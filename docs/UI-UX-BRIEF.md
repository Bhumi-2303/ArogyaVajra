# Arogyavajra — UI/UX Brief Document

**Project:** Arogyavajra  
**Document:** UI/UX Brief  
**Version:** 1.0  
**Date:** 02 October 2026  
**Status:** MVP Design Brief

---

## 1. Purpose

This document defines the UI/UX direction for **Arogyavajra**, a healthcare management platform designed to connect patients, doctors, receptionists, billing staff, and administrators through a structured digital workflow.

The UI/UX should make the platform:

- Clear
- Trustworthy
- Professional
- Easy to navigate
- Consistent across roles
- Responsive
- Accessible
- Suitable for healthcare workflows

The design should support the existing PRD, TRD, MVP, and APP Flow without introducing functionality outside the defined MVP scope.

---

# 2. Product Overview

Arogyavajra is a unified healthcare management platform covering:

- Patient management
- Doctor management
- Appointment management
- Medical records
- Prescriptions
- Billing and payments
- Role-based access
- Auditability

The product has two major UI areas:

```text
                         AROGYAVAJRA
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
       PUBLIC EXPERIENCE                AUTHENTICATED APP
              │                               │
       Landing Page                    Role Dashboard
       About                            Patient
       Features                         Doctor
       How It Works                     Receptionist
       Get Started                      Billing Staff
       Login                            Admin
```

---

# 3. UX Goals

## Primary Goals

### 3.1 Clarity

Users should immediately understand:

- Where they are
- What they can do
- What action is expected
- What happened after an action

### 3.2 Simplicity

Healthcare workflows should avoid unnecessary steps.

Common tasks such as booking an appointment, creating a medical record, writing a prescription, and recording a payment should have clear paths.

### 3.3 Trust

The interface should communicate:

- Reliability
- Privacy awareness
- Structured information
- Controlled access
- Professional healthcare experience

### 3.4 Consistency

Buttons, forms, tables, cards, dialogs, alerts, statuses, and navigation should behave consistently throughout the application.

### 3.5 Role Awareness

The UI should adapt to the user's role.

Users should primarily see modules and actions relevant to their responsibilities.

---

# 4. Target Users

| User | Primary UI Needs |
|---|---|
| Patient | Appointments, records, prescriptions, invoices, profile |
| Doctor | Appointments, patient information, records, prescriptions, availability |
| Receptionist | Patient registration, doctor information, appointment booking |
| Billing Staff | Invoices, billing items, payments, payment status |
| Admin | Users, system management, audit logs, overview |

---

# 5. Design Personality

Arogyavajra should have a:

**Modern + Clinical + Minimal + Trustworthy + Human**

visual personality.

The interface should avoid:

- Excessive decoration
- Overuse of gradients
- Heavy shadows
- Dense visual noise
- Excessive animations
- Aggressive colors
- Unnecessary medical imagery

The visual language should feel appropriate for a professional healthcare organization while still looking like a modern technology product.

---

# 6. Visual Design Direction

## 6.1 Core Color Palette

The Arogyavajra interface should use a consistent blue-and-white healthcare palette.

| Color | Hex | Usage |
|---|---|---|
| Deep Navy | `#021C48` | Primary dark text, navigation, strong headings |
| Primary Blue | `#012C7D` | Primary brand color |
| Royal Blue | `#0B5ED7` | Primary actions and links |
| Bright Blue | `#1677E8` | Interactive states and highlights |
| Soft Blue | `#E5F0FE` | Information backgrounds and selected states |
| Background | `#F6F9FD` | Application background |
| White | `#FFFFFF` | Cards, surfaces, navigation |
| Border | `#DDE6F2` | Borders and separators |
| Muted Text | `#52658A` | Secondary text |
| Success | `#16A765` | Success states |
| Success Light | `#D7F5E3` | Success backgrounds |

The interface should primarily rely on **white + blue**, with semantic colors reserved for system feedback.

---

# 7. Typography

The typography should be clean and highly readable.

Recommended hierarchy:

```text
Display / Hero
        ↓
H1 — Main page heading
        ↓
H2 — Section heading
        ↓
H3 — Component heading
        ↓
Body — Main information
        ↓
Secondary — Supporting information
        ↓
Caption — Metadata / helper text
```

Typography should prioritize:

- Readability
- Clear hierarchy
- Comfortable line height
- Consistent spacing
- Easy scanning of healthcare information

Avoid using many different font styles.

---

# 8. Spacing System

Use a consistent spacing scale throughout the product.

Suggested base:

```text
4px   — micro spacing
8px   — tight spacing
12px  — component spacing
16px  — standard spacing
24px  — section spacing
32px  — large spacing
48px  — major section spacing
64px+ — hero / page spacing
```

Spacing should create clear grouping between:

- Labels and inputs
- Form sections
- Cards
- Tables
- Dashboard widgets
- Page sections

---

# 9. Border Radius & Elevation

Use moderate corner rounding to create a modern healthcare interface.

Suggested radius:

```text
Small       6px
Medium      8px
Large       12px
Cards       12–16px
Buttons     8px
Inputs      8px
```

Shadows should be subtle.

Prefer:

```text
Border + light shadow
```

instead of large floating shadows.

---

# 10. Iconography

Use a consistent outline icon system.

Recommended icon library:

**Lucide React**

Icons should:

- Communicate meaning quickly
- Have consistent stroke width
- Be paired with labels when meaning is ambiguous
- Not replace important text
- Use semantic colors only when appropriate

Examples:

```text
Calendar       → Appointments
Users          → Patients / Users
Stethoscope    → Doctors
FileText       → Medical Records
Pill           → Prescriptions
Receipt        → Billing
CreditCard     → Payments
ShieldCheck    → Security
Activity       → Dashboard / Healthcare activity
```

---

# 11. Landing Page UX

The public landing page is the primary entry point.

It should **describe Arogyavajra before asking the user to log in**.

## Landing Page Structure

```text
Navbar
   ↓
Hero
   ↓
Why Arogyavajra?
   ↓
Core Capabilities
   ↓
How It Works
   ↓
Role-Based Platform
   ↓
Security & Trust
   ↓
Final CTA
   ↓
Footer
```

---

## 11.1 Navbar

Elements:

- Arogyavajra logo
- Features
- How It Works
- About
- Login
- Get Started

Desktop navigation should be clean and minimal.

Mobile navigation should collapse into a menu.

---

## 11.2 Hero Section

### Objective

Immediately communicate:

1. What Arogyavajra is
2. Who it serves
3. What problem it solves

Suggested copy:

> **A Unified Healthcare Management Platform**

Supporting copy:

> Arogyavajra brings patient management, doctor workflows, appointments, medical records, prescriptions, billing, and administration into one structured healthcare platform.

Primary CTA:

**Get Started**

Secondary CTA:

**Explore Platform**

### Hero Visual

Use a clean healthcare-management visual such as:

- Dashboard preview
- Abstract healthcare network
- Patient-doctor workflow
- Minimal medical technology illustration

Avoid implying autonomous medical diagnosis.

---

# 12. Why Arogyavajra Section

Use three or four feature cards.

Example:

### Patient-Centered

Manage appointments, records, prescriptions, and billing information through a structured patient experience.

### Connected Workflows

Connect patients, doctors, reception, billing, and administration within one platform.

### Organized Healthcare Data

Keep healthcare information structured and accessible according to user permissions.

### Controlled Access

Use role-based access and auditability for important system actions.

---

# 13. Core Capabilities Section

Display major features using a consistent card/grid system.

```text
┌──────────────────┐  ┌──────────────────┐
│ Patient          │  │ Doctor           │
│ Management       │  │ Management       │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ Appointments     │  │ Medical Records  │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ Prescriptions    │  │ Billing          │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ Role-Based Access│  │ Audit Logs       │
└──────────────────┘  └──────────────────┘
```

Each card should contain:

- Icon
- Feature name
- Short description
- Optional link/action

---

# 14. How It Works Section

Present the healthcare workflow visually.

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
Auditable Workflow
```

Use a horizontal timeline on desktop and a vertical timeline on mobile.

---

# 15. Role-Based Experience Section

Show how Arogyavajra serves different users.

Suggested layout:

```text
                 One Platform
                      │
      ┌───────────────┼───────────────┐
      │               │               │
   Patient          Doctor        Receptionist
      │               │               │
 Appointments     Consultation      Booking
 Records          Records           Patients
 Prescriptions    Prescription      Doctors
 Billing
```

Additional roles:

- Billing Staff
- Admin

The section should focus on the different workflows rather than exposing technical implementation details.

---

# 16. Security & Trust Section

The UI can communicate the platform's security principles through concise visual cards.

Suggested items:

- Role-Based Access
- Secure Authentication
- Controlled Information Access
- Audit Logging
- Backend Validation
- Structured Data Management

Do not display regulatory certification or compliance claims unless officially established.

---

# 17. Dashboard UX

Every authenticated role should have a dashboard tailored to its responsibilities.

## Common Dashboard Structure

```text
┌─────────────────────────────────────────────────────┐
│ Header                                              │
├───────────────┬─────────────────────────────────────┤
│ Sidebar       │ Page Header                         │
│               │                                     │
│ Dashboard     │ Summary Cards                       │
│ Module 1      │                                     │
│ Module 2      ├─────────────────────────────────────┤
│ Module 3      │ Main Data / Activity                │
│               │                                     │
│ Profile       │                                     │
│ Logout        │                                     │
└───────────────┴─────────────────────────────────────┘
```

---

# 18. Dashboard Components

Use:

### Summary Cards

Examples:

- Today's Appointments
- Upcoming Appointments
- Pending Payments
- Active Patients

### Data Tables

For:

- Patients
- Doctors
- Appointments
- Invoices
- Payments
- Users
- Audit Logs

### Status Badges

Examples:

- Scheduled
- Confirmed
- Completed
- Cancelled
- No-show
- Issued
- Partially Paid
- Paid

### Quick Actions

Examples:

- Book Appointment
- Add Patient
- Create Invoice
- Add Medical Record
- Create Prescription

---

# 19. Navigation UX

Use a persistent sidebar for authenticated desktop users.

### Patient

```text
Dashboard
Appointments
Medical Records
Prescriptions
Invoices
Profile
Logout
```

### Doctor

```text
Dashboard
Appointments
Patients
Medical Records
Prescriptions
Availability
Profile
Logout
```

### Receptionist

```text
Dashboard
Patients
Doctors
Appointments
Profile
Logout
```

### Billing Staff

```text
Dashboard
Invoices
Payments
Patients
Profile
Logout
```

### Admin

```text
Dashboard
Users
Patients
Doctors
Appointments
Medical Records
Prescriptions
Billing
Audit Logs
Profile
Logout
```

---

# 20. Appointment UX

Appointment booking should be one of the clearest workflows.

```text
Select Patient
      ↓
Select Doctor
      ↓
Select Date
      ↓
Available Slots
      ↓
Select Time
      ↓
Review Details
      ↓
Confirm Appointment
```

## Important UI elements

- Doctor name
- Doctor code / relevant identifier
- Date picker
- Available time slots
- Appointment duration
- Patient information
- Appointment status

When a conflict occurs:

> **This time slot is no longer available. Please select another time.**

The UI should preserve entered information where possible so the user does not need to restart the entire form.

---

# 21. Forms UX

Forms should follow:

```text
Section Heading
      ↓
Field Label
      ↓
Input
      ↓
Helper Text / Validation
      ↓
Next Field
```

Rules:

- Labels should always be visible.
- Required fields should be clearly identified.
- Validation should appear near the relevant field.
- Do not rely only on color for validation.
- Preserve entered values after validation errors.
- Use appropriate input controls.
- Disable submission only when necessary.
- Show loading state after submission.

---

# 22. Medical Record UX

Medical information should be presented in a structured format.

Suggested layout:

```text
Patient Header
   ├── Patient Name
   ├── Patient Code
   └── Basic Information

Visit Information
   ├── Appointment
   ├── Date
   └── Doctor

Clinical Information
   ├── Notes
   ├── Findings
   └── Relevant Information

Related Prescription
   └── Prescription Details
```

Use clear sections rather than one large block of text.

---

# 23. Prescription UX

Prescription creation should use a structured item interface.

```text
Prescription
     ↓
Medicine Items
     ↓
┌──────────────────────────────────────────┐
│ Medicine                                  │
│ Dosage                                    │
│ Frequency                                  │
│ Duration                                   │
│ Instructions                              │
└──────────────────────────────────────────┘
     ↓
Add Another Medicine
     ↓
Review
     ↓
Save Prescription
```

Use confirmation before destructive actions such as cancellation.

---

# 24. Billing UX

Billing should emphasize clarity and numerical accuracy.

## Invoice Layout

```text
Invoice Header
      ↓
Patient Information
      ↓
Invoice Items
      ↓
Subtotal
      ↓
Discount
      ↓
Tax
      ↓
Total
      ↓
Payment Status
      ↓
Payment History
```

Amounts should be visually aligned and easy to scan.

The backend remains authoritative for calculations.

---

# 25. Tables

Tables should support:

- Search
- Filtering
- Pagination
- Sorting where required
- Row actions
- Status indicators

Example:

```text
Patient | Doctor | Date | Time | Status | Action
--------------------------------------------------
A       | Dr. X  | ...  | ...  | Confirmed | View
B       | Dr. Y  | ...  | ...  | Scheduled | View
```

On mobile, wide tables should become:

- Responsive cards
- Horizontally scrollable tables
- Or prioritized information layouts

depending on the data.

---

# 26. Feedback States

Every important user action should provide visible feedback.

## Success

Example:

> Appointment booked successfully.

## Validation

Example:

> Please enter a valid appointment time.

## Conflict

Example:

> The selected appointment slot is already booked.

## Authorization

Example:

> You do not have permission to perform this action.

## Not Found

Example:

> The requested record could not be found.

## Server Error

Example:

> Something went wrong. Please try again.

Messages should be concise and actionable.

---

# 27. Loading & Skeleton States

Skeleton loading is a **required part of the Arogyavajra UI system**, not an optional enhancement.

The application should avoid blank screens while asynchronous content is being fetched.

## 27.1 Skeleton Principles

Skeletons should:

- Match the approximate shape of the content being loaded
- Preserve page layout while data loads
- Avoid unnecessary movement
- Use subtle neutral tones
- Disappear when real content becomes available
- Be reusable as components

Avoid showing a generic spinner for entire pages when the structure of the content can be represented with skeletons.

## 27.2 Required Skeleton Components

The component system should provide reusable skeletons for:

- Dashboard cards
- Tables
- Table rows
- Patient profile
- Doctor profile
- Appointment cards
- Appointment lists
- Medical records
- Prescription items
- Invoice summaries
- Payment history
- User lists
- Audit logs
- Page headers where appropriate

Example dashboard skeleton:

```text
┌──────────────────┐ ┌──────────────────┐
│ █████████        │ │ █████████        │
│ █████████████    │ │ █████████████    │
│                  │ │                  │
│ ██████           │ │ ██████           │
└──────────────────┘ └──────────────────┘

┌─────────────────────────────────────────┐
│ █████████████████████████              │
│ ██████████████████████████████         │
│ ████████████████████                   │
│ ███████████████████████████            │
└─────────────────────────────────────────┘
```

Example table skeleton:

```text
Patient          Doctor          Date          Status
─────────────────────────────────────────────────────
████████         ███████         ███████       ███████
██████████       ████████        ███████       ███████
████████         █████████       ███████       ███████
██████████       ███████         ███████       ███████
```

## 27.3 Button Loading States

Buttons should communicate processing:

```text
Save
 ↓
Saving...
```

The button should normally prevent duplicate submission while the request is in progress.

## 27.4 Loading Strategy by Screen

| Screen | Preferred Loading Pattern |
|---|---|
| Dashboard | Card + section skeletons |
| Patient List | Table skeleton |
| Patient Details | Profile + content skeleton |
| Appointments | Table/card skeleton |
| Medical Records | Record-card skeleton |
| Prescriptions | Prescription-item skeleton |
| Billing | Invoice + table skeleton |
| Users | Table skeleton |
| Audit Logs | Table skeleton |

---

# 28. Empty States

Empty screens should explain what happened and what the user can do next.

Example:

```text
No upcoming appointments

You do not have any upcoming appointments.

[ Book Appointment ]
```

Avoid showing empty tables without explanation.

---

# 29. Error States

Errors should be:

- Clear
- Specific
- Non-technical
- Actionable

Avoid exposing:

- Database errors
- Stack traces
- Internal service details
- Sensitive information

---

# 30. Confirmation Dialogs

Use confirmation dialogs for destructive or important actions.

Examples:

- Cancel appointment
- Cancel prescription
- Cancel invoice
- Deactivate user

Example:

```text
Cancel Appointment?

This will cancel the selected appointment.

[Keep Appointment]   [Cancel Appointment]
```

The destructive action should be visually distinguishable but not overly aggressive.

---

# 31. Responsive Design

The interface must work across:

- Desktop
- Laptop
- Tablet
- Mobile

### Desktop

Use:

- Sidebar
- Multi-column layouts
- Data tables
- Dashboard cards

### Tablet

Use:

- Collapsible sidebar
- Reduced grid columns
- Responsive tables

### Mobile

Use:

- Bottom navigation or collapsible navigation where appropriate
- Single-column layouts
- Full-width forms
- Stacked cards
- Responsive dialogs
- Simplified tables

---

# 32. Accessibility

The UI should target practical accessibility standards.

Requirements:

- Keyboard navigable controls
- Visible focus states
- Sufficient color contrast
- Semantic HTML
- Accessible form labels
- Meaningful error messages
- Do not rely only on color
- Alt text for meaningful images
- Logical heading hierarchy
- Accessible dialogs and menus

---

# 33. Motion & Animation

Animations should be subtle and functional.

Recommended:

- Page transitions
- Hover states
- Button feedback
- Modal transitions
- Skeleton loading
- Expand/collapse transitions

Avoid:

- Continuous decorative animation
- Distracting motion
- Excessive parallax
- Long transitions

Suggested transition duration:

```text
Fast:     120–160ms
Normal:   180–240ms
Complex:  250–350ms
```

---

# 34. Component Design System

The frontend should maintain reusable components.

### Core Components

- Button
- Input
- Select
- Date Picker
- Time Slot
- Checkbox
- Radio
- Textarea
- Badge
- Avatar
- Card
- Modal
- Drawer
- Tooltip
- Alert
- Toast
- Tabs
- Table
- Pagination
- Breadcrumb
- Dropdown
- Skeleton

### Healthcare Components

- Appointment Card
- Doctor Card
- Patient Summary
- Medical Record Card
- Prescription Item
- Invoice Summary
- Payment Status
- Activity Timeline

---

# 35. Page Hierarchy

## Public

```text
/
├── Landing
├── Features
├── How It Works
├── About
└── Login / Get Started
```

## Authenticated

```text
/dashboard

/patients
/patients/[id]

/doctors
/doctors/[id]

/appointments
/appointments/[id]

/medical-records
/medical-records/[id]

/prescriptions
/prescriptions/[id]

/billing
/invoices/[id]

/payments

/users

/audit-logs

/profile
```

Exact routes may be adjusted during implementation while preserving the same user flow.

---

# 36. UX Flow Principles

The interface should follow these principles:

1. **Show before asking** — explain Arogyavajra before authentication.
2. **Role-first experience** — dashboards reflect user responsibilities.
3. **One primary action** — each screen should have a clear main CTA.
4. **Progressive disclosure** — show essential information first.
5. **Consistent interaction** — similar tasks should behave similarly.
6. **Immediate feedback** — users should know whether actions succeeded.
7. **Prevent errors** — validate before destructive or conflicting operations.
8. **Preserve user input** — avoid unnecessary form resets.
9. **Make states visible** — appointment and billing states should be obvious.
10. **Protect sensitive information** — display only information allowed by the user's role.

---

# 37. Landing-to-Application UX Flow

The complete experience should be:

```text
                     VISITOR
                        │
                        ▼
               Arogyavajra Landing
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       Features      How It Works    About
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                   Get Started
                        │
                        ▼
                 Authentication
                        │
                        ▼
                  Role Detection
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
     Dashboard       Dashboard        Dashboard
     Patient           Doctor           Staff/Admin
        │               │                │
        ▼               ▼                ▼
     Modules          Modules          Modules
        │               │                │
        └───────────────┼────────────────┘
                        ▼
                 Action Completed
                        │
                        ▼
                  Feedback / State
                        │
                        ▼
                    Audit Log
```

---

# 38. MVP UI/UX Scope

### Included

- Public landing page
- Login / authentication
- Role-based dashboards
- Patient management
- Doctor management
- Appointment management
- Medical records
- Prescriptions
- Billing
- Payments
- User management
- Audit logs
- Responsive design
- Accessibility basics
- Loading / empty / error / success states

### Not Included in MVP

- AI diagnosis
- Clinical prediction
- AI-generated prescriptions
- Medical image diagnosis
- IoT / medical-device integration
- Telemedicine
- Laboratory management
- Radiology management
- Pharmacy management
- Insurance / TPA
- Production ABDM / FHIR integration
- Payment gateway integration
- IPD / bed management
- Emergency / ambulance management
- Advanced BI
- Real-time chat
- Automated messaging

---

# 39. Design Deliverables

The UI/UX implementation should produce:

1. Brand / visual direction
2. Landing page
3. Authentication screens
4. Role-based dashboard designs
5. Navigation system
6. Appointment booking screens
7. Patient management screens
8. Doctor workflow screens
9. Medical record screens
10. Prescription screens
11. Billing and payment screens
12. User management screens
13. Audit log screens
14. Responsive layouts
15. Component library
16. Loading, empty, success, error, and confirmation states

---

# 40. UI/UX Acceptance Criteria

The design is ready for implementation when:

- The landing page clearly explains Arogyavajra without relying on a traditional hero section.
- A visitor can understand the major capabilities without logging in.
- The primary CTA leads naturally to authentication.
- Each role has a clear dashboard and navigation structure.
- Core workflows have identifiable start and end points.
- Appointment conflicts have clear user feedback.
- Forms have validation and useful error states.
- Medical information is presented in structured sections.
- Billing information is visually clear.
- Destructive actions require appropriate confirmation.
- Responsive layouts are defined.
- Accessibility considerations are included.
- The color palette and component behavior are consistent.
- The design does not introduce functionality outside the MVP.

---

# 41. Key UI/UX Design Decisions

### Landing Page

- No traditional hero section.
- Start with a compact product introduction.
- Explain the platform through capabilities, workflows, roles, and trust principles.
- Keep the visual language minimal and healthcare-focused.

### Application

- Use role-specific dashboards.
- Use consistent navigation and reusable components.
- Keep primary actions obvious.
- Use structured forms and tables.

### Loading

- Skeleton loading is mandatory across data-heavy application screens.
- Skeletons should preserve layout and reduce perceived waiting time.
- Use button loading states for submitted actions.
- Use empty states only after data loading has completed and no records exist.

### Overall Direction

**Minimal public introduction + structured healthcare application + strong loading states + consistent role-based UX.**

---

# 41. Final UX Definition

The Arogyavajra experience should follow:

> **Introduce → Explain → Build Trust → Guide → Authenticate → Personalize by Role → Load Clearly → Complete Task → Confirm Result**

The central design idea is:

> **Arogyavajra should feel like one connected healthcare platform, while each user sees a simple interface tailored to their responsibilities.**

---

# 42. Relationship With Project Documents

```text
PRD.md
  │
  │ Product requirements
  ▼
MVP.md
  │
  │ MVP scope
  ▼
TRD.md
  │
  │ Technical architecture
  ▼
APP-FLOW.md
  │
  │ Application navigation & workflows
  ▼
UI-UX-BRIEF.md
  │
  │ Visual language & user experience
  ▼
Design / Frontend Implementation
```

The UI/UX brief should remain synchronized with changes to the PRD, MVP, TRD, and APP Flow.
