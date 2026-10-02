# Arogyavajra — Frontend + Backend Communication & Integration Contract

**Project:** Arogyavajra  
**Document:** Frontend + Backend Schema & Communication Contract  
**Version:** 1.0  
**Date:** 02 October 2026  
**Audience:** Development Agents, Frontend Developers, Backend Developers, Reviewers  
**Status:** MVP Implementation Contract

---

# 1. Purpose

This document is the **single implementation contract** between the Arogyavajra frontend and backend.

Its primary purpose is to prevent development agents from making inconsistent architectural decisions while implementing the project.

The frontend and backend must follow this document for:

- Project structure
- Responsibilities
- API communication
- Authentication
- Authorization
- Request formats
- Response formats
- Error formats
- Data models
- API routes
- Frontend state management
- Loading and skeleton states
- Form validation
- Database mapping
- Naming conventions
- HTTP status handling
- Security boundaries
- Development workflow

When implementation decisions are unclear, this document should be checked together with:

```text
PRD.md
MVP.md
TRD.md
APP-FLOW.md
UI-UX-BRIEF.md
DATABASE-SCHEMA.md
```

---

# 2. Source-of-Truth Hierarchy

The project documents have different responsibilities.

```text
PRD.md
  ↓
Product requirements

MVP.md
  ↓
MVP scope

TRD.md
  ↓
Technical architecture

APP-FLOW.md
  ↓
Application workflows

UI-UX-BRIEF.md
  ↓
Interface and interaction rules

DATABASE-SCHEMA.md
  ↓
Database structure

FRONTEND-BACKEND-CONTRACT.md
  ↓
Frontend ↔ Backend implementation contract
```

If a conflict is discovered:

1. Do not silently invent a new architecture.
2. Identify the conflicting requirement.
3. Preserve the existing project architecture.
4. Update the relevant project document before introducing a major structural change.

---

# 3. Non-Negotiable Architecture

Arogyavajra uses:

```text
Next.js + TypeScript
        ↓
FastAPI + Python
        ↓
SQLAlchemy
        ↓
PostgreSQL
```

Supporting technologies:

```text
Frontend:
Next.js
TypeScript
Tailwind CSS
shadcn/ui
React Hook Form
Zod
TanStack Query
Lucide React

Backend:
Python 3.12+
FastAPI
Pydantic
SQLAlchemy 2.x
Alembic
JWT-based authentication
Secure password hashing

Database:
PostgreSQL 16+
```

Do not replace these technologies without an explicit architectural decision.

---

# 4. High-Level Communication Architecture

```text
┌──────────────────────────────────────────────┐
│                 BROWSER                      │
│                                              │
│  Next.js / React / TypeScript                │
│                                              │
│  Pages → Features → Hooks → API Client       │
└──────────────────────┬───────────────────────┘
                       │
                       │ HTTPS / HTTP
                       │ JSON
                       ▼
┌──────────────────────────────────────────────┐
│                 FASTAPI                      │
│                                              │
│ Router → Schema → Service → Repository       │
│                         │                    │
│                         ▼                    │
│                    SQLAlchemy                │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                PostgreSQL                    │
│                                              │
│ Users / Patients / Doctors / Appointments    │
│ Records / Prescriptions / Billing / Audit    │
└──────────────────────────────────────────────┘
```

The frontend must **never communicate directly with PostgreSQL**.

The frontend communicates only through the backend API.

---

# 5. Responsibility Boundary

## Frontend Responsibilities

The frontend is responsible for:

- Rendering UI
- Navigation
- Form interaction
- Client-side validation
- Displaying loading states
- Displaying skeletons
- Displaying errors
- Displaying success feedback
- Managing local UI state
- Managing server state through TanStack Query
- Sending API requests
- Rendering API responses
- Role-aware navigation
- Responsive behavior

The frontend is **not authoritative** for:

- Authorization
- Permissions
- Appointment conflict prevention
- Billing calculations
- Payment status
- Database integrity
- Sensitive business rules

---

## Backend Responsibilities

The backend is responsible for:

- Authentication
- Authorization
- RBAC
- Business rules
- Server-side validation
- Appointment conflict detection
- Availability validation
- Billing calculations
- Payment state
- Database transactions
- Data integrity
- Audit logging
- Sensitive-resource access control

The backend is the **source of truth** for business logic.

---

# 6. Frontend Project Structure

Recommended structure:

```text
apps/
└── web/
    ├── app/
    │   ├── (public)/
    │   │   ├── page.tsx
    │   │   ├── features/
    │   │   ├── about/
    │   │   └── how-it-works/
    │   │
    │   ├── (auth)/
    │   │   ├── login/
    │   │   └── register/
    │   │
    │   ├── (dashboard)/
    │   │   ├── dashboard/
    │   │   ├── patients/
    │   │   ├── doctors/
    │   │   ├── appointments/
    │   │   ├── medical-records/
    │   │   ├── prescriptions/
    │   │   ├── billing/
    │   │   ├── users/
    │   │   ├── audit-logs/
    │   │   └── profile/
    │   │
    │   ├── layout.tsx
    │   └── globals.css
    │
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   ├── forms/
    │   ├── tables/
    │   ├── feedback/
    │   └── healthcare/
    │
    ├── features/
    │   ├── auth/
    │   ├── patients/
    │   ├── doctors/
    │   ├── appointments/
    │   ├── medical-records/
    │   ├── prescriptions/
    │   ├── billing/
    │   ├── users/
    │   └── audit-logs/
    │
    ├── hooks/
    ├── lib/
    │   ├── api/
    │   ├── auth/
    │   ├── validation/
    │   └── utils/
    │
    ├── types/
    └── tests/
```

---

# 7. Backend Project Structure

Recommended structure:

```text
apps/
└── api/
    ├── app/
    │   ├── core/
    │   │   ├── config.py
    │   │   ├── security.py
    │   │   ├── permissions.py
    │   │   └── exceptions.py
    │   │
    │   ├── db/
    │   │   ├── session.py
    │   │   └── base.py
    │   │
    │   ├── models/
    │   │   ├── user.py
    │   │   ├── patient.py
    │   │   ├── doctor.py
    │   │   ├── appointment.py
    │   │   ├── medical_record.py
    │   │   ├── prescription.py
    │   │   ├── invoice.py
    │   │   ├── payment.py
    │   │   └── audit.py
    │   │
    │   ├── schemas/
    │   │   ├── auth.py
    │   │   ├── user.py
    │   │   ├── patient.py
    │   │   ├── doctor.py
    │   │   ├── appointment.py
    │   │   ├── medical_record.py
    │   │   ├── prescription.py
    │   │   ├── invoice.py
    │   │   ├── payment.py
    │   │   └── common.py
    │   │
    │   ├── repositories/
    │   ├── services/
    │   ├── dependencies/
    │   ├── api/
    │   │   └── routes/
    │   └── main.py
    │
    └── tests/
```

---

# 8. Frontend Feature Boundary

Each feature should own its feature-specific:

```text
components
hooks
schemas
types
query functions
mutation functions
```

Example:

```text
features/
└── appointments/
    ├── components/
    │   ├── appointment-table.tsx
    │   ├── appointment-form.tsx
    │   ├── appointment-card.tsx
    │   └── appointment-status.tsx
    │
    ├── hooks/
    │   ├── use-appointments.ts
    │   ├── use-appointment.ts
    │   ├── use-create-appointment.ts
    │   └── use-update-appointment.ts
    │
    ├── schemas/
    │   └── appointment.schema.ts
    │
    └── types.ts
```

Do not place all application logic into one global component or hook.

---

# 9. Backend Domain Boundary

Each backend domain should follow:

```text
Router
   ↓
Pydantic Schema
   ↓
Service
   ↓
Repository
   ↓
SQLAlchemy Model
   ↓
PostgreSQL
```

Example:

```text
POST /appointments
       ↓
appointments.py router
       ↓
AppointmentCreate schema
       ↓
AppointmentService
       ↓
AppointmentRepository
       ↓
Appointment model
       ↓
PostgreSQL
```

---

# 10. API Base URL

The frontend must use:

```text
NEXT_PUBLIC_API_URL
```

Example:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Production value should be environment-specific.

The frontend must not hardcode the backend URL inside feature components.

---

# 11. API Versioning

All MVP APIs use:

```text
/api/v1
```

Examples:

```text
/api/v1/auth/login
/api/v1/patients
/api/v1/doctors
/api/v1/appointments
```

Future breaking changes should use a new API version rather than silently changing the existing contract.

---

# 12. HTTP Communication

Frontend ↔ Backend communication uses:

```text
HTTP/HTTPS
JSON
REST-style endpoints
```

Default request header:

```http
Content-Type: application/json
```

Authentication information must be sent according to the implemented secure session/token strategy.

The exact token storage mechanism must remain centralized in the authentication layer and must not be duplicated across feature components.

---

# 13. Standard API Response Contract

Successful responses use:

```json
{
  "data": {},
  "message": "Operation completed successfully."
}
```

Example:

```json
{
  "data": {
    "id": "uuid",
    "patient_code": "PAT-001"
  },
  "message": "Patient created successfully."
}
```

---

# 14. List Response Contract

Paginated endpoints use:

```json
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

Frontend should use the pagination metadata rather than calculating total pages independently.

---

# 15. Error Response Contract

All API errors should follow:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message."
  }
}
```

Validation errors may additionally contain structured field information when required.

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fields": {
      "email": "Invalid email address."
    }
  }
}
```

The frontend should never depend on parsing arbitrary backend exception strings.

---

# 16. HTTP Status Contract

| Status | Meaning | Frontend Action |
|---|---|---|
| `200` | Success | Update UI |
| `201` | Created | Update cache / redirect if required |
| `204` | No Content | Update UI/cache |
| `400` | Bad Request | Show error |
| `401` | Unauthenticated | Re-authenticate / redirect |
| `403` | Forbidden | Show permission error |
| `404` | Not Found | Show not-found state |
| `409` | Conflict | Show conflict-specific message |
| `422` | Validation | Show field errors |
| `429` | Rate Limited | Show retry message |
| `500` | Server Error | Show safe error state |

---

# 17. Authentication Contract

## Login

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response should provide the authenticated session/token information required by the application's authentication strategy and the current user context.

Conceptually:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "PATIENT"
    }
  },
  "message": "Login successful."
}
```

The implementation must not expose `password_hash`.

---

## Current User

```http
GET /api/v1/auth/me
```

Purpose:

- Validate current authentication
- Retrieve current user
- Resolve role
- Initialize authenticated application state

---

## Logout

```http
POST /api/v1/auth/logout
```

Purpose:

- End the current authentication session/token lifecycle according to the implemented authentication strategy.

---

# 18. Role Contract

Supported roles:

```text
PATIENT
DOCTOR
RECEPTIONIST
BILLING_STAFF
ADMIN
```

Frontend role values must exactly match backend role values.

Do not create alternate names such as:

```text
BILLING
STAFF
SUPER_ADMIN
RECEPTION
```

unless the backend contract is explicitly changed.

---

# 19. Authorization Contract

The frontend may hide navigation items based on role.

However:

```text
Frontend authorization = UX
Backend authorization = Security
```

The backend must independently verify:

```text
Authenticated?
      ↓
Role allowed?
      ↓
Resource relationship allowed?
      ↓
Business rule allowed?
      ↓
Execute
```

A hidden frontend button must never be treated as a security boundary.

---

# 20. API Endpoint Contract

## Authentication

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me
PUT    /auth/me
PUT    /auth/change-password
```

---

## Patients

```text
GET    /patients
POST   /patients
GET    /patients/{patient_id}
PUT    /patients/{patient_id}
DELETE /patients/{patient_id}

GET    /patients/{patient_id}/appointments
GET    /patients/{patient_id}/medical-records
GET    /patients/{patient_id}/prescriptions
GET    /patients/{patient_id}/invoices
```

---

## Doctors

```text
GET    /doctors
POST   /doctors
GET    /doctors/{doctor_id}
PUT    /doctors/{doctor_id}
DELETE /doctors/{doctor_id}

GET    /doctors/{doctor_id}/availability
POST   /doctors/{doctor_id}/availability
PUT    /doctors/{doctor_id}/availability/{availability_id}
DELETE /doctors/{doctor_id}/availability/{availability_id}

GET    /doctors/{doctor_id}/appointments
```

---

## Appointments

```text
GET    /appointments
POST   /appointments
GET    /appointments/{appointment_id}
PUT    /appointments/{appointment_id}

POST   /appointments/{appointment_id}/confirm
POST   /appointments/{appointment_id}/cancel
POST   /appointments/{appointment_id}/complete
```

---

## Medical Records

```text
GET    /medical-records
POST   /medical-records
GET    /medical-records/{record_id}
PUT    /medical-records/{record_id}
```

---

## Prescriptions

```text
GET    /prescriptions
POST   /prescriptions
GET    /prescriptions/{prescription_id}
PUT    /prescriptions/{prescription_id}
POST   /prescriptions/{prescription_id}/cancel
```

---

## Invoices

```text
GET    /invoices
POST   /invoices
GET    /invoices/{invoice_id}
PUT    /invoices/{invoice_id}

POST   /invoices/{invoice_id}/issue
POST   /invoices/{invoice_id}/cancel
```

---

## Payments

```text
GET    /invoices/{invoice_id}/payments
POST   /invoices/{invoice_id}/payments
```

---

## Admin / Users

```text
GET    /users
GET    /users/{user_id}
PUT    /users/{user_id}
POST   /users/{user_id}/activate
POST   /users/{user_id}/deactivate

GET    /audit-logs
```

---

# 21. Frontend API Client

All API calls should go through a centralized API client.

Recommended:

```text
lib/api/client.ts
```

Example conceptual interface:

```typescript
api.get<T>(url, options)
api.post<T>(url, body, options)
api.put<T>(url, body, options)
api.delete<T>(url, options)
```

Feature components should not directly use `fetch()` repeatedly throughout the codebase.

Instead:

```text
Component
   ↓
Feature Hook
   ↓
API Function
   ↓
Central API Client
   ↓
FastAPI
```

---

# 22. TanStack Query Contract

Server state should be managed through TanStack Query.

Use:

```text
Queries
→ GET operations

Mutations
→ POST / PUT / DELETE operations
```

Example:

```text
useAppointments()
      ↓
GET /appointments
```

```text
useCreateAppointment()
      ↓
POST /appointments
```

After mutations, invalidate or update the appropriate query cache.

Example:

```text
Create Appointment
        ↓
Success
        ↓
Invalidate appointments query
        ↓
Refresh visible appointment data
```

Do not duplicate server state unnecessarily in local React state.

---

# 23. Query Key Convention

Use predictable query keys.

Examples:

```typescript
["appointments"]

["appointments", appointmentId]

["appointments", { page, pageSize, status }]

["patients"]

["patients", patientId]

["medical-records", patientId]

["prescriptions", patientId]

["invoices", patientId]

["payments", invoiceId]

["users"]

["audit-logs"]
```

Query keys should be stable and consistent across the application.

---

# 24. Frontend Form Validation

Use:

```text
React Hook Form
+
Zod
```

Flow:

```text
User Input
    ↓
Zod Validation
    ↓
Valid?
 ┌──┴──┐
No     Yes
│       │
▼       ▼
Show    API Request
Error      ↓
         Backend Validation
```

Client-side validation improves UX.

Backend validation remains authoritative.

---

# 25. API ↔ Form Field Contract

Frontend form fields should match backend schema names unless a deliberate UI mapping is required.

Example:

```json
{
  "first_name": "Bhumi",
  "last_name": "Patel",
  "phone": "9876543210"
}
```

Avoid unnecessary transformations such as:

```text
firstName
lastName
phoneNumber
```

unless the frontend type layer intentionally maps these fields.

If a mapping is used, keep it centralized.

---

# 26. Appointment Communication Contract

## Create Appointment

```http
POST /api/v1/appointments
```

Conceptual request:

```json
{
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "start_at": "2026-10-05T10:00:00+05:30",
  "end_at": "2026-10-05T10:30:00+05:30",
  "reason": "Consultation",
  "notes": "Optional notes"
}
```

Backend validates:

```text
Patient exists
Doctor exists
Doctor active
Valid date/time
Doctor availability
No overlapping appointment
User permission
```

Conflict:

```http
409 Conflict
```

Example:

```json
{
  "error": {
    "code": "APPOINTMENT_CONFLICT",
    "message": "The selected appointment slot is no longer available."
  }
}
```

Frontend should preserve the user's form and ask them to select another slot.

---

# 27. Medical Record Communication Contract

Creating a medical record:

```http
POST /api/v1/medical-records
```

Conceptual request:

```json
{
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "appointment_id": "uuid",
  "record_date": "2026-10-05T11:00:00+05:30",
  "notes": "Clinical notes",
  "findings": "Recorded findings"
}
```

The backend verifies that the authenticated doctor is permitted to perform the operation.

---

# 28. Prescription Communication Contract

Creating a prescription:

```http
POST /api/v1/prescriptions
```

Conceptual request:

```json
{
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "appointment_id": "uuid",
  "prescription_date": "2026-10-05T11:30:00+05:30",
  "notes": "Instructions",
  "items": [
    {
      "medicine_name": "Example Medicine",
      "dosage": "500 mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "instructions": "After food"
    }
  ]
}
```

The backend validates the complete operation transactionally.

---

# 29. Billing Communication Contract

## Create Invoice

```http
POST /api/v1/invoices
```

Conceptual request:

```json
{
  "patient_id": "uuid",
  "discount": "100.00",
  "tax": "50.00",
  "items": [
    {
      "description": "Consultation",
      "quantity": "1",
      "unit_price": "500.00"
    }
  ]
}
```

Backend calculates:

```text
item amount
subtotal
total
```

Frontend should not be treated as the authoritative calculator.

---

# 30. Payment Communication Contract

```http
POST /api/v1/invoices/{invoice_id}/payments
```

Conceptual request:

```json
{
  "amount": "300.00",
  "payment_method": "CASH",
  "reference": "Optional reference"
}
```

Backend:

```text
Validate invoice
      ↓
Validate payment
      ↓
Create payment
      ↓
Calculate paid amount
      ↓
Update invoice status
      ↓
Audit
      ↓
Commit
```

---

# 31. Date and Time Contract

Use ISO 8601-compatible values for API communication.

Example:

```text
2026-10-05T10:00:00+05:30
```

The frontend should not send locale-specific strings such as:

```text
05/10/2026 10:00 AM
```

unless they are converted before the API request.

---

# 32. Monetary Value Contract

Monetary values must be treated as exact decimal values.

Backend:

```text
NUMERIC(12,2)
```

Frontend should represent money safely and avoid binary floating-point calculations for authoritative totals.

The backend remains authoritative for:

```text
subtotal
discount
tax
total
paid amount
balance
payment status
```

---

# 33. Loading / Skeleton Communication

Skeleton loading is a required part of the frontend architecture.

Flow:

```text
Component Mounts
      ↓
TanStack Query
      ↓
isPending
      ↓
Show Skeleton
      ↓
API Response
      ↓
 ┌─────────────┬──────────────┐
 │ Success     │ Error        │
 ▼             ▼              │
Real Content   Error State    │
```

Examples:

```text
PatientTableSkeleton
AppointmentTableSkeleton
DashboardCardSkeleton
MedicalRecordSkeleton
PrescriptionSkeleton
InvoiceSkeleton
AuditLogSkeleton
```

Do not show an empty-state message while the query is still loading.

Correct:

```text
Loading → Skeleton
Loaded + zero records → Empty State
Loaded + records → Content
Error → Error State
```

---

# 34. Frontend State Model

Separate state into:

```text
Server State
    ↓
TanStack Query

Form State
    ↓
React Hook Form

Validation State
    ↓
Zod + RHF

UI State
    ↓
React state / local component state

Authentication State
    ↓
Centralized auth/session layer
```

Do not put every type of state into one global store.

---

# 35. Authentication State Flow

```text
Application Start
      ↓
Check Authentication
      ↓
GET /auth/me
      ↓
 ┌───────────────┬───────────────┐
 │ Authenticated │ Not Authenticated
 │       ↓       │       ↓
 │ Resolve Role  │ Public Routes
 │       ↓       │
 │ Dashboard     │
 └───────────────┘
```

On `401`:

```text
API Request
    ↓
401
    ↓
Clear invalid auth state
    ↓
Redirect to Login
```

Avoid redirect loops.

---

# 36. Route Protection

Public routes:

```text
/
/features
/about
/how-it-works
/login
/register
```

Protected routes:

```text
/dashboard
/patients
/doctors
/appointments
/medical-records
/prescriptions
/billing
/users
/audit-logs
/profile
```

Role-specific access must also be enforced by the backend.

---

# 37. Error Boundary Strategy

Frontend should have:

```text
Global Error Boundary
        ↓
Feature Error State
        ↓
API Error Handler
```

Do not expose:

- Stack traces
- Database errors
- SQL errors
- Internal service names
- Secrets
- Authentication details

---

# 38. Backend Exception Mapping

Backend exceptions should map to predictable API errors.

Example:

```text
AppointmentConflictError
        ↓
409
APPOINTMENT_CONFLICT
```

```text
PermissionDeniedError
        ↓
403
FORBIDDEN
```

```text
ResourceNotFoundError
        ↓
404
NOT_FOUND
```

```text
ValidationError
        ↓
422
VALIDATION_ERROR
```

The frontend should rely on the error `code`, not fragile message matching.

---

# 39. CORS Contract

The backend should explicitly allow configured frontend origins.

Configuration:

```text
CORS_ORIGINS
```

Example development value:

```text
http://localhost:3000
```

Do not use unrestricted CORS in production.

---

# 40. Security Boundary

Never trust frontend values for:

```text
role
user_id
permissions
invoice total
payment status
appointment authorization
medical-record ownership
```

The backend must derive or verify these values.

For example:

```text
Frontend says:
patient_id = X

Backend:
Is current user allowed to access patient X?
       ↓
Yes → Continue
No  → 403
```

---

# 41. Audit Communication

Important mutations should create audit records.

Examples:

```text
Create patient
Update patient
Create appointment
Cancel appointment
Complete appointment
Create medical record
Create prescription
Cancel prescription
Create invoice
Issue invoice
Cancel invoice
Record payment
Activate user
Deactivate user
```

Audit creation belongs to the backend.

The frontend should not create audit records directly.

---

# 42. Frontend Cache Invalidation Rules

After a successful mutation, invalidate affected queries.

Example:

```text
Create Appointment
      ↓
Invalidate:
["appointments"]
["appointments", patientId]
["appointments", doctorId]
```

Example:

```text
Create Payment
      ↓
Invalidate:
["invoices", invoiceId]
["payments", invoiceId]
```

Example:

```text
Create Medical Record
      ↓
Invalidate:
["medical-records", patientId]
```

Only invalidate queries that are actually affected.

---

# 43. Optimistic Updates

Optimistic updates should **not** be used by default for sensitive healthcare and billing operations.

Prefer:

```text
Submit
 ↓
Loading
 ↓
Backend success
 ↓
Update cache
```

rather than immediately assuming success for:

- Medical records
- Prescriptions
- Billing
- Payments
- Appointment booking

---

# 44. Naming Convention

## Frontend

Files:

```text
kebab-case.tsx
kebab-case.ts
```

Components:

```text
PascalCase
```

Hooks:

```text
useSomething
```

Types:

```text
PascalCase
```

---

## Backend

Python:

```text
snake_case.py
```

Classes:

```text
PascalCase
```

Functions:

```text
snake_case
```

Database columns:

```text
snake_case
```

API paths:

```text
/kebab-case
```

Existing project endpoint naming should remain consistent.

---

# 45. Type Contract

Frontend TypeScript types should represent API data.

Example:

```typescript
type UserRole =
  | "PATIENT"
  | "DOCTOR"
  | "RECEPTIONIST"
  | "BILLING_STAFF"
  | "ADMIN";
```

Do not duplicate slightly different role enums across features.

Centralize shared API types where practical.

---

# 46. Frontend ↔ Backend Contract Example

Complete appointment request:

```text
USER
 ↓
AppointmentForm
 ↓
React Hook Form
 ↓
Zod
 ↓
useCreateAppointment()
 ↓
api.post()
 ↓
POST /api/v1/appointments
 ↓
FastAPI Router
 ↓
AppointmentCreate
 ↓
AppointmentService
 ↓
Permission Check
 ↓
Availability Check
 ↓
Conflict Check
 ↓
AppointmentRepository
 ↓
SQLAlchemy
 ↓
PostgreSQL
 ↓
Audit Log
 ↓
Response
 ↓
TanStack Query Cache Update
 ↓
UI Success State
```

This is the standard pattern the coding agent should follow.

---

# 47. Example Response Flow

```text
FastAPI
    ↓
201 Created
    ↓
{
  "data": {
    "id": "...",
    "status": "SCHEDULED"
  },
  "message": "Appointment created successfully."
}
    ↓
API Client
    ↓
TanStack Mutation
    ↓
Invalidate Appointment Queries
    ↓
Toast / Success Feedback
    ↓
Updated Appointment List
```

---

# 48. Do Not Do These Things

Agents must avoid:

### Architecture

```text
❌ Frontend → PostgreSQL
❌ Frontend → SQLAlchemy
❌ Backend → Directly manipulate React state
❌ Business logic inside UI components
❌ Database queries inside FastAPI routers
```

### Security

```text
❌ Trust frontend role
❌ Trust frontend price
❌ Trust frontend payment status
❌ Store plaintext passwords
❌ Expose password hashes
❌ Expose database credentials
```

### State

```text
❌ Duplicate server state in multiple stores
❌ Manually refetch everything after every mutation
❌ Show empty state while data is loading
```

### API

```text
❌ Random response structures
❌ Random error structures
❌ Hardcoded API URLs
❌ Feature-specific fetch implementations everywhere
❌ Silent API contract changes
```

---

# 49. Development Workflow for Agents

For every feature:

```text
1. Read relevant requirements
        ↓
2. Check database schema
        ↓
3. Define backend model/schema if needed
        ↓
4. Implement repository
        ↓
5. Implement service/business logic
        ↓
6. Implement API route
        ↓
7. Add backend tests
        ↓
8. Define frontend API type
        ↓
9. Add API client function
        ↓
10. Add TanStack Query hook
        ↓
11. Add UI
        ↓
12. Add loading/skeleton state
        ↓
13. Add empty/error/success states
        ↓
14. Add frontend tests
        ↓
15. Run integration/E2E test
```

Do not start by modifying random UI components without establishing the API contract.

---

# 50. Feature Implementation Checklist

Every new feature should answer:

```text
[ ] What user role uses it?
[ ] What page owns it?
[ ] What database entities are involved?
[ ] What API endpoint is required?
[ ] What request schema is required?
[ ] What response schema is required?
[ ] What permissions are required?
[ ] What business rules apply?
[ ] What loading skeleton is required?
[ ] What empty state is required?
[ ] What error states are required?
[ ] What success feedback is required?
[ ] What queries must be invalidated?
[ ] What audit event is required?
[ ] What tests are required?
```

---

# 51. Testing Contract

## Backend

Test:

- Schema validation
- Authentication
- Authorization
- Service logic
- Repository behavior
- Appointment conflicts
- Appointment state transitions
- Prescription creation
- Invoice calculations
- Payment status
- Audit logging

## Frontend

Test:

- Form validation
- Component rendering
- Loading states
- Skeleton states
- Error states
- Empty states
- Role-based navigation
- API error handling
- Mutation success behavior

## E2E

At minimum:

```text
Patient:
Login → Book Appointment → View Appointment

Doctor:
Login → Open Appointment → Add Record → Create Prescription

Receptionist:
Login → Create Patient → Book Appointment

Billing:
Login → Create Invoice → Record Payment

Admin:
Login → Manage User → View Audit Log
```

---

# 52. Local Development Communication

Recommended environment:

```text
Browser
   ↓
Next.js
localhost:3000
   ↓
FastAPI
localhost:8000
   ↓
PostgreSQL
localhost:5432
```

API:

```text
http://localhost:8000/api/v1
```

Frontend:

```text
http://localhost:3000
```

Health endpoint:

```text
GET /health
```

Readiness endpoint:

```text
GET /ready
```

---

# 53. Environment Configuration

Frontend:

```text
NEXT_PUBLIC_API_URL
```

Backend:

```text
DATABASE_URL
JWT_SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS
CORS_ORIGINS
```

Never commit real secrets.

Use:

```text
.env.example
```

for documented configuration names.

---

# 54. API Documentation

FastAPI should expose generated API documentation during development.

Expected endpoints:

```text
/docs
/redoc
```

The API documentation should reflect the actual Pydantic request/response schemas.

The coding agent should use these schemas as the backend contract rather than inventing request shapes independently.

---

# 55. Contract Change Procedure

If a frontend requirement needs a backend change:

```text
Identify mismatch
      ↓
Document proposed change
      ↓
Update backend schema
      ↓
Update API route
      ↓
Update frontend type
      ↓
Update API client
      ↓
Update hooks
      ↓
Update UI
      ↓
Update tests
```

Never change only one side.

---

# 56. Definition of "Done"

A frontend-backend feature is complete only when:

- Backend endpoint exists.
- Pydantic request schema exists.
- Pydantic response schema exists.
- Authorization is implemented.
- Service logic exists.
- Database operation works.
- Transaction requirements are satisfied.
- Audit requirements are satisfied.
- API error contract is followed.
- Frontend API client exists.
- TypeScript types exist.
- TanStack Query hook exists.
- UI exists.
- Form validation exists where applicable.
- Skeleton/loading state exists.
- Empty state exists.
- Error state exists.
- Success feedback exists.
- Cache invalidation works.
- Tests pass.

---

# 57. Final Agent Rules

The implementation agent should follow these rules throughout development:

1. **Do not invent a second architecture.**
2. **Do not bypass FastAPI from the frontend.**
3. **Do not put business logic in React components.**
4. **Do not put database queries directly in API routers.**
5. **Do not trust frontend authorization.**
6. **Do not trust frontend billing calculations.**
7. **Do not create arbitrary API response formats.**
8. **Do not create duplicate role definitions.**
9. **Do not hardcode environment-specific URLs.**
10. **Do not omit loading/skeleton states.**
11. **Do not show empty states while data is still loading.**
12. **Do not expose sensitive backend information.**
13. **Do not silently change the API contract.**
14. **Do not introduce MVP-excluded functionality without an explicit scope change.**
15. **Keep frontend and backend changes synchronized.**
16. **Add tests with every significant feature.**
17. **Use the database schema as the source of truth for persistence.**
18. **Use backend services as the source of truth for business logic.**
19. **Use the API contract as the source of truth for frontend/backend communication.**
20. **When uncertain, inspect the existing project structure and documentation before creating new patterns.**

---

# 58. Complete Communication Model

```text
                         USER
                          │
                          ▼
                  ┌───────────────┐
                  │    Next.js    │
                  │  TypeScript   │
                  └───────┬───────┘
                          │
                   API Client
                          │
                   TanStack Query
                          │
                    JSON / HTTP
                          │
                          ▼
                  ┌───────────────┐
                  │    FastAPI    │
                  │    Router     │
                  └───────┬───────┘
                          │
                   Pydantic Schema
                          │
                          ▼
                  ┌───────────────┐
                  │    Service    │
                  │ Business Logic│
                  └───────┬───────┘
                          │
                 Permission / Rules
                          │
                          ▼
                  ┌───────────────┐
                  │  Repository   │
                  └───────┬───────┘
                          │
                      SQLAlchemy
                          │
                          ▼
                  ┌───────────────┐
                  │  PostgreSQL   │
                  └───────────────┘
                          │
                          ▼
                    Audit Logging
                          │
                          ▼
                       Response
                          │
                          ▼
                    API Client
                          │
                          ▼
                   TanStack Query
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
           Content     Success      Error
              │
              ▼
             UI
```

---

# 59. Final Architecture Contract

The Arogyavajra implementation must follow:

```text
                    FRONTEND
          Next.js + TypeScript
                    │
             TanStack Query
                    │
              Central API Client
                    │
             HTTP/JSON Contract
                    │
                    ▼
                    BACKEND
               FastAPI + Pydantic
                    │
              Authentication
                    │
                RBAC / ACL
                    │
                 Services
                    │
               Repositories
                    │
                SQLAlchemy
                    │
                    ▼
                 DATABASE
                PostgreSQL
                    │
                    ▼
                Audit Logs
```

The central rule is:

> **Frontend handles presentation and user interaction. Backend handles authentication, authorization, validation, business rules, transactions, and data integrity. PostgreSQL handles persistent relational data. The API contract is the controlled communication boundary between frontend and backend.**

---

# 60. Project Documentation Chain

```text
PRD.md
   ↓
MVP.md
   ↓
TRD.md
   ↓
APP-FLOW.md
   ↓
UI-UX-BRIEF.md
   ↓
DATABASE-SCHEMA.md
   ↓
FRONTEND-BACKEND-CONTRACT.md
   ↓
Implementation
```

This document should be treated as the **integration contract for development agents** working on the Arogyavajra frontend and backend.
