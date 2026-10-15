# DOCUMENT 14 — REQUIREMENT TRACEABILITY MATRIX (RTM)

## 1. Purpose
The Requirement Traceability Matrix (RTM) ensures end-to-end forward and backward traceability, establishing that every functional requirement originates from business specifications, is broken down in the WBS, realized in source code, and verified by test cases.

## 2. Project-Specific Content
Correlates Functional Requirements (FR-01 to FR-14) with WBS Tasks, Architectural Modules, Implementation Files, Test Cases, and Verification Status.

## 3. Tables
### Traceability Matrix
| Req ID | Requirement Description | WBS ID | Architectural Module | Implementation Source Files | Test Case ID | Test Status | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FR-01 | User Authentication | 1.4.1 | Auth Engine | `apps/api/app/api/v1/auth.py`, `apps/web/features/auth/` | TC-AUTH-01..04 | PASS | Completed |
| FR-02 | Role-Based Access Control | 1.4.1 | Security / RBAC | `apps/api/app/dependencies/auth.py`, `ProtectedRoute.tsx` | TC-RBAC-01..02 | PASS | Completed |
| FR-03 | Patient Profile Management| 1.4.2 | Patient Domain | `apps/api/app/api/v1/patients.py`, `features/patients/` | TC-PAT-01 | PASS | Completed |
| FR-04 | Doctor Profile & Specialty | 1.4.3 | Doctor Domain | `apps/api/app/api/v1/doctors.py`, `features/doctors/` | TC-DOC-01 | PASS | Completed |
| FR-05 | Doctor Availability Sched | 1.4.3 | Scheduling | `apps/api/app/api/v1/doctors.py`, `availability/` | TC-AVL-01 | PASS | Completed |
| FR-06 | Appointment Booking | 1.4.4 | Appointment Core | `apps/api/app/api/v1/appointments.py`, `booking/` | TC-APT-01..02 | PASS | Completed |
| FR-07 | Appointment State Machine | 1.4.4 | Appointment Core | `apps/api/app/services/appointment_service.py` | TC-APT-01 | PASS | Completed |
| FR-08 | Clinical Medical Records | 1.4.5 | Consultation | `apps/api/app/api/v1/medical_records.py` | TC-MED-01 | PASS | Completed |
| FR-09 | Structured Prescriptions | 1.4.6 | Pharmacy / Rx | `apps/api/app/api/v1/prescriptions.py` | TC-RX-01 | PASS | Completed |
| FR-10 | Itemized Billing & Invoices| 1.4.7 | Billing Domain | `apps/api/app/api/v1/invoices.py`, `features/billing/` | TC-BIL-01 | PASS | Completed |
| FR-11 | Offline Payment Logging | 1.4.8 | Payments | `apps/api/app/api/v1/invoices.py` | TC-PAY-01 | PASS | Completed |
| FR-12 | Search & Filtering Query | 1.4.2..4| Cross-Cutting | `apps/api/app/repositories/` list queries | TC-PAT-01 | PASS | Completed |
| FR-13 | Role-Specific Dashboards | 1.4.10 | Frontend Portal | `apps/web/app/(dashboard)/*` (5 role portals) | UI Verify | In Progress | In Progress |
| FR-14 | Immutable Audit Logging | 1.4.9 | Audit Engine | `apps/api/app/services/audit_service.py` | TC-AUD-01 | PASS | Completed |

## 4. Current Status
- Requirement Coverage: 100% of defined FRs mapped to architecture, code, and test cases.
- Implementation Status: 13 / 14 Completed; 1 In Progress (FR-13).

## 5. Assumptions / Missing Information
- None. Full bidirectional traceability maintained.
