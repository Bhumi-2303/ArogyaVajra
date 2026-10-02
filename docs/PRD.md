# Arogyavajra --- Product Requirements Document (PRD)

**Product:** Arogyavajra\
**Version:** 1.0\
**Status:** MVP Product Baseline\
**Date:** 2026-10-02

## 1. Executive Summary

Arogyavajra is a centralized healthcare management platform for
patients, doctors, receptionists, billing staff, and administrators. The
MVP covers authentication, role-based access, patient and doctor
management, doctor availability, appointments, medical records,
prescriptions, billing, payments, dashboards, and audit logging.

The MVP is a healthcare management system, not an autonomous clinical
decision-making system. Advanced AI diagnosis, clinical prediction,
medical-device integration, telemedicine, laboratory, pharmacy,
insurance, and interoperability capabilities are future scope.

## 2. Product Vision

> Build a clean, secure, extensible healthcare management platform that
> connects patients, healthcare professionals, administrative staff, and
> billing operations through one unified system.

### Principles

1.  Patient-centered.
2.  Role-aware.
3.  Secure by design.
4.  Clinically organized.
5.  Operationally efficient.
6.  Modular and extensible.
7.  Core workflows first.

## 3. Problem Statement

Healthcare information and daily operations can become difficult to
manage when patient information, doctor information, appointments,
medical records, prescriptions, and billing are maintained separately.
Arogyavajra centralizes these workflows to improve organization,
retrieval, scheduling, access control, and operational visibility.

## 4. Product Goal

The MVP must support this end-to-end workflow:

``` text
Authentication
    ↓
Role-Based Dashboard
    ↓
Patient / Doctor Management
    ↓
Doctor Availability
    ↓
Appointment Booking
    ↓
Consultation
    ↓
Medical Record
    ↓
Prescription
    ↓
Invoice
    ↓
Payment
    ↓
Authorized History + Audit Trail
```

## 5. Target Users

### Patient

Needs registration, profile management, doctor discovery, appointment
booking, appointment history, medical-record access, prescription
access, and billing visibility.

### Doctor

Needs professional profile management, availability management,
appointment schedules, authorized patient history, consultation records,
prescriptions, and follow-up tracking.

### Receptionist

Needs patient registration, patient search, doctor availability,
appointment booking, rescheduling, cancellation, and daily scheduling.

### Billing Staff

Needs patient billing lookup, invoice creation, invoice issuing, payment
recording, and outstanding-payment tracking.

### Administrator

Needs user, doctor, patient, appointment, billing, account-status, and
audit-log management.

## 6. MVP Scope

### In Scope

-   Authentication and session management
-   Role-based access control
-   Patient management
-   Doctor management
-   Doctor availability
-   Appointment management
-   Medical records
-   Prescriptions
-   Billing and invoices
-   Payment recording
-   Search and filtering
-   Role-specific dashboards
-   Audit logging
-   Input validation
-   Error handling
-   Automated testing
-   Responsive web UI

### Out of Scope for MVP v1

-   AI-based diagnosis
-   Clinical prediction
-   Disease-risk prediction
-   Medical image diagnosis
-   AI-generated prescriptions
-   Medical-device/IoT integration
-   Telemedicine/video consultation
-   Laboratory information system
-   Radiology/PACS/DICOM
-   Pharmacy/inventory
-   Insurance/TPA claims
-   ABDM integration
-   Production FHIR interoperability
-   Online payment gateway
-   Complex IPD/bed management
-   Emergency/ambulance management
-   Advanced BI/analytics
-   Real-time chat
-   Automated SMS/WhatsApp/email notification infrastructure

## 7. Functional Product Requirements

### PR-001 Authentication

The system shall support patient registration, login, logout/session
handling, password change, account activation/deactivation, and
protected routes. Passwords must never be stored in plaintext.

**Acceptance:** valid users authenticate, invalid credentials are
rejected, and protected resources require authentication.

### PR-002 Role-Based Access Control

Roles:

``` text
PATIENT
DOCTOR
RECEPTIONIST
BILLING_STAFF
ADMIN
```

Authorization must be enforced on the backend. Frontend hiding alone is
not authorization.

### PR-003 Patient Management

Authorized users shall create, view, update, and search patients
according to role permissions.

### PR-004 Doctor Management

Authorized users shall create, view, update, and search doctors and
manage specialization, qualification, professional information, and
availability.

### PR-005 Doctor Availability

Availability includes day of week, start time, end time, slot duration,
and active status. End time must be after start time; inactive
availability cannot be booked.

### PR-006 Appointment Booking

Patients/receptionists/admins may create appointments according to
permissions. The backend must verify patient existence, doctor activity,
availability, time conflicts, and authorization.

### PR-007 Appointment Lifecycle

Statuses:

``` text
SCHEDULED
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW
```

Actions include view, confirm, cancel, reschedule, and complete.
Cancelled appointments cannot be completed; completed appointments
cannot be directly rescheduled; overlapping active appointments must be
rejected.

### PR-008 Medical Records

Authorized doctors can create/manage consultation records containing
patient, doctor, appointment, record date, chief complaint, clinical
notes, diagnosis/assessment, treatment notes, and follow-up date.

### PR-009 Prescriptions

Authorized doctors can create prescriptions containing patient, doctor,
appointment, date, instructions, status, and one or more medicine items.
Medicine items contain name, dosage, frequency, duration, route, and
instructions.

### PR-010 Billing

Billing staff/admin can create and issue invoices containing invoice
number, patient, appointment where applicable, date, items, subtotal,
discount, tax, total, and status.

Invoice statuses:

``` text
DRAFT
ISSUED
PARTIALLY_PAID
PAID
CANCELLED
```

Backend calculation:

``` text
subtotal = Σ(quantity × unit_price)
total = subtotal - discount + tax
```

### PR-011 Payments

Authorized billing users can record payments using CASH, CARD, UPI,
BANK_TRANSFER, or OTHER. Payment status must be recalculated after each
payment.

### PR-012 Search and Retrieval

Patient search: code, name, phone, email. Doctor search: name,
specialization, code. Appointment filters: date, doctor, patient,
status. Billing filters: patient, invoice number, date, payment status.
Large result sets must be paginated.

### PR-013 Dashboards

Patient: upcoming appointments, active prescriptions, recent records,
outstanding bills.

Doctor: today's appointments, upcoming appointments, assigned patients,
pending follow-ups.

Receptionist: today's appointments, upcoming appointments, pending
appointments, patient registrations.

Billing: today's invoices, outstanding amount, paid amount, pending
payments.

Admin: total patients, active doctors, today's appointments, outstanding
billing amount.

### PR-014 Audit Logging

Important security-sensitive and data-changing actions shall be
auditable, including relevant login, user, patient, appointment,
medical-record, prescription, invoice, and payment operations. Sensitive
credentials and tokens must not be logged.

## 8. User Stories

### Authentication

-   As a patient, I want to register so that I can use the platform.
-   As a user, I want to log in securely so that I can access my
    account.
-   As a user, I want to log out so that my session is no longer active.
-   As an administrator, I want to activate/deactivate accounts so that
    access can be controlled.

### Patients and Doctors

-   As a patient, I want to maintain my profile.
-   As a receptionist, I want to register patients.
-   As an authorized staff member, I want to search patients.
-   As an administrator, I want to create doctor profiles.
-   As a patient, I want to search doctors by specialization.
-   As a doctor, I want to manage my availability.

### Appointments

-   As a patient, I want to book an available appointment.
-   As a receptionist, I want to book an appointment for a patient.
-   As a user, I want to view appointments.
-   As an authorized user, I want to cancel/reschedule an appointment.
-   As a doctor, I want to view my schedule.

### Clinical

-   As a doctor, I want to record consultation information.
-   As a doctor, I want to view relevant patient history.
-   As a patient, I want to view my authorized medical records.
-   As a doctor, I want to create prescriptions.
-   As a patient, I want to view prescriptions.

### Billing

-   As billing staff, I want to create invoices.
-   As billing staff, I want to record payments.
-   As a patient, I want to view my billing information.
-   As billing staff, I want to see outstanding payments.

## 9. Permission Matrix

  --------------------------------------------------------------------------------
  Capability      Patient     Doctor       Receptionist   Billing     Admin
  --------------- ----------- ------------ -------------- ----------- ------------
  Own profile     CRUD        CRUD         CRUD           CRUD        CRUD

  Other patient   No          Authorized   CRUD           Limited     CRUD
  profile                     view                                    

  Doctor          No          Own          View           View        CRUD
  management                                                          

  Availability    No          Own          View           View        CRUD

  Book            Own         Limited      Yes            No          Yes
  appointment                                                         

  Manage          Own         Own schedule Yes            No          Yes
  appointments                                                        

  Medical records Own view    Authorized   No clinical    No          Authorized
                              CRUD         edit                       view/audit

  Prescriptions   Own view    Authorized   No             No          Authorized
                              CRUD                                    view/audit

  Billing         Own view    Limited      No             CRUD        CRUD

  User management No          No           No             No          CRUD

  Audit logs      No          No           No             No          Read
  --------------------------------------------------------------------------------

## 10. Non-Functional Requirements

  -----------------------------------------------------------------------
  ID                      Requirement             Expectation
  ----------------------- ----------------------- -----------------------
  NFR-01                  Security                Protect healthcare
                                                  information from
                                                  unauthorized access

  NFR-02                  Performance             Normal operations
                                                  respond within
                                                  reasonable time

  NFR-03                  Usability               Simple, consistent
                                                  interface

  NFR-04                  Reliability             Minimize failures and
                                                  preserve valid data

  NFR-05                  Availability            Authorized users can
                                                  access the operational
                                                  system

  NFR-06                  Maintainability         Modular services,
                                                  reusable UI, migrations
                                                  and tests

  NFR-07                  Scalability             Support increasing
                                                  users and records

  NFR-08                  Data Integrity          Maintain accurate
                                                  relational data

  NFR-09                  Backup/Recovery         Document database
                                                  backup and restore

  NFR-10                  Compatibility           Modern browsers and
                                                  responsive layouts

  NFR-11                  Accessibility           Keyboard navigation,
                                                  readable contrast,
                                                  semantic markup, focus
                                                  states

  NFR-12                  Privacy                 Avoid unnecessary
                                                  sensitive-data exposure
  -----------------------------------------------------------------------

## 11. UX Requirements

Use the established Arogyavajra palette:

``` text
Deep Navy       #021C48
Primary Blue    #012C7D
Royal Blue      #0B5ED7
Bright Blue     #1677E8
Soft Blue       #E5F0FE
Background      #F6F9FD
White           #FFFFFF
Border          #DDE6F2
Muted Text      #52658A
Success         #16A765
Success Light   #D7F5E3
```

Primary brand colors are #021C48 and #0B5ED7. Use white and very-light
blue as neutral surfaces.

Authenticated pages should use a consistent sidebar + top bar +
main-content shell. Navigation must be role-aware. Important screens
must support loading, empty, success, validation-error, server-error,
unauthorized, and not-found states.

## 12. Required Screens

### Public

-   Landing page
-   Login
-   Patient registration
-   Password-management screens as implemented

### Patient

-   Dashboard
-   Profile
-   Find doctors
-   Doctor details
-   Book appointment
-   Appointments
-   Medical records
-   Prescriptions
-   Bills

### Doctor

-   Dashboard
-   Profile
-   Availability
-   Appointments
-   Patient details
-   Medical records
-   Consultation form
-   Prescriptions
-   Prescription form

### Receptionist

-   Dashboard
-   Patients
-   Patient registration
-   Appointments
-   Appointment booking
-   Schedule

### Billing

-   Dashboard
-   Invoices
-   Create invoice
-   Invoice details
-   Record payment
-   Payment history

### Admin

-   Dashboard
-   Users
-   Doctors
-   Patients
-   Appointments
-   Billing overview
-   Audit logs
-   Settings

## 13. Core User Flows

### Patient Appointment

``` text
Login → Dashboard → Find Doctor → Select Doctor → Availability
→ Select Slot → Confirm → Conflict Check → Appointment Created
```

### Doctor Consultation

``` text
Login → Dashboard → Today's Appointments → Patient
→ Authorized History → Consultation → Medical Record
→ Prescription → Complete Appointment
```

### Billing

``` text
Login → Find Patient → Create Invoice → Add Items
→ Backend Total → Issue Invoice → Record Payment → Payment Status
```

## 14. Information Architecture

``` text
Arogyavajra
├── Public
│   ├── Home
│   ├── Login
│   └── Register
├── Patient
│   ├── Dashboard
│   ├── Profile
│   ├── Doctors
│   ├── Appointments
│   ├── Medical Records
│   ├── Prescriptions
│   └── Billing
├── Doctor
│   ├── Dashboard
│   ├── Profile
│   ├── Availability
│   ├── Appointments
│   ├── Patients
│   ├── Medical Records
│   └── Prescriptions
├── Receptionist
│   ├── Dashboard
│   ├── Patients
│   └── Appointments
├── Billing
│   ├── Dashboard
│   ├── Invoices
│   └── Payments
└── Admin
    ├── Dashboard
    ├── Users
    ├── Doctors
    ├── Patients
    ├── Appointments
    ├── Billing
    ├── Audit Logs
    └── Settings
```

## 15. Data Model Requirements

Core entities:

``` text
User
PatientProfile
DoctorProfile
DoctorAvailability
Appointment
MedicalRecord
Prescription
PrescriptionItem
Invoice
InvoiceItem
Payment
AuditLog
```

Relationships:

``` text
User
 ├── PatientProfile
 └── DoctorProfile

Patient
 ├── Appointments ─── Doctor
 ├── MedicalRecords ─ Doctor
 ├── Prescriptions ── Doctor
 └── Invoices
        └── Payments

Doctor
 ├── Availability
 ├── Appointments
 ├── MedicalRecords
 └── Prescriptions

Prescription
 └── PrescriptionItems

Invoice
 ├── InvoiceItems
 └── Payments
```

## 16. Technical Constraints

### Frontend

-   Next.js
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   React Hook Form
-   Zod
-   TanStack Query
-   Lucide React

### Backend

-   Python 3.12+
-   FastAPI
-   Pydantic
-   SQLAlchemy 2.x
-   Alembic
-   JWT-based authentication
-   Secure password hashing

### Database

-   PostgreSQL 16+

### Development

-   Git/GitHub
-   Docker
-   Docker Compose
-   pytest
-   Ruff
-   Frontend lint/type checking
-   Playwright for critical E2E flows

## 17. API Contract

Base path:

``` text
/api/v1
```

Major resources:

``` text
/auth
/patients
/doctors
/appointments
/medical-records
/prescriptions
/invoices
/users
/audit-logs
```

The frontend consumes these APIs; it must not directly access the
database. Protected APIs must enforce authentication and authorization.

## 18. Security Requirements

-   Secure password hashing.
-   Protected authenticated routes.
-   Server-side RBAC.
-   Resource ownership checks.
-   Explicit CORS configuration.
-   Validation of request data.
-   Rate limiting for authentication endpoints where implemented.
-   No secrets in source code.
-   No passwords, tokens, database credentials, or stack traces in
    logs/responses.
-   Audit important mutations.

## 19. Quality Requirements

### Unit tests

Test authentication, permissions, appointment conflicts, appointment
state transitions, invoice calculations, and prescription validation.

### Integration tests

Test authentication/database integration, patient and doctor creation,
appointments, medical records, prescriptions, billing, and payments.

### End-to-end tests

At minimum cover patient appointment booking, doctor consultation,
prescription creation, billing/payment, and unauthorized clinical-data
access.

## 20. Definition of Done

A feature is complete only when UI, API, database persistence,
validation, authorization, loading/empty/error/success states, relevant
audit behavior, tests, documentation, and required migrations are
complete. Critical E2E workflows must be covered where applicable.

## 21. MVP Release Criteria

### Core

-   [ ] Authentication works
-   [ ] RBAC works
-   [ ] Patient management works
-   [ ] Doctor management works
-   [ ] Availability works
-   [ ] Appointment booking works
-   [ ] Conflict prevention works
-   [ ] Medical records work
-   [ ] Prescriptions work
-   [ ] Invoices work
-   [ ] Payments work
-   [ ] Dashboards work
-   [ ] Audit logging works

### Security

-   [ ] Passwords are hashed
-   [ ] Backend RBAC is enforced
-   [ ] Resource ownership is enforced
-   [ ] Sensitive data is protected

### Quality

-   [ ] Unit tests pass
-   [ ] Integration tests pass
-   [ ] Critical E2E tests pass
-   [ ] Database migrations work from a clean environment
-   [ ] Docker setup works
-   [ ] Responsive UI reviewed
-   [ ] Accessibility baseline reviewed

## 22. Success Metrics

The MVP should be evaluated through software/product reliability rather
than clinical outcome claims.

-   Valid users authenticate successfully.
-   Invalid authentication is handled correctly.
-   Correct role routing occurs.
-   Valid appointments can be booked.
-   No conflicting active appointment is accepted for the same
    doctor/time slot.
-   Consultation records and prescriptions are correctly associated with
    patient and doctor.
-   Backend billing calculations are correct.
-   Payment status transitions are correct.
-   Critical authorization tests pass.
-   Critical data-integrity failures are absent.

## 23. Risks and Mitigation

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Unauthorized            High                    Backend RBAC, ownership
  medical-data access                             checks, authorization
                                                  tests

  Appointment double      High                    Transactional conflict
  booking                                         validation

  Incorrect billing       High                    Backend calculation and
  totals                                          tests

  Data loss               High                    PostgreSQL backups and
                                                  restore procedure

  Scope expansion         High                    Strict MVP boundary

  Excessive architecture  Medium                  Modular monolith
  complexity                                      

  API/frontend mismatch   Medium                  Documented contracts

  Poor UX                 Medium                  Consistent design
                                                  system and usability
                                                  review

  Insufficient test       Medium                  Critical-workflow
  coverage                                        testing

  Sensitive data in logs  High                    Structured logging
                                                  policy
  -----------------------------------------------------------------------

## 24. Future Roadmap

### Phase 2 --- Operational Expansion

-   Notifications
-   Laboratory management
-   Pharmacy/inventory
-   Advanced appointment scheduling
-   Reporting and analytics

### Phase 3 --- Healthcare Integration

-   Telemedicine
-   Interoperability
-   FHIR-based integrations
-   ABDM-related integrations where applicable

### Phase 4 --- Clinical Intelligence

-   AI-assisted clinical insights
-   Risk prediction
-   Clinical decision-support tools
-   Medical-data analytics
-   Explainable AI capabilities

Future clinical-intelligence features require their own safety, privacy,
validation, and governance requirements.

## 25. MVP vs Future Scope

  Capability                     MVP   Future
  ---------------------------- ----- --------
  Authentication                   ✓ 
  RBAC                             ✓ 
  Patient management               ✓ 
  Doctor management                ✓ 
  Availability                     ✓ 
  Appointments                     ✓ 
  Medical records                  ✓ 
  Prescriptions                    ✓ 
  Billing                          ✓ 
  Payments                         ✓ 
  Audit logs                       ✓ 
  Basic dashboards                 ✓ 
  Advanced analytics                        ✓
  Notifications                             ✓
  Laboratory                                ✓
  Pharmacy                                  ✓
  Telemedicine                              ✓
  ABDM/FHIR integrations                    ✓
  AI diagnosis                              ✓
  Clinical prediction                       ✓
  Medical-device integration                ✓

## 26. Product Boundary

Arogyavajra MVP v1 is a **healthcare management platform**. It manages
people, appointments, clinical records, prescriptions, billing,
payments, access control, and audit. It does not independently make
medical decisions.

The MVP should not claim that the system diagnoses disease, determines
treatment, replaces a doctor, or provides autonomous clinical decisions.

## 27. Relationship to MVP.md

This PRD defines **what the product must achieve and why**. `MVP.md`
defines the **implementation-level baseline for how the MVP is
structured and built**.

``` text
PRD
 ↓
Vision + Users + Problems + Goals + Requirements + Scope
 ↓
MVP.md
 ↓
Architecture + Database + APIs + Business Rules + Security + Testing + Implementation Checklist
```

If the documents conflict, record the change and update both documents
rather than silently choosing one.

## 28. Product Decision Log

  -----------------------------------------------------------------------
  Decision                            Rationale
  ----------------------------------- -----------------------------------
  Healthcare management as MVP        Focuses the first release on core
                                      operations

  Modular monolith                    Avoids unnecessary microservice
                                      complexity

  PostgreSQL                          Provides relational integrity for
                                      healthcare and billing data

  FastAPI backend                     Centralizes business logic and
                                      authorization

  Next.js frontend                    Provides a structured modern web
                                      application

  Backend-authoritative calculations  Protects billing integrity

  Backend-enforced RBAC               Protects sensitive healthcare data

  Audit logging                       Provides traceability

  Advanced AI excluded from MVP       Keeps clinical-intelligence
                                      complexity separate

  Payment gateway excluded            Manual payment recording is
                                      sufficient for MVP

  Notifications excluded              Keeps first release focused
  -----------------------------------------------------------------------

## 29. Final Product Definition

Arogyavajra MVP v1 provides a unified system in which patients, doctors,
receptionists, billing staff, and administrators perform their
authorized workflows using persistent data, validated business rules,
and role-based access.

The first release prioritizes:

**Correctness → Security → Core workflow completeness → Usability →
Maintainability → Extensibility**

## 30. Final Acceptance Statement

Arogyavajra MVP v1 is ready when the defined users can successfully and
securely perform their respective end-to-end workflows using persistent
data, correct role permissions, validated business rules, and tested
application behavior.
