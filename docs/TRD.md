# Arogyavajra --- Technical Requirements Document (TRD)

**Project:** Arogyavajra\
**Document:** Technical Requirements Document\
**Version:** 1.0\
**Status:** MVP Technical Baseline\
**Date:** 2026-10-02\
**Purpose:** Engineering and implementation specification

------------------------------------------------------------------------

## 1. Document Purpose

This Technical Requirements Document defines the technical architecture,
implementation constraints, system components, data model, API
standards, security controls, testing requirements, deployment
requirements, and engineering rules for the Arogyavajra MVP.

The document translates the product requirements into an
implementation-oriented technical specification.

The MVP is a healthcare management platform covering:

``` text
Authentication
      ↓
Role-Based Access
      ↓
Patients / Doctors
      ↓
Doctor Availability
      ↓
Appointments
      ↓
Medical Records
      ↓
Prescriptions
      ↓
Billing
      ↓
Payments
      ↓
Audit Trail
```

Advanced clinical intelligence and other future modules are
intentionally excluded from MVP v1.

------------------------------------------------------------------------

# 2. Technical Objectives

The system shall:

1.  Provide secure authentication.
2.  Enforce server-side role-based authorization.
3.  Maintain relational healthcare data in PostgreSQL.
4.  Provide REST APIs through FastAPI.
5.  Provide a responsive web application through Next.js.
6.  Maintain strict separation between presentation, business logic, and
    data access.
7.  Prevent appointment conflicts.
8.  Preserve patient, clinical, and billing data integrity.
9.  Maintain an audit trail for important operations.
10. Support automated testing.
11. Support reproducible local development through Docker.
12. Support database schema evolution through Alembic migrations.
13. Provide a foundation for future healthcare modules without premature
    microservice complexity.

------------------------------------------------------------------------

# 3. MVP Technical Scope

## 3.1 Included

-   Authentication.
-   JWT/session-based protected access.
-   Role-based authorization.
-   Patient management.
-   Doctor management.
-   Doctor availability.
-   Appointment management.
-   Medical records.
-   Prescriptions.
-   Billing/invoices.
-   Payment recording.
-   Search and pagination.
-   Role-specific dashboards.
-   Audit logging.
-   Validation.
-   Error handling.
-   Automated tests.
-   Docker-based development.

## 3.2 Excluded

The following are not implementation requirements for MVP v1:

-   AI diagnosis.
-   Clinical prediction.
-   Disease-risk prediction.
-   Medical image diagnosis.
-   AI-generated prescriptions.
-   Medical-device/IoT integration.
-   Telemedicine/video consultation.
-   Laboratory information system.
-   Radiology/PACS/DICOM.
-   Pharmacy inventory.
-   Insurance/TPA claims.
-   ABDM integration.
-   Production FHIR integration.
-   Online payment gateway.
-   Complex IPD/bed management.
-   Emergency/ambulance management.
-   Advanced BI/analytics.
-   Real-time patient-doctor chat.
-   Automated SMS/WhatsApp/email notification infrastructure.

------------------------------------------------------------------------

# 4. Architecture

## 4.1 Architecture Style

Arogyavajra MVP shall use a **modular monolith with layered
architecture**.

Microservices are not required for MVP v1.

``` text
                         ┌──────────────────────────┐
                         │      Next.js Web App      │
                         │ TypeScript + Tailwind CSS│
                         └────────────┬─────────────┘
                                      │ HTTPS / REST
                                      ▼
                         ┌──────────────────────────┐
                         │       FastAPI API        │
                         │ Auth / RBAC / Validation  │
                         └────────────┬─────────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 ▼                    ▼                    ▼
        ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
        │ Domain/Service │   │  Repositories  │   │ Audit Service  │
        │     Layer      │   │     Layer      │   │                │
        └────────┬───────┘   └────────┬───────┘   └────────────────┘
                 │                    │
                 └────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │       16+           │
                    └─────────────────────┘
```

------------------------------------------------------------------------

# 5. Architectural Principles

## Principle 1 --- Backend Authority

Business rules must be implemented on the backend.

The frontend must never be treated as a trusted source for:

-   Permissions.
-   Invoice totals.
-   Appointment conflict decisions.
-   Clinical-data authorization.
-   User roles.
-   Data ownership.

------------------------------------------------------------------------

## Principle 2 --- Layer Separation

Use:

``` text
Router
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

Routes should remain thin and should not contain complex business logic.

------------------------------------------------------------------------

## Principle 3 --- Domain Separation

Keep healthcare domains logically separated:

``` text
auth
users
patients
doctors
appointments
medical_records
prescriptions
billing
audit
```

------------------------------------------------------------------------

## Principle 4 --- Least Privilege

Users should receive only the permissions required for their role and
relationship to the requested resource.

------------------------------------------------------------------------

## Principle 5 --- Database Integrity

Important relationships must be represented using:

-   Foreign keys.
-   Unique constraints.
-   Check constraints where appropriate.
-   Transactions.
-   Indexes.

------------------------------------------------------------------------

## Principle 6 --- Future Extensibility

Future modules should be added through clear domain boundaries rather
than rewriting the MVP architecture.

------------------------------------------------------------------------

# 6. Technology Stack

## 6.1 Frontend

  Technology        Purpose
  ----------------- ----------------------------------
  Next.js           Web application framework
  TypeScript        Type-safe frontend development
  Tailwind CSS      Styling
  shadcn/ui         Reusable UI components
  React Hook Form   Form management
  Zod               Client-side schema validation
  TanStack Query    Server-state/API data management
  Lucide React      UI icons

------------------------------------------------------------------------

## 6.2 Backend

  Technology                Purpose
  ------------------------- --------------------------------
  Python 3.12+              Backend language
  FastAPI                   REST API framework
  Pydantic                  Request/response validation
  SQLAlchemy 2.x            ORM/data access
  Alembic                   Database migrations
  JWT                       Authentication token mechanism
  Secure password hashing   Password storage

------------------------------------------------------------------------

## 6.3 Database

``` text
PostgreSQL 16+
```

SQLite may be used for isolated tests if necessary, but PostgreSQL is
the authoritative MVP database.

------------------------------------------------------------------------

## 6.4 Development and Testing

``` text
Git
GitHub
Docker
Docker Compose
pytest
Ruff
Frontend linting
Type checking
Playwright
```

------------------------------------------------------------------------

# 7. Repository Structure

The recommended monorepo structure is:

``` text
arogyavajra/
│
├── apps/
│   │
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
│       │   ├── dependencies/
│       │   ├── api/
│       │   │   └── routes/
│       │   └── main.py
│       │
│       └── tests/
│
├── docs/
│
├── infra/
│   ├── docker/
│   └── compose/
│
├── scripts/
│
├── .env.example
├── docker-compose.yml
├── README.md
├── PRD.md
├── MVP.md
└── TRD.md
```

------------------------------------------------------------------------

# 8. Backend Module Structure

``` text
apps/api/app/
│
├── core/
│   ├── config.py
│   ├── security.py
│   ├── exceptions.py
│   └── logging.py
│
├── db/
│   ├── session.py
│   ├── base.py
│   └── migrations/
│
├── models/
│   ├── user.py
│   ├── patient.py
│   ├── doctor.py
│   ├── availability.py
│   ├── appointment.py
│   ├── medical_record.py
│   ├── prescription.py
│   ├── prescription_item.py
│   ├── invoice.py
│   ├── invoice_item.py
│   ├── payment.py
│   └── audit_log.py
│
├── schemas/
│   ├── auth.py
│   ├── user.py
│   ├── patient.py
│   ├── doctor.py
│   ├── appointment.py
│   ├── medical_record.py
│   ├── prescription.py
│   ├── invoice.py
│   ├── payment.py
│   └── common.py
│
├── repositories/
│   ├── user_repository.py
│   ├── patient_repository.py
│   ├── doctor_repository.py
│   ├── appointment_repository.py
│   ├── medical_record_repository.py
│   ├── prescription_repository.py
│   ├── invoice_repository.py
│   └── audit_repository.py
│
├── services/
│   ├── auth_service.py
│   ├── patient_service.py
│   ├── doctor_service.py
│   ├── appointment_service.py
│   ├── medical_record_service.py
│   ├── prescription_service.py
│   ├── billing_service.py
│   └── audit_service.py
│
├── dependencies/
│   ├── auth.py
│   └── permissions.py
│
├── api/
│   └── routes/
│       ├── auth.py
│       ├── users.py
│       ├── patients.py
│       ├── doctors.py
│       ├── appointments.py
│       ├── medical_records.py
│       ├── prescriptions.py
│       ├── invoices.py
│       └── audit_logs.py
│
└── main.py
```

------------------------------------------------------------------------

# 9. Authentication Architecture

## 9.1 Authentication Flow

``` text
User
 ↓
Login Form
 ↓
POST /api/v1/auth/login
 ↓
FastAPI
 ↓
Verify Password Hash
 ↓
Generate Auth Token
 ↓
Return Authentication Response
 ↓
Frontend Session
 ↓
Protected API Requests
```

------------------------------------------------------------------------

## 9.2 Password Storage

Passwords shall never be stored directly.

Store:

``` text
password_hash
```

Do not store:

``` text
password
plain_password
```

------------------------------------------------------------------------

## 9.3 Authentication Data

The user record shall contain:

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

------------------------------------------------------------------------

# 10. Authorization Architecture

Use a centralized authorization dependency.

Conceptually:

``` text
Request
  ↓
Authenticate User
  ↓
Resolve Role
  ↓
Check Permission
  ↓
Check Resource Relationship
  ↓
Execute Service
```

Example:

``` text
Patient A
   ↓
GET /medical-records/{record_id}
   ↓
Authenticate
   ↓
Check role = PATIENT
   ↓
Check record.patient_id = current_user.patient_id
   ↓
Allow / Reject
```

Never authorize only by URL structure or frontend state.

------------------------------------------------------------------------

# 11. Role Definitions

``` text
PATIENT
DOCTOR
RECEPTIONIST
BILLING_STAFF
ADMIN
```

Permissions must be explicitly defined in backend authorization logic.

------------------------------------------------------------------------

# 12. Database Design

## 12.1 Entity List

The MVP database shall contain:

``` text
users
patient_profiles
doctor_profiles
doctor_availability
appointments
medical_records
prescriptions
prescription_items
invoices
invoice_items
payments
audit_logs
```

------------------------------------------------------------------------

# 13. Database Schema

## 13.1 users

``` text
id                 UUID / BIGINT PK
email              VARCHAR UNIQUE NOT NULL
password_hash      TEXT NOT NULL
role               ENUM NOT NULL
is_active          BOOLEAN NOT NULL DEFAULT TRUE
created_at         TIMESTAMP NOT NULL
updated_at         TIMESTAMP NOT NULL
last_login_at      TIMESTAMP NULL
```

------------------------------------------------------------------------

## 13.2 patient_profiles

``` text
id                       PK
user_id                  FK → users.id UNIQUE
patient_code             VARCHAR UNIQUE NOT NULL
first_name               VARCHAR NOT NULL
last_name                VARCHAR NOT NULL
date_of_birth            DATE
gender                   VARCHAR
phone                    VARCHAR
address                  TEXT
emergency_contact_name   VARCHAR
emergency_contact_phone  VARCHAR
created_at               TIMESTAMP
updated_at               TIMESTAMP
```

------------------------------------------------------------------------

## 13.3 doctor_profiles

``` text
id                 PK
user_id            FK → users.id UNIQUE
doctor_code        VARCHAR UNIQUE NOT NULL
first_name         VARCHAR NOT NULL
last_name          VARCHAR NOT NULL
specialization     VARCHAR NOT NULL
qualification      VARCHAR
license_number     VARCHAR UNIQUE
phone              VARCHAR
consultation_fee   NUMERIC
bio                TEXT
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

------------------------------------------------------------------------

## 13.4 doctor_availability

``` text
id                     PK
doctor_id              FK → doctor_profiles.id
day_of_week            SMALLINT NOT NULL
start_time             TIME NOT NULL
end_time               TIME NOT NULL
slot_duration_minutes  INTEGER NOT NULL
is_active              BOOLEAN NOT NULL DEFAULT TRUE
created_at             TIMESTAMP
updated_at             TIMESTAMP
```

Constraints:

``` text
start_time < end_time
slot_duration_minutes > 0
day_of_week within configured valid range
```

------------------------------------------------------------------------

## 13.5 appointments

``` text
id                 PK
appointment_code   VARCHAR UNIQUE NOT NULL
patient_id         FK → patient_profiles.id
doctor_id          FK → doctor_profiles.id
appointment_date   DATE NOT NULL
start_time         TIME NOT NULL
end_time           TIME NOT NULL
reason             TEXT
status             ENUM NOT NULL
notes              TEXT
created_by         FK → users.id
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

Status enum:

``` text
SCHEDULED
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW
```

------------------------------------------------------------------------

## 13.6 medical_records

``` text
id                 PK
patient_id         FK → patient_profiles.id
doctor_id          FK → doctor_profiles.id
appointment_id     FK → appointments.id NULLABLE
record_date        DATE NOT NULL
chief_complaint    TEXT
clinical_notes     TEXT
diagnosis          TEXT
treatment_notes    TEXT
follow_up_date     DATE NULLABLE
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

------------------------------------------------------------------------

## 13.7 prescriptions

``` text
id                 PK
patient_id         FK → patient_profiles.id
doctor_id          FK → doctor_profiles.id
appointment_id     FK → appointments.id NULLABLE
prescription_date  DATE NOT NULL
instructions       TEXT
status             ENUM NOT NULL
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

Status:

``` text
ACTIVE
COMPLETED
CANCELLED
```

------------------------------------------------------------------------

## 13.8 prescription_items

``` text
id                  PK
prescription_id     FK → prescriptions.id
medicine_name       VARCHAR NOT NULL
dosage              VARCHAR NOT NULL
frequency           VARCHAR NOT NULL
duration            VARCHAR NOT NULL
route               VARCHAR
instructions        TEXT
```

------------------------------------------------------------------------

## 13.9 invoices

``` text
id                 PK
invoice_number     VARCHAR UNIQUE NOT NULL
patient_id         FK → patient_profiles.id
appointment_id     FK → appointments.id NULLABLE
invoice_date       DATE NOT NULL
subtotal           NUMERIC NOT NULL
discount           NUMERIC NOT NULL
tax                NUMERIC NOT NULL
total              NUMERIC NOT NULL
status             ENUM NOT NULL
created_by         FK → users.id
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

Status:

``` text
DRAFT
ISSUED
PARTIALLY_PAID
PAID
CANCELLED
```

------------------------------------------------------------------------

## 13.10 invoice_items

``` text
id             PK
invoice_id     FK → invoices.id
description    TEXT NOT NULL
quantity       NUMERIC NOT NULL
unit_price     NUMERIC NOT NULL
amount         NUMERIC NOT NULL
```

------------------------------------------------------------------------

## 13.11 payments

``` text
id                  PK
invoice_id          FK → invoices.id
amount              NUMERIC NOT NULL
payment_method      ENUM NOT NULL
payment_reference   VARCHAR
paid_at             TIMESTAMP NOT NULL
recorded_by         FK → users.id
created_at          TIMESTAMP
```

Payment method:

``` text
CASH
CARD
UPI
BANK_TRANSFER
OTHER
```

------------------------------------------------------------------------

## 13.12 audit_logs

``` text
id             PK
user_id        FK → users.id NULLABLE
action         VARCHAR NOT NULL
entity_type    VARCHAR NOT NULL
entity_id      VARCHAR
old_values     JSONB
new_values     JSONB
ip_address     VARCHAR
user_agent     TEXT
created_at     TIMESTAMP NOT NULL
```

------------------------------------------------------------------------

# 14. Database Relationships

``` text
users
 ├─────────────── patient_profiles
 │                       │
 │                       ├──── appointments
 │                       ├──── medical_records
 │                       ├──── prescriptions
 │                       └──── invoices
 │
 └─────────────── doctor_profiles
                         │
                         ├──── doctor_availability
                         ├──── appointments
                         ├──── medical_records
                         └──── prescriptions

prescriptions
 └──── prescription_items

invoices
 ├──── invoice_items
 └──── payments

users
 └──── audit_logs
```

------------------------------------------------------------------------

# 15. Database Constraints and Indexes

## Unique Constraints

At minimum:

``` text
users.email
patient_profiles.patient_code
doctor_profiles.doctor_code
doctor_profiles.license_number
appointments.appointment_code
invoices.invoice_number
```

## Recommended Indexes

``` text
users.email
users.role
patient_profiles.patient_code
patient_profiles.phone
doctor_profiles.doctor_code
doctor_profiles.specialization
appointments.patient_id
appointments.doctor_id
appointments.appointment_date
appointments.status
medical_records.patient_id
medical_records.doctor_id
prescriptions.patient_id
invoices.patient_id
invoices.status
payments.invoice_id
audit_logs.entity_type + entity_id
audit_logs.user_id
```

------------------------------------------------------------------------

# 16. Transaction Requirements

Use database transactions for operations involving multiple writes.

Required examples:

### Patient registration

``` text
Create user
+
Create patient profile
```

### Prescription creation

``` text
Create prescription
+
Create prescription items
```

### Invoice creation

``` text
Create invoice
+
Create invoice items
```

### Payment recording

``` text
Create payment
+
Recalculate invoice payment status
```

If any step fails, the transaction should roll back.

------------------------------------------------------------------------

# 17. Appointment Conflict Algorithm

When creating or rescheduling an appointment:

``` text
1. Authenticate user.
2. Validate patient.
3. Validate doctor.
4. Validate doctor active status.
5. Validate date/time.
6. Validate doctor availability.
7. Search overlapping active appointments.
8. If conflict exists → return 409.
9. Otherwise create appointment.
10. Commit transaction.
11. Write audit event.
```

Overlap condition:

``` text
existing_start < requested_end
AND
existing_end > requested_start
```

Only non-cancelled appointments should participate in the active
conflict check.

------------------------------------------------------------------------

# 18. Appointment State Machine

``` text
                ┌─────────────┐
                │  SCHEDULED  │
                └──────┬──────┘
                       │
                ┌──────▼──────┐
                │  CONFIRMED  │
                └───┬─────┬───┘
                    │     │
              complete    cancel
                    │     │
             ┌──────▼─┐ ┌─▼────────┐
             │COMPLETED│ │CANCELLED │
             └─────────┘ └──────────┘

Scheduled/Confirmed
        │
        ▼
     NO_SHOW
```

The backend must reject invalid state transitions.

------------------------------------------------------------------------

# 19. Billing Calculation Rules

The server is authoritative.

``` text
item.amount = quantity × unit_price

subtotal = Σ item.amount

total = subtotal - discount + tax
```

The API must not trust a client-provided total.

The backend should recalculate totals whenever invoice items or
applicable financial values change.

Use a decimal/numeric database type rather than floating-point
representation for financial values.

------------------------------------------------------------------------

# 20. Payment Status Rules

Conceptually:

``` text
paid_amount = Σ successful payments
balance = invoice.total - paid_amount
```

Status:

``` text
paid_amount = 0
    → ISSUED

0 < paid_amount < total
    → PARTIALLY_PAID

paid_amount >= total
    → PAID
```

Cancelled invoices must not accept normal payments.

------------------------------------------------------------------------

# 21. API Design

## Base URL

``` text
/api/v1
```

Use JSON for normal request/response bodies.

------------------------------------------------------------------------

# 22. Authentication API

``` http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
PUT  /api/v1/auth/me
PUT  /api/v1/auth/change-password
```

------------------------------------------------------------------------

# 23. Patient API

``` http
GET    /api/v1/patients
POST   /api/v1/patients
GET    /api/v1/patients/{patient_id}
PUT    /api/v1/patients/{patient_id}

GET    /api/v1/patients/{patient_id}/appointments
GET    /api/v1/patients/{patient_id}/medical-records
GET    /api/v1/patients/{patient_id}/prescriptions
GET    /api/v1/patients/{patient_id}/invoices
```

------------------------------------------------------------------------

# 24. Doctor API

``` http
GET    /api/v1/doctors
POST   /api/v1/doctors
GET    /api/v1/doctors/{doctor_id}
PUT    /api/v1/doctors/{doctor_id}

GET    /api/v1/doctors/{doctor_id}/availability
PUT    /api/v1/doctors/{doctor_id}/availability

GET    /api/v1/doctors/{doctor_id}/appointments
```

------------------------------------------------------------------------

# 25. Appointment API

``` http
GET    /api/v1/appointments
POST   /api/v1/appointments
GET    /api/v1/appointments/{appointment_id}
PUT    /api/v1/appointments/{appointment_id}

POST   /api/v1/appointments/{appointment_id}/confirm
POST   /api/v1/appointments/{appointment_id}/cancel
POST   /api/v1/appointments/{appointment_id}/complete
```

Rescheduling can use `PUT` with validated date/time changes.

------------------------------------------------------------------------

# 26. Medical Record API

``` http
GET    /api/v1/medical-records
POST   /api/v1/medical-records
GET    /api/v1/medical-records/{record_id}
PUT    /api/v1/medical-records/{record_id}
```

------------------------------------------------------------------------

# 27. Prescription API

``` http
GET    /api/v1/prescriptions
POST   /api/v1/prescriptions
GET    /api/v1/prescriptions/{prescription_id}
PUT    /api/v1/prescriptions/{prescription_id}

POST   /api/v1/prescriptions/{prescription_id}/cancel
```

------------------------------------------------------------------------

# 28. Billing API

``` http
GET    /api/v1/invoices
POST   /api/v1/invoices
GET    /api/v1/invoices/{invoice_id}
PUT    /api/v1/invoices/{invoice_id}

POST   /api/v1/invoices/{invoice_id}/issue
POST   /api/v1/invoices/{invoice_id}/cancel

GET    /api/v1/invoices/{invoice_id}/payments
POST   /api/v1/invoices/{invoice_id}/payments
```

------------------------------------------------------------------------

# 29. User/Admin API

``` http
GET    /api/v1/users
GET    /api/v1/users/{user_id}
PUT    /api/v1/users/{user_id}

POST   /api/v1/users/{user_id}/activate
POST   /api/v1/users/{user_id}/deactivate

GET    /api/v1/audit-logs
```

------------------------------------------------------------------------

# 30. API Response Standard

## Success

``` json
{
  "data": {},
  "message": "Operation completed successfully"
}
```

## Paginated

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

## Error

``` json
{
  "error": {
    "code": "APPOINTMENT_CONFLICT",
    "message": "The selected doctor already has an appointment during this time."
  }
}
```

Do not return:

-   Stack traces.
-   SQL errors.
-   Password hashes.
-   Tokens.
-   Database credentials.
-   Internal filesystem paths.

------------------------------------------------------------------------

# 31. HTTP Status Codes

Use:

``` text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

Examples:

``` text
Invalid credentials          → 401
Insufficient permission      → 403
Record does not exist        → 404
Appointment conflict         → 409
Invalid request data         → 422
```

------------------------------------------------------------------------

# 32. Validation Requirements

Validation must exist at both frontend and backend levels.

## Email

-   Required where applicable.
-   Valid format.
-   Unique for account creation.

## Phone

-   Validate configured format.
-   Normalize representation where practical.

## Dates

-   Valid format.
-   Date of birth cannot be in the future.
-   Appointment values must satisfy scheduling rules.

## Appointment

-   Patient required.
-   Doctor required.
-   Date/time required.
-   Doctor availability required.
-   No overlapping active appointment.

## Prescription

-   At least one item.
-   Medicine name required.
-   Dosage required.
-   Frequency required.
-   Duration required.

## Invoice

-   At least one item.
-   Quantity \> 0.
-   Unit price \>= 0.
-   Total calculated by backend.

------------------------------------------------------------------------

# 33. Frontend Architecture

Recommended structure:

``` text
apps/web/
│
├── app/
│   ├── (public)/
│   ├── (auth)/
│   └── (dashboard)/
│       ├── patient/
│       ├── doctor/
│       ├── receptionist/
│       ├── billing/
│       └── admin/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   ├── cards/
│   └── feedback/
│
├── features/
│   ├── auth/
│   ├── patients/
│   ├── doctors/
│   ├── appointments/
│   ├── medical-records/
│   ├── prescriptions/
│   └── billing/
│
├── hooks/
├── lib/
├── types/
└── tests/
```

------------------------------------------------------------------------

# 34. Frontend Data Flow

``` text
UI Component
    ↓
Feature Hook
    ↓
TanStack Query
    ↓
API Client
    ↓
FastAPI
```

The frontend should not directly access PostgreSQL.

------------------------------------------------------------------------

# 35. Frontend Authorization

Frontend authorization exists for UX only.

It should:

-   Hide irrelevant navigation.
-   Prevent accidental access attempts.
-   Redirect users appropriately.

But actual authorization must always occur on the backend.

Example:

``` text
Patient dashboard
    ↓
Show patient navigation
    ↓
User manually requests doctor endpoint
    ↓
Backend checks role
    ↓
403 if unauthorized
```

------------------------------------------------------------------------

# 36. UI Design System

Use the existing Arogyavajra palette.

``` text
Deep Navy       #021C48
Primary Blue    #012C7D
Royal Blue      #0B5ED7
Bright Blue     #1677E8
Soft Blue       #E5F0FE
Background      #F6F9FD
White           #FFFFFF
Border Gray     #DDE6F2
Muted Text      #52658A
Success         #16A765
Success Light   #D7F5E3
```

Primary brand colors:

``` text
#021C48
#0B5ED7
```

UI principles:

-   Consistent spacing.
-   Reusable components.
-   Clear hierarchy.
-   Responsive layouts.
-   Visible focus states.
-   Clear validation.
-   Consistent status badges.
-   Minimal visual clutter.

------------------------------------------------------------------------

# 37. Environment Configuration

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

Real secrets must never be committed.

Provide:

``` text
.env.example
```

------------------------------------------------------------------------

# 38. Docker Requirements

Local development shall support:

``` text
web
api
db
```

A clean checkout should support:

``` bash
docker compose up --build
```

The exact container names may differ, but the development environment
must be reproducible.

------------------------------------------------------------------------

# 39. Database Migration Requirements

Use Alembic.

Workflow:

``` text
Modify SQLAlchemy Model
        ↓
Generate Migration
        ↓
Review Migration
        ↓
Apply Migration
        ↓
Run Tests
```

Do not manually modify the production schema outside migrations.

Every database schema change must be represented by a migration.

------------------------------------------------------------------------

# 40. Seed Data

Development seed data should include:

``` text
1 Admin
1 Doctor
1 Receptionist
1 Billing Staff
2 Patients
```

Related seed data should include:

-   Doctor availability.
-   Sample appointments.
-   Different appointment statuses.
-   At least one completed appointment.
-   Medical record.
-   Prescription with multiple items.
-   Invoice.
-   Invoice items.
-   Payment.

Seed credentials are development-only.

------------------------------------------------------------------------

# 41. Logging Requirements

Application logs should contain:

-   HTTP method.
-   Request path.
-   Response status.
-   Request duration.
-   Request/correlation ID where practical.
-   Error identifier.

Do not log:

-   Passwords.
-   Authentication tokens.
-   Database credentials.
-   Full medical records.
-   Unnecessary sensitive patient information.

------------------------------------------------------------------------

# 42. Error Handling Architecture

Use centralized exception handling.

Conceptually:

``` text
Service Error
     ↓
Domain/Application Exception
     ↓
FastAPI Exception Handler
     ↓
Standard API Error
```

Example:

``` json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested patient was not found."
  }
}
```

Internal errors should be logged securely while clients receive safe
messages.

------------------------------------------------------------------------

# 43. Security Requirements

## Authentication Security

-   Strong password hashing.
-   Secure token/session handling.
-   Protected endpoints.
-   Account status validation.
-   Authentication rate limiting should be considered during hardening.

## Authorization Security

-   Server-side RBAC.
-   Resource ownership checks.
-   Role-specific permissions.
-   No client-side-only security.

## API Security

-   Request validation.
-   Explicit CORS configuration.
-   Parameterized ORM/database operations.
-   Safe error responses.
-   Authentication endpoint abuse protection.
-   Secure secret management.

## Data Security

-   Do not expose passwords.
-   Do not expose tokens.
-   Do not expose database credentials.
-   Do not unnecessarily expose clinical information.
-   Avoid unnecessary sensitive logging.

------------------------------------------------------------------------

# 44. Privacy Requirements

Healthcare data must be treated as sensitive.

Technical requirements:

1.  Return only fields required by the requesting role.
2.  Apply resource-level authorization.
3.  Avoid unnecessary client-side persistence of sensitive information.
4.  Do not include clinical records in general-purpose logs.
5.  Do not expose another patient's data through predictable IDs.
6.  Use server-side access checks on every protected resource.
7.  Use HTTPS in deployed environments.

The MVP must not claim regulatory certification unless separately
obtained.

------------------------------------------------------------------------

# 45. API Pagination

List APIs must support pagination.

Example:

``` text
?page=1&page_size=20
```

Recommended default:

``` text
page = 1
page_size = 20
```

The API should enforce a maximum page size to prevent excessive queries.

------------------------------------------------------------------------

# 46. API Filtering and Search

Examples:

``` text
GET /patients?search=bhumi
GET /doctors?specialization=cardiology
GET /appointments?date=2026-10-02&status=CONFIRMED
GET /invoices?status=PARTIALLY_PAID
```

Search implementation should use indexed fields where practical.

------------------------------------------------------------------------

# 47. Performance Requirements

The MVP should target reasonable performance under expected
small-to-medium clinic usage.

Recommended engineering targets:

  -----------------------------------------------------------------------
  Operation                                                        Target
  ------------------------------ ----------------------------------------
  Standard API read               \< 500 ms under normal local/deployment
                                                               conditions

  Standard API write                       \< 1 s under normal conditions

  Dashboard initial data                   \< 2 s under normal conditions

  Database query                     \< 300 ms for common indexed queries

  Critical E2E workflow              Completes without avoidable blocking
  -----------------------------------------------------------------------

These are engineering targets rather than guaranteed production SLAs.

Large datasets must use:

-   Pagination.
-   Indexes.
-   Efficient joins.
-   Avoidance of N+1 queries.

------------------------------------------------------------------------

# 48. Reliability Requirements

The application should:

-   Use database transactions for multi-write operations.
-   Validate data before persistence.
-   Handle expected API failures gracefully.
-   Avoid partial writes.
-   Preserve database integrity.
-   Provide safe error responses.

------------------------------------------------------------------------

# 49. Backup and Recovery

The deployment must support a documented PostgreSQL backup/restore
procedure.

Minimum process:

``` text
Database
   ↓
Backup
   ↓
Verify Backup
   ↓
Restore to Test Environment
   ↓
Verify Application
```

The MVP should not claim a specific recovery-time or recovery-point SLA
without an actual operational backup system.

------------------------------------------------------------------------

# 50. Testing Strategy

## 50.1 Unit Tests

Test:

-   Password verification.
-   Permission checks.
-   Appointment conflict detection.
-   Appointment state transitions.
-   Invoice calculations.
-   Payment status calculation.
-   Prescription validation.
-   Input/business rules.

------------------------------------------------------------------------

## 50.2 Integration Tests

Test:

-   Authentication + database.
-   Patient creation.
-   Doctor creation.
-   Availability.
-   Appointment booking.
-   Appointment cancellation.
-   Medical records.
-   Prescriptions.
-   Invoices.
-   Payments.
-   Authorization.

------------------------------------------------------------------------

## 50.3 API Tests

Verify:

-   Status codes.
-   Request validation.
-   Response schemas.
-   Authentication.
-   Authorization.
-   Pagination.
-   Error responses.

------------------------------------------------------------------------

## 50.4 Frontend Tests

Test:

-   Login form.
-   Registration form.
-   Appointment form.
-   Prescription form.
-   Invoice form.
-   Role navigation.
-   Error states.
-   Loading states.

------------------------------------------------------------------------

## 50.5 E2E Tests

### Flow A --- Patient Appointment

``` text
Register/Login
→ Find Doctor
→ Select Availability
→ Book Appointment
→ Verify Appointment
```

### Flow B --- Doctor Consultation

``` text
Doctor Login
→ Open Appointment
→ Create Medical Record
→ Create Prescription
→ Complete Appointment
```

### Flow C --- Billing

``` text
Billing Login
→ Search Patient
→ Create Invoice
→ Issue Invoice
→ Record Payment
→ Verify Payment Status
```

### Flow D --- Authorization

``` text
Patient A Login
→ Attempt Patient B Medical Record
→ Request Rejected
```

------------------------------------------------------------------------

# 51. Testing Matrix

  Module              Unit   Integration   E2E   Security
  ----------------- ------ ------------- ----- ----------
  Authentication         ✓             ✓     ✓          ✓
  RBAC                   ✓             ✓     ✓          ✓
  Patients               ✓             ✓     ✓          ✓
  Doctors                ✓             ✓     ✓          ✓
  Availability           ✓             ✓     ✓ 
  Appointments           ✓             ✓     ✓          ✓
  Medical Records        ✓             ✓     ✓          ✓
  Prescriptions          ✓             ✓     ✓          ✓
  Billing                ✓             ✓     ✓          ✓
  Payments               ✓             ✓     ✓          ✓
  Audit Logs             ✓             ✓                ✓

------------------------------------------------------------------------

# 52. CI Pipeline

Recommended CI sequence:

``` text
Git Push / Pull Request
        ↓
Install Dependencies
        ↓
Lint
        ↓
Type Check
        ↓
Unit Tests
        ↓
Integration Tests
        ↓
Build Frontend
        ↓
Build Backend
        ↓
E2E Tests
        ↓
Report
```

A failed required stage should block the release/merge according to
repository policy.

------------------------------------------------------------------------

# 53. Deployment Architecture

For MVP deployment, a containerized architecture may be used:

``` text
                    Internet
                       │
                       ▼
                ┌──────────────┐
                │ Web Frontend │
                │   Next.js    │
                └──────┬───────┘
                       │ HTTPS
                       ▼
                ┌──────────────┐
                │ FastAPI API  │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ PostgreSQL   │
                └──────────────┘
```

The exact cloud provider is not mandated by the MVP technical baseline.

------------------------------------------------------------------------

# 54. Production Configuration Principles

Production deployment should:

-   Use HTTPS.
-   Use managed/separate PostgreSQL where appropriate.
-   Store secrets outside source control.
-   Restrict database network access.
-   Configure CORS explicitly.
-   Enable structured logging.
-   Configure health checks.
-   Configure backups.
-   Separate development and production environments.

------------------------------------------------------------------------

# 55. Health Endpoints

Provide at least:

``` http
GET /health
GET /ready
```

### `/health`

Indicates that the API process is running.

### `/ready`

Indicates whether required dependencies, particularly the database, are
available.

------------------------------------------------------------------------

# 56. Observability

Minimum observability should include:

``` text
Application Logs
API Request Logs
Authentication Logs
Error Logs
Database Errors
Health Checks
```

Recommended future additions:

``` text
Metrics
Tracing
Centralized Log Aggregation
Alerting
```

Advanced observability is not required for MVP demonstration.

------------------------------------------------------------------------

# 57. Data Integrity Rules

The following must be enforced:

``` text
Unique email
Unique patient code
Unique doctor code
Unique invoice number
Foreign key relationships
Valid appointment states
Valid invoice states
Valid payment amounts
Valid prescription items
```

Important financial values should use decimal/numeric representation.

------------------------------------------------------------------------

# 58. Frontend Form Rules

Forms should:

-   Validate user input before submission.
-   Display field-level errors.
-   Disable duplicate submissions during pending requests.
-   Display server errors.
-   Display success feedback.
-   Preserve entered values where appropriate.
-   Use accessible labels.
-   Clearly distinguish required fields.

------------------------------------------------------------------------

# 59. API Client Rules

Create one centralized API client.

Example conceptual structure:

``` text
lib/
└── api/
    ├── client.ts
    ├── auth.ts
    ├── patients.ts
    ├── doctors.ts
    ├── appointments.ts
    ├── medical-records.ts
    ├── prescriptions.ts
    └── billing.ts
```

Do not scatter raw `fetch` calls throughout page components.

------------------------------------------------------------------------

# 60. State Management

Use server-state management for backend data.

Recommended:

``` text
TanStack Query
```

Use local React state for:

-   Form state.
-   UI toggles.
-   Temporary view state.

Do not duplicate server data unnecessarily in multiple global stores.

------------------------------------------------------------------------

# 61. API Versioning

All MVP APIs should use:

``` text
/api/v1
```

Future breaking API changes should use a new version rather than
silently changing existing contracts.

------------------------------------------------------------------------

# 62. Configuration and Secrets

The following must be configurable:

``` text
DATABASE_URL
JWT_SECRET_KEY
JWT expiration values
CORS origins
Application environment
Frontend API URL
```

Never hard-code production credentials.

------------------------------------------------------------------------

# 63. Development Workflow

Recommended workflow:

``` text
Requirement
   ↓
API/schema design
   ↓
Database model
   ↓
Migration
   ↓
Service/business logic
   ↓
API route
   ↓
Frontend feature
   ↓
Unit tests
   ↓
Integration tests
   ↓
E2E test
   ↓
Review
```

------------------------------------------------------------------------

# 64. Feature Implementation Rules

A feature is not complete if only its frontend page exists.

For each feature verify:

``` text
UI
API
Schema
Database
Business Logic
Authorization
Validation
Error Handling
Audit
Tests
Documentation
```

------------------------------------------------------------------------

# 65. Technical Definition of Done

A technical feature is complete when:

-   Database model exists where required.
-   Migration exists.
-   Pydantic schemas exist.
-   Service logic exists.
-   Repository/data-access logic exists where required.
-   API route exists.
-   Authentication is enforced where required.
-   Authorization is enforced.
-   Frontend feature is connected to real API data.
-   Validation exists.
-   Loading/empty/error states exist.
-   Audit requirements are satisfied.
-   Unit tests pass.
-   Integration tests pass.
-   Critical E2E flow passes.
-   Lint/type checks pass.
-   No secret is committed.
-   Documentation is updated.

------------------------------------------------------------------------

# 66. Technical Acceptance Criteria

## Authentication

-   User can register where allowed.
-   User can login.
-   Invalid credentials are rejected.
-   Protected APIs reject unauthenticated requests.
-   Password hashes are never returned.

## Authorization

-   Patient cannot access another patient's clinical records.
-   Receptionist cannot modify clinical records.
-   Billing staff cannot create prescriptions.
-   Unauthorized API requests return `403` or appropriate response.
-   Admin functions require admin authorization.

## Appointments

-   Appointment can be created only for an active patient and doctor.
-   Appointment must fall within configured availability.
-   Overlapping active appointments are rejected.
-   Invalid status transitions are rejected.

## Clinical Records

-   Authorized doctor can create a record.
-   Patient can view authorized own records.
-   Unauthorized staff cannot modify clinical records.

## Prescriptions

-   Authorized doctor can create prescriptions.
-   Prescription requires at least one item.
-   Patient can view own prescriptions.
-   Unauthorized roles cannot create prescriptions.

## Billing

-   Invoice requires at least one item.
-   Backend calculates total.
-   Payment is linked to invoice.
-   Invoice status reflects payment state.
-   Cancelled invoices cannot accept normal payments.

## Audit

-   Important mutations create audit records.
-   Audit records identify actor and affected entity.
-   Sensitive credentials are not logged.

------------------------------------------------------------------------

# 67. Security Test Cases

At minimum test:

``` text
Unauthenticated → protected endpoint
Patient → another patient's record
Patient → admin endpoint
Doctor → another doctor's restricted operation
Receptionist → clinical record mutation
Billing → prescription creation
Invalid/expired token
Inactive account
Malformed request
Repeated authentication attempts
```

------------------------------------------------------------------------

# 68. Performance Test Cases

Test:

-   Patient search.
-   Doctor search.
-   Appointment listing.
-   Dashboard aggregation.
-   Invoice listing.
-   Patient history retrieval.

Verify:

-   Pagination works.
-   Indexes are used where expected.
-   No N+1 query pattern exists in critical paths.
-   API response remains acceptable under expected MVP load.

------------------------------------------------------------------------

# 69. Migration and Rollback Strategy

Every schema migration should be:

1.  Generated.
2.  Reviewed.
3.  Tested against a fresh database.
4.  Tested against representative existing data.
5.  Applied through migration tooling.

Where practical, migrations should have a safe rollback strategy.

------------------------------------------------------------------------

# 70. Seed and Development Environment

A developer should be able to initialize the project approximately as
follows:

``` bash
git clone <repository>
cd arogyavajra

cp .env.example .env

docker compose up --build

# Apply migrations
alembic upgrade head

# Seed development data
python scripts/seed.py
```

Exact commands may be adjusted to the final repository structure.

------------------------------------------------------------------------

# 71. Technical Risks

  -----------------------------------------------------------------------
  Risk                    Technical Impact        Mitigation
  ----------------------- ----------------------- -----------------------
  Incorrect authorization Exposure of healthcare  Centralized RBAC +
                          data                    resource checks + tests

  Appointment race        Double booking          Transactional conflict
  condition                                       handling

  Financial rounding      Incorrect invoices      Decimal/Numeric types
  errors                                          

  Schema drift            Application failures    Alembic migrations

  API contract drift      Frontend failures       Versioned documented
                                                  schemas

  Excessive complexity    Slower development      Modular monolith

  N+1 queries             Slow dashboards         Query review + eager
                                                  loading

  Sensitive logs          Privacy risk            Structured logging
                                                  rules

  Hard-coded secrets      Security risk           Environment/secret
                                                  management

  Scope creep             Delayed MVP             Strict MVP boundary
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 72. Future Technical Extension Points

The architecture should allow future modules:

``` text
Arogyavajra
│
├── Core Healthcare Management   ← MVP
│
├── Laboratory
├── Pharmacy
├── Insurance / TPA
├── Telemedicine
├── Notifications
├── Analytics
├── Interoperability
└── Clinical Intelligence / AI
```

Future modules should use clear service/domain boundaries.

They should not directly manipulate unrelated module internals.

------------------------------------------------------------------------

# 73. Technical Non-Goals

MVP does not attempt to:

-   Build a distributed microservice system.
-   Implement autonomous clinical decision making.
-   Build a real-time medical device platform.
-   Implement a full hospital ERP.
-   Implement a production insurance claims engine.
-   Implement a full pharmacy system.
-   Implement online payment processing.
-   Claim healthcare regulatory certification.

------------------------------------------------------------------------

# 74. Implementation Checklist

## Foundation

-   [ ] Monorepo created.
-   [ ] Next.js application created.
-   [ ] FastAPI application created.
-   [ ] PostgreSQL configured.
-   [ ] Docker Compose configured.
-   [ ] Environment configuration created.
-   [ ] Alembic configured.
-   [ ] CI configured.

## Backend

-   [ ] Core configuration.
-   [ ] Database session.
-   [ ] SQLAlchemy models.
-   [ ] Pydantic schemas.
-   [ ] Repositories.
-   [ ] Services.
-   [ ] API routes.
-   [ ] Authentication dependencies.
-   [ ] RBAC dependencies.
-   [ ] Exception handlers.
-   [ ] Logging.

## Authentication

-   [ ] Registration.
-   [ ] Login.
-   [ ] Logout/session handling.
-   [ ] Current-user endpoint.
-   [ ] Password change.
-   [ ] Account activation/deactivation.

## Healthcare Modules

-   [ ] Patient management.
-   [ ] Doctor management.
-   [ ] Availability.
-   [ ] Appointments.
-   [ ] Medical records.
-   [ ] Prescriptions.
-   \[Billing.
-   [ ] Payments.
-   [ ] Audit logs.

## Frontend

-   [ ] Design system.
-   [ ] Application shell.
-   [ ] Role-based navigation.
-   [ ] Authentication pages.
-   [ ] Patient dashboard.
-   [ ] Doctor dashboard.
-   [ ] Receptionist dashboard.
-   [ ] Billing dashboard.
-   [ ] Admin dashboard.
-   [ ] Forms.
-   [ ] Tables.
-   [ ] Loading states.
-   [ ] Empty states.
-   [ ] Error states.

## Testing

-   [ ] Unit tests.
-   [ ] Integration tests.
-   [ ] API tests.
-   [ ] Frontend tests.
-   [ ] E2E tests.
-   [ ] Security tests.
-   [ ] Performance checks.

## Deployment

-   [ ] Production environment configuration.
-   [ ] HTTPS.
-   [ ] Secret management.
-   [ ] Database backup.
-   [ ] Health checks.
-   [ ] Logging.
-   [ ] Deployment documentation.

------------------------------------------------------------------------

# 75. Technical Success Criteria

The Arogyavajra MVP is technically ready when:

1.  The complete core workflow operates using real PostgreSQL
    persistence.
2.  All protected APIs enforce authentication.
3.  Role and resource authorization is enforced server-side.
4.  Appointment conflicts are prevented.
5.  Medical records and prescriptions are protected.
6.  Billing calculations are performed by the backend.
7.  Payment status is consistent with recorded payments.
8.  Important mutations are auditable.
9.  Database migrations can initialize the system from a clean
    environment.
10. Critical unit, integration, and E2E tests pass.
11. Docker-based development is reproducible.
12. No production secrets are committed.
13. The application handles expected validation and error conditions
    safely.
14. The system remains within the defined MVP scope.

------------------------------------------------------------------------

# 76. Relationship With Other Project Documents

Arogyavajra documentation should be treated as a hierarchy:

``` text
PRD.md
  │
  │ Defines product requirements
  ▼
MVP.md
  │
  │ Defines MVP implementation baseline
  ▼
TRD.md
  │
  │ Defines technical implementation requirements
  ▼
Source Code
```

### PRD

Defines:

-   Why the product exists.
-   Who uses it.
-   What the product must accomplish.
-   Product scope.
-   User stories.
-   Product acceptance expectations.

### MVP

Defines:

-   MVP boundary.
-   Architecture baseline.
-   Domain modules.
-   Database concepts.
-   API surface.
-   Business rules.
-   Testing baseline.
-   Implementation checklist.

### TRD

Defines:

-   Exact technical architecture.
-   Technology stack.
-   Repository structure.
-   Database schema.
-   API contracts.
-   Security implementation.
-   Validation.
-   Deployment.
-   Testing.
-   Performance.
-   Engineering constraints.

If a conflict is found, update the documents together rather than
silently implementing an inconsistent requirement.

------------------------------------------------------------------------

# 77. Final Technical Architecture

``` text
                         AROGYAVAJRA
                              │
                 ┌────────────┴────────────┐
                 │                         │
           Next.js Web App             FastAPI API
                 │                         │
          TypeScript UI             Authentication
          Tailwind CSS              Authorization
          shadcn/ui                 Validation
          TanStack Query            Business Logic
                 │                         │
                 └────────────┬────────────┘
                              │
                       Repository Layer
                              │
                         SQLAlchemy
                              │
                         PostgreSQL
                              │
                ┌─────────────┼─────────────┐
                │             │             │
            Healthcare     Billing       Audit
             Records       Records       Records
```

------------------------------------------------------------------------

# 78. Final Technical Definition

Arogyavajra MVP v1 shall be implemented as a **secure modular monolith**
consisting of:

``` text
Next.js + TypeScript
        ↓
FastAPI + Python
        ↓
SQLAlchemy
        ↓
PostgreSQL
```

with:

``` text
JWT/session authentication
RBAC authorization
Pydantic validation
Alembic migrations
Docker development
Automated testing
Audit logging
```

The technical implementation must prioritize:

**Security → Data Integrity → Correct Business Rules → Testability →
Maintainability → Extensibility**

The MVP must remain a healthcare management platform and must not
silently expand into autonomous clinical intelligence, medical-device
control, or other future-scope functionality.

------------------------------------------------------------------------

## 79. Document Control

  -----------------------------------------------------------------------
  Field                               Value
  ----------------------------------- -----------------------------------
  Document                            Technical Requirements Document

  Project                             Arogyavajra

  Version                             1.0

  Status                              MVP Technical Baseline

  Date                                2026-10-02

  Companion document                  PRD.md

  Companion document                  MVP.md

  Change policy                       Update TRD when technical
                                      architecture or implementation
                                      contracts change
  -----------------------------------------------------------------------

**Implementation rule:** Any change to the database model, API contract,
authentication/authorization model, core business rule, technology
stack, or deployment architecture must be reflected in this TRD and
reviewed against the PRD and MVP specification.
