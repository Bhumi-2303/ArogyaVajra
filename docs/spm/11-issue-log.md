# DOCUMENT 11 — ISSUE / PROBLEM LOG

## 1. Purpose
The Issue / Problem Log records real, encountered defects, obstacles, and environmental failures during development. It tracks severity, root causes, corrective actions, and resolutions separately from prospective risks.

## 2. Project-Specific Content
Tracks verified engineering defects discovered during development, code review, test execution, or continuous integration.

## 3. Tables
### Issue Log
| Issue ID | Date Logged | Issue Summary | Affected Component | Severity | Priority | Root Cause | Action Taken | Owner | Status | Resolution Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ISS-01 | 2026-10-02 | User registration privilege escalation | Auth / Backend | Critical | Critical | `/api/v1/auth/register` accepted arbitrary `role` input from payload | Enforced `UserRole.PATIENT` default in register schema & handler (Commit `17bae4b`) | Bhavini Chauhan | Closed | 2026-10-02 |
| ISS-02 | 2026-10-02 | Role authorization inversion in billing | Services | High | High | Inverted role check allowed billing staff to access doctor availability overrides | Corrected permission evaluation matrix in billing service (Commit `391f106`) | Bhavini Chauhan | Closed | 2026-10-02 |
| ISS-03 | 2026-10-02 | Patient subresource endpoints returned mock data | Patient API | Medium | High | Router was not wired to live SQLAlchemy repository | Wired endpoints to transactional database sessions (Commit `440feee`) | Bhavini Chauhan | Closed | 2026-10-02 |
| ISS-04 | 2026-10-02 | Invoice number collision under concurrency | Database / DB | High | High | Invoice numbers derived via `COUNT(*)+1` leading to unique key violation | Created PostgreSQL sequence `invoice_number_seq` via Alembic migration (Commit `d6812f3`) | Bhavini Chauhan | Closed | 2026-10-02 |
| ISS-05 | 2026-10-03 | Missing Radix UI dependencies causing build break | Web UI | Medium | Medium | Missing `@radix-ui/react-slot` package in package.json | Installed missing Radix packages and added asChild button support (Commit `d362a22`) | Bhavini Chauhan | Closed | 2026-10-03 |
| ISS-06 | 2026-10-04 | Integration tests fail when run on host outside Docker | Backend Tests | Medium | High | `DATABASE_URL` in `.env` targets host `db` (Docker DNS), unresolvable on host machine | Update test configuration to dynamically resolve `localhost:5432` when outside Docker | Bhavini Chauhan | In Progress | [TO BE PROVIDED] |
| ISS-07 | 2026-10-04 | TypeScript errors (7) in dashboard pages | Web Dashboards | Medium | Medium | Icon components passed as JSX elements vs component types; button/badge variant mismatch | Refactor icon props to `<Icon />` and align button `variant="ghost"` | Bhavini Chauhan | In Progress | [TO BE PROVIDED] |

## 4. Current Status
- Total Issues: 7
- Closed: 5 (71%)
- Open / In Progress: 2 (ISS-06, ISS-07)

## 5. Assumptions / Missing Information
- Production hardware defect logs: Not Applicable.
