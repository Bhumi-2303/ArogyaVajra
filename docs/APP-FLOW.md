# Arogyavajra — Application Flow Document

**Project:** Arogyavajra  
**Document:** Application Flow (APP Flow)  
**Version:** 1.0  
**Date:** 02 October 2026  
**Purpose:** Define how users move through the Arogyavajra application, including authentication, role-based navigation, core workflows, page transitions, and major system states.

---

## 1. Document Purpose

The APP Flow document describes the functional navigation and user journey of the Arogyavajra healthcare management platform.

It connects the product requirements with the actual application experience:

**User → Authentication → Role Dashboard → Module → Action → Validation → Result → Audit/Next Action**

The flow is designed for the MVP and covers the five supported roles:

- Patient
- Doctor
- Receptionist
- Billing Staff
- Admin

---

# 2. High-Level Application Flow

```text
                    ┌─────────────────────┐
                    │     Launch App      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Authentication Check│
                    └──────────┬──────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
            Not Authenticated          Authenticated
                  │                         │
                  ▼                         ▼
          ┌───────────────┐        ┌─────────────────┐
          │ Login / Signup│        │ Resolve User    │
          └───────┬───────┘        │ Role & Session  │
                  │                └────────┬────────┘
                  ▼                         │
          ┌───────────────┐                 ▼
          │ Validate User │        ┌─────────────────┐
          └───────┬───────┘        │ Role Dashboard  │
                  │                └────────┬────────┘
                  ▼                         │
          ┌───────────────┐                 ▼
          │ Create Session│        ┌─────────────────┐
          └───────┬───────┘        │ Select Module   │
                  │                └────────┬────────┘
                  └─────────────────────────┤
                                            ▼
                                  ┌────────────────────┐
                                  │ Perform Operation  │
                                  └─────────┬──────────┘
                                            │
                               ┌────────────┴────────────┐
                               │                         │
                            Success                   Failure
                               │                         │
                               ▼                         ▼
                       ┌──────────────┐          ┌──────────────┐
                       │ Save / Update│          │ Error / Retry│
                       └──────┬───────┘          └──────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │ Audit Action │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │ Next Action  │
                       └──────────────┘
```

---

# 3. Public Landing Page & Application Entry Flow

The Arogyavajra application should **not open directly to a login screen**.

The first screen should be a public, product-focused landing page that introduces Arogyavajra, explains its purpose, highlights its major capabilities, and then guides users toward the appropriate application entry point.

## 3.1 Landing Page Flow

```text
                         Open Arogyavajra
                                ↓
                    ┌───────────────────────┐
                    │    Public Landing     │
                    │        Page           │
                    └───────────┬───────────┘
                                │
       ┌────────────────────────┼────────────────────────┐
       │                        │                        │
       ▼                        ▼                        ▼
   Explore                 Learn About              Get Started
   Features                Arogyavajra               / Login
       │                        │                        │
       ▼                        ▼                        ▼
  Feature Sections       About / Vision /        Authentication
                         Healthcare Platform
                                                        │
                                                        ▼
                                               Role-Based Dashboard
```

The landing page acts as the **public entry point** to Arogyavajra.

---

## 3.2 Landing Page Structure

```text
┌──────────────────────────────────────────────────────────────┐
│ AROGYAVAJRA                         Features  About  Login    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              Intelligent Healthcare Management               │
│                                                              │
│        A unified platform connecting patients, doctors,      │
│        reception, billing and administration workflows.      │
│                                                              │
│        [ Get Started ]       [ Explore Platform ]            │
│                                                              │
│                 Healthcare Platform Visual                   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    Why Arogyavajra?                           │
│                                                              │
│  Patient Care     Doctor Workflow     Administration         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    Core Capabilities                          │
│                                                              │
│  Appointments | Medical Records | Prescriptions | Billing    │
│  User Management | Role-Based Access | Auditability          │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    How It Works                               │
│                                                              │
│       Patient → Doctor → Records → Prescription → Billing    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                     Built for Healthcare                      │
│                                                              │
│       Secure • Role-Based • Structured • Extensible          │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                 Ready to use Arogyavajra?                    │
│                                                              │
│                       [ Get Started ]                         │
├──────────────────────────────────────────────────────────────┤
│ Arogyavajra | About | Features | Login | Contact             │
└──────────────────────────────────────────────────────────────┘
```

---

## 3.3 Landing Page Sections

### 1. Navigation Bar

The navigation bar provides access to:

- Arogyavajra logo/name
- Features
- About
- How It Works
- Login
- Get Started

The navigation should remain simple and focused on introducing the platform.

---

### 2. Hero Section

The hero section should immediately communicate what Arogyavajra is.

**Suggested headline:**

> **A Unified Healthcare Management Platform**

**Suggested supporting text:**

> Arogyavajra brings patient management, doctor workflows, appointments, medical records, prescriptions, billing, and administration into one structured healthcare platform.

Primary CTA:

**Get Started**

Secondary CTA:

**Explore Platform**

The hero should visually communicate healthcare, trust, technology, and structured clinical workflows without implying unsupported AI diagnosis or autonomous medical decision-making.

---

### 3. Why Arogyavajra?

This section explains the problem the platform addresses.

Suggested cards:

```text
Patient-Centered
Manage appointments, records, prescriptions and billing information
through a structured patient experience.

Connected Workflows
Connect reception, doctors, patients and billing operations through
one application.

Organized Healthcare Data
Keep healthcare information structured and accessible according
to user permissions.

Controlled Access
Use role-based access and auditability for important system actions.
```

---

### 4. Core Capabilities

The landing page should introduce the major MVP capabilities:

```text
                    AROGYAVAJRA CAPABILITIES

        ┌──────────────────┐  ┌──────────────────┐
        │ Patient Management│  │ Doctor Management│
        └──────────────────┘  └──────────────────┘

        ┌──────────────────┐  ┌──────────────────┐
        │  Appointments    │  │ Medical Records  │
        └──────────────────┘  └──────────────────┘

        ┌──────────────────┐  ┌──────────────────┐
        │  Prescriptions   │  │     Billing      │
        └──────────────────┘  └──────────────────┘

        ┌──────────────────┐  ┌──────────────────┐
        │ Role-Based Access│  │   Audit Logs     │
        └──────────────────┘  └──────────────────┘
```

Each capability can link to a more detailed section or application screen.

---

### 5. How Arogyavajra Works

A simple workflow should explain the platform to a first-time visitor.

```text
Patient / Reception
        ↓
Appointment
        ↓
Doctor Consultation
        ↓
Medical Record
        ↓
Prescription
        ↓
Billing
        ↓
Auditable Healthcare Workflow
```

This section should communicate that Arogyavajra connects multiple healthcare operations rather than functioning as a single isolated feature.

---

### 6. Role-Based Platform Section

The landing page should introduce the different users of the system.

```text
┌────────────┐
│  PATIENT   │
└─────┬──────┘
      │
      ├── Appointments
      ├── Medical Records
      ├── Prescriptions
      └── Billing

┌────────────┐
│   DOCTOR   │
└─────┬──────┘
      │
      ├── Appointments
      ├── Patient Records
      ├── Medical Records
      └── Prescriptions

┌──────────────┐
│ RECEPTIONIST │
└──────┬───────┘
       │
       ├── Patients
       ├── Doctors
       └── Appointments

┌───────────────┐
│ BILLING STAFF │
└───────┬───────┘
        │
        ├── Invoices
        └── Payments

┌────────────┐
│   ADMIN    │
└─────┬──────┘
      │
      ├── Users
      ├── System Management
      └── Audit Logs
```

This gives visitors a quick understanding of who the platform is designed for.

---

### 7. Security & Trust Section

The landing page can communicate the platform's technical principles without making unsupported compliance claims.

Suggested points:

- Role-based access control
- Secure authentication
- Controlled access to healthcare information
- Audit logging
- Structured data management
- Backend validation
- Transaction-safe operations

Avoid presenting Arogyavajra as medically certified or regulatory compliant unless such certification is actually obtained.

---

### 8. Final Call-to-Action

The landing page ends with a clear entry point:

> **Ready to explore Arogyavajra?**

**[ Get Started ]**

The button takes the user to the authentication flow.

```text
Landing Page
      ↓
Get Started / Login
      ↓
Authentication
      ↓
Role Resolution
      ↓
Role Dashboard
```

---

## 3.4 Public vs Authenticated Application

The application should therefore have two major areas:

```text
                    AROGYAVAJRA
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
       PUBLIC AREA            AUTHENTICATED AREA
             │                       │
       Landing Page           Role Dashboard
       About                   Patient
       Features                Doctor
       How It Works            Receptionist
       Login                   Billing Staff
       Get Started             Admin
```

### Public area

Accessible without authentication:

- Landing page
- Product introduction
- Features
- How it works
- About
- Login / Get Started

### Authenticated area

Requires login:

- Dashboard
- Patient management
- Doctor management
- Appointments
- Medical records
- Prescriptions
- Billing
- User management
- Audit logs

---

## 3.5 Updated First-Time User Flow

```text
User Visits Arogyavajra
        ↓
Public Landing Page
        ↓
Understand Platform
        ↓
Explore Features / How It Works
        ↓
Click "Get Started"
        ↓
Authentication
        ↓
 ┌─────────────────────┐
 │ New User            │
 │        ↓            │
 │ Registration        │
 └─────────┬───────────┘
           │
           ▼
      Account Created
           │
           ▼
      Authentication
           │
           ▼
      Resolve Role
           │
           ▼
      Role Dashboard
```

---

## 3.6 Updated Returning User Flow

```text
User Visits Arogyavajra
        ↓
Public Landing Page
        ↓
Click Login
        ↓
Enter Credentials
        ↓
Validate Credentials
        ↓
Create / Restore Session
        ↓
Resolve Role
        ↓
Role Dashboard
```

If a valid session is already available, the application may provide a direct **Continue to Dashboard** action while retaining the public landing page as the primary public entry point.

# 4. Authentication Flow

```text
Login
  ↓
Enter Email + Password
  ↓
Client Validation
  ↓
Send Authentication Request
  ↓
Backend Validates Credentials
  ↓
 ┌──────────────────┬───────────────────┐
 │ Invalid          │ Valid             │
 │      ↓           │      ↓            │
 │ Show Error       │ Create Session     │
 │      ↓           │      ↓            │
 │ Retry Login      │ Resolve Role      │
 └──────────────────┴─────────┬─────────┘
                              ↓
                       Role Dashboard
```

### Authentication screens

- Login
- Registration
- Forgot/Reset Password flow if implemented
- Change Password
- Current User/Profile

### Authentication rules

- Passwords are never stored in plaintext.
- Protected routes require authentication.
- Backend authorization is authoritative.
- Frontend role checks are used for navigation and UX only.

---

# 5. Role-Based Application Flow

After successful authentication, the application determines the user's role.

```text
                         Authenticated User
                                │
                                ▼
                         Resolve User Role
                                │
        ┌───────────────┬───────┼────────┬───────────────┐
        ▼               ▼       ▼        ▼               ▼
     Patient         Doctor Reception  Billing          Admin
        │               │       │        │               │
        ▼               ▼       ▼        ▼               ▼
 Patient Dashboard Doctor Dashboard Receptionist     Billing       Admin
                                      Dashboard      Dashboard     Dashboard
```

Each role sees only the modules and actions permitted to that role.

---

# 6. Common Application Shell

Authenticated users use a common application structure.

```text
┌───────────────────────────────────────────────────────┐
│ Arogyavajra Logo       Search       Notifications     │
├───────────────┬───────────────────────────────────────┤
│               │                                       │
│ Dashboard     │                                       │
│ Appointments  │          Main Content Area            │
│ Patients      │                                       │
│ Doctors       │                                       │
│ Records       │                                       │
│ Prescriptions │                                       │
│ Billing       │                                       │
│ Users         │                                       │
│ Audit Logs    │                                       │
│               │                                       │
│ Profile       │                                       │
│ Logout        │                                       │
└───────────────┴───────────────────────────────────────┘
```

The exact navigation items depend on the user's role.

---

# 7. Patient Application Flow

## 7.1 Patient Dashboard

```text
Login
  ↓
Patient Dashboard
  ├── View Profile
  ├── Book Appointment
  ├── View Appointments
  ├── View Medical Records
  ├── View Prescriptions
  └── View Invoices / Payments
```

---

## 7.2 Book Appointment Flow

```text
Patient Dashboard
      ↓
Book Appointment
      ↓
Select Doctor
      ↓
Select Date
      ↓
View Available Time
      ↓
Select Time Slot
      ↓
Confirm Appointment Details
      ↓
Submit
      ↓
Backend Validation
      ↓
Check Doctor Availability
      ↓
Check Appointment Conflict
      ↓
 ┌───────────────┬─────────────────┐
 │ Conflict      │ Available       │
 │      ↓        │       ↓         │
 │ Show Error    │ Create Booking  │
 │      ↓        │       ↓         │
 │ Select Again  │ Appointment     │
 └───────────────┴────────┬────────┘
                           ↓
                    Booking Confirmation
                           ↓
                    Appointment List
```

### Appointment information

- Doctor
- Patient
- Date
- Start time
- End time
- Appointment status
- Appointment code

---

## 7.3 Patient Appointment Management

```text
Appointments
      ↓
Select Appointment
      ↓
 ┌───────────────┬─────────────────┐
 │ View Details  │ Cancel           │
 │               │        ↓         │
 │               │ Validate Action  │
 │               │        ↓         │
 │               │ Update Status    │
 └───────────────┴─────────────────┘
```

Supported appointment states:

- Scheduled
- Confirmed
- Completed
- Cancelled
- No-show

---

## 7.4 Patient Medical Records Flow

```text
Patient Dashboard
      ↓
Medical Records
      ↓
Select Record
      ↓
View Clinical Information
      ↓
View Related Prescription / Visit Information
```

Patients can view information permitted by the application. They cannot modify clinical records through the patient workflow.

---

## 7.5 Patient Prescription Flow

```text
Patient Dashboard
      ↓
Prescriptions
      ↓
Prescription List
      ↓
Select Prescription
      ↓
View Medicines / Instructions / Dates
```

---

## 7.6 Patient Billing Flow

```text
Patient Dashboard
      ↓
Invoices
      ↓
Select Invoice
      ↓
View Invoice Details
      ↓
View Payment Status
      ↓
View Payment History
```

---

# 8. Doctor Application Flow

## 8.1 Doctor Dashboard

```text
Login
  ↓
Doctor Dashboard
  ├── Today's Appointments
  ├── Upcoming Appointments
  ├── Patient Information
  ├── Medical Records
  ├── Prescriptions
  └── Availability
```

---

## 8.2 Doctor Availability Flow

```text
Doctor Dashboard
      ↓
Availability
      ↓
Select Day / Date
      ↓
Add or Update Available Time
      ↓
Validate Time Range
      ↓
Save Availability
      ↓
Updated Availability
```

The availability information is used during appointment booking.

---

## 8.3 Doctor Appointment Flow

```text
Doctor Dashboard
      ↓
Appointments
      ↓
Select Appointment
      ↓
View Patient + Appointment Details
      ↓
 ┌──────────────┬──────────────┬──────────────┐
 │ Confirm      │ Complete     │ Cancel       │
 │              │              │              │
 ▼              ▼              ▼              ▼
Status Update   Consultation   Status Update
                / Record
```

---

## 8.4 Doctor Consultation / Medical Record Flow

```text
Doctor
  ↓
Appointments
  ↓
Select Patient Appointment
  ↓
Open Patient Details
  ↓
Review Existing Records
  ↓
Add Medical Record
  ↓
Enter Clinical Information
  ↓
Validate
  ↓
Save Record
  ↓
Audit Action
  ↓
Patient Record Updated
```

---

## 8.5 Doctor Prescription Flow

```text
Doctor
  ↓
Patient
  ↓
Prescription
  ↓
Create Prescription
  ↓
Add Medicine Items
  ↓
Enter Dosage / Frequency / Duration / Instructions
  ↓
Validate Prescription
  ↓
Save Prescription
  ↓
Audit Action
  ↓
Prescription Available in Patient Record
```

---

# 9. Receptionist Application Flow

## 9.1 Receptionist Dashboard

```text
Login
  ↓
Receptionist Dashboard
  ├── Patient Management
  ├── Doctor Management
  ├── Appointments
  └── Patient Registration
```

---

## 9.2 Patient Registration Flow

```text
Receptionist Dashboard
      ↓
Patients
      ↓
Add Patient
      ↓
Enter Patient Information
      ↓
Validate Data
      ↓
Check Required / Unique Fields
      ↓
Create Patient Profile
      ↓
Generate Patient Code
      ↓
Save
      ↓
Patient Profile Created
```

---

## 9.3 Receptionist Appointment Booking

```text
Receptionist
      ↓
Appointments
      ↓
Select Patient
      ↓
Select Doctor
      ↓
Select Date
      ↓
Select Available Time
      ↓
Confirm Booking
      ↓
Conflict Check
      ↓
Create Appointment
      ↓
Appointment Confirmation
```

---

## 9.4 Doctor Management Flow

```text
Receptionist
      ↓
Doctors
      ↓
View Doctor List
      ↓
Select Doctor
      ↓
View / Manage Permitted Information
      ↓
Save Changes
```

---

# 10. Billing Staff Application Flow

## 10.1 Billing Dashboard

```text
Login
  ↓
Billing Dashboard
  ├── Invoices
  ├── Payments
  └── Patient Billing Information
```

---

## 10.2 Create Invoice Flow

```text
Billing Dashboard
      ↓
Invoices
      ↓
Create Invoice
      ↓
Select Patient
      ↓
Add Invoice Items
      ↓
Enter Quantity + Unit Price
      ↓
Calculate Item Amount
      ↓
Calculate Subtotal
      ↓
Apply Discount / Tax
      ↓
Calculate Total
      ↓
Validate
      ↓
Create Invoice
      ↓
Invoice Created
```

### Billing calculation

```text
Item Amount = Quantity × Unit Price

Subtotal = Sum of Item Amounts

Total = Subtotal - Discount + Tax
```

The backend is authoritative for billing calculations.

---

## 10.3 Payment Flow

```text
Invoice
  ↓
View Invoice
  ↓
Record Payment
  ↓
Enter Payment Amount + Method + Reference
  ↓
Validate Payment
  ↓
Save Payment
  ↓
Recalculate Paid Amount
  ↓
Update Invoice Payment Status
  ↓
Payment History Updated
```

### Payment status flow

```text
No Payment
    ↓
ISSUED
    ↓
Partial Payment
    ↓
PARTIALLY_PAID
    ↓
Full Payment
    ↓
PAID
```

---

# 11. Admin Application Flow

## 11.1 Admin Dashboard

```text
Login
  ↓
Admin Dashboard
  ├── Users
  ├── Patients
  ├── Doctors
  ├── Appointments
  ├── Medical Records
  ├── Prescriptions
  ├── Billing
  └── Audit Logs
```

---

## 11.2 User Management Flow

```text
Admin Dashboard
      ↓
Users
      ↓
View User List
      ↓
Search / Filter
      ↓
Select User
      ↓
View User Details
      ↓
 ┌──────────────────┬───────────────────┐
 │ Update Role      │ Activate/Deactivate│
 │                  │                    │
 ▼                  ▼                    ▼
Validate Change    Validate Action
      ↓                  ↓
Save                Save Status
      └──────────────┬───┘
                     ↓
                 Audit Log
```

---

## 11.3 Audit Log Flow

```text
Admin Dashboard
      ↓
Audit Logs
      ↓
Search / Filter
      ↓
Select Audit Entry
      ↓
View:
- Actor
- Action
- Resource
- Timestamp
- Relevant metadata
```

Audit logs provide traceability for important system operations.

---

# 12. Global Search and Listing Flow

For supported list screens:

```text
Open Module
    ↓
Load Paginated Data
    ↓
 ┌───────────────┬───────────────┐
 │ Search        │ Filter        │
 │               │               │
 ▼               ▼               ▼
Enter Query    Select Filter   Apply
       └──────────────┬─────────┘
                      ↓
                Updated Results
                      ↓
                Select Record
                      ↓
                 Detail Page
```

Pagination is used where data sets can become large.

---

# 13. Appointment State Flow

```text
                 ┌──────────────┐
                 │  SCHEDULED   │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │  CONFIRMED   │
                 └──────┬───────┘
                        │
                ┌───────┴────────┐
                ▼                ▼
        ┌──────────────┐  ┌──────────────┐
        │  COMPLETED   │  │  CANCELLED   │
        └──────────────┘  └──────────────┘

Scheduled / Confirmed
        │
        ▼
    NO_SHOW
```

Invalid state transitions are rejected by the backend.

---

# 14. Medical Record Flow

```text
Patient / Appointment
        ↓
Doctor Opens Patient
        ↓
Review Existing Records
        ↓
Create New Medical Record
        ↓
Enter Information
        ↓
Validate
        ↓
Save
        ↓
Audit
        ↓
Record Available According to Permissions
```

The medical-record workflow is designed around controlled access and auditability.

---

# 15. Prescription Flow

```text
Patient Consultation
        ↓
Doctor Creates Prescription
        ↓
Add Prescription Items
        ↓
Validate Required Fields
        ↓
Save Prescription
        ↓
Audit Action
        ↓
Prescription Linked to Patient
        ↓
Patient Can View Permitted Prescription Information
```

---

# 16. Billing and Payment Flow

```text
Patient
  ↓
Invoice Creation
  ↓
Invoice Issued
  ↓
 ┌──────────────────────┐
 │ Payment Received?     │
 └──────────┬───────────┘
            │
       ┌────┴─────┐
       │          │
      No         Yes
       │          │
       ▼          ▼
    ISSUED    Record Payment
                  ↓
            Recalculate Balance
                  ↓
          ┌───────┴────────┐
          │                │
     Partial Payment   Full Payment
          │                │
          ▼                ▼
  PARTIALLY_PAID         PAID
```

---

# 17. Permission / Authorization Flow

Every protected operation follows:

```text
User Request
     ↓
Authenticate User
     ↓
Resolve Role
     ↓
Check Permission
     ↓
Check Resource Relationship / Ownership
     ↓
 ┌───────────────┬───────────────┐
 │ Unauthorized  │ Authorized    │
 │      ↓        │      ↓        │
 │ HTTP 403      │ Execute       │
 │               │ Operation     │
 └───────────────┴───────┬───────┘
                         ↓
                     Audit Action
```

Authentication and authorization are enforced on the backend.

---

# 18. Error Handling Flow

```text
User Action
    ↓
Client Validation
    ↓
 ┌──────────────┬──────────────┐
 │ Invalid      │ Valid        │
 │      ↓       │      ↓       │
 │ Show Field   │ API Request  │
 │ Error        │              │
 └──────────────┴──────┬───────┘
                       ↓
                 Backend Validation
                       ↓
              ┌────────┴─────────┐
              │                  │
           Success             Failure
              │                  │
              ▼                  ▼
          Update UI        Return Safe Error
                                 ↓
                           Show User Message
                                 ↓
                              Retry / Fix
```

Common API outcomes:

- `400` Bad Request
- `401` Unauthenticated
- `403` Forbidden
- `404` Not Found
- `409` Conflict
- `422` Validation Error
- `429` Too Many Requests
- `500` Internal Server Error

---

# 19. Logout Flow

```text
Authenticated User
      ↓
Open Profile / Account Menu
      ↓
Select Logout
      ↓
End Session
      ↓
Clear Client Authentication State
      ↓
Redirect to Login
```

---

# 20. End-to-End Core User Journeys

## 20.1 Patient Appointment Journey

```text
Patient Login
    ↓
Dashboard
    ↓
Book Appointment
    ↓
Choose Doctor
    ↓
Choose Date & Time
    ↓
Confirm
    ↓
Availability + Conflict Check
    ↓
Appointment Created
    ↓
Appointment Appears in Patient Dashboard
```

---

## 20.2 Doctor Consultation Journey

```text
Doctor Login
    ↓
Dashboard
    ↓
Today's Appointments
    ↓
Open Patient Appointment
    ↓
Review Patient Records
    ↓
Add Medical Record
    ↓
Create Prescription
    ↓
Complete Appointment
    ↓
Audit Actions
```

---

## 20.3 Receptionist Journey

```text
Receptionist Login
    ↓
Dashboard
    ↓
Register / Search Patient
    ↓
Select Doctor
    ↓
Check Availability
    ↓
Book Appointment
    ↓
Confirm Appointment
```

---

## 20.4 Billing Journey

```text
Billing Staff Login
    ↓
Billing Dashboard
    ↓
Select Patient
    ↓
Create Invoice
    ↓
Add Items
    ↓
Calculate Total
    ↓
Issue Invoice
    ↓
Record Payment
    ↓
Update Payment Status
```

---

## 20.5 Admin Journey

```text
Admin Login
    ↓
Admin Dashboard
    ↓
Manage Users / Roles
    ↓
Review System Data
    ↓
Review Audit Logs
    ↓
Perform Authorized Administrative Action
    ↓
Audit Entry Created
```

---

# 21. Navigation Structure by Role

| Module | Patient | Doctor | Receptionist | Billing Staff | Admin |
|---|---:|---:|---:|---:|---:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| Patients | Own/Permitted | ✓ | ✓ | Billing Context | ✓ |
| Doctors | View/Booking | Own Profile | ✓ | Limited | ✓ |
| Appointments | Own | Assigned/Permitted | ✓ | Billing Context | ✓ |
| Medical Records | View Permitted | ✓ | Permitted Context | — | ✓ |
| Prescriptions | View | ✓ | Permitted Context | — | ✓ |
| Invoices | View | — | — | ✓ | ✓ |
| Payments | View | — | — | ✓ | ✓ |
| Availability | — | ✓ | View/Booking Context | — | ✓ |
| Users | — | — | — | — | ✓ |
| Audit Logs | — | — | — | — | ✓ |

`—` means the module is not part of the normal role workflow.

---

# 22. Application Flow Summary

The complete Arogyavajra application can be represented as:

```text
                         AROGYAVAJRA
                              │
                              ▼
                       Authentication
                              │
                              ▼
                        Role Resolution
                              │
       ┌──────────────┬───────┼────────┬──────────────┐
       ▼              ▼       ▼        ▼              ▼
    PATIENT        DOCTOR  RECEPTION  BILLING        ADMIN
       │              │       │        │              │
       ▼              ▼       ▼        ▼              ▼
 Appointment      Patient   Patient   Invoice       Users
 Records          Records   Booking   Payment       System
 Prescription     Rx        Doctors   Billing       Audit
 Billing          Appt      Appt      Patients      Management
       │              │       │        │              │
       └──────────────┴───────┼────────┴──────────────┘
                              ▼
                     Backend Validation
                              │
                              ▼
                     Business Rule Check
                              │
                              ▼
                      Database Operation
                              │
                              ▼
                         Audit Action
                              │
                              ▼
                        Updated State
                              │
                              ▼
                         User Interface
```

---

# 23. MVP Flow Boundary

The APP Flow follows the MVP scope. The following are **not part of the current application flow**:

- AI diagnosis
- Clinical prediction
- AI-generated prescriptions
- Medical image diagnosis
- IoT / medical device integration
- Telemedicine
- Laboratory management
- Radiology management
- Pharmacy management
- Insurance / TPA
- Production ABDM / FHIR integration
- Payment gateway integration
- IPD / bed management
- Emergency / ambulance management
- Advanced business intelligence
- Real-time chat
- Automated messaging

These can be connected later through the extension points defined in the PRD and TRD.

---

# 24. Flow Design Principles

1. **Role-first navigation** — users see workflows relevant to their responsibilities.
2. **Backend authorization** — permissions are enforced server-side.
3. **Validation before state change** — invalid input does not modify persistent data.
4. **Conflict prevention** — appointment booking checks availability and overlapping appointments.
5. **Auditability** — important operations create audit records.
6. **Clear states** — appointments and billing use explicit status transitions.
7. **Consistent feedback** — success, validation, conflict, and authorization errors are clearly surfaced.
8. **Minimal navigation depth** — common tasks should be reachable directly from role dashboards.
9. **Data integrity** — transactional operations are committed atomically.
10. **MVP focus** — flows remain limited to the defined Arogyavajra MVP.

---

# 25. Document Relationship

The Arogyavajra project documentation is structured as:

```text
PRD.md
  │
  │ What the product must accomplish
  ▼
MVP.md
  │
  │ What belongs in the first release
  ▼
TRD.md
  │
  │ How the software should be technically built
  ▼
APP-FLOW.md
  │
  │ How users move through the application
  ▼
Implementation
```

---

## Final Definition

**Arogyavajra APP Flow:**

> Public Landing Page → Explore Arogyavajra → Get Started / Login → Authenticate → Resolve Role → Open Role Dashboard → Select Module → Perform Action → Validate → Apply Business Rules → Persist Data → Audit → Show Updated State.

This flow provides the application-level navigation and workflow baseline for implementing the Arogyavajra MVP.
