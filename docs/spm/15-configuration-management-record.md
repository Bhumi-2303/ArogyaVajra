# DOCUMENT 15 — CONFIGURATION / VERSION CONTROL RECORD

## 1. Purpose
The Configuration Management Record documents release baselines, repository branching conventions, tag milestones, and major engineering changes to ensure code integrity and reproducibility.

## 2. Project-Specific Content
- **Repository:** Git version control at local workspace `/home/bhumi/GitHub/ArogyaVajra`.
- **Primary Branch:** `main`.
- **Configuration Management Convention:** Semantic Versioning (SemVer) with Conventional Commits.

## 3. Tables
### Release & Major Change History
| Version / Tag | Release Date | Key Commit Range | Primary Changes Included | Affected Modules | Author | Release Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| v0.1.0-alpha | 2026-10-02 | `7799a7a`..`e066fe3` | Project scaffolding, Docker configuration, specifications | Infra, Docs | Bhavini Chauhan | Baselined |
| v0.2.0-alpha | 2026-10-02 | `2fb9d1a`..`f8e03f8` | SQLAlchemy 2.0 declarative base, Alembic migrations | Database Engine | Bhavini Chauhan | Baselined |
| v0.3.0-alpha | 2026-10-02 | `090e27a`..`4a95f86` | Auth API, JWT lifecycle, password hashing, tests | Auth / Security | Bhavini Chauhan | Baselined |
| v0.4.0-alpha | 2026-10-02 | `762ffc0`..`36cf620` | RBAC authorization engine, permission model | Core AuthZ | Bhavini Chauhan | Baselined |
| v0.5.0-alpha | 2026-10-02 | `3335976`..`4794c0b` | Patient, Doctor, and Admin user management API | Patients, Doctors| Bhavini Chauhan | Baselined |
| v0.6.0-beta | 2026-10-03 | `8b664b5`..`c2bf5c0` | Doctor availability and appointment booking domain | Scheduling | Bhavini Chauhan | Baselined |
| v0.7.0-beta | 2026-10-03 | `5c22538`..`d1106a5` | Medical records consultation and prescriptions | Clinical Domain | Bhavini Chauhan | Baselined |
| v0.8.0-beta | 2026-10-03 | `629dfa2`..`36adce2` | Billing, invoice generation, sequence, offline payments | Financial Domain| Bhavini Chauhan | Baselined |
| v0.9.0-rc1 | 2026-10-03 | `4cfe6ac`..`08330a5` | 5 role dashboards and audit log administrative viewer | Frontend Portals| Bhavini Chauhan | Baselined |
| v0.9.1-rc1 | 2026-10-03 | `17bae4b`..`d6812f3` | Security fix for registration escalation, DB sequence | Security, DB | Bhavini Chauhan | Baselined |
| v0.9.2-rc2 | 2026-10-04 | `0ade03c`..`07053d4` | State transition endpoints, table accessibility, UI fixes | API, Web Pages | Bhavini Chauhan | Baselined |

## 4. Current Status
- Current Git Revision: `07053d4` (HEAD -> main).
- Working Tree Status: Clean.

## 5. Assumptions / Missing Information
- Production Tag Signing (GPG): [TO BE PROVIDED] (Optional).
