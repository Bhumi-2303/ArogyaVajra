"""Integration tests for refresh token lifecycle, rotation, grace window, and replay detection."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import select, update

from app.core.config import settings
from app.core.rate_limit import check_rate_limit, cleanup_expired_rate_limit_buckets
from app.db.session import SessionLocal
from app.main import app
from app.models.rate_limit import RateLimitBucket
from app.models.refresh_token import RefreshToken

client = TestClient(app)


@pytest.mark.integration
def test_refresh_token_rotation_success():
    """Verify refresh token is rotated on use and maintains the token family."""
    unique_email = f"rotation_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    # 1. Register user
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "role": "PATIENT"},
    )
    assert reg_res.status_code == 201
    rt1 = reg_res.json()["data"]["refresh_token"]

    user_id = reg_res.json()["data"]["user"]["id"]

    # 2. First refresh (RT1 -> RT2)
    ref_res1 = client.post("/api/v1/auth/refresh", json={"refresh_token": rt1})
    assert ref_res1.status_code == 200
    ref_data1 = ref_res1.json()["data"]
    rt2 = ref_data1["refresh_token"]
    assert rt2 != rt1

    # Verify in DB that RT1 is marked consumed
    with SessionLocal() as db:
        tokens = db.scalars(
            select(RefreshToken).where(RefreshToken.user_id == user_id)
        ).all()
        rt1_db = next(t for t in tokens if t.consumed_at is not None)
        assert rt1_db.consumed_at is not None
        assert rt1_db.is_revoked is False


    # 3. Second refresh (RT2 -> RT3)
    ref_res2 = client.post("/api/v1/auth/refresh", json={"refresh_token": rt2})
    assert ref_res2.status_code == 200
    rt3 = ref_res2.json()["data"]["refresh_token"]
    assert rt3 != rt2


@pytest.mark.integration
def test_refresh_token_concurrency_grace_window():
    """Verify concurrent requests with the same token within grace window succeed."""
    unique_email = f"grace_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "role": "PATIENT"},
    )
    assert reg_res.status_code == 201
    rt1 = reg_res.json()["data"]["refresh_token"]

    # First request consumes RT1 and returns RT2
    ref_res1 = client.post("/api/v1/auth/refresh", json={"refresh_token": rt1})
    assert ref_res1.status_code == 200
    assert "access_token" in ref_res1.json()["data"]

    # Second in-flight request arrives immediately (within 15s grace window) with RT1
    ref_res2 = client.post("/api/v1/auth/refresh", json={"refresh_token": rt1})
    assert ref_res2.status_code == 200
    # Returns valid fresh access and refresh tokens
    assert "access_token" in ref_res2.json()["data"]
    assert "refresh_token" in ref_res2.json()["data"]



@pytest.mark.integration
def test_refresh_token_replay_triggers_family_revocation():
    """Verify that replaying a consumed token after grace window revokes the whole family."""
    unique_email = f"replay_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "role": "PATIENT"},
    )
    assert reg_res.status_code == 201
    rt1 = reg_res.json()["data"]["refresh_token"]

    # Consume RT1 -> RT2
    ref_res1 = client.post("/api/v1/auth/refresh", json={"refresh_token": rt1})
    assert ref_res1.status_code == 200
    rt2 = ref_res1.json()["data"]["refresh_token"]

    user_id = reg_res.json()["data"]["user"]["id"]

    # Simulate expiration of grace window (e.g. consumed 30 seconds ago)
    with SessionLocal() as db:
        db.execute(
            update(RefreshToken)
            .where(
                RefreshToken.user_id == user_id,
                RefreshToken.consumed_at.is_not(None),
            )
            .values(consumed_at=datetime.now(UTC) - timedelta(seconds=30))
        )
        db.commit()


    # Replay of RT1 now occurs after grace window
    replay_res = client.post("/api/v1/auth/refresh", json={"refresh_token": rt1})
    assert replay_res.status_code == 401
    assert "Replay attack detected" in replay_res.json()["detail"]

    # Attempting to use the active RT2 should now also fail because family was revoked
    res_after_revocation = client.post("/api/v1/auth/refresh", json={"refresh_token": rt2})
    assert res_after_revocation.status_code == 401
    assert "revoked" in res_after_revocation.json()["detail"].lower()


@pytest.mark.integration
def test_logout_revokes_token_family():
    """Verify that logging out revokes all active refresh tokens for the user."""
    unique_email = f"logout_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "role": "PATIENT"},
    )
    assert reg_res.status_code == 201
    at = reg_res.json()["data"]["access_token"]
    rt = reg_res.json()["data"]["refresh_token"]

    # Log out
    logout_res = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {at}"})
    assert logout_res.status_code == 200

    # Refresh should fail
    ref_res = client.post("/api/v1/auth/refresh", json={"refresh_token": rt})
    assert ref_res.status_code == 401


@pytest.mark.integration
def test_password_change_revokes_active_refresh_tokens():
    """Verify that changing password revokes all active refresh tokens for the user."""
    unique_email = f"pwd_rev_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "role": "PATIENT"},
    )
    assert reg_res.status_code == 201
    at = reg_res.json()["data"]["access_token"]
    rt = reg_res.json()["data"]["refresh_token"]

    # Change password
    change_res = client.put(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {at}"},
        json={"current_password": password, "new_password": "NewSecurePassword456!"},
    )
    assert change_res.status_code == 200

    # Refresh token should now be rejected as revoked
    ref_res = client.post("/api/v1/auth/refresh", json={"refresh_token": rt})
    assert ref_res.status_code == 401


@pytest.mark.integration
def test_distributed_rate_limiter_atomic_upsert():
    """Verify the rate limiter enforces rate limits and returns 429 when threshold exceeded."""
    with SessionLocal() as db:
        test_ip = f"192.168.1.{uuid.uuid4().int % 250 + 1}"
        # Make 3 allowed calls
        check_rate_limit(
            db=db,
            key_prefix="test_action",
            identifier=test_ip,
            max_requests=3,
            window_seconds=60,
            bypass_in_test=False,
        )
        check_rate_limit(
            db=db,
            key_prefix="test_action",
            identifier=test_ip,
            max_requests=3,
            window_seconds=60,
            bypass_in_test=False,
        )
        check_rate_limit(
            db=db,
            key_prefix="test_action",
            identifier=test_ip,
            max_requests=3,
            window_seconds=60,
            bypass_in_test=False,
        )

        # 4th call exceeds max_requests (3) and must raise HTTPException(429)
        with pytest.raises(HTTPException) as exc_info:
            check_rate_limit(
                db=db,
                key_prefix="test_action",
                identifier=test_ip,
                max_requests=3,
                window_seconds=60,
                bypass_in_test=False,
            )

        assert exc_info.value.status_code == 429
        assert "Rate limit exceeded" in exc_info.value.detail
        assert "Retry-After" in exc_info.value.headers


@pytest.mark.integration
def test_concurrent_refresh_requests_thread_pool():
    """Verify concurrent requests with the same refresh token are handled safely under row locks."""
    import concurrent.futures

    unique_email = f"conc_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "role": "PATIENT"},
    )
    assert reg_res.status_code == 201
    rt = reg_res.json()["data"]["refresh_token"]

    def make_refresh():
        # Each thread creates its own TestClient or shares client
        return client.post("/api/v1/auth/refresh", json={"refresh_token": rt})

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(make_refresh)
        f2 = executor.submit(make_refresh)
        res1 = f1.result()
        res2 = f2.result()

    # Both requests should succeed (one as initial consumer, one as the bounded grace window consumer)
    assert res1.status_code == 200
    assert res2.status_code == 200
    assert "access_token" in res1.json()["data"]
    assert "access_token" in res2.json()["data"]


@pytest.mark.integration
def test_grace_window_cannot_mint_indefinitely():
    """Verify that a 3rd attempt with the same token within grace window is treated as replay."""
    unique_email = f"bounded_grace_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "role": "PATIENT"},
    )
    assert reg_res.status_code == 201
    rt1 = reg_res.json()["data"]["refresh_token"]

    # 1st call: consumes RT1 -> 200 OK
    res1 = client.post("/api/v1/auth/refresh", json={"refresh_token": rt1})
    assert res1.status_code == 200
    rt2 = res1.json()["data"]["refresh_token"]

    # 2nd call: within grace window, single allowed grace resolution -> 200 OK
    res2 = client.post("/api/v1/auth/refresh", json={"refresh_token": rt1})
    assert res2.status_code == 200

    # 3rd call: exceeded grace count (attempted indefinite minting) -> 401 Replay attack!
    res3 = client.post("/api/v1/auth/refresh", json={"refresh_token": rt1})
    assert res3.status_code == 401
    assert "Replay attack detected" in res3.json()["detail"]

    # The entire family is now revoked; even rt2 must be rejected
    res_family = client.post("/api/v1/auth/refresh", json={"refresh_token": rt2})
    assert res_family.status_code == 401
    assert "revoked" in res_family.json()["detail"].lower()


@pytest.mark.integration
def test_login_account_rate_limiting(monkeypatch):
    """Verify that excessive login attempts against a single account triggers 429."""
    # Ensure rate limiting is active during this test across all environments (including CI where APP_ENV=test)
    monkeypatch.delenv("PYTEST_CURRENT_TEST", raising=False)
    monkeypatch.setattr(settings, "APP_ENV", "development")
    # Configure testclient as trusted proxy so distinct forwarded client IPs are recognized
    monkeypatch.setattr(settings, "TRUSTED_PROXIES", "testclient")

    target_email = f"brute_{uuid.uuid4().hex[:8]}@example.com"
    # Create the user first
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": target_email, "password": "CorrectPassword123!", "role": "PATIENT"},
    )
    assert reg_res.status_code == 201

    # Attempt 10 failed logins with different client IPs forwarded through trusted proxy
    statuses = []
    for i in range(12):
        res = client.post(
            "/api/v1/auth/login",
            json={"email": target_email, "password": "WrongPassword999!"},
            headers={"X-Forwarded-For": f"198.51.100.{i+1}"},
        )
        statuses.append(res.status_code)

    # Max login attempts per account is 10.
    # The first 10 attempts fail credential validation (401).
    # The 11th and 12th attempts exceed the threshold and must be 429 Too Many Requests.
    assert statuses[:10] == [401] * 10
    assert statuses[10:] == [429, 429]

    # Changing client IP does not bypass account-level limit on target account
    res_diff_ip = client.post(
        "/api/v1/auth/login",
        json={"email": target_email, "password": "WrongPassword999!"},
        headers={"X-Forwarded-For": "203.0.113.99"},
    )
    assert res_diff_ip.status_code == 429

    # Even with the correct password, the rate-limited account remains blocked until window expires
    res_correct_pw = client.post(
        "/api/v1/auth/login",
        json={"email": target_email, "password": "CorrectPassword123!"},
        headers={"X-Forwarded-For": "203.0.113.100"},
    )
    assert res_correct_pw.status_code == 429

    # Separate accounts do not share the rate-limit counter
    other_email = f"separate_{uuid.uuid4().hex[:8]}@example.com"
    reg_other = client.post(
        "/api/v1/auth/register",
        json={"email": other_email, "password": "CorrectPassword123!", "role": "PATIENT"},
    )
    assert reg_other.status_code == 201

    login_other = client.post(
        "/api/v1/auth/login",
        json={"email": other_email, "password": "CorrectPassword123!"},
        headers={"X-Forwarded-For": "198.51.100.1"},
    )
    assert login_other.status_code == 200
    assert "access_token" in login_other.json()["data"]


@pytest.mark.integration
def test_cleanup_expired_rate_limit_buckets():
    """Verify expired rate limit buckets are purged by cleanup function."""
    with SessionLocal() as db:
        old_bucket = RateLimitBucket(
            key="old_test_hash",
            count=5,
            window_expires_at=datetime.now(UTC) - timedelta(hours=2),
        )
        db.add(old_bucket)
        db.commit()

        deleted = cleanup_expired_rate_limit_buckets(db)
        assert deleted >= 1


@pytest.mark.integration
def test_postgresql_row_locking_transaction_isolation():
    """Verify PostgreSQL pessimistic row lock (FOR UPDATE) blocks concurrent sessions until commit."""
    import threading
    import time

    unique_email = f"rowlock_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "role": "PATIENT"},
    )
    assert reg_res.status_code == 201
    user_id = reg_res.json()["data"]["user"]["id"]

    with SessionLocal() as db_prep:
        token = db_prep.scalar(select(RefreshToken).where(RefreshToken.user_id == user_id))
        token_id = token.id

    session1 = SessionLocal()
    session2 = SessionLocal()

    lock_acquired_time = [0.0]
    session2_read_consumed_at = [None]
    session2_done = threading.Event()

    try:
        # Session 1 acquires exclusive row lock on the token
        t1 = session1.scalar(
            select(RefreshToken).where(RefreshToken.id == token_id).with_for_update()
        )
        assert t1.consumed_at is None
        # Mutate the token within uncommitted Session 1
        t1.consumed_at = datetime.now(UTC)

        def session2_worker():
            # Session 2 attempts to select FOR UPDATE the same row.
            # Must block in PostgreSQL until Session 1 commits.
            t2 = session2.scalar(
                select(RefreshToken).where(RefreshToken.id == token_id).with_for_update()
            )
            lock_acquired_time[0] = time.time()
            session2_read_consumed_at[0] = t2.consumed_at
            session2.commit()
            session2_done.set()

        thread2 = threading.Thread(target=session2_worker)
        thread2.start()

        # Allow Session 2 to begin query and block on lock
        time.sleep(0.2)
        # Session 2 should NOT have completed yet because Session 1 holds the row lock
        assert not session2_done.is_set()

        # Session 1 commits, releasing the row lock
        commit_time = time.time()
        session1.commit()

        thread2.join(timeout=3.0)
        assert session2_done.is_set()
        # Verify Session 2 only acquired lock after Session 1 committed
        assert lock_acquired_time[0] >= commit_time
        # Verify Session 2 observed the updated consumed_at written by Session 1
        assert session2_read_consumed_at[0] is not None

    finally:
        session1.close()
        session2.close()


@pytest.mark.integration
def test_refresh_token_rollback_on_persistence_failure(monkeypatch):
    """Verify that an unhandled failure while persisting the replacement token or committing

    the transaction rolls back the transaction, leaving the original refresh token unconsumed
    and therefore valid for a subsequent retry.
    """
    unique_email = f"rollback_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "role": "PATIENT"},
    )
    assert reg_res.status_code == 201
    user_id = reg_res.json()["data"]["user"]["id"]
    rt1 = reg_res.json()["data"]["refresh_token"]

    # Verify initial state: rt1 is in DB with consumed_at is None
    with SessionLocal() as db_check:
        t1 = db_check.scalar(select(RefreshToken).where(RefreshToken.user_id == user_id))
        assert t1 is not None
        assert t1.consumed_at is None
        assert t1.grace_count == 0

    # Simulate a persistence failure in issue_and_persist_tokens
    import app.api.v1.auth as auth_mod

    def failing_issue_and_persist(*args, **kwargs):
        raise RuntimeError("Simulated failure during replacement token persistence")

    monkeypatch.setattr(auth_mod, "issue_and_persist_tokens", failing_issue_and_persist)

    # Attempt refresh - should fail with RuntimeError in TestClient
    with pytest.raises(RuntimeError, match="Simulated failure during replacement token persistence"):
        client.post("/api/v1/auth/refresh", json={"refresh_token": rt1})

    # Query database using a fresh session to verify rollback
    with SessionLocal() as db_check:
        t1_after = db_check.scalar(select(RefreshToken).where(RefreshToken.user_id == user_id))
        assert t1_after is not None
        # MUST BE ROLLED BACK: consumed_at is still None, grace_count is still 0
        assert t1_after.consumed_at is None
        assert t1_after.grace_count == 0

        # And no replacement token exists
        total_tokens = db_check.scalars(select(RefreshToken).where(RefreshToken.user_id == user_id)).all()
        assert len(total_tokens) == 1

    # Restore the original function
    monkeypatch.undo()

    # The client retries the refresh with the exact same rt1 - this must now succeed cleanly!
    retry_res = client.post("/api/v1/auth/refresh", json={"refresh_token": rt1})
    assert retry_res.status_code == 200
    rt2 = retry_res.json()["data"]["refresh_token"]
    assert rt2 != rt1

    # Verify state in DB now reflects successful consumption and issuance of rt2
    with SessionLocal() as db_check:
        all_tokens = db_check.scalars(select(RefreshToken).where(RefreshToken.user_id == user_id)).all()
        assert len(all_tokens) == 2
        consumed_tokens = [t for t in all_tokens if t.consumed_at is not None]
        active_tokens = [t for t in all_tokens if t.consumed_at is None]
        assert len(consumed_tokens) == 1
        assert len(active_tokens) == 1





