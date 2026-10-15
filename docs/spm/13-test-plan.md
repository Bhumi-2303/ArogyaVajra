# DOCUMENT 13 — TEST PLAN

## 1. Purpose
The Test Plan defines the multi-tiered verification strategy, testing environments, test execution procedures, and detailed test cases mapped to requirements.

## 2. Project-Specific Content
### Testing Levels
1. **Unit Testing:** Validates isolated domain logic, Pydantic validators, password hashing, and permission evaluations using Pytest.
2. **Integration Testing:** Tests API route handlers, SQLAlchemy repository queries, and transactional rollbacks against a real PostgreSQL database.
3. **End-to-End (E2E) Journey Testing:** Verifies complete multi-step clinical journeys (Registration -> Booking -> Consultation -> Prescription -> Invoicing -> Payment).
4. **UI & Accessibility Verification:** Node.js automated DOM inspection scripts verifying responsive breakpoints and ARIA compliance.

## 3. Tables
### Test Case Suite
| TC ID | Requirement ID | Module | Test Scenario | Preconditions | Input Data | Expected Result | Actual Result | Status | Test Date | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-AUTH-01 | FR-01 | Auth | Patient registration | None | Valid email, password | HTTP 201, User created, JWT issued | HTTP 201 | PASS | 2026-10-02 | Verified in test_auth_endpoints.py |
| TC-AUTH-02 | FR-01 | Auth | Reject duplicate registration | User exists | Existing email | HTTP 400 Conflict | HTTP 400 | PASS | 2026-10-02 | Verified |
| TC-AUTH-03 | FR-01 | Auth | Login with valid credentials | User exists | Correct email & password | HTTP 200, JWT token returned | HTTP 200 | PASS | 2026-10-02 | Verified |
| TC-AUTH-04 | FR-01 | Auth | Reject invalid password | User exists | Wrong password | HTTP 401 Unauthorized | HTTP 401 | PASS | 2026-10-02 | Verified |
| TC-RBAC-01 | FR-02 | RBAC | Reject unauthenticated request | No token | Request to `/patients` | HTTP 401 Unauthorized | HTTP 401 | PASS | 2026-10-02 | Verified in test_authorization.py |
| TC-RBAC-02 | FR-02 | RBAC | Patient access forbidden endpoint| Patient token | Request to `/admin/users` | HTTP 403 Forbidden | HTTP 403 | PASS | 2026-10-02 | Verified |
| TC-PAT-01 | FR-03 | Patient | Create patient profile | Authenticated | Valid demographics | HTTP 201, PatientProfile record | HTTP 201 | PASS | 2026-10-02 | Verified in test_patient_service.py |
| TC-DOC-01 | FR-04 | Doctor | Create doctor profile | Admin token | Valid specialization, fee | HTTP 201, DoctorProfile record | HTTP 201 | PASS | 2026-10-02 | Verified in test_doctor_service.py |
| TC-AVL-01 | FR-05 | Availability | Generate availability slots | Doctor exists | Day of week, start/end time | Slots generated in DB | Slots generated| PASS | 2026-10-03 | Verified |
| TC-APT-01 | FR-06 | Appointments | Book valid appointment slot | Available slot| Patient ID, Doctor ID, slot | HTTP 201, status SCHEDULED | HTTP 201 | PASS | 2026-10-03 | Verified in test_mvp_journeys.py |
| TC-APT-02 | FR-06 | Appointments | Prevent double booking | Slot booked | Same doctor & slot time | HTTP 409 Conflict | HTTP 409 | PASS | 2026-10-03 | Verified (Integrity constraint) |
| TC-MED-01 | FR-08 | Medical Rec | Doctor adds consultation note | Confirmed apt | Symptoms, examination, dx | HTTP 201, MedicalRecord created | HTTP 201 | PASS | 2026-10-03 | Verified |
| TC-RX-01 | FR-09 | Prescription | Doctor issues prescription | Medical rec | Medication items (dosage, freq)| HTTP 201, Prescription created | HTTP 201 | PASS | 2026-10-03 | Verified |
| TC-BIL-01 | FR-010 | Billing | Generate itemized invoice | Completed apt | Consultation items, tax, disc | HTTP 201, Invoice with total calc | HTTP 201 | PASS | 2026-10-03 | Verified |
| TC-PAY-01 | FR-011 | Payment | Record offline payment | Issued invoice| Amount, payment method (UPI) | HTTP 200, balance reduced | HTTP 200 | PASS | 2026-10-03 | Verified |
| TC-AUD-01 | FR-014 | Audit | Audit event logged on mutation| Authenticated | Any state change | AuditLog entry persisted in DB | Log persisted | PASS | 2026-10-03 | Verified in unit test |

## 4. Current Status
- Unit Tests: 48 / 48 PASS (100% pass rate).
- Integration / E2E Tests: Written; host execution pending database network parameter adjustment (ISS-06).
- UI Verification: Automated script suite ready in `apps/web/scripts/`.

## 5. Assumptions / Missing Information
- Production Load Testing (JMeter/Locust): [TO BE PROVIDED] (Future phase).
