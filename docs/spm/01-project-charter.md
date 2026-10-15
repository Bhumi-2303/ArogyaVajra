# DOCUMENT 01 — PROJECT CHARTER

## 1. Purpose
The Project Charter formally authorizes the Arogyavajra project, establishes its engineering and academic rationale, outlines operational boundaries, identifies key stakeholders, and articulates high-level project objectives, constraints, and success criteria for academic and engineering governance.

## 2. Project-Specific Content
### Project Title
**Arogyavajra (आरोग्यवज्र)** — The Indomitable Shield for Healthcare Management (Centralized Outpatient Healthcare Administration Platform).

### Problem Statement
Healthcare outpatient facilities face severe operational friction when demographic data, physician schedules, appointment queues, clinical consultations, medication orders, and billing workflows operate across disconnected software or physical paper records. This leads to scheduling conflicts, untracked patient histories, prescription discrepancies, billing leakage, and lack of non-repudiable audit trails.

### Background
Arogyavajra is initiated as an undergraduate semester engineering project adhering to Gujarat Technological University (GTU) Software Project Management (SPM) academic guidelines. It addresses hospital outpatient department (OPD) administration by establishing a secure, role-based modular monolith.

### Project Objectives
1. Provide unified role-based portals for five distinct hospital user classes: Patients, Doctors, Receptionists, Billing Staff, and System Administrators.
2. Automate doctor slot generation, appointment booking, rescheduling, and status transitions while preventing double-booking via transactional integrity.
3. Digitally link consultation visit notes directly with structured digital prescriptions and itemized invoices.
4. Guarantee least-privilege security via backend-enforced JWT Role-Based Access Control (RBAC) and record all sensitive mutations in an immutable audit log.

### Scope & Out of Scope
- **In Scope (MVP v1.0):**
  - User authentication and role-based access control (PATIENT, DOCTOR, RECEPTIONIST, BILLING, ADMIN).
  - Patient demographic profile management and history.
  - Doctor profiles, consultation fee tracking, and recurring availability scheduling.
  - Appointment booking lifecycle (SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW).
  - Clinical consultation records (symptoms, examination observations, diagnoses).
  - Structured digital prescriptions (drug name, dosage, frequency, duration, instructions).
  - Itemized billing, invoice generation, tax/discount calculation, and offline payment logging (Cash, UPI, Card, Net Banking).
  - Role-specific authenticated dashboards and full-text audit logging.
- **Out of Scope (Future Phases):**
  - Autonomous AI clinical diagnosis, predictive risk scoring, or medical image diagnostics.
  - Telemedicine, WebRTC video calling, or real-time patient-doctor messaging.
  - Laboratory Information Systems (LIS) and Radiology PACS/DICOM processing.
  - Real-time online payment gateway integration (Razorpay/Stripe webhooks).
  - Ayushman Bharat Digital Mission (ABDM) and production FHIR gateways.
  - In-Patient Department (IPD) bed management and emergency/ambulance dispatch.

### Assumptions & Constraints
- **Assumptions:** Users have access to modern desktop or mobile web browsers; clinic administrators maintain local network infrastructure; PostgreSQL database server is hosted on local or containerized environments.
- **Constraints:** Must be implemented using modern open-source stacks (FastAPI, Next.js, PostgreSQL); must complete within GTU semester academic timeline; zero commercial licensing budget.

### Success Criteria
1. 100% of core outpatient workflows (Registration -> Appointment -> Consultation -> Prescription -> Invoice -> Payment) successfully execute end-to-end.
2. Zero unauthorized cross-role data access (enforced at API layer).
3. 100% pass rate on unit test suites with audit log verification for all mutating requests.

## 3. Tables
### Stakeholder Summary
| Role / Entity | Key Responsibility | Project Interest |
| :--- | :--- | :--- |
| Project Lead / Developer | Architecture, API, UI implementation, Testing | System delivery, academic evaluation |
| Academic Supervisor / Guide | Review, guidance, milestone evaluation | Academic rigor, syllabus compliance |
| GTU Examination Board | Viva-voce and practical file assessment | SPM curriculum mastery |
| Healthcare Users (Simulated) | Testing operational clinical workflows | Usability, accuracy, reliability |

### Initial Risk Register Summary
| Risk ID | Description | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| R-INIT-01 | Tight semester schedule vs full-stack scope | High | Modular monolith architecture; strict MVP boundaries excluding AI/telehealth |
| R-INIT-02 | Role escalation and privacy leakage | Critical | Backend dependency injection enforcing RBAC; server-side token validation |
| R-INIT-03 | Database concurrency conflicts during booking | Medium | PostgreSQL transactional locks and unique constraints on doctor time-slots |

## 4. Current Status
- Project Charter Status: Completed / Approved Baseline
- Implementation Status: In Progress (Backend API functional; Frontend dashboard integration and type-refinement ongoing).

## 5. Assumptions / Missing Information
- Academic Team Members / Student Partners: [TO BE PROVIDED] (Currently authored by Bhavini Chauhan in Git commit history; co-authors/group partners to be confirmed).
- Academic Supervisor / Guide Name: [TO BE PROVIDED].
- Formal Semester Project Deadline / GTU Submission Date: [TO BE PROVIDED].
