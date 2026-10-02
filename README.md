# Arogyavajra (आरोग्यवज्र)

> **The Indomitable Shield for Healthcare Management**  
> A centralized, secure, role-based healthcare management platform connecting patients, healthcare professionals, administrative staff, and billing operations through a unified, high-integrity system.

---

[![Status](https://img.shields.io/badge/status-MVP%20Baseline%20v1.0-blue.svg)](#mvp-scope-and-boundaries)
[![Architecture](https://img.shields.io/badge/architecture-Modular%20Monolith-teal.svg)](#system-architecture)
[![Backend](https://img.shields.io/badge/backend-FastAPI%20%7C%20Python%203.12%2B-green.svg)](#technology-stack)
[![Frontend](https://img.shields.io/badge/frontend-Next.js%2014%20%7C%20TypeScript-black.svg)](#technology-stack)
[![Database](https://img.shields.io/badge/database-PostgreSQL%2016%2B-blue.svg)](#technology-stack)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Principles](#core-principles)
3. [MVP Scope and Boundaries](#mvp-scope-and-boundaries)
4. [User Roles and Capabilities](#user-roles-and-capabilities)
5. [End-to-End Operational Workflow](#end-to-end-operational-workflow)
6. [System Architecture](#system-architecture)
7. [Repository Structure](#repository-structure)
8. [Technology Stack](#technology-stack)
9. [API Design and Communication Contract](#api-design-and-communication-contract)
10. [Getting Started and Local Development](#getting-started-and-local-development)
11. [Testing and Quality Assurance](#testing-and-quality-assurance)
12. [Documentation Hub](#documentation-hub)
13. [Security, Privacy, and Auditability](#security-privacy-and-auditability)
14. [License](#license)

---

## 🏥 Executive Summary

Healthcare operations become fragmented, error-prone, and inefficient when patient data, doctor schedules, appointments, clinical records, prescriptions, and billing are maintained across siloed systems or physical paperwork.

**Arogyavajra** is built to solve this problem by establishing a unified, dependable, and clinically organized platform. It serves small to mid-sized hospitals, clinics, and outpatient departments with strict separation between presentation, business logic, and relational persistence.

---

## 🎯 Core Principles

1. **Patient-Centered**: Protects patient data privacy while empowering patients with visibility into their appointments, health records, prescriptions, and billing.
2. **Role-Aware (Strict RBAC)**: Grants explicit, least-privilege permissions across 5 distinct operational roles. Frontend checks exist solely for user experience; the backend is the sole authority.
3. **Clinical Calm & Utility**: Designed with a calm, high-legibility clinical aesthetic. No generic SaaS distractions, unnecessary animations, or cluttered dashboards.
4. **Secure by Design**: Cryptographically verified sessions (JWT), secure password hashing (Argon2/Bcrypt), protected endpoints, and server-side validation.
5. **Auditable Integrity**: Sensitive mutations (prescriptions, consultations, invoices, payment status, role assignments) are recorded in an immutable audit log.
6. **Modular Monolith**: Eliminates the premature complexity of microservices for MVP while maintaining strict layering (Presentation &rarr; API &rarr; Service &rarr; Repository &rarr; Database).

---

## 🔍 MVP Scope and Boundaries

### In Scope (MVP v1.0)
- **Centralized Authentication & RBAC**: Secure login/registration, token lifecycle, and role-based access.
- **Patient Management**: Full demographic profiles, search, and history tracking.
- **Doctor Management & Availability**: Specialties, consultation fees, and recurring schedule/slot generation.
- **Appointment Lifecycle**: Booking, status transitions (`SCHEDULED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`), and double-booking prevention.
- **Consultation & Medical Records**: Clinical visit notes, diagnosis, symptoms, and examination observations.
- **Digital Prescriptions**: Structured medication orders (drug name, dosage, frequency, duration, instructions).
- **Billing & Invoicing**: Itemized consultation/service charges, discounts, tax, and automated balance calculation.
- **Payment Recording**: Verified offline payment logging (Cash, UPI, Card, Net Banking).
- **Role-Specific Dashboards**: Custom metrics and relevant actions for all 5 roles.
- **Audit Logging**: Comprehensive, non-repudiable audit trails.

### Out of Scope (Future Phases)
To maintain engineering rigor and stability, the following are explicitly deferred:
- Autonomous AI diagnosis, medical image analysis, or clinical predictions.
- Telemedicine, WebRTC video calling, or real-time patient-doctor messaging.
- Laboratory Information Systems (LIS) and Radiology PACS/DICOM processing.
- Online payment gateway integrations (Razorpay/Stripe webhooks).
- ABDM (Ayushman Bharat Digital Mission) or production FHIR gateways.
- In-patient department (IPD) bed management and emergency/ambulance dispatch.

---

## 👥 User Roles and Capabilities

| Role | Key Capabilities |
| :--- | :--- |
| **Patient** | Self-registration, profile management, doctor discovery, slot availability check, appointment booking, clinical history, prescription downloads, and invoice review. |
| **Doctor** | Profile management, availability slot scheduling, assigned appointment queues, authorized patient history access, consultation note creation, and prescription issuance. |
| **Receptionist** | Patient intake/registration, doctor schedule lookup, walk-in/phone booking, appointment rescheduling, check-in validation, and cancellation handling. |
| **Billing Staff** | Patient billing lookup, itemized invoice creation, offline payment collection, payment receipt generation, and outstanding balance monitoring. |
| **Administrator**| System user lifecycle, staff account provisioning, role assignment, doctor profile approval, clinic operational metrics, and audit log inspection. |

---

## 🔄 End-to-End Operational Workflow

```text
       [ User Authentication ]
                  ↓
       [ Role-Based Dashboard ]
                  ↓
  [ Patient & Doctor Registration ]
                  ↓
      [ Doctor Availability Slot ]
                  ↓
       [ Appointment Booking ]
                  ↓
     [ Consultation Encounter ]
                  ↓
      [ Medical Record Created ]
                  ↓
      [ Prescription Generated ]
                  ↓
     [ Itemized Invoice Issued ]
                  ↓
       [ Payment Recorded ]
                  ↓
 [ History Updated + Audit Trail Logged ]
```

---

## 🏗️ System Architecture

Arogyavajra follows a **Modular Monolith** architecture with strict separation of concerns.

```text
┌─────────────────────────────────────────────────────────────┐
│                       Next.js Web App                       │
│      TypeScript • Tailwind CSS • React Hook Form • Zod      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API (/api/v1)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         FastAPI API                         │
│           Auth (JWT) • Dependencies • Schema Validation     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Domain Services         │ │     Audit Logger Engine    │
│  Appointment, Medical, Bill  │ │    (Immutable Records)     │
└──────────────┬───────────────┘ └─────────────┬──────────────┘
               │                               │
               ▼                               │
┌──────────────────────────────┐               │
│      Repository Layer        │               │
│  Clean SQL Queries via ORM   │               │
└──────────────┬───────────────┘               │
               │                               │
               └───────────────┬───────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL 16 Database                   │
│        Tables • Foreign Keys • Indexes • Constraints        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```text
ArogyaVajra/
├── apps/
│   ├── web/                          # Next.js Frontend Application
│   │   ├── app/                      # App Router directory
│   │   │   ├── (public)/             # Landing, about, doctor directory
│   │   │   ├── (auth)/               # Login, register, forgot-password
│   │   │   └── (dashboard)/          # Authenticated role-specific dashboards
│   │   │       ├── patient/          # Patient dashboard and appointments
│   │   │       ├── doctor/           # Doctor schedule and consultations
│   │   │       ├── receptionist/     # Desk bookings, check-in queue
│   │   │       ├── billing/          # Invoices, payments, receipts
│   │   │       └── admin/            # Staff management, audit logs
│   │   ├── components/               # Reusable UI component library
│   │   │   ├── ui/                   # Primitive design system components
│   │   │   ├── layout/               # Navbars, sidebars, headers, footers
│   │   │   ├── forms/                # Form wrappers, input controls
│   │   │   ├── tables/               # Data tables with pagination/filters
│   │   │   ├── cards/                # Stat cards, appointment summary cards
│   │   │   └── feedback/             # Alerts, toast notifications, modals
│   │   ├── features/                 # Modular feature domains
│   │   │   ├── auth/                 # Auth hooks, context, login forms
│   │   │   ├── patients/             # Patient lookup, profile components
│   │   │   ├── doctors/              # Doctor listings, availability picker
│   │   │   ├── appointments/         # Booking wizard, rescheduling modal
│   │   │   ├── medical-records/      # Consultation notes, diagnosis editor
│   │   │   ├── prescriptions/        # Rx medication builder, view/print
│   │   │   └── billing/              # Invoice generator, payment recorder
│   │   ├── hooks/                    # Reusable React hooks
│   │   ├── lib/                      # Client utilities (HTTP client, formatters)
│   │   ├── types/                    # Shared TypeScript interfaces & DTOs
│   │   ├── tests/                    # Frontend tests
│   │   ├── public/                   # Static assets, icons, logos
│   │   ├── Dockerfile                # Container definition for web app
│   │   └── package.json              # Web dependencies and scripts
│   │
│   └── api/                          # FastAPI Backend Application
│       ├── app/                      # Main application package
│       │   ├── core/                 # App configuration, security, errors
│       │   │   ├── config.py         # Pydantic Settings & environment variables
│       │   │   └── ...
│       │   ├── db/                   # Database engine, session, migrations
│       │   │   ├── session.py        # SQLAlchemy session factory
│       │   │   └── migrations/       # Alembic migration revisions
│       │   ├── models/               # SQLAlchemy ORM database models
│       │   ├── schemas/              # Pydantic request/response schemas
│       │   ├── repositories/         # Data access & database queries
│       │   ├── services/             # Business rules, validation & logic
│       │   ├── dependencies/         # Auth, permissions & DB injection
│       │   ├── api/                  # API routers
│       │   │   └── routes/           # Versioned endpoint route handlers
│       │   └── main.py               # FastAPI entrypoint & middleware setup
│       ├── tests/                    # Automated backend test suite
│       │   ├── conftest.py           # Pytest test client fixtures
│       │   ├── unit/                 # Unit tests (services, models, utils)
│       │   ├── integration/          # API route and repository tests
│       │   └── e2e/                  # End-to-end user scenario tests
│       ├── Dockerfile                # Container definition for backend API
│       ├── pyproject.toml            # Project packaging and metadata
│       └── requirements.txt          # Python dependencies
│
├── docs/                             # Core Project Documentation
│   ├── PRD.md                        # Product Requirements Document
│   ├── TRD.md                        # Technical Requirements Document
│   ├── MVP.md                        # Minimum Viable Product Scope Baseline
│   ├── APP-FLOW.md                   # Application Navigation & User Journeys
│   ├── FRONTEND-BACKEND-CONTRACT.md  # Detailed API Specifications & Schemas
│   ├── AGENT.md                      # Agent Working Protocol & Engineering Rules
│   └── UI-UX-BRIEF.md                # Clinical Design System & UX Standards
│
├── infra/                            # Deployment & Infrastructure configs
│   ├── docker/                       # Dockerfiles and container configurations
│   └── compose/                      # Compose overrides (production, staging)
│
├── scripts/                          # Maintenance & automation scripts
│   ├── seed/                         # Initial database seeding scripts
│   └── setup.sh                      # Local development onboarding script
│
├── .env.example                      # Environment variables template
├── .gitignore                        # Git exclusion rules
├── docker-compose.yml                # Docker Compose orchestration
├── LICENSE                           # MIT License
└── README.md                         # Project documentation
```

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14+ (App Router) | High-performance React framework with SSR and server components |
| **Frontend Language** | TypeScript | Strong typing across components, contracts, and state |
| **Styling** | Tailwind CSS + shadcn/ui | Clinical design tokens, accessible components, zero bloat |
| **State Management** | TanStack Query (v5) | Robust server state management, caching, and background refetching |
| **Forms & Validation** | React Hook Form + Zod | Type-safe form handling, schema-driven validation |
| **Backend** | FastAPI | High-throughput asynchronous Python web framework |
| **Backend Language** | Python 3.12+ | Modern Python with strict type hinting |
| **Data Validation** | Pydantic v2 | High-speed data parsing and validation |
| **ORM & Migrations** | SQLAlchemy 2.0 + Alembic | Modern SQLAlchemy declarative models and migration engine |
| **Database** | PostgreSQL 16+ | Enterprise relational database with ACID guarantees |
| **Authentication** | JWT (PyJWT / Jose) + Bcrypt | Stateless tokens with server-side role and ownership validation |
| **Containerization** | Docker & Docker Compose | Reproducible environments for local and production deployments |
| **Testing** | Pytest, HTTPX, Jest, Playwright | Multi-tier automated testing (Unit, Integration, E2E) |

---

## 📡 API Design and Communication Contract

All API endpoints follow a standardized, predictable contract rooted at `/api/v1`.

### Success Response Format
```json
{
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Paginated Response Format
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 142,
    "total_pages": 8
  },
  "message": "Items retrieved successfully"
}
```

### Error Response Format
```json
{
  "error": {
    "code": "APPOINTMENT_CONFLICT",
    "message": "The selected doctor already has an active appointment in this time slot.",
    "details": []
  }
}
```

For complete endpoint contracts, request payloads, and status codes, refer to [`docs/FRONTEND-BACKEND-CONTRACT.md`](docs/FRONTEND-BACKEND-CONTRACT.md).

---

## 🚀 Getting Started and Local Development

### Prerequisites
- **Git**
- **Docker & Docker Compose** (Recommended)
- *Alternatively, for local native setup:*
  - **Node.js** 18.x or 20.x
  - **Python** 3.12+
  - **PostgreSQL** 16+

---

### Option A: Running with Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bhumi-2303/ArogyaVajra.git
   cd ArogyaVajra
   ```

2. **Initialize Environment Variables:**
   ```bash
   cp .env.example .env
   ```

3. **Start all services:**
   ```bash
   docker compose up --build
   ```

4. **Access the application:**
   - **Web Interface:** [http://localhost:3000](http://localhost:3000)
   - **FastAPI Documentation (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Health Check Endpoint:** [http://localhost:8000/health](http://localhost:8000/health)

---

### Option B: Manual Local Setup

#### 1. Configure Database
Ensure a local PostgreSQL 16 instance is running and create the database:
```sql
CREATE DATABASE arogyavajra;
```

#### 2. Backend Setup (FastAPI)
```bash
cd apps/api

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (once configured)
# alembic upgrade head

# Start development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Frontend Setup (Next.js)
```bash
cd apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🧪 Testing and Quality Assurance

### Backend Tests (Pytest)
```bash
cd apps/api
pytest -v
```

### Backend Linting and Formatting
```bash
cd apps/api
ruff check .
ruff format .
```

### Frontend Type Checking and Linting
```bash
cd apps/web
npm run type-check
npm run lint
```

---

## 📚 Documentation Hub

The complete blueprint and specification of Arogyavajra is located in the [`docs/`](docs/) directory:

| Document | Purpose |
| :--- | :--- |
| [`PRD.md`](docs/PRD.md) | **Product Requirements Document**: User personas, functional requirements, and product boundaries. |
| [`TRD.md`](docs/TRD.md) | **Technical Requirements Document**: Architectural blueprints, database schemas, and backend rules. |
| [`MVP.md`](docs/MVP.md) | **MVP Specification**: Implementation baseline and functional criteria for MVP v1. |
| [`APP-FLOW.md`](docs/APP-FLOW.md) | **Application Flow**: User journeys, wireframe flows, and screen navigation rules. |
| [`FRONTEND-BACKEND-CONTRACT.md`](docs/FRONTEND-BACKEND-CONTRACT.md) | **API Contract**: Standard request/response DTOs, endpoint signatures, and error codes. |
| [`AGENT.md`](docs/AGENT.md) | **Agent Working Rules**: Mandatory development guidelines and coding rules for agents. |
| [`UI-UX-BRIEF.md`](docs/UI-UX-BRIEF.md) | **UI/UX Design Brief**: Visual design system, clinical aesthetics, typography, and accessibility guidelines. |

---

## 🔒 Security, Privacy, and Auditability

- **Authoritative Server-Side RBAC**: Roles are checked cryptographically per request; frontend navigation checks are purely decorative.
- **Data Isolation**: Patients have zero access to other patients' records; doctors are granted access strictly based on active consultations and assigned appointments.
- **Sensitive Data Protection**: Passwords, auth tokens, and raw health metrics are strictly excluded from logs.
- **Relational Integrity**: Database foreign key constraints prevent orphaned appointments, prescriptions, or bills.
- **Immutable Audit Trail**: Key operations (clinical notes, prescription edits, billing payments) generate tamper-evident audit logs with user and timestamp attribution.

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE).
