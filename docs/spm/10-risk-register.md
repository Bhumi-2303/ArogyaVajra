# DOCUMENT 10 — RISK REGISTER

## 1. Purpose
The Risk Register identifies, analyzes, categorizes, prioritizes, and outlines mitigation strategies for potential future uncertainties that could adversely impact project schedule, security, architecture, or quality.

## 2. Project-Specific Content
Risks are scored using standard risk scoring: $\text{Risk Score} = \text{Probability (1-5)} \times \text{Impact (1-5)}$. Priority is assigned as Critical (20-25), High (12-19), Medium (6-11), or Low (1-5).

## 3. Tables
### Risk Register
| Risk ID | Risk Description | Category | Root Cause | Prob (1-5) | Imp (1-5) | Score | Priority | Preventive Action | Mitigation Strategy | Contingency Plan | Owner | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R-01 | Tight semester schedule vs full-stack scope | Schedule | Full-stack monorepo with 5 distinct role portals | 3 | 4 | 12 | High | Strict MVP scope definition; eliminate non-core features (AI, telehealth) | Prioritize core OPD workflow (Auth -> Booking -> Rx -> Bill) | Defer advanced dashboard charts if needed | Bhavini Chauhan | Mitigated |
| R-02 | Role escalation and privacy violation | Security | Client-side role claims tampering | 2 | 5 | 10 | Medium | Never trust client tokens or headers; enforce RBAC in FastAPI dependencies | Authoritative server-side DB role check | Immediate session revocation & audit flag | Bhavini Chauhan | Mitigated |
| R-03 | Appointment double-booking under load | Technical | Concurrency between concurrent booking requests | 3 | 4 | 12 | High | PostgreSQL unique constraint on `(doctor_id, start_time)` | Database-level lock and transaction rollback | Return HTTP 409 Conflict with friendly message | Bhavini Chauhan | Mitigated |
| R-04 | Invoice number race condition | Technical | Concurrent invoice generation for multiple OPD bills | 3 | 4 | 12 | High | Use dedicated PostgreSQL sequence generator rather than MAX()+1 | Migration `d6812f3` introduced atomic sequence | Resync sequence if gaps occur | Bhavini Chauhan | Mitigated |
| R-05 | Client-backend contract divergence | Integration | Independent development of frontend DTOs and API schemas | 3 | 3 | 9 | Medium | Formalized `FRONTEND-BACKEND-CONTRACT.md` specification | Shared TypeScript types matching Pydantic schemas | Run automated verification scripts | Bhavini Chauhan | Mitigated |
| R-06 | Database connection failure in host test run| Environment| Discrepancy between Docker hostname `db` and `localhost` | 4 | 3 | 12 | High | Standardize environment config via `.env.example` | Pytest fixture fallback to `localhost` when outside Docker | Run test suite via Docker Compose | Bhavini Chauhan | In Progress |
| R-07 | Frontend TypeScript compilation regressions| Technical | Strict mode component prop mismatch in dashboard | 4 | 2 | 8 | Medium | Enable strict `tsc --noEmit` checks in pre-commit | Align icon/badge/button variant props with design system | Patch dashboard page components | Bhavini Chauhan | In Progress |

## 4. Current Status
- Total Risks Tracked: 7
- Mitigated: 5
- In Progress: 2 (R-06, R-07)
- Closed: 0

## 5. Assumptions / Missing Information
- Production cloud deployment risks: Not applicable for local academic evaluation.
