# DOCUMENT 02 — PROJECT REQUIREMENTS / SRS

## 1. Purpose
This Software Requirements Specification (SRS) establishes the formal baseline of functional and non-functional requirements for Arogyavajra. It serves as the authoritative contract between requirements, system architecture, WBS, implementation, and test cases.

## 2. Project-Specific Content
### User Classes & Actors
1. **Patient:** Self-registers, manages personal demographic profile, browses doctors, views schedules, books/reschedules appointments, reviews medical records, downloads prescriptions, and inspects invoices.
2. **Doctor:** Manages clinical profile and recurring availability schedules, views patient appointment queues, reviews medical history, enters consultation notes/diagnoses, and authors digital prescriptions.
3. **Receptionist:** Registers walk-in patients, manages doctor schedules, books/cancels appointments on behalf of patients, and oversees daily OPD check-in queues.
4. **Billing Staff:** Accesses finalized consultations, generates itemized invoices, applies authorized discounts and taxes, and records offline payments (Cash, UPI, Card, Net Banking).
5. **Administrator:** Manages system users, activates/deactivates accounts, provisions staff roles, approves doctor profiles, inspects non-repudiable audit logs, and monitors clinic operational metrics.

### Hardware & Software Requirements
- **Server Minimum Hardware:** Quad-core x86_64 CPU, 8 GB RAM, 20 GB SSD storage.
- **Client Hardware:** Standard desktop/laptop or mobile smartphone with minimum screen width 320px.
- **Server Software:** Linux OS (Ubuntu 22.04 LTS / Debian 12 / Arch), Python 3.12+, Node.js 20+, PostgreSQL 16+, Docker Engine & Compose.
- **Client Software:** Modern evergreen browser (Chrome 115+, Firefox 115+, Safari 17+, Edge 115+).

### External Interfaces & Security
- **REST API:** JSON over HTTPS rooted at `/api/v1`.
- **Authentication:** Stateless Bearer tokens (JWT) signed with HMAC-SHA256, Bcrypt/Argon2 password hashing.

## 3. Tables
### Functional Requirements (FR)
| Requirement ID | Module | Description | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| FR-01 | Authentication | Patient registration, credential login, password hashing, and JWT token issuance | Critical | Completed |
| FR-02 | RBAC | Enforce strict role-based access control across PATIENT, DOCTOR, RECEPTIONIST, BILLING, ADMIN | Critical | Completed |
| FR-03 | Patient Management | Patient demographic profile CRUD, medical history overview, emergency contacts | High | Completed |
| FR-04 | Doctor Management | Doctor profile setup, medical specialization, qualification, and consultation fees | High | Completed |
| FR-05 | Doctor Availability | Doctor recurring schedule configuration and dynamic time-slot generation | High | Completed |
| FR-06 | Appointment Booking | Patient slot booking with conflict detection and transactional double-booking prevention | Critical | Completed |
| FR-07 | Appointment Lifecycle | Appointment state transitions: SCHEDULED -> CONFIRMED -> COMPLETED / CANCELLED / NO_SHOW | High | Completed |
| FR-08 | Medical Records | Clinical encounter visit notes, chief complaints, symptoms, diagnosis, and clinical notes | Critical | Completed |
| FR-09 | Prescriptions | Structured medication orders (drug name, dosage, frequency, duration, instructions) | Critical | Completed |
| FR-10 | Invoicing & Billing | Itemized invoice creation for consultation/services with tax, discount, and balance calculation | High | Completed |
| FR-11 | Payment Recording | Offline payment recording (Cash, UPI, Card, Net Banking) with receipt balance adjustment | High | Completed |
| FR-12 | Search & Filtering | Filterable list endpoints and UI tables for patients, doctors, appointments, and invoices | Medium | Completed |
| FR-13 | Role Dashboards | Tailored dashboard interfaces with operational KPIs for each of the 5 user roles | High | In Progress |
| FR-14 | Audit Logging | Immutable chronological event logging for sensitive mutations and access events | Critical | Completed |

### Non-Functional Requirements (NFR)
| Requirement ID | Category | Specification | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| NFR-01 | Security | Password hashing with Bcrypt/Argon2, signed JWT, protection against OWASP Top 10 | Automated unit tests & security audits | Completed |
| NFR-02 | Performance | API response time < 300ms for p95 requests under standard OPD load | HTTP benchmark & endpoint profiling | In Progress |
| NFR-03 | Usability | Calming clinical aesthetic, responsive layout, clear error states | UI review & responsive verification scripts | In Progress |
| NFR-04 | Reliability | Transactional DB guarantees; atomic commits across billing and booking operations | DB rollback and transaction tests | Completed |
| NFR-05 | Availability | System uptime of 99.5% during operating hours; containerized restart policies | Docker health probes and orchestration | Completed |
| NFR-06 | Maintainability | Modular monolith layering (Router -> Service -> Repository -> Database); strict type hints | Ruff linter & TypeScript type check | In Progress |
| NFR-07 | Scalability | Database indexing on foreign keys and search fields (patient_id, doctor_id, dates) | PostgreSQL query explain analysis | Completed |
| NFR-08 | Data Integrity | Relational integrity via foreign keys, unique constraints, and PostgreSQL sequences | Alembic migrations and schema constraints | Completed |
| NFR-09 | Backup / Recovery | Automated SQL backup scripts for disaster recovery | Shell backup scripts | Planned |
| NFR-10 | Compatibility | Cross-browser compatibility across Chrome, Firefox, Safari, Edge | Responsive test harness | Completed |
| NFR-11 | Accessibility | Keyboard navigation, ARIA attributes, semantic HTML elements, WCAG 2.1 AA contrast | Web inspection & Radix UI primitives | In Progress |
| NFR-12 | Data Privacy | Masking sensitive credentials and excluding passwords/tokens from audit logs and logs | Audit route sanitizer tests | Completed |

## 4. Current Status
- Requirements Baseline Status: Completed
- Traceability: Mapped 100% to WBS tasks and architectural components.
- Verification: 48 backend unit tests verify core FRs; frontend dashboard UI integration in progress.

## 5. Assumptions / Missing Information
- Specific Institution Name / Hospital Partner: [TO BE PROVIDED] (Currently generic OPD model).
- External Notification Gateway (SMS/Email): Not Applicable for MVP (Excluded by PRD scope).
