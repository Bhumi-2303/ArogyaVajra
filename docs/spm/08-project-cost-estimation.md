# DOCUMENT 08 — PROJECT COST ESTIMATION

## 1. Purpose
This document provides empirical software cost and effort estimation for Arogyavajra using the standard Constructive Cost Model (COCOMO Basic) and itemized project expenditure budgeting suitable for academic evaluation.

## 2. Project-Specific Content
### Project Code Size Metrics (Empirical Count)
- **Python Backend Code:** 8,900 physical source lines (103 `.py` files).
- **TypeScript/TSX Frontend Code:** 15,051 physical source lines (96 `.ts` and `.tsx` files).
- **Total Application Code (Excluding dependencies & docs):** **23,951 LOC = 23.95 KLOC**.
- **Documentation & Specifications:** 10,184 lines (10 `.md` files).
- **Configuration & Shell Scripts:** 7,633 lines (JSON, MJS, YAML, SH).

### COCOMO Model Application
- **COCOMO Mode Selected:** **Organic Mode**.
  - *Justification:* Small team, thoroughly understood domain (hospital outpatient management), familiar development environment, and stable, well-defined specifications.
- **Model Constants (Organic Mode):**
  - $a_b = 2.4$
  - $b_b = 1.05$
  - $c_b = 2.5$
  - $d_b = 0.38$

### Effort & Duration Calculations
1. **Effort ($E$):**
   $$E = a_b \times (KLOC)^{b_b} = 2.4 \times (23.95)^{1.05}$$
   $$(23.95)^{1.05} = 28.028$$
   $$E = 2.4 \times 28.028 = \mathbf{67.27\text{ Person-Months (PM)}}$$

2. **Development Time ($T_{dev}$):**
   $$T_{dev} = c_b \times (E)^{d_b} = 2.5 \times (67.27)^{0.38}$$
   $$(67.27)^{0.38} = 4.945$$
   $$T_{dev} = 2.5 \times 4.945 = \mathbf{12.36\text{ Months}}$$

3. **Average Staffing ($SS$):**
   $$SS = \frac{E}{T_{dev}} = \frac{67.27}{12.36} = \mathbf{5.44\text{ Persons}}$$

4. **Academic Project Calibration Note:**
   - COCOMO calculates commercial industry-equivalent effort. For an undergraduate academic semester project, development velocity is accelerated through modern AI-assisted engineering and reusable frameworks (Next.js, FastAPI, Radix UI), compressing actual calendar duration to semester timelines.

## 3. Tables
### Estimated vs Actual Project Cost Breakdown
| Cost Category | Item Description | Estimated Cost (INR) | Actual Cost (INR) | Variance | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Development Labor** | Student Developer Effort (Academic evaluation) | ₹ 0.00 | ₹ 0.00 | ₹ 0.00 | Academic project labor (Industry equiv: ~₹ 3,50,000) |
| **Hardware** | Developer Workstation (Existing PC/Laptop) | ₹ 0.00 | ₹ 0.00 | ₹ 0.00 | Existing personal equipment |
| **Operating System & DB**| Linux OS, PostgreSQL 16 Enterprise | ₹ 0.00 | ₹ 0.00 | ₹ 0.00 | Open source (FOSS) |
| **Frameworks & Libs** | Next.js, FastAPI, Tailwind CSS, SQLAlchemy | ₹ 0.00 | ₹ 0.00 | ₹ 0.00 | Open source (MIT License) |
| **Development Tools** | VS Code / Cursor, Git, GitHub Free Tier | ₹ 0.00 | ₹ 0.00 | ₹ 0.00 | Free academic tier |
| **Cloud Hosting / VPS** | Local container deployment / Optional VPS | ₹ 1,500.00 | [TO BE PROVIDED]| - | Local Docker Compose used for demo |
| **Domain & SSL** | Not required for local / self-signed SSL | ₹ 0.00 | ₹ 0.00 | ₹ 0.00 | Localhost development |
| **Printing & Practical File**| GTU Academic Documentation Hardcopy | ₹ 1,200.00 | [TO BE PROVIDED]| - | Practical file printing at semester end |
| **Total Project Cost**| **Total Financial Outlay** | **₹ 2,700.00** | **₹ 0.00 (Current)**| - | Minimal financial cost due to open source stack |

## 4. Current Status
- Cost Estimation Status: Baseline Completed
- Financial Incurred to Date: ₹ 0.00 (Pure open-source stack and existing hardware).

## 5. Assumptions / Missing Information
- Commercial Labor Billing Rate: [TO BE PROVIDED] (If GTU examiner requests industry-equivalent cost estimation; benchmark standard is ₹ 35,000 / PM).
- Final Documentation Printing Cost: [TO BE PROVIDED] (At semester conclusion).
