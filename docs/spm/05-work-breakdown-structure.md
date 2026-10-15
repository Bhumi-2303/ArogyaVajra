# DOCUMENT 05 — WORK BREAKDOWN STRUCTURE (WBS)

## 1. Purpose
The Work Breakdown Structure (WBS) decomposes the entire Arogyavajra project scope into manageable work packages and discrete, deliverable-oriented tasks, establishing accountability, dependency mapping, and progress tracking.

## 2. Project-Specific Content
The WBS follows a standard hierarchical engineering decomposition structured around project lifecycle phases (1.1 Requirements to 1.8 Project Closure), ensuring 100% traceability to functional specifications.

## 3. Tables
### WBS Decomposition & Status
| WBS ID | Task Name | Description | Owner | Dependency | Est. Days | Act. Days | Status | Deliverable |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1.0** | **Arogyavajra System** | **Complete Healthcare Outpatient Platform** | **Bhavini Chauhan** | - | **45** | **-** | **In Progress** | **Full System Release** |
| 1.1 | **Requirements & Inception** | Requirements gathering and domain modeling | Bhavini Chauhan | - | 4 | 4 | Completed | PRD & Architecture Spec |
| 1.1.1 | Clinical Workflow Analysis | Analyze OPD workflows, roles, and boundaries | Bhavini Chauhan | - | 2 | 2 | Completed | APP-FLOW.md |
| 1.1.2 | SRS & PRD Formulation | Formalize functional & non-functional requirements | Bhavini Chauhan | 1.1.1 | 2 | 2 | Completed | PRD.md & TRD.md |
| 1.2 | **System Design** | Architectural and relational specification | Bhavini Chauhan | 1.1 | 4 | 4 | Completed | Design Specifications |
| 1.2.1 | Relational Database Design | Define 12 entities, constraints, and relationships | Bhavini Chauhan | 1.1.2 | 2 | 2 | Completed | DATABASE-SCHEMA.md |
| 1.2.2 | API Contract Design | Formalize OpenAPI REST endpoints & DTOs | Bhavini Chauhan | 1.2.1 | 2 | 2 | Completed | FRONTEND-BACKEND-CONTRACT.md |
| 1.3 | **Infrastructure & Core Setup** | Development environment & foundation | Bhavini Chauhan | 1.2 | 3 | 3 | Completed | Core Architecture Repo |
| 1.3.1 | Container Orchestration | Docker compose for API, Web, and PostgreSQL | Bhavini Chauhan | 1.2.2 | 1 | 1 | Completed | docker-compose.yml |
| 1.3.2 | Database Engine & Migrations | SQLAlchemy 2.0 async engine & Alembic setup | Bhavini Chauhan | 1.3.1 | 2 | 2 | Completed | Alembic migrations |
| 1.4 | **Development (Core Slices)** | Modular vertical slice implementation | Bhavini Chauhan | 1.3 | 20 | - | In Progress | Executable Application |
| 1.4.1 | Authentication & RBAC | JWT token lifecycle, hashing, role dependencies | Bhavini Chauhan | 1.3.2 | 2 | 2 | Completed | Auth API & Route Guards |
| 1.4.2 | Patient Management | Patient profile schemas, repository, endpoints | Bhavini Chauhan | 1.4.1 | 2 | 2 | Completed | Patient API & Components |
| 1.4.3 | Doctor Management & Schedule | Doctor profiles and recurring availability slots | Bhavini Chauhan | 1.4.1 | 2 | 2 | Completed | Doctor API & Schedule Picker |
| 1.4.4 | Appointment Booking Engine | Booking lifecycle, conflict checks, transitions | Bhavini Chauhan | 1.4.2, 1.4.3 | 3 | 3 | Completed | Appointment API & Booking Wizard |
| 1.4.5 | Medical Records Domain | Clinical encounter visit notes and diagnosis | Bhavini Chauhan | 1.4.4 | 2 | 2 | Completed | Medical Records API & UI |
| 1.4.6 | Prescriptions Domain | Structured medication builder & issuance | Bhavini Chauhan | 1.4.5 | 2 | 2 | Completed | Prescription API & Rx UI |
| 1.4.7 | Billing & Invoicing Engine | Itemized billing, tax/discount, sequence generator | Bhavini Chauhan | 1.4.6 | 3 | 3 | Completed | Invoice API & Receipt Generator |
| 1.4.8 | Payment Recording | Offline payment logging and balance adjustment | Bhavini Chauhan | 1.4.7 | 1 | 1 | Completed | Payment API & Cash Drawer UI |
| 1.4.9 | Audit Logging Subsystem | Non-repudiable transaction audit logger | Bhavini Chauhan | 1.4.1 | 1 | 1 | Completed | Audit Engine & Admin Log Table |
| 1.4.10| Role-Based Dashboards | Custom portal screens for all 5 user roles | Bhavini Chauhan | 1.4.4, 1.4.7 | 4 | - | In Progress | 5 Dashboard Pages |
| 1.5 | **Testing & Quality Assurance** | Verification and test execution | Bhavini Chauhan | 1.4 | 6 | - | In Progress | Test Suite & QA Report |
| 1.5.1 | Unit Test Suite | Backend service, model, and security unit tests | Bhavini Chauhan | 1.4.9 | 2 | 2 | Completed | 48 Passing Pytest Units |
| 1.5.2 | Integration & E2E Testing | Cross-module transaction tests & journey checks | Bhavini Chauhan | 1.5.1 | 2 | - | In Progress | Pytest Integration Suite |
| 1.5.3 | Frontend UI Verification | Accessibility, responsive layouts, client routing | Bhavini Chauhan | 1.4.10 | 2 | - | In Progress | Verification MJS Scripts |
| 1.6 | **Documentation & SPM** | Semester project management documentation | Bhavini Chauhan | 1.1 | 5 | - | In Progress | SPM Practical Dossier |
| 1.6.1 | Continuous SPM Artifacts | 20 GTU SPM documents maintained in repo | Bhavini Chauhan | 1.1 | 3 | 2 | In Progress | docs/spm/* Artifacts |
| 1.6.2 | Practical File Preparation | GTU format academic report compilation | Bhavini Chauhan | 1.6.1 | 2 | - | Planned | Final Practical Report |
| 1.7 | **Deployment & Release** | Production build and packaging | Bhavini Chauhan | 1.5 | 2 | - | Planned | Packaged Production Build |
| 1.8 | **Project Closure** | Academic viva, presentation & archiving | Bhavini Chauhan | 1.6, 1.7 | 1 | - | Planned | Project Closure Report |

## 4. Current Status
- Overall WBS Completion: ~75% (Core backend complete; frontend dashboards in progress; testing/stabilization active).
- Active Work Packages: 1.4.10 (Dashboards), 1.5.2 (Integration Tests), 1.6.1 (SPM Documentation).

## 5. Assumptions / Missing Information
- Team Task Distribution: Assigned to Bhavini Chauhan based on repository commits; additional team assignments: [TO BE PROVIDED].
