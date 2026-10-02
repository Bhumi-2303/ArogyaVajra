# Arogyavajra --- MVP Specification

**Document type:** Implementation-ready MVP definition\
**Project:** Arogyavajra\
**Project category:** Healthcare Management Platform\
**Status:** Baseline specification for MVP development\
**Version:** 1.0\
**Last updated:** 2026-10-02

------------------------------------------------------------------------

## 1. Purpose

Arogyavajra is a centralized healthcare management platform for managing
patients, doctors, appointments, medical records, prescriptions,
billing, and role-based access from one system.

This document is the **implementation baseline for the MVP**.
Development should follow this document unless a requirement is
explicitly changed and recorded in a newer version.

The MVP is intentionally limited to core healthcare-management
workflows. AI diagnosis, clinical prediction, medical-device
integration, telemedicine, pharmacy, laboratory automation,
insurance/TPA processing, and other advanced clinical-intelligence
capabilities are **not part of MVP v1**.

------------------------------------------------------------------------

## 2. Product Goal

The MVP must allow a small healthcare organization/clinic to perform the
following complete workflow:

``` text
User authentication
       ↓
Role-based dashboard
       ↓
Patient registration/profile
       ↓
Doctor and availability management
       ↓
Appointment booking
       ↓
Doctor consultation record
       ↓
Prescription creation
       ↓
Billing/invoice generation
       ↓
Patient/doctor/staff can retrieve authorized history
```

The MVP is successful when this end-to-end workflow works reliably with
real database persistence and enforced authorization.

------------------------------------------------------------------------

## 3. Primary Users and Roles

### 3.1 Patient

A patient can:

-   Register/login.
-   Maintain their own profile.
-   View available doctors.
-   View doctor availability.
-   Book an appointment.
-   View their appointments.
-   Cancel/reschedule according to appointment rules.
-   View their own medical records.
-   View their own prescriptions.
-   View their own bills and payment status.

A patient must never access another patient's private medical
information.

### 3.2 Doctor

A doctor can:

-   Login.
-   View their dashboard.
-   Maintain professional profile and availability.
-   View their assigned/upcoming appointments.
-   View authorized patient information.
-   Create consultation/medical records.
-   View relevant patient medical history.
-   Create prescriptions.
-   View prescription history for authorized patients.

A doctor must not access unrelated administrative data or another
doctor's private account information.

### 3.3 Receptionist

A receptionist can:

-   Login.
-   Register/manage patients.
-   View doctors and their availability.
-   Create appointments on behalf of patients.
-   Reschedule/cancel appointments.
-   View appointment queues/schedules.
-   View basic patient administrative information.

A receptionist should not create or modify clinical records or
prescriptions.

### 3.4 Billing Staff

Billing staff can:

-   Login.
-   View patient billing information.
-   Create invoices.
-   Add invoice line items.
-   Record payments.
-   View payment status.
-   View billing history.

Billing staff should not modify clinical records or prescriptions.

### 3.5 Administrator

The administrator can:

-   Login.
-   Manage users.
-   Create/manage doctor accounts.
-   Manage roles.
-   Activate/deactivate users.
-   Manage doctors and their professional information.
-   View/manage patients.
-   View/manage appointments.
-   View system-level billing information.
-   View audit logs.
-   Access administrative dashboards.

Administrative access does not automatically grant permission to alter
clinical information. Clinical actions remain role-specific.

------------------------------------------------------------------------

## 4. MVP Scope

### 4.1 Included in MVP

  Module                      MVP Status
  --------------------------- ------------
  Authentication              Required
  Role-Based Access Control   Required
  Patient Management          Required
  Doctor Management           Required
  Doctor Availability         Required
  Appointment Management      Required
  Medical Records             Required
  Prescriptions               Required
  Billing / Invoices          Required
  Payment Recording           Required
  Search / Retrieval          Required
  Role-Based Dashboards       Required
  Audit Logging               Required
  Database Persistence        Required
  Input Validation            Required
  Error Handling              Required
  Automated Tests             Required
  Responsive Web UI           Required

### 4.2 Explicitly excluded from MVP v1

The following must **not** be implemented as MVP requirements:

-   AI-based diagnosis.
-   Clinical prediction.
-   Disease-risk prediction.
-   Medical image diagnosis.
-   AI-generated prescriptions.
-   Medical-device/IoT integration.
-   Telemedicine/video consultation.
-   Automated laboratory information system.
-   Radiology/PACS/DICOM integration.
-   Pharmacy/inventory management.
-   Insurance/TPA claim processing.
-   ABDM integration.
-   FHIR interoperability as a production integration.
-   Payment-gateway integration.
-   Complex hospital IPD/bed management.
-   Emergency/ambulance management.
-   Advanced analytics/BI.
-   Patient-to-doctor real-time chat.
-   Notification infrastructure such as SMS/WhatsApp/email automation.

These may be added as future modules without changing the core MVP
domain model unnecessarily.

------------------------------------------------------------------------

## 5. MVP Product Principles

1.  **Backend is authoritative.** Frontend validation improves UX but
    never replaces backend validation.
2.  **Authorization is enforced server-side.** Hiding a UI element is
    not an authorization mechanism.
3.  **Clinical data is private by default.**
4.  **Every database entity has a clear owner/relationship.**
5.  **Appointments have explicit states and transition rules.**
6.  **Prescriptions and medical records are linked to the doctor,
    patient, and relevant consultation/appointment.**
7.  **Invoices are immutable in important financial fields after payment
    unless an authorized correction workflow exists.**
8.  **All important mutations are auditable.**
9.  **Business logic stays in the backend/service layer, not inside UI
    components.**
10. **The MVP should be a modular monolith, not microservices.**

------------------------------------------------------------------------

# 6. Recommended Technology Stack

The stack below is the implementation baseline.

## Frontend

-   **Next.js**
-   **TypeScript**
-   **Tailwind CSS**
-   **shadcn/ui** for reusable UI primitives
-   **React Hook Form**
-   **Zod**
-   **TanStack Query** for server-state/API data
-   **Lucide React** for icons

## Backend

-   **Python 3.12+**
-   **FastAPI**
-   **Pydantic**
-   **SQLAlchemy 2.x**
-   **Alembic**
-   **PyJWT**
-   **bcrypt/passlib-compatible password hashing implementation**

## Database

-   **PostgreSQL 16+**

SQLite may be used only for isolated local experiments/tests if
required. PostgreSQL remains the actual MVP database.

## Development / DevOps

-   Git
-   GitHub
-   Docker
-   Docker Compose
-   pytest
-   Ruff
-   frontend lint/type checking
-   Playwright for critical end-to-end flows

------------------------------------------------------------------------

# 7. Architecture

## 7.1 Architecture Style

Use a **modular monolith / layered architecture**.

``` text
                    ┌─────────────────────────┐
                    │     Next.js Frontend    │
                    │ TypeScript + Tailwind   │
                    └────────────┬────────────┘
                                 │ HTTPS / REST
                                 ▼
                    ┌─────────────────────────┐
                    │      FastAPI API        │
                    │ Auth + RBAC + Validation│
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
       Domain Services      Repositories       Audit Service
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │      PostgreSQL         │
                    └─────────────────────────┘
```

Do not create separate microservices for each module in MVP v1.

------------------------------------------------------------------------

## 7.2 Backend Layering

Recommended backend structure:

``` text
API Router
   ↓
Schema Validation
   ↓
Service / Business Logic
   ↓
Repository / Data Access
   ↓
SQLAlchemy
   ↓
PostgreSQL
```

Authentication and authorization must be applied before protected
business operations.

------------------------------------------------------------------------

# 8. Repository Structure

Use a repository structure similar to:

``` text
arogyavajra/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   └── tests/
│   │
│   └── api/
│       ├── app/
│       │   ├── core/
│       │   ├── db/
│       │   ├── models/
│       │   ├── schemas/
│       │   ├── repositories/
│       │   ├── services/
│       │   ├── api/
│       │   │   └── routes/
│       │   ├── dependencies/
│       │   └── main.py
│       └── tests/
│
├── docs/
├── infra/
│   ├── docker/
│   └── compose/
├── scripts/
├── .env.example
├── docker-compose.yml
├── README.md
└── MVP.md
```

Keep domain modules separated even though the application is a monolith.

------------------------------------------------------------------------

# 9. Core Domain Modules

The backend should contain these logical modules:

``` text
auth
users
patients
doctors
appointments
medical_records
prescriptions
billing
search
audit
```

------------------------------------------------------------------------

# 10. Authentication and Authorization

## 10.1 Authentication

MVP authentication must provide:

-   Registration for patients.
-   Login.
-   Logout/session invalidation strategy.
-   Password hashing.
-   Access-token based authentication.
-   Refresh-token support if the chosen frontend/session design requires
    it.
-   Current-user/profile endpoint.
-   Password change.
-   Account activation/deactivation.

Passwords must never be stored as plaintext.

## 10.2 Roles

Use an enum:

``` text
PATIENT
DOCTOR
RECEPTIONIST
BILLING_STAFF
ADMIN
```

## 10.3 RBAC Matrix

  -------------------------------------------------------------------------------------
  Action               Patient          Doctor   Receptionist      Billing        Admin
  --------------- ------------ --------------- -------------- ------------ ------------
  Own profile             CRUD            CRUD           CRUD         CRUD         CRUD

  Other patient             No Authorized view           CRUD Limited view         CRUD
  profile                                                                  

  Doctor                    No     Own profile           View         View         CRUD
  management                                                               

  Availability              No             Own           View         View         CRUD

  Book                     Own   Limited/admin            Yes           No          Yes
  appointment                         workflow                             

  Manage                   Own    Own schedule            Yes           No          Yes
  appointment                                                              

  Medical records     Own view Authorized CRUD    No clinical           No   View/audit
                                                         edit              as permitted

  Prescriptions       Own view Authorized CRUD             No           No   View/audit
                                                                           as permitted

  Billing             Own view    Limited view             No         CRUD         CRUD

  User management           No              No             No           No         CRUD

  Audit logs                No              No             No           No         Read
  -------------------------------------------------------------------------------------

**Important:** "Admin" is not a blanket bypass for application-level
authorization. Sensitive clinical and financial actions must still be
represented explicitly in the permission model.

------------------------------------------------------------------------

# 11. Database Model

The following entities are the minimum MVP data model.

## 11.1 users

``` text
id
email
password_hash
role
is_active
created_at
updated_at
last_login_at
```

Constraints:

-   `email` unique.
-   `role` required.
-   `password_hash` never exposed through API responses.

## 11.2 patient_profiles

``` text
id
user_id
patient_code
first_name
last_name
date_of_birth
gender
phone
address
emergency_contact_name
emergency_contact_phone
created_at
updated_at
```

Constraints:

-   `user_id` unique for patient-linked accounts.
-   Patient code unique.

## 11.3 doctor_profiles

``` text
id
user_id
doctor_code
first_name
last_name
specialization
qualification
license_number
phone
consultation_fee
bio
created_at
updated_at
```

Constraints:

-   Doctor code unique.
-   License number unique when supplied.

## 11.4 doctor_availability

``` text
id
doctor_id
day_of_week
start_time
end_time
slot_duration_minutes
is_active
created_at
updated_at
```

Rules:

-   End time must be after start time.
-   Slot duration must be positive.
-   Availability must belong to an active doctor.

## 11.5 appointments

``` text
id
appointment_code
patient_id
doctor_id
appointment_date
start_time
end_time
reason
status
notes
created_by
created_at
updated_at
```

Appointment status:

``` text
SCHEDULED
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW
```

Rules:

-   Patient and doctor must exist and be active.
-   Doctor cannot have overlapping active appointments.
-   Cancelled appointments cannot be completed.
-   Completed appointments cannot be rescheduled directly.
-   Appointment date/time must satisfy the application's scheduling
    rules.
-   Status transitions must be validated by backend logic.

## 11.6 medical_records

``` text
id
patient_id
doctor_id
appointment_id
record_date
chief_complaint
clinical_notes
diagnosis
treatment_notes
follow_up_date
created_at
updated_at
```

Rules:

-   Record must reference a patient and doctor.
-   Appointment reference is required when the record originates from an
    appointment.
-   Clinical record creation is restricted to authorized clinical users.

## 11.7 prescriptions

``` text
id
patient_id
doctor_id
appointment_id
prescription_date
instructions
status
created_at
updated_at
```

Prescription status:

``` text
ACTIVE
COMPLETED
CANCELLED
```

## 11.8 prescription_items

``` text
id
prescription_id
medicine_name
dosage
frequency
duration
route
instructions
```

The MVP does not require a separate pharmacy inventory or drug-catalog
system.

## 11.9 invoices

``` text
id
invoice_number
patient_id
appointment_id
invoice_date
subtotal
discount
tax
total
status
created_by
created_at
updated_at
```

Invoice status:

``` text
DRAFT
ISSUED
PARTIALLY_PAID
PAID
CANCELLED
```

## 11.10 invoice_items

``` text
id
invoice_id
description
quantity
unit_price
amount
```

## 11.11 payments

``` text
id
invoice_id
amount
payment_method
payment_reference
paid_at
recorded_by
created_at
```

Payment method:

``` text
CASH
CARD
UPI
BANK_TRANSFER
OTHER
```

No online payment gateway is required for MVP.

## 11.12 audit_logs

``` text
id
user_id
action
entity_type
entity_id
old_values
new_values
ip_address
user_agent
created_at
```

Audit logs should capture security-sensitive and important data
mutations.

------------------------------------------------------------------------

# 12. Database Relationships

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

Every relationship must be represented with foreign keys.

Use database indexes for frequently queried fields such as:

-   user.email
-   patient.patient_code
-   doctor.doctor_code
-   appointment.patient_id
-   appointment.doctor_id
-   appointment.appointment_date
-   appointment.status
-   medical_record.patient_id
-   prescription.patient_id
-   invoice.patient_id
-   audit_log.entity_type/entity_id

------------------------------------------------------------------------

# 13. API Conventions

Base URL:

``` text
/api/v1
```

Use RESTful endpoints.

## 13.1 Authentication

``` text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me
PUT    /auth/me
PUT    /auth/change-password
```

## 13.2 Patients

``` text
GET    /patients
POST   /patients
GET    /patients/{patient_id}
PUT    /patients/{patient_id}
GET    /patients/{patient_id}/appointments
GET    /patients/{patient_id}/medical-records
GET    /patients/{patient_id}/prescriptions
GET    /patients/{patient_id}/invoices
```

## 13.3 Doctors

``` text
GET    /doctors
POST   /doctors
GET    /doctors/{doctor_id}
PUT    /doctors/{doctor_id}
GET    /doctors/{doctor_id}/availability
PUT    /doctors/{doctor_id}/availability
GET    /doctors/{doctor_id}/appointments
```

## 13.4 Appointments

``` text
GET    /appointments
POST   /appointments
GET    /appointments/{appointment_id}
PUT    /appointments/{appointment_id}
POST   /appointments/{appointment_id}/cancel
POST   /appointments/{appointment_id}/confirm
POST   /appointments/{appointment_id}/complete
```

## 13.5 Medical Records

``` text
GET    /medical-records
POST   /medical-records
GET    /medical-records/{record_id}
PUT    /medical-records/{record_id}
```

## 13.6 Prescriptions

``` text
GET    /prescriptions
POST   /prescriptions
GET    /prescriptions/{prescription_id}
PUT    /prescriptions/{prescription_id}
POST   /prescriptions/{prescription_id}/cancel
```

## 13.7 Billing

``` text
GET    /invoices
POST   /invoices
GET    /invoices/{invoice_id}
PUT    /invoices/{invoice_id}
POST   /invoices/{invoice_id}/issue
POST   /invoices/{invoice_id}/cancel
GET    /invoices/{invoice_id}/payments
POST   /invoices/{invoice_id}/payments
```

## 13.8 Admin / Users

``` text
GET    /users
GET    /users/{user_id}
PUT    /users/{user_id}
POST   /users/{user_id}/activate
POST   /users/{user_id}/deactivate
GET    /audit-logs
```

------------------------------------------------------------------------

# 14. API Response Standard

Successful response:

``` json
{
  "data": {},
  "message": "Operation completed successfully"
}
```

Paginated response:

``` json
{
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

Error response:

``` json
{
  "error": {
    "code": "APPOINTMENT_CONFLICT",
    "message": "The selected doctor already has an appointment during this time."
  }
}
```

Do not expose stack traces, SQL errors, password hashes, tokens, or
internal implementation details to clients.

------------------------------------------------------------------------

# 15. Core Business Rules

## 15.1 Registration

-   Patient self-registration is allowed.
-   Doctor/receptionist/billing/admin accounts are created by an
    authorized administrator.
-   Email must be unique.
-   Password must meet configured security requirements.
-   Patient profile must be created together with the patient account.

## 15.2 Appointment Booking

The backend must:

1.  Verify authenticated user.
2.  Verify patient exists and is active.
3.  Verify doctor exists and is active.
4.  Verify requested slot falls within doctor availability.
5.  Check overlapping active appointments.
6.  Reject conflicts.
7.  Create appointment.
8.  Write an audit event.

## 15.3 Consultation

A doctor can open an appointment assigned to them and create a medical
record.

The record should contain:

-   Chief complaint.
-   Clinical notes.
-   Diagnosis/assessment.
-   Treatment notes.
-   Follow-up date when applicable.

## 15.4 Prescription

A doctor can create a prescription for an authorized patient.

Each prescription can contain multiple medicine items.

A prescription must never be created by a patient, receptionist, or
billing staff.

## 15.5 Billing

Billing staff or administrator can:

1.  Create invoice.
2.  Add line items.
3.  Calculate subtotal.
4.  Apply discount/tax where applicable.
5.  Calculate total.
6.  Issue invoice.
7.  Record payment.
8.  Update payment status.

Basic calculation:

``` text
subtotal = Σ(quantity × unit_price)

total = subtotal - discount + tax
```

The backend must perform the final calculation. The frontend must not be
trusted for totals.

## 15.6 Medical Data Access

Default rule:

> A user may access only the healthcare data permitted by their role and
> relationship to that data.

Never implement an endpoint that returns all medical records without
authorization filtering.

------------------------------------------------------------------------

# 16. Search and Filtering

MVP search must support practical administrative/clinical retrieval.

### Patient search

Search by:

-   Patient code.
-   Name.
-   Phone.
-   Email.

### Doctor search

Search by:

-   Doctor name.
-   Specialization.
-   Doctor code.

### Appointment filters

Filter by:

-   Date.
-   Doctor.
-   Patient.
-   Status.

### Billing filters

Filter by:

-   Patient.
-   Invoice number.
-   Date.
-   Payment status.

Pagination is required for list endpoints.

------------------------------------------------------------------------

# 17. Dashboard Requirements

Dashboards are role-specific.

## 17.1 Patient Dashboard

Minimum cards:

-   Upcoming appointments.
-   Active prescriptions.
-   Recent medical records.
-   Outstanding bills.

Quick actions:

-   Book appointment.
-   View appointments.
-   View records.
-   View prescriptions.

## 17.2 Doctor Dashboard

Minimum cards:

-   Today's appointments.
-   Upcoming appointments.
-   Total assigned patients.
-   Pending follow-ups.

Quick actions:

-   Open today's appointment.
-   Create medical record.
-   Create prescription.
-   View patient.

## 17.3 Receptionist Dashboard

Minimum cards:

-   Today's appointments.
-   Upcoming appointments.
-   Pending appointments.
-   Patient registrations.

Quick actions:

-   Register patient.
-   Book appointment.
-   Manage today's schedule.

## 17.4 Billing Dashboard

Minimum cards:

-   Today's invoices.
-   Outstanding amount.
-   Paid amount.
-   Pending payments.

Quick actions:

-   Create invoice.
-   Record payment.
-   Search invoice.

## 17.5 Admin Dashboard

Minimum cards:

-   Total patients.
-   Active doctors.
-   Today's appointments.
-   Outstanding billing amount.

Quick actions:

-   Add doctor.
-   Add staff.
-   Manage users.
-   View audit logs.

Do not build complex analytics for MVP. Simple database-backed counts
are sufficient.

------------------------------------------------------------------------

# 18. UI / UX Requirements

The UI must follow the established Arogyavajra healthcare design
language.

## 18.1 Core colors

Use the existing Arogyavajra palette:

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

Primary brand colors:

``` text
#021C48
#0B5ED7
```

Use white and very-light blue as neutral surfaces.

## 18.2 Design direction

The interface should maintain:

-   Clean healthcare appearance.
-   Strong visual hierarchy.
-   Spacious layouts.
-   Consistent card design.
-   Clear status indicators.
-   Accessible typography.
-   Responsive layouts.
-   Minimal visual clutter.

## 18.3 Main application shell

Authenticated pages should use:

``` text
┌────────────────────────────────────────────────────┐
│ Top bar / profile / contextual actions             │
├──────────────┬─────────────────────────────────────┤
│              │                                     │
│ Sidebar      │ Main content                        │
│              │                                     │
│ Dashboard    │ Page heading                        │
│ Appointments │ Summary cards                       │
│ Records      │ Tables / forms / content             │
│ Prescriptions│                                     │
│ Billing      │                                     │
│ Settings     │                                     │
└──────────────┴─────────────────────────────────────┘
```

Navigation items must be role-aware.

------------------------------------------------------------------------

# 19. Required Screens

## Public

-   Landing page.
-   Login.
-   Patient registration.
-   Forgot/change password flow as implemented by authentication design.

## Patient

-   Dashboard.
-   Profile.
-   Find doctors.
-   Doctor details/availability.
-   Book appointment.
-   My appointments.
-   Medical records.
-   Prescriptions.
-   Bills.

## Doctor

-   Dashboard.
-   Profile.
-   Availability.
-   Appointments.
-   Patient details.
-   Medical records.
-   Create consultation record.
-   Prescriptions.
-   Create prescription.

## Receptionist

-   Dashboard.
-   Patients.
-   Register patient.
-   Appointments.
-   Appointment booking.
-   Schedule view.

## Billing

-   Dashboard.
-   Invoices.
-   Create invoice.
-   Invoice details.
-   Record payment.
-   Payment history.

## Admin

-   Dashboard.
-   Users.
-   Doctors.
-   Patients.
-   Appointments.
-   Billing overview.
-   Audit logs.
-   Settings.

------------------------------------------------------------------------

# 20. Validation Rules

Frontend and backend validation are both required.

Examples:

### Email

-   Required where applicable.
-   Valid email format.
-   Unique for account creation.

### Phone

-   Validate configured country format.
-   Store normalized representation where practical.

### Dates

-   Validate date format.
-   Date of birth cannot be in the future.
-   Appointment date/time must follow scheduling rules.

### Appointment

-   Doctor required.
-   Patient required.
-   Date/time required.
-   No overlapping active appointment for the same doctor.

### Prescription

-   At least one medicine item.
-   Medicine name required.
-   Dosage required.
-   Frequency required.
-   Duration required.

### Invoice

-   At least one invoice item.
-   Quantity \> 0.
-   Unit price \>= 0.
-   Total calculated on backend.

------------------------------------------------------------------------

# 21. Security Requirements

Healthcare information is sensitive. Security is a core MVP requirement.

## Authentication

-   Hash passwords using a strong password hashing algorithm.
-   Never store plaintext passwords.
-   Use secure token/session handling.
-   Protect authenticated routes.

## Authorization

-   Enforce RBAC on backend.
-   Validate resource ownership/relationship.
-   Never rely only on frontend route protection.

## API security

-   Validate all request bodies.
-   Validate query parameters.
-   Use parameterized ORM/database operations.
-   Add rate limiting to authentication endpoints.
-   Configure CORS explicitly.
-   Do not expose secrets in source code.

## Sensitive data

-   Do not log passwords or authentication tokens.
-   Avoid logging unnecessary clinical information.
-   Protect database credentials.
-   Use environment variables/secrets.

## Audit

Record important events such as:

-   Login.
-   Failed login where appropriate.
-   User creation/deactivation.
-   Patient updates.
-   Appointment creation/cancellation.
-   Medical record creation/update.
-   Prescription creation/update.
-   Invoice/payment changes.

------------------------------------------------------------------------

# 22. Environment Configuration

Use environment variables.

Example:

``` env
APP_ENV=development
APP_NAME=arogyavajra-api

DATABASE_URL=postgresql+psycopg://arogyavajra:password@db:5432/arogyavajra

JWT_SECRET_KEY=change-me
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

CORS_ORIGINS=http://localhost:3000

NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Never commit real secrets.

Provide `.env.example`.

------------------------------------------------------------------------

# 23. Docker Development

Local development should support:

``` text
Frontend container
Backend container
PostgreSQL container
```

Recommended local command:

``` bash
docker compose up --build
```

The exact service names can be chosen during implementation, but the
application must remain reproducible from a clean checkout.

------------------------------------------------------------------------

# 24. Database Migration Rules

Use Alembic.

Required workflow:

``` text
Change SQLAlchemy model
        ↓
Create migration
        ↓
Review migration
        ↓
Apply migration
        ↓
Run tests
```

Do not modify production schema manually.

Every schema change must have a migration.

------------------------------------------------------------------------

# 25. Seed Data

Development seed data should create:

### Users

-   1 admin.
-   1 doctor.
-   1 receptionist.
-   1 billing staff user.
-   2 patient users.

### Related data

-   Doctor profile.
-   Doctor availability.
-   Sample patients.
-   Several appointments in different statuses.
-   At least one completed appointment.
-   Medical record.
-   Prescription with multiple items.
-   Invoice with multiple items.
-   Payment.

Seed credentials must be development-only and clearly documented.

------------------------------------------------------------------------

# 26. Error Handling

Use predictable HTTP status codes.

``` text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Too Many Requests
500 Internal Server Error
```

Examples:

-   Invalid login → `401`.
-   Accessing another user's restricted record → `403`.
-   Unknown patient → `404`.
-   Appointment conflict → `409`.
-   Invalid request schema → `422`.

------------------------------------------------------------------------

# 27. Testing Strategy

Testing is part of the MVP, not a post-MVP activity.

## 27.1 Backend unit tests

Test:

-   Password hashing.
-   Authentication.
-   RBAC.
-   Appointment conflict detection.
-   Appointment state transitions.
-   Invoice calculations.
-   Prescription validation.
-   Search/filter logic.

## 27.2 Backend integration tests

Test:

-   Auth + database.
-   Patient creation.
-   Doctor creation.
-   Appointment booking.
-   Medical record creation.
-   Prescription creation.
-   Invoice/payment flow.

## 27.3 Frontend tests

Test:

-   Login form.
-   Registration form.
-   Appointment booking form.
-   Prescription form.
-   Invoice form.
-   Role-based navigation.
-   Error states.

## 27.4 End-to-end tests

At minimum, automate:

### Flow 1 --- Patient appointment

``` text
Register/login
→ Find doctor
→ Select available slot
→ Book appointment
→ Verify appointment
```

### Flow 2 --- Doctor consultation

``` text
Doctor login
→ Open appointment
→ Create medical record
→ Create prescription
→ Verify saved data
```

### Flow 3 --- Billing

``` text
Billing login
→ Search patient
→ Create invoice
→ Issue invoice
→ Record payment
→ Verify payment status
```

### Flow 4 --- Authorization

``` text
Patient A login
→ Attempt to access Patient B clinical record
→ Request rejected
```

------------------------------------------------------------------------

# 28. Definition of Done

A feature is not complete merely because its page exists.

A feature is considered **Done** only when:

-   UI is implemented.
-   API is implemented.
-   Database model is implemented.
-   Validation is implemented.
-   Authorization is implemented.
-   Loading state exists.
-   Empty state exists.
-   Error state exists.
-   Success feedback exists.
-   Relevant audit event exists.
-   Unit/integration tests exist.
-   Critical E2E path is covered where applicable.
-   No sensitive data is leaked.
-   Code passes lint/type checks.
-   Migration is committed.
-   Documentation/API contract is updated.

------------------------------------------------------------------------

# 29. MVP Development Order

Implement in this order to minimize rework.

## Phase 0 --- Foundation

1.  Repository setup.
2.  Docker Compose.
3.  PostgreSQL.
4.  FastAPI application.
5.  Next.js application.
6.  Environment configuration.
7.  Database connection.
8.  Alembic.
9.  Base UI theme.
10. CI/lint/test setup.

## Phase 1 --- Authentication

1.  User model.
2.  Password hashing.
3.  Registration.
4.  Login.
5.  Token/session handling.
6.  Current-user endpoint.
7.  RBAC dependencies.
8.  Protected frontend routes.

**Milestone:** Every role can authenticate and reach the correct
dashboard.

## Phase 2 --- Patients and Doctors

1.  Patient profile.
2.  Doctor profile.
3.  Admin user management.
4.  Doctor availability.
5.  Patient/doctor search.

**Milestone:** Staff can manage the core people/entities.

## Phase 3 --- Appointments

1.  Appointment model.
2.  Availability validation.
3.  Conflict detection.
4.  Booking.
5.  Rescheduling.
6.  Cancellation.
7.  Confirmation/completion.
8.  Role-based appointment views.

**Milestone:** A patient can book a valid appointment and a doctor can
manage it.

## Phase 4 --- Clinical Records

1.  Medical record model.
2.  Doctor consultation workflow.
3.  Patient history.
4.  Record access control.

**Milestone:** Doctor can complete a consultation and patient can view
authorized history.

## Phase 5 --- Prescriptions

1.  Prescription model.
2.  Prescription items.
3.  Doctor creation workflow.
4.  Patient viewing.
5.  Prescription status.

**Milestone:** Doctor can issue a structured prescription.

## Phase 6 --- Billing

1.  Invoice model.
2.  Invoice items.
3.  Backend total calculation.
4.  Invoice status.
5.  Payment recording.
6.  Billing dashboard.

**Milestone:** Billing staff can issue an invoice and record a payment.

## Phase 7 --- Audit, Quality and Hardening

1.  Audit logs.
2.  Security review.
3.  Error handling review.
4.  Database indexes.
5.  Automated tests.
6.  E2E tests.
7.  Responsive UI review.
8.  Accessibility review.
9.  Seed data.
10. Documentation.

**Milestone:** MVP is demonstrable end-to-end.

------------------------------------------------------------------------

# 30. MVP Acceptance Scenarios

The following scenarios must work before calling the MVP complete.

### Scenario A --- Patient registration

**Given:** A new patient.

**When:** The patient submits valid registration information.

**Then:**

-   User account is created.
-   Patient profile is created.
-   Password is stored securely.
-   Patient can log in.
-   Patient dashboard is displayed.

### Scenario B --- Doctor setup

**Given:** An administrator is logged in.

**When:** The administrator creates a doctor.

**Then:**

-   Doctor account is created.
-   Doctor profile is created.
-   Doctor can log in.
-   Doctor can configure availability.

### Scenario C --- Appointment booking

**Given:** A patient and an active doctor with available time.

**When:** The patient books a free slot.

**Then:**

-   Appointment is created.
-   Correct patient and doctor are linked.
-   Appointment appears on both relevant schedules.
-   Audit log is created.

### Scenario D --- Appointment conflict

**Given:** Doctor already has an active appointment.

**When:** Another appointment overlaps that time.

**Then:**

-   Booking is rejected.
-   Existing appointment is unchanged.
-   User receives a clear conflict message.

### Scenario E --- Consultation

**Given:** Doctor has an assigned appointment.

**When:** Doctor completes consultation.

**Then:**

-   Appointment becomes completed.
-   Medical record is saved.
-   Record is associated with patient and doctor.

### Scenario F --- Prescription

**Given:** Doctor is authorized for the patient.

**When:** Doctor creates a prescription.

**Then:**

-   Prescription is stored.
-   All medicine items are stored.
-   Patient can view the prescription.
-   Unauthorized roles cannot create it.

### Scenario G --- Billing

**Given:** Billing staff has a patient.

**When:** Billing staff creates and issues an invoice.

**Then:**

-   Invoice total is calculated by backend.
-   Invoice status becomes `ISSUED`.
-   Patient can view the invoice.

### Scenario H --- Payment

**Given:** An issued invoice.

**When:** Billing staff records a valid payment.

**Then:**

-   Payment is stored.
-   Invoice payment status is recalculated.
-   Fully paid invoice becomes `PAID`.

### Scenario I --- Unauthorized clinical access

**Given:** Patient A is logged in.

**When:** Patient A attempts to access Patient B's medical record.

**Then:**

-   Request is rejected.
-   No protected record is returned.
-   Attempt may be recorded according to the audit/security policy.

------------------------------------------------------------------------

# 31. Performance Baseline

For normal MVP usage:

-   Standard API reads should normally respond within a few hundred
    milliseconds under local/small deployment conditions.
-   Database queries must use appropriate indexes.
-   Large collections must be paginated.
-   Do not load all patients/appointments/records into the browser.
-   Dashboard statistics should use efficient aggregate queries.
-   Avoid N+1 database query patterns.

Performance targets should be re-baselined after deployment with
realistic load testing.

------------------------------------------------------------------------

# 32. Accessibility Baseline

The frontend should:

-   Support keyboard navigation.
-   Use semantic HTML.
-   Provide visible focus states.
-   Associate labels with inputs.
-   Provide meaningful error messages.
-   Maintain readable contrast.
-   Avoid color-only status communication.
-   Work on desktop and common mobile/tablet widths.

------------------------------------------------------------------------

# 33. Data Integrity Rules

Use database constraints wherever possible.

Required examples:

``` text
UNIQUE:
users.email
patient_profiles.patient_code
doctor_profiles.doctor_code
doctor_profiles.license_number

FOREIGN KEY:
appointments.patient_id
appointments.doctor_id
medical_records.patient_id
medical_records.doctor_id
prescriptions.patient_id
prescriptions.doctor_id
invoices.patient_id
payments.invoice_id
```

Use transactions for multi-step operations.

Examples:

-   Create invoice + invoice items.
-   Record payment + update invoice status.
-   Create patient account + patient profile.
-   Create prescription + prescription items.

------------------------------------------------------------------------

# 34. Important Implementation Boundaries

## Do not put business logic in:

-   React components.
-   Page components.
-   SQL strings scattered across routes.
-   Client-side-only authorization checks.

## Business rules belong in:

``` text
FastAPI service layer
```

## Data access belongs in:

``` text
Repository/data-access layer
```

## Request/response validation belongs in:

``` text
Pydantic schemas
```

## Database schema belongs in:

``` text
SQLAlchemy models + Alembic migrations
```

------------------------------------------------------------------------

# 35. API and Frontend Contract

Frontend types must reflect backend API schemas.

Do not independently invent a different data structure in the frontend.

For each API feature define:

``` text
Request schema
Response schema
Error schema
Authorization requirement
Pagination/filter rules
```

When backend contracts change, update frontend types and tests together.

------------------------------------------------------------------------

# 36. Logging

Application logs should include:

-   Request method/path.
-   Response status.
-   Request duration.
-   Correlation/request ID where practical.
-   Error identifiers.

Do not log:

-   Passwords.
-   Access/refresh tokens.
-   Sensitive credentials.
-   Full medical records.
-   Unnecessary personal health information.

------------------------------------------------------------------------

# 37. Backup and Recovery Baseline

MVP development must support database backup/restore procedures.

At minimum document:

``` text
Database backup
↓
Backup verification
↓
Database restore
↓
Application verification
```

Do not claim a production backup SLA until an actual deployment and
backup system exists.

------------------------------------------------------------------------

# 38. Future Architecture Extension

The MVP should leave clear extension points for:

``` text
Arogyavajra
│
├── Core Healthcare Management      ← MVP
│
├── Laboratory Management           ← Future
├── Pharmacy & Inventory            ← Future
├── Insurance / TPA                 ← Future
├── Telemedicine                    ← Future
├── Interoperability / ABDM / FHIR  ← Future
├── Notifications                   ← Future
├── Analytics                       ← Future
└── Clinical Intelligence / AI      ← Future
```

Future modules must consume well-defined domain APIs rather than
directly modifying unrelated module internals.

------------------------------------------------------------------------

# 39. Explicit MVP Non-Goals

The MVP is **not** intended to:

-   Replace a certified hospital information system.
-   Provide autonomous medical advice.
-   Diagnose diseases automatically.
-   Prescribe medicines automatically.
-   Make clinical decisions without a qualified healthcare professional.
-   Act as a medical-device controller.
-   Provide emergency medical services.
-   Claim regulatory certification that has not been obtained.

The system is an academic/software engineering MVP unless separately
validated and certified for real-world clinical deployment.

------------------------------------------------------------------------

# 40. Implementation Checklist

## Foundation

-   [ ] Repository created
-   [ ] Frontend created
-   [ ] Backend created
-   [ ] PostgreSQL configured
-   [ ] Docker Compose configured
-   [ ] Environment variables documented
-   [ ] Alembic configured
-   [ ] CI/lint/test setup configured

## Authentication

-   [ ] User model
-   [ ] Password hashing
-   [ ] Registration
-   [ ] Login
-   [ ] Logout/session handling
-   [ ] RBAC
-   [ ] Protected routes
-   [ ] Account activation/deactivation

## Patient / Doctor

-   [ ] Patient CRUD
-   [ ] Doctor CRUD
-   [ ] Doctor availability
-   [ ] Search
-   [ ] Pagination

## Appointments

-   [ ] Booking
-   [ ] Availability validation
-   [ ] Conflict detection
-   [ ] Rescheduling
-   [ ] Cancellation
-   [ ] Confirmation
-   [ ] Completion
-   [ ] Role-specific views

## Clinical

-   [ ] Medical records
-   [ ] Patient history
-   [ ] Prescriptions
-   [ ] Prescription items
-   [ ] Clinical access control

## Billing

-   [ ] Invoice
-   [ ] Invoice items
-   [ ] Backend total calculation
-   [ ] Invoice status
-   [ ] Payment recording
-   [ ] Payment status

## Quality

-   [ ] Audit logging
-   [ ] Error handling
-   [ ] Unit tests
-   [ ] Integration tests
-   [ ] E2E tests
-   [ ] Security review
-   [ ] Responsive UI
-   [ ] Accessibility review
-   [ ] Seed data
-   [ ] Database backup/restore documentation

------------------------------------------------------------------------

# 41. Final MVP Definition

Arogyavajra MVP v1 is complete when a user can move through the complete
authorized healthcare-management workflow:

``` text
Authentication
      ↓
Role-based dashboard
      ↓
Patient / Doctor management
      ↓
Doctor availability
      ↓
Appointment
      ↓
Consultation
      ↓
Medical record
      ↓
Prescription
      ↓
Invoice
      ↓
Payment
      ↓
Authorized history + audit trail
```

The MVP should remain a **focused, secure, modular healthcare management
system**. Advanced AI and clinical-intelligence features are
intentionally separated from the first implementation so that the core
platform can be built, tested, demonstrated, and extended without
destabilizing the foundational architecture.

------------------------------------------------------------------------

## 42. Source Alignment

This specification aligns the implementation with the project's
established requirements:

-   Arogyavajra uses the healthcare UI palette already defined for the
    project.
-   The earlier healthcare-management requirements establish patient,
    doctor, appointment, medical record, prescription, billing,
    authentication, and role-management domains.
-   The SPM practical plan requires project implementation and
    software-quality testing as part of the semester project.
-   The MVP deliberately converts those project requirements into an
    implementation boundary rather than treating every possible
    healthcare feature as a first-release requirement.

**Implementation rule:** If a future feature is not explicitly listed as
an MVP requirement in this document, do not add it to MVP v1 merely
because it appears in a broader healthcare-system feature list. Add it
only through an explicit scope update.
