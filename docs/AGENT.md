# AGENT.md

## Arogyavajra Agent Rules and Working Instructions

This document is the mandatory working contract for any coding or design agent working on **Arogyavajra**, the healthcare management platform.

The agent must follow the existing project documentation before introducing or changing architecture, UI, APIs, database structures, or workflows.

---

## 1. Source of Truth

Before making implementation changes, inspect and follow these project documents in this order:

1. `PRD.md` - product requirements and scope
2. `MVP.md` - MVP boundaries
3. `TRD.md` - technical architecture and backend rules
4. `APP-FLOW.md` - application and navigation flows
5. `UI-UX-BRIEF.md` - visual and UX rules
6. `DATABASE-SCHEMA.md` - database and persistence rules
7. `FRONTEND-BACKEND-CONTRACT.md` - API, schema, and communication contract
8. `AGENT.md` - agent-specific implementation rules

If an existing project implementation conflicts with these documents:

- Do not silently invent a third approach.
- Identify the conflict.
- Preserve the documented architecture unless the project owner explicitly changes it.
- Keep frontend, backend, database, and API contracts synchronized.

---

# 2. Core Product Principles

Arogyavajra must feel:

- Modern
- Clinical
- Minimal
- Professional
- Trustworthy
- Human
- Calm
- Consistent

The interface must look like a real healthcare product, not an AI demo, template, hackathon landing page, or generic SaaS dashboard.

Prioritize:

- clarity
- accessibility
- predictable interaction
- strong information hierarchy
- readable typography
- restrained motion
- meaningful feedback
- trustworthy visual language

Avoid unnecessary visual decoration.

---

# 3. Architecture Rules

The required architecture is:

```text
Next.js + TypeScript
        |
        v
FastAPI + Python
        |
        v
Service / Repository Layer
        |
        v
SQLAlchemy
        |
        v
PostgreSQL
```

### Frontend

Use:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Lucide React

### Backend

Use:

- Python 3.12+
- FastAPI
- Pydantic
- SQLAlchemy 2.x
- Alembic
- JWT-based authentication
- Secure password hashing

### Database

Use:

- PostgreSQL 16+

Do not introduce a second competing architecture.

---

# 4. Frontend Rules

## DO

- Use reusable components.
- Keep API communication centralized.
- Use TanStack Query for server state.
- Use React Hook Form for complex forms.
- Use Zod for client-side validation.
- Keep frontend types synchronized with backend schemas.
- Implement responsive layouts.
- Provide loading, empty, success, and error states.
- Use skeleton loading for data-heavy screens.
- Keep interactions predictable.
- Use accessible labels and keyboard-friendly controls.
- Use semantic HTML where appropriate.
- Preserve consistent spacing, typography, colors, borders, and radii.

## DON'T

- Do not put business logic in React components.
- Do not directly query PostgreSQL from the frontend.
- Do not bypass the FastAPI API.
- Do not duplicate backend business rules in multiple frontend components.
- Do not trust frontend authorization.
- Do not hardcode API URLs.
- Do not create arbitrary response formats.
- Do not use random UI libraries without a project-level reason.
- Do not create one-off styling patterns when an existing component can be reused.

---

# 5. Backend Rules

The backend is authoritative for:

- authentication
- authorization
- validation
- business rules
- appointment conflicts
- doctor availability
- billing calculations
- payment status
- database integrity
- transactions
- audit logging

## DO

- Validate every request server-side.
- Enforce RBAC server-side.
- Validate resource ownership and relationships.
- Use service-layer business logic.
- Use repositories for database access.
- Use Pydantic schemas for request/response validation.
- Use transactions for important multi-step operations.
- Use stable error codes.
- Audit important mutations.
- Return safe error messages.

## DON'T

- Do not trust `user_id`, role, permissions, totals, payment status, or ownership values supplied by the frontend.
- Do not put database queries directly in route handlers.
- Do not calculate authoritative billing totals only on the frontend.
- Do not expose stack traces or internal implementation details to users.
- Do not log passwords, tokens, credentials, or unnecessary medical information.
- Do not silently change an API contract.

---

# 6. Authentication and Authorization

Required roles:

```text
PATIENT
DOCTOR
RECEPTIONIST
BILLING_STAFF
ADMIN
```

Authentication must be centralized.

Authorization must follow:

```text
Authenticate
    ↓
Resolve Role
    ↓
Check Permission
    ↓
Check Resource Relationship / Ownership
    ↓
Execute Service
```

Frontend role checks are for UX only.

The backend remains the final authority.

Never create authorization logic that exists only in the frontend.

---

# 7. API Rules

API base:

```text
/api/v1
```

Standard success response:

```json
{
  "data": {},
  "message": "Success"
}
```

Paginated response:

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

Error response:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

Do not create inconsistent response structures.

Use the existing frontend-backend contract.

---

# 8. Database Rules

PostgreSQL is the persistence source of truth.

Use:

- UUID primary keys
- `TIMESTAMPTZ` for timezone-aware timestamps
- `NUMERIC` for money
- foreign keys
- appropriate unique constraints
- indexes for common filtering/search
- Alembic migrations

Do not use floating-point values for authoritative financial calculations.

Do not bypass the repository/service architecture for database operations.

---

# 9. Healthcare Data Rules

Healthcare information must be treated as sensitive.

Never expose more patient information than required for the current role and workflow.

Avoid placing sensitive information in:

- browser console logs
- server logs
- error messages
- analytics payloads
- URLs
- unnecessary API responses

Do not invent medical information.

Do not add AI diagnosis, clinical prediction, AI prescriptions, or medical-image diagnosis to the MVP.

Arogyavajra is a healthcare management platform, not an autonomous clinical decision-maker.

---

# 10. UI Visual Rules

These rules are mandatory.

## NEVER USE

### Purple gradients

Do not use purple gradients anywhere in the application.

Avoid:

- purple-to-blue gradients
- purple-to-pink gradients
- purple glowing backgrounds
- purple gradient buttons
- purple gradient cards
- purple gradient text

Use the approved blue/white healthcare palette instead.

### Pill-shaped buttons

Do not use excessive pill-shaped UI.

Buttons should generally use the project's normal rounded rectangular shape.

Avoid:

```text
████████████
 pill buttons
████████████
```

Use clear rectangular controls with consistent radius.

### Fake metrics

Never invent:

- patient counts
- success percentages
- appointment statistics
- healthcare outcomes
- satisfaction scores
- performance numbers
- growth percentages
- accuracy values
- user counts
- financial numbers

If real data is unavailable:

- show an empty state
- show a neutral placeholder
- show loading skeleton
- explain that data is unavailable

Never make a fake number look real.

### Vague hero text

Do not use generic AI/SaaS marketing phrases such as:

- "The future of healthcare is here"
- "Revolutionizing healthcare with AI"
- "Transform your healthcare journey"
- "Empowering tomorrow's healthcare"
- "Intelligent healthcare reimagined"

Use clear product language describing what Arogyavajra actually does.

### Emoji icons

Do not use emoji as UI icons.

Use Lucide React or another approved icon system.

Examples:

Do not use:

```text
📅 Appointment
👨‍⚕️ Doctor
💊 Prescription
💳 Billing
```

Use proper interface icons instead.

### Excessive scroll animation

Do not add animation to every section.

Avoid:

- constant fade-ins
- scroll-triggered text movement
- parallax everywhere
- elements flying into the viewport
- repeated reveal animations
- animated counters for fake metrics

Motion should be subtle and functional.

Prefer:

- small hover transitions
- button state transitions
- modal transitions
- skeleton loading
- meaningful state changes

---

# 11. AI-Style Design Restrictions

Arogyavajra must NOT look like an AI-generated website template.

## NEVER USE AI-STYLE PHOTOS

Do not use:

- AI-generated doctor photographs
- unrealistic doctor/patient portraits
- synthetic hospital scenes
- glossy AI healthcare imagery
- fake medical professionals
- surreal healthcare visuals
- generic AI stock-style imagery

Prefer:

- clean UI
- icons
- structured cards
- real product screenshots when available
- diagrams where useful
- typography and spacing
- authentic product-focused visuals

If photography is not necessary, do not add photography.

---

# 12. AI-Style Copy Restrictions

Do not generate vague, exaggerated, or artificial marketing copy.

Avoid language that sounds like generic AI-generated startup copy.

Copy should be:

- specific
- concise
- factual
- understandable
- product-focused
- healthcare appropriate

Example:

Bad:

> "Experience a revolutionary intelligent ecosystem transforming the future of patient care."

Better:

> "Manage patients, appointments, medical records, prescriptions, and billing from one platform."

Do not claim capabilities that are not implemented.

---

# 13. Cursor Animation Restrictions

Never add fake cursor animations.

Do not create:

- animated mouse pointers
- fake user cursor recordings
- cursor trails
- cursor-following effects
- fake clicking demonstrations
- animated cursor walkthroughs

The application should communicate through real UI interactions.

---

# 14. Landing Page Rules

The public landing page is required.

The flow is:

```text
Public Landing Page
        ↓
Explore Arogyavajra
        ↓
Get Started / Login
        ↓
Authentication
        ↓
Role Resolution
        ↓
Role Dashboard
```

Do not create a traditional oversized hero section.

Use a compact:

## Product Introduction Section

Include:

- Arogyavajra
- Healthcare Management Platform
- concise factual description
- Get Started
- Explore Platform

The landing page may include:

- Navbar
- Product Introduction
- Why Arogyavajra
- Core Capabilities
- How It Works
- Role-Based Platform
- Security & Trust
- Get Started
- Footer

Avoid:

- giant marketing banners
- vague slogans
- fake statistics
- excessive gradients
- unnecessary illustrations
- AI-style imagery
- excessive animation

---

# 15. Loading and Skeleton Rules

Skeleton loading is mandatory for data-heavy screens.

Use skeletons for:

- dashboard cards
- tables
- patient profiles
- doctor profiles
- appointment lists
- medical records
- prescriptions
- invoices
- payment history
- user lists
- audit logs

Correct state model:

```text
Loading
  ↓
Skeleton

Loaded + zero records
  ↓
Empty State

Loaded + records
  ↓
Content

Request failed
  ↓
Error State
```

Never show:

```text
Loading
  ↓
"0 records"
```

when the request has not completed.

---

# 16. Button and Interaction Rules

Buttons must communicate their action clearly.

Use:

- Save
- Create Appointment
- Confirm Appointment
- Cancel Appointment
- Record Payment
- Update Profile
- Add Patient

Avoid vague actions such as:

- "Continue"
- "Do It"
- "Let's Go"
- "Magic"
- "Improve"

unless the actual context makes the action unambiguous.

Do not use excessive animation.

During submission:

```text
Save
↓
Saving...
```

Disable duplicate submissions where appropriate.

---

# 17. Favicon and Branding

The application must use a **custom Arogyavajra favicon**.

Do not leave the default framework favicon.

Do not use:

- Next.js favicon
- generic browser icon
- placeholder favicon
- random template favicon

The favicon should represent Arogyavajra branding and be consistent with the approved visual identity.

The production deployment must also use the project's configured **custom domain**.

Do not leave production branding pointing to an accidental framework/demo domain when the custom domain is available.

---

# 18. Remove "Made with AI"

The application must not display:

```text
Made with AI
```

or similar AI-generated/template attribution labels in the product UI.

Remove:

- "Made with AI"
- "Built with AI"
- "Generated by AI"
- AI template badges
- template watermarks
- unnecessary builder branding

Do not replace it with another fake attribution.

The footer should contain actual product/legal information.

---

# 19. Legal Pages

The application must contain dedicated:

```text
/privacy
/terms
```

pages.

Recommended navigation:

```text
Footer
├── Privacy Policy
└── Terms & Conditions
```

## Privacy Policy

Create a clear Privacy Policy page covering, as applicable:

- information collected
- account information
- healthcare-related information handled by the platform
- purpose of data processing
- access and use
- data security
- data retention
- sharing/disclosure
- user rights
- contact information
- policy updates

Do not make unsupported legal or regulatory claims.

## Terms & Conditions

Create a Terms & Conditions page covering, as applicable:

- acceptable use
- account responsibilities
- platform scope
- user responsibilities
- healthcare-management disclaimer where appropriate
- intellectual property
- availability
- limitation of liability
- termination
- changes to terms
- contact information

Legal text must be reviewed by the project owner/legal professional before production use.

Do not claim legal compliance merely because these pages exist.

---

# 20. Footer Rules

The footer should be professional and minimal.

Include appropriate links such as:

- Product
- Features
- About
- Privacy Policy
- Terms & Conditions
- Contact

Do not include:

- fake social links
- fake certifications
- fake regulatory badges
- fake trust scores
- fake partner logos
- "Made with AI"
- template credits

---

# 21. No Fake Trust Signals

Never fabricate:

- hospital partnerships
- doctor counts
- patient counts
- certifications
- awards
- compliance badges
- security certifications
- customer logos
- testimonials
- reviews
- ratings
- healthcare outcomes

If a claim cannot be verified from the project requirements or actual implementation, do not present it as fact.

---

# 22. Scope Protection

Do not introduce MVP-excluded features unless explicitly requested.

Current excluded areas include:

- AI diagnosis
- clinical prediction
- AI prescriptions
- medical image diagnosis
- IoT/medical device integration
- telemedicine
- laboratory management
- radiology
- pharmacy
- insurance/TPA
- production ABDM/FHIR integration
- payment gateway
- IPD/bed management
- emergency/ambulance
- advanced BI
- real-time chat
- automated messaging

Do not expand scope simply because a UI template suggests these features.

---

# 23. Appointment Rules

The backend must validate:

1. authenticated user
2. patient
3. doctor
4. active doctor
5. date/time
6. doctor availability
7. overlapping appointment
8. permission

Overlap rule:

```text
existing_start < requested_end
AND
existing_end > requested_start
```

If a conflict exists, return:

```text
409 APPOINTMENT_CONFLICT
```

Never rely on frontend checks alone.

---

# 24. Billing Rules

Backend is authoritative.

```text
item.amount = quantity × unit_price

subtotal = sum(item.amount)

total = subtotal - discount + tax
```

Use exact decimal arithmetic.

Payment state is calculated from successful payments.

Do not allow frontend-provided totals or payment statuses to override backend calculations.

---

# 25. Audit Rules

Important mutations should create audit records.

Examples:

- login/security events where appropriate
- patient creation/update
- doctor changes
- appointment creation/update/cancellation
- medical record changes
- prescription changes
- invoice creation/update
- payment recording
- user role/status changes

Audit logs must not contain unnecessary sensitive information.

---

# 26. Error Handling

Every important screen should support:

- loading
- empty
- success
- error

Errors must be:

- understandable
- actionable where possible
- safe
- consistent

Do not expose:

- stack traces
- SQL errors
- internal paths
- credentials
- tokens
- infrastructure details

---

# 27. Responsive Design

The application must work across:

- desktop
- laptop
- tablet
- mobile

Do not build desktop-only layouts.

Tables should have an intentional responsive strategy.

Do not allow healthcare data to become unreadable on smaller screens.

---

# 28. Accessibility

Use:

- semantic HTML
- accessible labels
- keyboard navigation
- visible focus states
- adequate contrast
- meaningful button text
- accessible form errors
- appropriate ARIA only when needed

Do not use color as the only way to communicate state.

---

# 29. Performance

Avoid unnecessary:

- client-side rendering
- large dependencies
- repeated API requests
- expensive animations
- unnecessary re-renders
- duplicate data fetching

Use caching and query invalidation appropriately.

Do not sacrifice healthcare usability for visual effects.

---

# 30. Testing Requirements

Every meaningful feature should include appropriate tests.

Backend:

- unit tests
- service tests
- API/integration tests
- authorization tests
- validation tests

Frontend:

- component tests where appropriate
- form validation tests
- loading/error/empty-state tests

E2E:

- authentication
- patient workflow
- doctor workflow
- receptionist workflow
- billing workflow
- admin workflow

Do not consider a feature complete merely because the page renders.

---

# 31. Development Workflow

Before coding:

1. Inspect the relevant project documentation.
2. Inspect the existing implementation.
3. Identify reusable components/services.
4. Confirm the API/database contract.
5. Plan the smallest required change.

While coding:

1. Follow existing architecture.
2. Reuse components.
3. Keep frontend/backend contracts synchronized.
4. Add validation.
5. Add loading/error/empty states.
6. Add tests.
7. Avoid unrelated refactoring.

After coding:

1. Run formatting/linting.
2. Run type checking.
3. Run relevant tests.
4. Verify API behavior.
5. Verify responsive UI.
6. Verify authorization.
7. Verify loading states.
8. Verify legal/footer/branding requirements when UI is changed.
9. Check that no forbidden design patterns were introduced.

---

# 32. Git and Change Discipline

Keep changes focused.

Do not:

- rewrite unrelated files
- remove working functionality without reason
- rename APIs casually
- change database fields without migration
- change response formats without updating consumers
- introduce dependencies without justification
- overwrite project decisions silently

When a contract changes, update all affected layers:

```text
Database
↓
Backend Model
↓
Pydantic Schema
↓
Service
↓
Route
↓
API Contract
↓
Frontend Type
↓
API Function
↓
Query/Mutation Hook
↓
UI
↓
Tests
```

---

# 33. Forbidden Design Checklist

Before completing UI work, verify that the implementation contains NONE of the following:

- [ ] Purple gradients
- [ ] Purple glowing backgrounds
- [ ] Pill-shaped buttons
- [ ] Fake metrics
- [ ] Fake statistics
- [ ] Fake testimonials
- [ ] Fake certifications
- [ ] Fake healthcare claims
- [ ] Vague hero slogans
- [ ] Emoji UI icons
- [ ] AI-style healthcare photos
- [ ] AI-style marketing copy
- [ ] Fake cursor animation
- [ ] Cursor trails
- [ ] Excessive scroll animation
- [ ] Excessive parallax
- [ ] "Made with AI"
- [ ] AI/template watermark
- [ ] Default framework favicon
- [ ] Missing custom Arogyavajra favicon
- [ ] Missing Privacy Policy
- [ ] Missing Terms & Conditions
- [ ] Fake partner logos
- [ ] Fake reviews
- [ ] Fake user counts
- [ ] Fake performance numbers
- [ ] Unsupported compliance claims

---

# 34. Final Agent Checklist

Before declaring work complete:

## Product

- [ ] Feature belongs to the documented product scope.
- [ ] Existing user flow is preserved.
- [ ] No unsupported claims were added.

## Frontend

- [ ] Existing components were reused where possible.
- [ ] TypeScript types are correct.
- [ ] Forms use the established validation approach.
- [ ] Loading state uses skeleton where appropriate.
- [ ] Empty state is distinct from loading.
- [ ] Error state exists.
- [ ] Responsive layout works.
- [ ] Accessibility considered.

## Backend

- [ ] Authentication enforced.
- [ ] Authorization enforced.
- [ ] Server validation implemented.
- [ ] Business rules remain in services.
- [ ] Database access remains in repositories.
- [ ] Transactions used where required.
- [ ] Audit logging added where required.

## API

- [ ] Existing API contract followed.
- [ ] Response structure is consistent.
- [ ] Error codes are stable.
- [ ] Frontend types match backend schemas.

## Database

- [ ] Schema remains consistent.
- [ ] Migration added for schema changes.
- [ ] Foreign keys and constraints preserved.
- [ ] Money uses exact decimal types.

## Design

- [ ] No purple gradients.
- [ ] No pill-shaped buttons.
- [ ] No fake metrics.
- [ ] No vague hero text.
- [ ] No emoji icons.
- [ ] No AI-style photos.
- [ ] No AI-style copy.
- [ ] No cursor animation.
- [ ] No excessive scroll animation.
- [ ] Custom favicon is configured.
- [ ] "Made with AI" is removed.
- [ ] Privacy Policy exists.
- [ ] Terms & Conditions exists.
- [ ] Footer is clean and factual.

## Quality

- [ ] Tests pass.
- [ ] Lint/type checks pass.
- [ ] No sensitive data is exposed.
- [ ] No unrelated functionality was broken.
- [ ] No unnecessary dependencies were added.
- [ ] No architecture was invented outside the project documents.

---

# 35. Golden Rule

When uncertain:

**Do not invent. Inspect first.**

The agent must prefer:

```text
Existing project documentation
        ↓
Existing implementation
        ↓
Existing component/pattern
        ↓
Smallest consistent change
```

over:

```text
New idea
↓
New architecture
↓
New design system
↓
Unnecessary complexity
```

Arogyavajra should feel like one coherent healthcare product from the landing page to the database.

Every implementation decision should improve consistency, clarity, reliability, security, and maintainability.
