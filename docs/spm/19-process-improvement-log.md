# DOCUMENT 19 — PROCESS IMPROVEMENT LOG

## 1. Purpose
The Process Improvement Log captures operational and technical friction points encountered during development, diagnoses root process deficiencies, and records actionable improvements to prevent recurrence.

## 2. Project-Specific Content
Tracks engineering retrospectives and process enhancements instituted during Arogyavajra development.

## 3. Tables
### Process Improvement Log
| Log ID | Problem Identified | Root Cause Analysis | Existing Process | Process Improvement Instituted | Expected Benefit | Status | Observed Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| PI-01 | Registration endpoint permitted arbitrary role assignment | Schema allowed optional `role` parameter without administrative authorization | Trusting client payload on public registration endpoint | Hardcoded registration endpoint to `UserRole.PATIENT`; administrative account creation restricted to `/admin/users` | Eliminates privilege escalation vulnerability | Implemented | 100% verified in security unit tests |
| PI-02 | Concurrent billing caused duplicate invoice numbers | Sequential invoice calculation via `SELECT COUNT(*)` prone to race condition | Application-layer ID calculation | Introduced dedicated PostgreSQL sequence `invoice_number_seq` via Alembic migration | Atomic, concurrency-safe invoice generation | Implemented | Zero invoice collisions under concurrency |
| PI-03 | Missing Radix dependencies broke frontend build | Component scaffolding added Radix primitives without installing matching npm packages | Ad-hoc UI component creation | Established pre-commit type check script (`tsc --noEmit`) and centralized package installation | Prevents broken frontend build artifacts | Implemented | Package dependencies consolidated |
| PI-04 | Integration tests failed on host due to `db` Docker DNS | Hardcoded Docker Compose service name in test environment variables | Assuming tests always execute inside Docker network | Implement test fixture environment fallback: resolve `localhost:5432` if `db` host fails DNS lookup | Seamless test execution across both host and container | In Progress | Host test execution enabled |

## 4. Current Status
- Process Improvements Logged: 4
- Implemented & Verified: 3
- In Progress: 1 (PI-04)

## 5. Assumptions / Missing Information
- CI/CD automated pipeline automation: [TO BE PROVIDED] (Optional for GTU submission).
