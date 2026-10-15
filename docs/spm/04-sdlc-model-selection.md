# DOCUMENT 04 — PROJECT APPROACH / SDLC MODEL

## 1. Purpose
This document presents a structured engineering evaluation of candidate Software Development Life Cycle (SDLC) models and justifies the selected methodology for Arogyavajra based on project characteristics, constraints, and academic submission milestones.

## 2. Project-Specific Content
### Candidate SDLC Models Considered
1. **Classical Waterfall Model:** Linear-sequential progression through requirements, design, implementation, testing, deployment, and maintenance.
2. **Agile Scrum Model:** Short sprints (1-2 weeks), continuous backlog grooming, daily standups, and evolving requirements.
3. **Spiral Model:** Risk-driven model combining iterative prototyping with formal waterfall checkpoints.
4. **Iterative Incremental Model / Evolutionary Prototyping:** Structured development through successive modular increments where each cycle delivers a functional vertical slice of the architecture while preserving formal phase gates.

### Analysis & Justification
- **Waterfall Evaluation:** Unsuitable. Arogyavajra requires concurrent refinement of frontend contracts with backend services; strict sequential Waterfall prevents early integration testing and risk discovery.
- **Agile Scrum Evaluation:** Incomplete fit for academic evaluation. Pure Agile avoids upfront comprehensive documentation and fixed academic milestone commitments, conflicting with GTU semester syllabus requirements.
- **Selected Model:** **Iterative Incremental Model (with Modular Vertical Slices)**.
  - *Reason for Selection:* Allows the core database schema and authentication to stabilize first (Increment 1), followed by core domains: Patients & Doctors (Increment 2), Appointments & Clinical Notes (Increment 3), Billing & Invoices (Increment 4), and Role Dashboards & System Stabilization (Increment 5). Each increment produces tested, executable code while maintaining formal architectural documentation.

### Development Phases & Deliverables
1. **Phase 1: Inception & Specification (Completed):** PRD, TRD, Database Schema, and Architecture Contract.
2. **Phase 2: Architectural Foundation & Core Data Model (Completed):** Docker setup, PostgreSQL engine, SQLAlchemy declarative models, Alembic migrations, JWT Auth.
3. **Phase 3: Domain Implementation & API Services (Completed):** Patient, Doctor, Appointment, Medical Record, Prescription, and Invoice backend engines with 48 passing unit tests.
4. **Phase 4: Client Application & Role Dashboards (In Progress):** Next.js App router screens, form validations, data tables, and client route guards.
5. **Phase 5: Verification, Hardening & Documentation (In Progress):** E2E test resolution, TypeScript strict type refinement, and SPM practical dossier generation.
6. **Phase 6: Deployment & Academic Project Closure (Planned):** Final packaging, Docker deployment verification, project closure report.

## 3. Tables
### SDLC Model Comparison Matrix
| Evaluation Criteria | Weight | Waterfall | Pure Agile Scrum | Spiral | Iterative Incremental (Selected) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Requirement Stability | High | High (Poor adaptability) | High (Welcomes churn) | Moderate | **Optimal (Stable core, modular features)** |
| Academic Milestone Fit | High | High | Low (Difficult tracking) | Moderate | **High (Formal stage-gate deliverables)** |
| Early Working Prototype | Medium | Poor (Late delivery) | Excellent | Good | **High (Working slices per increment)** |
| Risk Management | High | Poor | Moderate | Highest (High overhead) | **High (Risks mitigated early in slices)** |
| Development Team Size | Medium | Suitable for large | Best for 5-9 | Overkill for small | **Optimal for 1-4 student developers** |
| Total Suitability Score | 100% | 55% | 70% | 75% | **92% (Selected)** |

## 4. Current Status
- Selected Model: Iterative Incremental Model
- Active Phase: Phase 4 & Phase 5 (Frontend Integration, Type Hardening & SPM Documentation Maintenance).

## 5. Assumptions / Missing Information
- Precise Sprint/Iteration Duration: Standardized to 1-week academic iterations.
