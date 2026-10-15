# DOCUMENT 17 — PROJECT METRICS

## 1. Purpose
This document tracks quantitative software engineering metrics reflecting development velocity, quality, defect status, code size, and test coverage to facilitate objective project control.

## 2. Project-Specific Content
Metrics are empirically measured from repository files, git logs, and test execution reports.

## 3. Tables
### Quantitative Metric Dashboard
| Metric Category | Specific Indicator | Target Value | Measured Value | Data Source |
| :--- | :--- | :--- | :--- | :--- |
| **Scope & Tasks** | Total WBS Tasks | - | 26 | WBS (Doc 05) |
| | Tasks Completed | - | 20 | Schedule (Doc 06) |
| | Tasks In Progress | - | 4 | Schedule (Doc 06) |
| | Tasks Remaining (Planned) | - | 2 | Schedule (Doc 06) |
| | Task Completion Rate | > 70% | **76.9%** | Calculated |
| **Requirements** | Functional Requirements Defined | 14 | 14 | SRS (Doc 02) |
| | Requirements Implemented | 14 | 13 | RTM (Doc 14) |
| | Requirement Completion % | > 80% | **92.9%** | Calculated |
| **Code Volume** | Python Backend LOC | - | 8,900 | cloc / file analysis |
| | TypeScript / Frontend LOC | - | 15,051 | cloc / file analysis |
| | Total Application KLOC | - | **23.95 KLOC** | cloc / file analysis |
| | Documentation LOC | - | 10,184 | Markdown files |
| **Quality & QA** | Automated Unit Tests Passed | 100% | **48 / 48 (100%)** | Pytest execution |
| | Integration / E2E Tests | - | 27 (DB host pending)| Pytest execution |
| | Open Issues (Total) | 0 | 2 | Issue Log (Doc 11) |
| | Critical / Blocker Defects | 0 | **0** | Issue Log (Doc 11) |
| | Closed Defects | - | 5 | Issue Log (Doc 11) |
| | Defect Resolution Rate | > 60% | **71.4%** | Calculated |
| **Risk Metrics** | Total Identified Risks | - | 7 | Risk Register (Doc 10)|
| | Mitigated Risks | - | 5 | Risk Register (Doc 10)|
| | Active Risks | - | 2 | Risk Register (Doc 10)|

## 4. Current Status
- Metrics Status: Baselined and synchronized with project repository state as of 2026-10-04.

## 5. Assumptions / Missing Information
- Formal Defect Density per KLOC in Production: [TO BE PROVIDED] (Post-deployment).
