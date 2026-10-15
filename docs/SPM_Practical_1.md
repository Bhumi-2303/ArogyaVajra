Enrollment No. : 230840116003

# PRACTICAL:- 1 

**AIM :** To select the project title and assign requirement engineering to the project title. 

**1. Selected Project :** 
**Project Name:** Arogyavajra (आरोग्यवज्र) - The Indomitable Shield for Healthcare Management

**2. Objectives :** 
* To build a centralized, secure, role-based healthcare management platform connecting patients, healthcare professionals, and staff.
* To protect patient data privacy while empowering patients with visibility into their health records and billing.
* To streamline appointment booking and prevent double-booking.
* To maintain an immutable audit log for sensitive operations to ensure auditable integrity.
* To provide clinical utility with a strict separation between presentation, business logic, and relational persistence.

**3. Technology Used :** 

| Component | Technology |
| :--- | :--- |
| Frontend Framework | Next.js 14+ (App Router) |
| Frontend Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend Framework | FastAPI |
| Backend Language | Python 3.12+ |
| Database | PostgreSQL 16+ |
| ORM | SQLAlchemy 2.0 + Alembic |
| Authentication | JWT + Bcrypt |

**4. Requirement Engineering :**

**5. Functional Requirements :** 
Functional requirements describe what the PROJECT should do.

| ID | Requirement |
| :--- | :--- |
| FR1 | System must allow users to register and login with specific roles (Patient, Doctor, Admin, Receptionist, Billing). |
| FR2 | Patients must be able to view doctor availability and book appointments. |
| FR3 | Doctors must be able to view their assigned appointment queues and authorized patient history. |
| FR4 | System must allow doctors to create consultation notes and issue digital prescriptions. |
| FR5 | Billing staff must be able to generate itemized invoices and record offline payments. |
| FR6 | System must prevent double-booking of doctors for the same time slot. |
| FR7 | Administrators must be able to manage staff accounts and assign roles. |

**6. Non-Functional Requirements :**
Non-functional requirements describe how effectively the system should operate.

| ID | Requirement |
| :--- | :--- |
| NFR1 | **Security:** System must use cryptographically verified sessions (JWT) and hash passwords (Bcrypt). |
| NFR2 | **Privacy:** Strict Role-Based Access Control (RBAC) ensuring users only access authorized data. |
| NFR3 | **Auditability:** System must maintain an immutable audit trail for sensitive mutations. |
| NFR4 | **Architecture:** Must follow a Modular Monolith architecture for strict separation of concerns. |
| NFR5 | **Usability:** Must have a calm, high-legibility clinical aesthetic for healthcare settings. |

**7. Requirement Engineering Activities :**

| Activity | Work Performed |
| :--- | :--- |
| Requirements Elicitation | Identified stakeholders (Patients, Doctors, Staff) and defined the MVP scope for clinical operations. |
| Requirements Analysis | Analyzed end-to-end workflows from registration to billing and defined strict RBAC boundaries. |
| Requirements Specification | Documented Functional and Non-Functional requirements in PRD and TRD documents. |
| Requirements Validation | Reviewed requirements against the core principle of maintaining clinical calm and data integrity. |

**8. Assignment of Activities :**

| Member/Role | Responsibility |
| :--- | :--- |
| Member 1 / Project Manager | Project Management & Requirement Engineering |
| Member 2 / Frontend Dev | Frontend Architecture & Next.js Implementation |
| Member 3 / Backend Dev | Backend API Design (FastAPI) & Database Schema |
| Member 4 / DevOps & Sec | Security, Authentication & Deployment (Docker) |

**9. Major Modules :**

*(Insert Flowchart Image Here)*
1. User Authentication Module
2. Role-Based Dashboard Module
3. Patient & Doctor Registration Module
4. Appointment Booking Module
5. Consultation & Medical Records Module
6. Billing & Invoicing Module

**10. Result :** 
The project title "Arogyavajra" was successfully selected. The requirement engineering process was completed by identifying the objectives, technology stack, functional and non-functional requirements, and major modules of the project.
