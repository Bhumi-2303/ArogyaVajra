# DOCUMENT 06 — PROJECT SCHEDULE

## 1. Purpose
The Project Schedule establishes the operational timeline, task dependencies, milestone commitments, and completion percentages based on the authoritative Work Breakdown Structure (WBS).

## 2. Project-Specific Content
The project initiated development on **2026-10-02** (Git Commit `7799a7a`). Planned duration is calibrated for an academic semester timeframe.

## 3. Tables
### Milestone Schedule
| Milestone ID | Milestone Description | Target Date | Actual Date | Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| M1 | Requirements & Specification Baselined | 2026-10-02 | 2026-10-02 | Completed | PRD.md, TRD.md, APP-FLOW.md committed |
| M2 | Relational Schema & Architecture Baselined | 2026-10-02 | 2026-10-02 | Completed | DATABASE-SCHEMA.md & Docker compose active |
| M3 | Core Backend API & DB Slices Complete | 2026-10-03 | 2026-10-03 | Completed | 48 unit tests passing across all domain services |
| M4 | Role Dashboards & Frontend Integration | [TO BE PROVIDED] | - | In Progress | All 5 role dashboards functional with zero TS errors |
| M5 | Multi-Tier Verification & Test Sign-off | [TO BE PROVIDED] | - | In Progress | E2E test execution passing against live DB |
| M6 | Final Academic Submission & GTU Viva | [TO BE PROVIDED] | - | Planned | Final documentation package & demo sign-off |

### Detailed Project Schedule
| Task ID | Task Description | Dependency | Duration (Days) | Start Date | End Date | Status | % Done | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| T-101 | Clinical Requirements & Scope Definition | None | 2 | 2026-10-02 | 2026-10-02 | Completed | 100% | Bhavini Chauhan |
| T-102 | Relational Schema & Migration Design | T-101 | 2 | 2026-10-02 | 2026-10-02 | Completed | 100% | Bhavini Chauhan |
| T-103 | FastAPI Core, Auth & JWT Engine | T-102 | 2 | 2026-10-02 | 2026-10-02 | Completed | 100% | Bhavini Chauhan |
| T-104 | Patient & Doctor Domain Implementation | T-103 | 2 | 2026-10-02 | 2026-10-03 | Completed | 100% | Bhavini Chauhan |
| T-105 | Appointment Booking & Conflict Logic | T-104 | 2 | 2026-10-03 | 2026-10-03 | Completed | 100% | Bhavini Chauhan |
| T-106 | Consultation Notes & Prescription Builder | T-105 | 2 | 2026-10-03 | 2026-10-03 | Completed | 100% | Bhavini Chauhan |
| T-107 | Billing, Invoicing & Sequence Lock | T-106 | 2 | 2026-10-03 | 2026-10-03 | Completed | 100% | Bhavini Chauhan |
| T-108 | Offline Payment & Audit Logging Subsystem| T-107 | 1 | 2026-10-03 | 2026-10-03 | Completed | 100% | Bhavini Chauhan |
| T-109 | Next.js Shell & Shared UI Components | T-103 | 2 | 2026-10-02 | 2026-10-03 | Completed | 100% | Bhavini Chauhan |
| T-110 | Role-Based Dashboards (5 Roles) | T-108, T-109 | 4 | 2026-10-03 | [TO BE PROVIDED] | In Progress | 70% | Bhavini Chauhan |
| T-111 | Automated Testing (Unit & Integration) | T-108 | 3 | 2026-10-03 | [TO BE PROVIDED] | In Progress | 65% | Bhavini Chauhan |
| T-112 | Continuous SPM Documentation Dossier | T-101 | Ongoing | 2026-10-04 | [TO BE PROVIDED] | In Progress | 75% | Bhavini Chauhan |
| T-113 | Deployment Build & GTU Submission Package | T-110, T-111 | 2 | [TO BE PROVIDED] | [TO BE PROVIDED] | Planned | 0% | Bhavini Chauhan |

## 4. Current Status
- Schedule State: On Track for academic milestones.
- Completed Tasks: T-101 through T-109.
- Current Active Tasks: T-110, T-111, T-112.

## 5. Assumptions / Missing Information
- Expected Final Completion Date: [TO BE PROVIDED] (Semester submission calendar required).
