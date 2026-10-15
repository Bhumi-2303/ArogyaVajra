Enrollment No. : 230840116003

# SOFTWARE PROJECT MANAGEMENT (3171609)
## DETAILED LAB MANUAL

**Project Name:** Arogyavajra (आरोग्यवज्र) - The Indomitable Shield for Healthcare Management

---

## PRACTICAL - 1

**AIM:** To select the project title and assign requirement engineering to the project title.

**1. Project Title Selection:**
* **Project Name:** Arogyavajra (Healthcare Management Platform)
* **Problem Statement:** Healthcare operations often become fragmented, error-prone, and inefficient when patient data, doctor schedules, appointments, clinical records, and billing are maintained across siloed systems or physical paperwork. There is a need for a centralized platform to manage these clinical operations seamlessly.

**2. Core Objectives:**
* **Patient-Centered Approach:** Protect patient data privacy while empowering patients with complete visibility into their appointments, health records, prescriptions, and billing.
* **Role-Aware Operations:** Implement strict Role-Based Access Control (RBAC) across 5 distinct operational roles (Patient, Doctor, Receptionist, Billing Staff, Administrator) to grant explicit, least-privilege permissions.
* **Clinical Integrity:** Design with a calm, high-legibility clinical aesthetic. Ensure no generic SaaS distractions interfere with clinical workflows.
* **Secure by Design:** Utilize cryptographically verified sessions (JWT), secure password hashing (Bcrypt), and server-side validation to protect all sensitive medical data.
* **Auditable Operations:** Maintain an immutable audit log for all sensitive mutations, including prescriptions, consultations, invoices, and role assignments.

**3. Technology Stack Justification:**
* **Frontend:** Next.js 14+ (App Router) with TypeScript. Chosen for its Server-Side Rendering (SSR) capabilities, enhancing performance and SEO. Tailwind CSS and shadcn/ui are used for consistent, rapid clinical UI development.
* **Backend:** FastAPI (Python 3.12+). Selected for its asynchronous capabilities, extremely high throughput, and automatic OpenAPI documentation generation via Pydantic schemas.
* **Database:** PostgreSQL 16+. Chosen for its robust ACID compliance, which is strictly required for medical and financial (billing) records. SQLAlchemy 2.0 acts as the ORM.

**4. Requirement Engineering Process Overview:**
The requirement engineering phase involved four major steps:
1.  **Feasibility Study:** Evaluated the technical and economic viability of building a modular monolith over microservices to reduce premature complexity.
2.  **Requirements Elicitation:** Conducted interviews and studied existing workflows of hospital receptionists, doctors, and patients.
3.  **Requirements Specification:** Drafted the Product Requirements Document (PRD) and Technical Requirements Document (TRD).
4.  **Requirements Validation:** Iteratively reviewed the scope with stakeholders to finalize the Minimum Viable Product (MVP v1.0).

---

## PRACTICAL - 2

**AIM:** Prepare functional and non-functional requirements of the project.

**1. Functional Requirements (FR):**
Functional requirements define the specific behaviors, actions, and features the system must support.

| FR ID | Module | Detailed Requirement |
| :--- | :--- | :--- |
| **FR-01** | **Authentication** | The system must allow users to register and securely log in. |
| **FR-02** | **RBAC** | The system must assign and enforce one of 5 specific roles: Patient, Doctor, Receptionist, Billing, or Admin upon login. |
| **FR-03** | **Patient Mgt** | Patients must be able to view and update their demographic profiles and medical history securely. |
| **FR-04** | **Scheduling** | Doctors must be able to configure their weekly availability and consultation fees. |
| **FR-05** | **Appointments** | Patients and Receptionists must be able to view available doctor slots and book appointments. |
| **FR-06** | **Integrity** | The system must actively prevent double-booking of doctors for the exact same time slot using database constraints. |
| **FR-07** | **Consultation** | Doctors must be able to view their daily assigned appointment queues. |
| **FR-08** | **EMR** | Doctors must be able to create consultation notes, record symptoms, and document diagnoses during a visit. |
| **FR-09** | **Prescriptions** | Doctors must be able to issue structured digital prescriptions (drug name, dosage, frequency, duration). |
| **FR-10** | **Billing** | Billing staff must be able to pull appointment data to generate itemized invoices (consultation fee, service charges, tax). |
| **FR-11** | **Payments** | The system must allow billing staff to record offline payments (Cash, Card, UPI) and mark invoices as PAID. |
| **FR-12** | **Admin** | Administrators must have a dashboard to provision new staff accounts and approve doctor profiles. |
| **FR-13** | **Audit** | The system must log every appointment cancellation, prescription edit, and payment receipt generation. |
| **FR-14** | **Notifications** | The system must display status transitions for appointments (`SCHEDULED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`). |
| **FR-15** | **Search** | The system must allow Receptionists to search for patients by Name, Phone Number, or Patient ID. |

**2. Non-Functional Requirements (NFR):**
Non-functional requirements specify the quality attributes, performance goals, and constraints of the system.

| NFR ID | Attribute | Detailed Requirement |
| :--- | :--- | :--- |
| **NFR-01** | **Security** | Passwords must be hashed using Bcrypt/Argon2. Sessions must be managed via cryptographically signed JWTs. |
| **NFR-02** | **Privacy** | A Patient must under no circumstances be able to access another patient’s health records via API manipulation. |
| **NFR-03** | **Performance** | Core API endpoints (e.g., fetching a patient profile) must respond within 200 milliseconds under normal load. |
| **NFR-04** | **Availability** | The system should aim for 99.9% uptime during operational hospital hours (8 AM - 10 PM). |
| **NFR-05** | **Scalability** | The backend architecture must be a Modular Monolith, allowing easy refactoring into microservices in the future if hospital load drastically increases. |
| **NFR-06** | **Usability** | The user interface must achieve a minimum accessibility score of 90 on Lighthouse, ensuring readability for visually impaired users. |
| **NFR-07** | **Reliability** | Database foreign keys must be strictly enforced to prevent orphaned records (e.g., a prescription cannot exist without a valid consultation). |
| **NFR-08** | **Auditability** | Audit logs must be strictly append-only and immutable. No user, not even an Admin, can delete an audit log entry. |
| **NFR-09** | **Maintainability**| The backend must maintain >80% test coverage using Pytest. Code must conform to PEP-8 standards via `ruff`. |
| **NFR-10** | **Portability** | The entire application stack (Frontend, Backend, Database) must be fully containerized using Docker to ensure environment parity. |

---

## PRACTICAL - 3

**AIM:** Estimate your project cost using COCOMO model.

**1. Introduction to COCOMO:**
The Constructive Cost Model (COCOMO) is an algorithmic software cost estimation model developed by Barry Boehm. It uses basic regression formulas with parameters derived from historical project data to estimate effort, time, and team size.

**2. Project Type Classification:**
Arogyavajra requires integrating a modern web frontend with a strict relational database and a high-performance backend API. The team has mixed experience levels, and the requirements are moderately strict due to healthcare constraints. Thus, it falls under the **Semi-Detached** mode.

**3. Size Estimation (KLOC - Kilo Lines of Code):**
Based on the MVP scope, we estimate the following module sizes:
*   Next.js Frontend (Components, Hooks, Pages): ~3,500 lines
*   FastAPI Backend (Routes, Models, Services): ~2,500 lines
*   Infrastructure & Configuration (Docker, DB Scripts): ~500 lines
*   **Total Estimated Size = 6.5 KLOC**

**4. COCOMO Constants for Semi-Detached Mode:**
*   $a = 3.0$
*   $b = 1.12$
*   $c = 2.5$
*   $d = 0.35$

**5. Effort Estimation (Person-Months):**
The effort required is calculated as: $E = a \times (KLOC)^b$
$E = 3.0 \times (6.5)^{1.12}$
$E = 3.0 \times 8.163$
**$E = 24.49$ Person-Months**
*(This means it would take one person roughly 24.5 months to complete the project alone.)*

**6. Development Time Estimation (Months):**
The time required is calculated as: $T = c \times (E)^d$
$T = 2.5 \times (24.49)^{0.35}$
$T = 2.5 \times 3.054$
**$T = 7.63$ Months**

**7. Average Staffing Size (Team Size):**
$Staff = Effort / Time$
$Staff = 24.49 / 7.63$
**$Staff = 3.21$** (Approximated to **3 to 4 developers**)

**Conclusion:** To build the Arogyavajra MVP, an estimated budget covering ~25 Person-Months of effort is required. A team of 3-4 developers should be able to deliver the project in approximately 7.5 months.

---

## PRACTICAL - 4

**AIM:** Prepare a project plan using Critical Path Method (CPM).

**1. Work Breakdown Structure (WBS) & Task Dependencies:**
To accurately map the project timeline, the project is broken down into specific tasks.

| Task ID | Task Description | Duration (Days) | Predecessors |
| :---: | :--- | :---: | :--- |
| **A** | Requirement Analysis & Scope Definition | 10 | None |
| **B** | System Architecture & Environment Setup | 7 | A |
| **C** | Database Schema Design (PostgreSQL) | 5 | B |
| **D** | API Design & OpenAPI Contracts | 5 | B |
| **E** | Frontend Wireframing & UI Mockups | 8 | A |
| **F** | Backend: Core Auth & RBAC Implementation | 15 | C, D |
| **G** | Frontend: Scaffold UI Components (Tailwind) | 12 | E |
| **H** | Backend: Appointments, EMR & Billing logic | 20 | F |
| **I** | Frontend: Integration & State Management | 15 | G, H |
| **J** | Unit & Integration Testing | 10 | I |
| **K** | Security Audit & Penetration Testing | 5 | J |
| **L** | User Acceptance Testing (UAT) | 7 | K |
| **M** | Production Deployment & Handoff | 3 | L |

**2. Network Diagram Analysis (Path Identification):**
By tracing the dependencies from Start to Finish, we identify two primary paths:

*   **Path 1 (Backend Heavy):** A $\rightarrow$ B $\rightarrow$ C/D $\rightarrow$ F $\rightarrow$ H $\rightarrow$ I $\rightarrow$ J $\rightarrow$ K $\rightarrow$ L $\rightarrow$ M
    *   Duration: $10 + 7 + 5 + 15 + 20 + 15 + 10 + 5 + 7 + 3 = 97$ Days
*   **Path 2 (Frontend Heavy):** A $\rightarrow$ E $\rightarrow$ G $\rightarrow$ I $\rightarrow$ J $\rightarrow$ K $\rightarrow$ L $\rightarrow$ M
    *   Duration: $10 + 8 + 12 + 15 + 10 + 5 + 7 + 3 = 70$ Days

**3. Critical Path Result:**
The longest path through the network dictates the shortest possible completion time for the project.
*   **Critical Path:** **A $\rightarrow$ B $\rightarrow$ C $\rightarrow$ F $\rightarrow$ H $\rightarrow$ I $\rightarrow$ J $\rightarrow$ K $\rightarrow$ L $\rightarrow$ M**
*   **Total Project Duration:** **97 Days**

**Conclusion:** The backend logic (Database, Auth, and EMR services) forms the critical path. Any delay in tasks C, F, or H will result in a day-for-day delay in the final deployment. The frontend UI design (Tasks E, G) has 27 days of "slack" or "float."

---

## PRACTICAL - 5

**AIM:** Prepare project report progress using Earned Value Analysis (EVA).

**1. Scenario Overview:**
The Arogyavajra project is being evaluated by stakeholders at the end of **Day 50** (approx. end of Month 2).
*   **Total Planned Duration:** 97 Days.
*   **Total Estimated Budget (BAC - Budget At Completion):** $30,000 (Based on developer salaries for the duration).

**2. Status at Day 50 (Metrics Gathering):**
*   **Planned completion:** According to the CPM schedule, by Day 50, the project should be 60% complete (Tasks A through H should be finished).
*   **Planned Value (PV):** $BAC \times 60\% = 30000 \times 0.60 = \$18,000$
*   **Actual completion:** Development hit a roadblock with complex SQL queries for appointment conflict resolution. Only 50% of the project is actually complete.
*   **Earned Value (EV):** $BAC \times 50\% = 30000 \times 0.50 = \$15,000$
*   **Actual Cost (AC):** Due to overtime paid to resolve the SQL issue, the actual money spent so far is **$17,000**.

**3. Variance Calculations (How far off are we?):**
*   **Cost Variance (CV)** = $EV - AC = 15000 - 17000 = -\$2,000$
    *(A negative CV means the project is over budget by $2,000)*
*   **Schedule Variance (SV)** = $EV - PV = 15000 - 18000 = -\$3,000$
    *(A negative SV means the project is behind schedule. We have delivered $3,000 less "value" than planned by this date)*

**4. Performance Indices (Efficiency metrics):**
*   **Cost Performance Index (CPI)** = $EV / AC = 15000 / 17000 = 0.88$
    *(For every $1 spent, we are only getting $0.88 of value. CPI < 1 = Over Budget)*
*   **Schedule Performance Index (SPI)** = $EV / PV = 15000 / 18000 = 0.83$
    *(We are progressing at 83% of the originally planned speed. SPI < 1 = Behind Schedule)*

**5. Forecasting (Estimate at Completion - EAC):**
Assuming the current rate of efficiency continues, what will the final cost be?
*   **EAC** = $BAC / CPI = 30000 / 0.88 = \$34,090$

**Conclusion & Corrective Action:** 
The EVA reveals Arogyavajra is tracking behind schedule and over budget. Management must intervene by reducing scope (deferring some non-critical billing features) or increasing backend developer resources to improve the SPI back to 1.0.

---

## PRACTICAL - 6

**AIM:** Identify the objects for SCM (Software Configuration Management) in your project.

**1. SCM Definition:**
SCM is the process of systematically managing, organizing, and controlling changes in documents, codes, and other entities during the Software Development Life Cycle (SDLC). 

**2. Identified Configuration Items (CIs) for Arogyavajra:**
CIs are the specific artifacts that need strict version control.
*   **Project Documentation Base:** PRD.md, TRD.md, FRONTEND-BACKEND-CONTRACT.md, UI-UX-BRIEF.md.
*   **Source Code (Frontend):** All `.tsx`, `.ts`, and `.css` files in the `apps/web` directory (Next.js components, pages, contexts).
*   **Source Code (Backend):** All `.py` files in the `apps/api` directory (FastAPI routes, Pydantic schemas, Dependency injections).
*   **Database Configuration:** Alembic migration scripts (`versions/`) representing the evolution of the database schema.
*   **Environment & Infra Configs:** `docker-compose.yml`, `Dockerfile` (web & api), `.env.example`, `package.json`, `requirements.txt`.
*   **Testing Artifacts:** Test scripts in `tests/unit` and `tests/integration`.

**3. Version Control Strategy (Git & GitHub):**
Arogyavajra utilizes a strict Git branching model to manage CIs.
*   `main`: The production-ready state. Commits here represent release versions (v1.0.0).
*   `develop`: The active integration branch.
*   `feature/*`: Branches for developing new features (e.g., `feature/billing-invoice-generator`).
*   `bugfix/*`: Branches for fixing bugs found in testing.

**4. Change Control Process:**
No developer can push code directly to `main` or `develop`. Changes to Configuration Items are proposed via Pull Requests (PRs). A PR must:
1. Pass all automated CI/CD checks.
2. Be reviewed and approved by at least one other senior team member.

---

## PRACTICAL - 7

**AIM:** Identify and elaborate in detail – Quality Assurance Activities needed for your project.

**1. QA Strategy Breakdown:**
For a healthcare application like Arogyavajra, Quality Assurance cannot be an afterthought. It must be integrated throughout the SDLC.

**2. Static Quality Assurance (Linting & Formatting):**
*   **Backend:** Python code is checked using `Ruff` to ensure compliance with PEP-8. `MyPy` is used for strict static type checking to catch type mismatch errors before runtime.
*   **Frontend:** TypeScript compilation strict mode is enabled. `ESLint` and `Prettier` ensure uniform code style across all React components.

**3. Dynamic Quality Assurance (Automated Testing):**
The testing pyramid is strictly followed:
*   **Unit Testing:** `Pytest` tests individual Python functions and services in isolation (e.g., testing the tax calculation logic). `Jest` is used for frontend utility functions.
*   **Integration Testing:** Tests the API endpoints and database interactions combined. FastAPI's `TestClient` is used with a test PostgreSQL database to ensure data flows correctly from route to database.
*   **End-to-End (E2E) Testing:** `Playwright` simulates a real user browser session to test full workflows (e.g., Logging in as a receptionist $\rightarrow$ finding a patient $\rightarrow$ booking a slot).

**4. Security Quality Assurance:**
*   **Authentication Testing:** Verifying that expired or malformed JWT tokens are always rejected with a `401 Unauthorized`.
*   **Authorization (RBAC) Audits:** Ensuring that a user with a "Patient" token cannot access "Admin" endpoints (preventing broken access control).
*   **Injection Prevention:** Validating that all database queries use SQLAlchemy's parameterized queries to completely neutralize SQL injection risks.

**5. CI/CD Integration:**
All QA activities are automated via GitHub Actions. If a developer opens a Pull Request, the CI pipeline runs the linters and the entire test suite. If any QA check fails, the PR is blocked from being merged.

---

## PRACTICAL - 8

**AIM:** Write a project closure analysis report for your project.

**Project Closure Report:**
*   **Project Name:** Arogyavajra Healthcare Management Platform
*   **Phase:** Minimum Viable Product (MVP v1.0)
*   **Date of Closure:** 10/11/2026

**1. Performance against Baseline:**
*   **Scope:** Successfully delivered 100% of the defined MVP scope, including central authentication, appointment scheduling, EMR note creation, and basic billing. Deferred telemedicine and advanced LIS integration to Phase 2 as planned.
*   **Schedule:** The project took 105 days to complete against the planned 97 days. The 8-day delay was attributed to complexities in handling timezones for doctor availability slots.
*   **Budget:** Concluded at $33,500, slightly over the $30,000 budget due to the scheduled delay requiring extra developer hours.

**2. Deliverables Handed Over:**
*   Source code repository with full commit history.
*   Dockerized application ready for production deployment.
*   Comprehensive Documentation Hub (`docs/`) containing PRD, TRD, and API Contracts.
*   Populated seed database for demonstration purposes.

**3. Lessons Learned:**
*   **Timezone Management:** Storing all datetimes in UTC in PostgreSQL and only converting to local time on the frontend is absolutely critical for medical scheduling. Attempting to handle local time in the backend caused severe bugs.
*   **API Contracts First:** Defining the JSON schemas for the API before writing any frontend code drastically reduced integration friction between the frontend and backend teams.
*   **Monolith Success:** Choosing a Modular Monolith over Microservices saved significant time in DevOps setup and allowed the team to focus entirely on business logic.

**4. Post-Implementation Support Plan:**
*   A monitoring system (Prometheus/Grafana) will be attached to the FastAPI logs to monitor for 500 errors.
*   A dedicated Slack channel has been created for the hospital staff to report UI bugs during the first 30 days of live operation.

---

## PRACTICAL - 9

**AIM:** Implementation of the project.

**1. Architectural Implementation Overview:**
Arogyavajra is implemented using a strict **Modular Monolith** architecture. It is divided into three distinct layers to ensure separation of concerns.

**2. The Presentation Layer (Frontend):**
*   Located in `apps/web`.
*   Implemented using **Next.js 14 App Router**. The UI is constructed using Tailwind CSS and pre-built accessible components from shadcn/ui to maintain a professional, clinical look.
*   **Data Fetching:** Uses `TanStack Query` to fetch data from the backend. This provides automatic caching, background refetching, and state management for API data.

**3. The Business Logic & API Layer (Backend):**
*   Located in `apps/api`.
*   Implemented using **FastAPI**.
*   **Routing:** The application exposes RESTful endpoints under `/api/v1/`.
*   **Validation:** Uses `Pydantic` schemas to strictly validate all incoming JSON requests. If a client sends an invalid string instead of an integer for a doctor ID, FastAPI rejects it before it even hits the business logic.
*   **Dependency Injection:** Used extensively for security. A `get_current_user` dependency verifies the JWT token and extracts the user's role on every protected route.

**4. The Persistence Layer (Database):**
*   Implemented in **PostgreSQL**.
*   Uses **SQLAlchemy 2.0** to define ORM models (`Patient`, `Doctor`, `Appointment`, `Invoice`).
*   Relational integrity is enforced using Foreign Keys (e.g., an `Appointment` row must reference a valid `Patient.id` and `Doctor.id`).

*(Note for user: Insert architectural diagrams, database ERDs, and screenshots of the actual running application dashboards here to complete this practical)*

---

## PRACTICAL - 10

**AIM:** Design test suite of your project to ensure software quality.

**1. Testing Strategy:**
The test suite ensures that critical healthcare operations are bug-free. Tests are executed via `Pytest`.

**2. Core Test Cases:**

| TC ID | Module | Test Description / Steps | Expected Result | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | Auth | Send POST `/auth/login` with incorrect password. | HTTP 401 Unauthorized. Error message: "Invalid credentials". | PASS |
| **TC-02** | Auth | Send POST `/auth/login` with correct Admin credentials. | HTTP 200 OK. Response contains valid JWT token and role='ADMIN'. | PASS |
| **TC-03** | RBAC | Patient attempts GET `/api/v1/admin/users` with Patient JWT. | HTTP 403 Forbidden. Access denied. | PASS |
| **TC-04** | Patients | Receptionist sends POST to create a patient with missing required field `date_of_birth`. | HTTP 422 Unprocessable Entity. Pydantic validation error returned. | PASS |
| **TC-05** | Schedule | Doctor updates availability to Monday 9AM - 12PM. | Database saves availability slots successfully. | PASS |
| **TC-06** | Bookings | Patient books an open slot for a specific Doctor. | Appointment created. Status becomes `SCHEDULED`. Database row added. | PASS |
| **TC-07** | Bookings | Second Patient attempts to book the exact same slot booked in TC-06. | HTTP 409 Conflict. Error message: "Time slot unavailable." | PASS |
| **TC-08** | EMR | Doctor adds consultation notes to a `COMPLETED` appointment. | Notes saved securely. Audit log entry created. | PASS |
| **TC-09** | Billing | Billing staff generates invoice for `COMPLETED` appointment. | Invoice generated. Calculations (Base + Tax) are mathematically correct. | PASS |
| **TC-10** | Integrity| Attempt to delete a Patient profile that has associated Appointments in DB. | Deletion blocked by Foreign Key Constraint (HTTP 400 or handled gracefully). | PASS |

**3. Execution Environment:**
These test cases are written in code and stored in `apps/api/tests/`. They are executed in an isolated Docker container with a temporary PostgreSQL database that is spun up and torn down exclusively for testing, ensuring tests do not affect production data.
