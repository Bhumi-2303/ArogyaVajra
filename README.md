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

# Run migrations
alembic upgrade head

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

## 🌐 Deploying to Render

Arogyavajra provides an automated [Render Blueprint](https://render.com/docs/blueprint-spec) in [`render.yaml`](render.yaml) that provisions a managed PostgreSQL 16 database, Dockerized FastAPI backend, and Next.js frontend web service.

### Blueprint Architecture & Important Service Syncing Notice
```text
  [ User Browser ]
         │ (Same-Origin HTTPS)
         ▼
  ┌─────────────────────────────────┐
  │  arogyavajra-web (Web Service)  │
  │  Next.js 14 (Docker)            │
  │  Rewrites: /api/v1/* -> API     │
  └────────────────┬────────────────┘
                   │
                   │ Internal Private Network (http://arogyavajra-api:8000)
                   ▼
  ┌─────────────────────────────────┐
  │  arogyavajra-api (Web Service)  │
  │  FastAPI / Python 3.12 (Docker) │
  │  Health Check: /health          │
  └────────────────┬────────────────┘
                   │
                   │ Internal Private Network (postgresql+psycopg://)
                   ▼
  ┌─────────────────────────────────┐
  │  arogyavajra-db (PostgreSQL 16) │
  │  Render Managed Database        │
  └─────────────────────────────────┘
```

> [!IMPORTANT]
> **Blueprint Syncing Creates NEW Services Unless Names Match Existing Ones**:
> When you sync a repository containing `render.yaml`, Render creates **NEW** services in your account matching the `name:` fields (`arogyavajra-db`, `arogyavajra-api`, `arogyavajra-web`).
> - If you already have existing Render services with different names, either rename the `name:` keys in `render.yaml` to match your existing service names exactly before syncing, or migrate your custom domains/traffic to the newly provisioned services.
> - Blueprint syncing is fully declarative: any services defined in the YAML file that do not exist will be created automatically.

> [!NOTE]
> **Plan Costs and Free-Tier Evaluation Alternative**:
> By default, `render.yaml` configures the `starter` tier ($7/mo per web service and $7/mo for PostgreSQL) to ensure zero sleep, dedicated resources, and uninterrupted uptime for healthcare clinic workflows.
> - **Free Tier Alternative**: You can evaluate on Render's Free tier for staging or personal testing by changing `plan: starter` to `plan: free` across `render.yaml`.
> - **Free Tier Considerations**: Free web services spin down after 15 minutes of inactivity (causing ~30–50s cold starts when woken), and Render free databases expire after 30 days with a 1GB limit.

### Environment Variables Reference

#### Backend Service (`arogyavajra-api`)
| Variable | Classification | Description | Default / Value |
| :--- | :---: | :--- | :--- |
| `APP_ENV` | Public | Application environment; enforces security guardrails in production | `production` |
| `APP_DEBUG` | Public | Debug mode; must be `false` in production | `false` |
| `APP_NAME` | Public | Standard application identifier | `arogyavajra` |
| `DATABASE_URL` | **Secret** | Connection string to PostgreSQL managed database | Wired from `arogyavajra-db` (`connectionString`) |
| `JWT_SECRET_KEY` | **Secret** | Cryptographic secret for signing tokens (min 32 chars) | Generated by Render (`generateValue: true`) |
| `JWT_ALGORITHM` | Public | Algorithm for JWT signatures | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Public | Access token lifespan in minutes | `30` |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | Public | Refresh token lifespan in days | `7` |
| `CORS_ORIGINS` | Public | Allowed origins for cross-origin requests; must be HTTPS with no trailing slash | Wired from `arogyavajra-web` host |
| `TRUSTED_PROXIES` | Public | IP addresses / CIDRs of trusted reverse proxies | `""` (empty ignores untrusted forwarded headers) |
| `BOOTSTRAP_SECRET` | **Secret** | One-time operator authorization key for admin creation (min 16 chars) | Operator-configured secret |

#### Frontend Service (`arogyavajra-web`)
| Variable | Type | Description |
| :--- | :---: | :--- |
| `NODE_ENV` | Env Var | Node environment (`production`) |
| `API_INTERNAL_URL` | Env Var | Internal address of the backend service (`hostport`), wired from `arogyavajra-api`. Requests to `/api/v1/*` are proxied same-origin via the runtime Route Handler at `app/api/v1/[[...path]]/route.ts`, guaranteeing first-party `httpOnly` refresh cookie persistence. |
| `TRUST_PLATFORM_IP_HEADERS` | Env Var | Edge header trust toggle (`true`/`false`, default `false`). When `true`, the Next.js runtime proxy trusts Cloudflare platform edge headers (`CF-Connecting-IP` / `True-Client-IP`) to resolve real client IP and inject authoritative `X-Real-IP`. Set to `true` on Render. |

### Cold-Start Notice
On Render free or starter tiers, instances spin down after 15 minutes of inactivity. When a new request arrives, a cold start takes approximately **30–50 seconds** while the Docker container boots and completes database readiness probes. Subsequent requests are served with sub-100ms latency.

### Automatic Migrations on Deployment
The backend container runs `apps/api/scripts/entrypoint.sh` on startup:
1. Executes `alembic upgrade head` to apply all pending database migrations idempotently.
2. If migrations fail for any reason, the entrypoint exits with a non-zero code immediately, terminating the container and causing the Render deploy to fail loudly.
3. Upon migration success, it starts `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`.

### Creating the First Administrator in Production
Production databases start with zero default users or demo credentials. To provision the initial administrator, use the secure one-time bootstrap CLI:

**Option A: Inside the Render Dashboard Web Shell (`arogyavajra-api` &rarr; Shell)**
```bash
# In the Render web shell, DATABASE_URL, APP_ENV, and BOOTSTRAP_SECRET are already set.
# The command will prompt interactively for the bootstrap secret and admin password:
python scripts/bootstrap_admin.py --email admin@hospital.org
```

**Option B: From an operator workstation with direct database connection**
```bash
# 1. Set the trusted BOOTSTRAP_SECRET and connection URL
export DATABASE_URL="postgresql+psycopg://<user>:<password>@<host>/<dbname>?sslmode=require"
export BOOTSTRAP_SECRET="<YourEnterpriseBootstrapKeyMin16Chars!>"
export APP_ENV="production"

# 2. Run the bootstrap CLI (prompts interactively for password with echo disabled)
cd apps/api
python scripts/bootstrap_admin.py --email admin@hospital.org
```

**Security Invariants Enforced:**
- **One-Time Only**: The script verifies that no active administrator exists in the database. If an administrator is already present, execution immediately halts (exit code `2`).
- **Constant-Time Verification**: The supplied secret is verified against `BOOTSTRAP_SECRET` using `secrets.compare_digest`.
- **Password Complexity**: Minimum 12 characters, requiring uppercase, lowercase, digit, and special symbol.
- **Audit Logging**: An immutable audit log entry is recorded in the database without logging secrets or passwords.

### Verifying Service Health and Readiness Probes
After deployment, verify the live services using HTTP probes:

```bash
# 1. Liveness Probe (verifies web process is active)
curl -f -s https://<api-service>.onrender.com/health
# Expected response (HTTP 200):
# {"status":"healthy","service":"arogyavajra-api","version":"1.0.0"}

# 2. Readiness Probe (verifies database connectivity)
curl -f -s https://<api-service>.onrender.com/ready
# Expected response (HTTP 200):
# {"status":"ready","service":"arogyavajra-api","database":"connected"}
# If the database is unreachable, returns HTTP 503 with {"status":"unhealthy", ...}

# 3. API Root & Version Probe
curl -f -s https://<api-service>.onrender.com/api/v1
# Expected response (HTTP 200):
# {"data":{"name":"Arogyavajra API","version":"v1","status":"active"},"message":"Welcome..."}
```

### Edge Platform Header Trust & Real Client IP Resolution

Behind the Next.js runtime proxy on Render, the backend API communicates directly with the Next.js server over the Render private network (RFC 1918 addresses such as `10.x.x.x`). To prevent IP spoofing while preserving accurate client IP attribution in audit logs and rate-limiting buckets:

1. **Header Stripping at Web Proxy**:
   The runtime proxy (`apps/web/app/api/v1/[[...path]]/route.ts`) strips **all client-supplied forwarded and IP headers** (`X-Forwarded-For`, `X-Real-IP`, `Forwarded`, `True-Client-IP`, `CF-Connecting-IP`) as well as auth bypass opt-in headers (`X-Client-Type`, `X-Auth-Flow`).
2. **Explicit Platform Edge Header Trust (`TRUST_PLATFORM_IP_HEADERS`)**:
   - `TRUST_PLATFORM_IP_HEADERS` defaults to `false`. In `render.yaml`, it is explicitly set to `"true"`.
   - When `TRUST_PLATFORM_IP_HEADERS="true"`, the Next.js proxy extracts the client IP from Cloudflare's non-spoofable edge headers (`CF-Connecting-IP` / `True-Client-IP`) and injects a single authoritative `X-Real-IP` to the internal API service.
   - When `TRUST_PLATFORM_IP_HEADERS="false"`, edge headers are ignored, and the system falls back to development logic (leftmost valid `X-Forwarded-For` in development, or `unknown` in production).
3. **Architectural Security Assumption**:
   This trust model strictly assumes the web service is reachable **exclusively through Render's Cloudflare edge**, where edge headers cannot be injected or modified by public callers. If the origin service is ever exposed directly to the public internet bypassing Cloudflare edge termination, `TRUST_PLATFORM_IP_HEADERS` must remain `false`.
4. **Backend Single-Header Enforcement**:
   When the incoming peer IP is in `TRUSTED_PROXIES` (e.g. `10.0.0.0/8`), `get_client_identifier` in `apps/api/app/core/rate_limit.py` trusts **only** `X-Real-IP`. It does not walk `X-Forwarded-For`, preventing header spoofing attacks.

### Verifying Client IP Attribution on Render

You can verify that the real client IP is properly extracted and forwarded behind Render's proxy using the diagnostic endpoint `/api/v1/auth/debug-client-ip`:

```bash
# Step 1: Log in as an administrator to obtain an access token
TOKEN=$(curl -s -X POST https://<web-service>.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.org","password":"<AdminPassword>"}' \
  | jq -r '.data.access_token')

# Step 2: Query the debug-client-ip endpoint
curl -s https://<web-service>.onrender.com/api/v1/auth/debug-client-ip \
  -H "Authorization: Bearer $TOKEN" | jq .

# Expected Response:
# {
#   "resolved_client_ip": "203.0.113.195",   <-- Your actual public IP
#   "direct_host": "10.0.1.25",             <-- Render web service private container IP
#   "is_trusted_proxy": true,               <-- Matches TRUSTED_PROXIES
#   "headers": {
#     "x-real-ip": "203.0.113.195",
#     "cf-connecting-ip": null,
#     "true-client-ip": null,
#     "x-forwarded-for": null,
#     "forwarded": null
#   }
# }
```

### Decommissioning / Deleting Debug Endpoint after Verifying on Render

The diagnostic endpoint `/api/v1/auth/debug-client-ip` is strictly restricted to authenticated administrators in production environments (returning HTTP 401 for unauthenticated requests and HTTP 403 for non-admin accounts). Follow these steps to delete the endpoint after verifying on Render:

1. **Delete Endpoint from Backend**:
   In `apps/api/app/api/v1/auth.py`, delete the `debug_client_ip` route handler (`@router.get("/debug-client-ip", ...)`).
2. **Remove Integration Test**:
   In `apps/api/tests/integration/test_trusted_proxy_and_client_ip.py`, delete `test_debug_client_ip_endpoint`.
3. **Execute Verification Baseline**:
   Verify that all quality gates remain green:
   ```bash
   cd apps/api
   python scripts/lint_gate.py
   alembic upgrade head
   pytest -q
   ```
4. **Commit and Deploy Deletion**:
   ```bash
   git add apps/api/app/api/v1/auth.py apps/api/tests/integration/test_trusted_proxy_and_client_ip.py
   git commit -m "chore(auth): delete temporary debug-client-ip endpoint after render verification"
   git push origin main
   ```

---

## 🧪 Testing and Quality Assurance

### Baseline Verification Commands

Both the backend and frontend enforce strict quality gates before any commit or deployment:

#### Backend Baseline
```bash
cd apps/api

# 1. Enforceable Ruff Lint Gate (zero new violations, strict modified file verification)
python scripts/lint_gate.py

# 2. Database Migrations Check
alembic upgrade head

# 3. Comprehensive Test Suite
pytest -q

# 4. Coverage Report (services and api/v1 target >= 80%)
pytest --cov=app/services --cov=app/api/v1 --cov-report=term-missing
```

#### Frontend Baseline
```bash
cd apps/web

# 1. Next.js Linting
npm run lint

# 2. TypeScript Static Type Check
npm run type-check

# 3. Production Build Compilation
npm run build

# 4. API URL Construction Verification Suite
node scripts/verify-api-url-construction.mjs

# 5. Security Headers and CSP Verification Suite
node scripts/verify-security-headers.mjs

# 6. Playwright End-to-End Test Suite
npx playwright test
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
