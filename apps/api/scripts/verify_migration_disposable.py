"""Disposable PostgreSQL database migration verification script for ArogyaVajra.

Verifies the upgrade chain from revision 7ea81b2c90df to head (f8a3c4d5e6f7) on an
isolated disposable PostgreSQL database without modifying the development database.
"""

import os

import psycopg
from alembic import command
from alembic.config import Config
from psycopg import sql

# Development database credentials
DB_HOST = os.environ.get("POSTGRES_HOST", "localhost")
DB_PORT = os.environ.get("POSTGRES_PORT", "5434")
DB_USER = os.environ.get("POSTGRES_USER", "arogyavajra")
DB_PASS = os.environ.get("POSTGRES_PASSWORD", "arogyavajra_dev_password")
BASE_DB = os.environ.get("POSTGRES_DB", "arogyavajra")
DISPOSABLE_DB = "arogyavajra_disposable_mig_test"

BASE_CONN_STR = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{BASE_DB}"
DISPOSABLE_CONN_STR = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DISPOSABLE_DB}"
DISPOSABLE_SQLALCHEMY_URL = f"postgresql+psycopg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DISPOSABLE_DB}"


def drop_disposable_db():
    with psycopg.connect(BASE_CONN_STR, autocommit=True) as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT pg_terminate_backend(pid) 
            FROM pg_stat_activity 
            WHERE datname = %s AND pid <> pg_backend_pid();
            """,
            (DISPOSABLE_DB,),
        )
        cur.execute(sql.SQL("DROP DATABASE IF EXISTS {}").format(sql.Identifier(DISPOSABLE_DB)))


def run_migration_verification():
    print("=" * 65)
    print("  Disposable PostgreSQL Database Migration Verification")
    print("=" * 65)

    # 1. Connect to base db with autocommit to create disposable database
    print(f"\n[1/6] Creating disposable test database '{DISPOSABLE_DB}'...")
    drop_disposable_db()
    with psycopg.connect(BASE_CONN_STR, autocommit=True) as conn, conn.cursor() as cur:
        cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DISPOSABLE_DB)))
    print(f"  ✓ Created clean disposable database: {DISPOSABLE_DB}")

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    alembic_ini_path = os.path.join(base_dir, "alembic.ini")
    alembic_cfg = Config(alembic_ini_path)
    alembic_cfg.set_main_option("sqlalchemy.url", DISPOSABLE_SQLALCHEMY_URL)
    alembic_cfg.set_main_option("script_location", os.path.join(base_dir, "app/db/migrations"))
    alembic_cfg.set_main_option(
        "version_locations", os.path.join(base_dir, "app/db/migrations/versions")
    )

    try:
        # 2. Upgrade to preceding revision (7ea81b2c90df)
        print("\n[2/6] Upgrading disposable database to preceding revision (7ea81b2c90df)...")
        command.upgrade(alembic_cfg, "7ea81b2c90df")
        print("  ✓ Successfully upgraded to revision 7ea81b2c90df")

        # Verify grace_count column DOES NOT exist at 7ea81b2c90df
        with psycopg.connect(DISPOSABLE_CONN_STR) as conn, conn.cursor() as cur:
            cur.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'refresh_tokens' AND column_name = 'grace_count';
            """)
            row = cur.fetchone()
            assert row is None, "Error: grace_count column already exists before migration!"
            print("  ✓ Confirmed: 'grace_count' does NOT exist prior to f8a3c4d5e6f7")

        # 3. Upgrade to head revision (f8a3c4d5e6f7)
        print("\n[3/6] Upgrading from 7ea81b2c90df to latest head (f8a3c4d5e6f7)...")
        command.upgrade(alembic_cfg, "f8a3c4d5e6f7")
        print("  ✓ Successfully applied migration f8a3c4d5e6f7")

        # 4. Verify new column metadata and indexes
        print("\n[4/6] Verifying schema and column invariants in PostgreSQL...")
        with psycopg.connect(DISPOSABLE_CONN_STR) as conn, conn.cursor() as cur:
            cur.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'refresh_tokens' AND column_name = 'grace_count';
            """)
            col = cur.fetchone()
            assert col is not None, "Error: grace_count column was not found after migration!"
            col_name, data_type, is_nullable, col_default = col
            print(f"  ✓ Column: {col_name}")
            print(f"  ✓ Data type: {data_type} (expected: integer)")
            print(f"  ✓ Nullable: {is_nullable} (expected: NO)")
            print(f"  ✓ Default: {col_default} (expected: 0)")
            assert data_type == "integer"
            assert is_nullable == "NO"
            assert "0" in str(col_default)

            # Check indexes on refresh_tokens
            cur.execute("""
                SELECT indexname, indexdef FROM pg_indexes
                WHERE tablename = 'refresh_tokens';
            """)
            indexes = cur.fetchall()
            print(f"  ✓ Indexes present on refresh_tokens: {len(indexes)}")
            for idx_name, idx_def in indexes:
                print(f"    - {idx_name}")

        # 5. Test downgrade and re-upgrade
        print("\n[5/6] Verifying downgrade and re-upgrade reversibility...")
        command.downgrade(alembic_cfg, "7ea81b2c90df")
        with psycopg.connect(DISPOSABLE_CONN_STR) as conn, conn.cursor() as cur:
            cur.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'refresh_tokens' AND column_name = 'grace_count';
            """)
            assert cur.fetchone() is None, "Error: grace_count column was not dropped on downgrade!"
        print("  ✓ Downgrade successfully dropped grace_count")

        command.upgrade(alembic_cfg, "head")
        with psycopg.connect(DISPOSABLE_CONN_STR) as conn, conn.cursor() as cur:
            cur.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'refresh_tokens' AND column_name = 'grace_count';
            """)
            assert cur.fetchone() is not None, "Error: grace_count not recreated on re-upgrade!"
        print("  ✓ Re-upgrade to head successfully recreated grace_count")

    finally:
        # 6. Clean up disposable database
        print("\n[6/6] Cleaning up disposable test database...")
        drop_disposable_db()
        print(f"  ✓ Dropped disposable database: {DISPOSABLE_DB}")
        print("  ✓ User development database remains untouched.")

    print("\n" + "=" * 65)
    print("  ✓ Migration verification on disposable PostgreSQL PASSED!")
    print("=" * 65)


if __name__ == "__main__":
    run_migration_verification()
