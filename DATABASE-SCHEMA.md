# DATABASE-SCHEMA.md

## Arogyavajra Database and Persistence Specification

This document provides the authoritative database design and persistence rules for **Arogyavajra**, derived from `docs/TRD.md` (Sections 12–16) and `docs/AGENT.md` (Section 8).

> **Rule**: Do not invent domain tables or fields. PostgreSQL 16+ is the authoritative persistence source of truth.

---

## 1. Technical Standards and Conventions

1. **Engine**: PostgreSQL 16+.
2. **Primary Keys**: Universal UUID primary keys (`UUID(as_uuid=True)` in SQLAlchemy, `gen_random_uuid()` or client-side v4).
3. **Timestamps**: Timezone-aware timestamps (`TIMESTAMPTZ` / `DateTime(timezone=True)`).
   - `created_at`: `TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()`
   - `updated_at`: `TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()` (updated via application / trigger)
4. **Monetary Values**: Exact decimals (`NUMERIC(10, 2)`). Never use floating-point types for currency or billing totals.
5. **Enums**: Native PostgreSQL enums or SQLAlchemy string-backed enums with uppercase values.
6. **Foreign Keys**: Explicit foreign key constraints preserving referential integrity.
7. **Constraint Naming Convention**:
   - Primary Keys: `pk_%(table_name)s`
   - Foreign Keys: `fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s`
   - Unique Constraints: `uq_%(table_name)s_%(column_0_name)s`
   - Check Constraints: `ck_%(table_name)s_%(constraint_name)s`
   - Indexes: `ix_%(column_0_label)s`

---

## 2. Entity Specifications (MVP Entities)

### 2.1 `users`
Core authentication and role entity.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login and notification email |
| `password_hash` | TEXT | NOT NULL | Secure salted password hash (Argon2 / bcrypt) |
| `role` | ENUM | NOT NULL | One of: `PATIENT`, `DOCTOR`, `RECEPTIONIST`, `BILLING_STAFF`, `ADMIN` |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | User active flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record update timestamp |
| `last_login_at` | TIMESTAMPTZ | NULLABLE | Last successful authentication |

---

### 2.2 `patient_profiles`
Patient demographic and clinical contact records.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique profile identifier |
| `user_id` | UUID | FK → `users.id`, UNIQUE, NOT NULL | Associated user account |
| `patient_code` | VARCHAR(32) | UNIQUE, NOT NULL | Human-readable patient ID (e.g., `PAT-00001`) |
| `first_name` | VARCHAR(100) | NOT NULL | First name |
| `last_name` | VARCHAR(100) | NOT NULL | Last name |
| `date_of_birth` | DATE | NULLABLE | Birth date |
| `gender` | VARCHAR(20) | NULLABLE | Gender |
| `phone` | VARCHAR(20) | NULLABLE | Primary phone number |
| `address` | TEXT | NULLABLE | Residential address |
| `emergency_contact_name` | VARCHAR(100) | NULLABLE | Emergency contact person |
| `emergency_contact_phone` | VARCHAR(20) | NULLABLE | Emergency contact phone |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record update timestamp |

---

### 2.3 `doctor_profiles`
Doctor clinical profiles and credentials.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique doctor identifier |
| `user_id` | UUID | FK → `users.id`, UNIQUE, NOT NULL | Associated user account |
| `doctor_code` | VARCHAR(32) | UNIQUE, NOT NULL | Human-readable doctor code (e.g., `DOC-00001`) |
| `first_name` | VARCHAR(100) | NOT NULL | First name |
| `last_name` | VARCHAR(100) | NOT NULL | Last name |
| `specialization` | VARCHAR(100) | NOT NULL | Medical specialty |
| `qualification` | VARCHAR(100) | NULLABLE | Degree / qualifications |
| `license_number` | VARCHAR(50) | UNIQUE, NULLABLE | Medical council license number |
| `phone` | VARCHAR(20) | NULLABLE | Doctor contact number |
| `consultation_fee` | NUMERIC(10, 2) | NOT NULL, DEFAULT 0.00 | Standard consultation charge |
| `bio` | TEXT | NULLABLE | Professional summary |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record update timestamp |

---

### 2.4 `doctor_availability`
Weekly recurring schedule definitions for appointment slot generation.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Schedule slot identifier |
| `doctor_id` | UUID | FK → `doctor_profiles.id`, NOT NULL | Doctor reference |
| `day_of_week` | SMALLINT | NOT NULL | Day index (`0` = Sunday .. `6` = Saturday or `1` = Monday .. `7` = Sunday) |
| `start_time` | TIME | NOT NULL | Slot window start |
| `end_time` | TIME | NOT NULL | Slot window end |
| `slot_duration_minutes` | INTEGER | NOT NULL | Individual appointment slot duration (e.g. 15, 30) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Slot active flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Update timestamp |

**Check Constraints**:
- `start_time < end_time`
- `slot_duration_minutes > 0`
- `day_of_week` within valid range `[0, 6]`

---

### 2.5 `appointments`
Clinical bookings connecting patients and doctors.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Appointment identifier |
| `appointment_code` | VARCHAR(32) | UNIQUE, NOT NULL | Human-readable appointment code (e.g., `APT-00001`) |
| `patient_id` | UUID | FK → `patient_profiles.id`, NOT NULL | Booking patient |
| `doctor_id` | UUID | FK → `doctor_profiles.id`, NOT NULL | Assigned doctor |
| `appointment_date` | DATE | NOT NULL | Date of consultation |
| `start_time` | TIME | NOT NULL | Scheduled start time |
| `end_time` | TIME | NOT NULL | Scheduled end time |
| `reason` | TEXT | NULLABLE | Patient consultation reason |
| `status` | ENUM | NOT NULL | `SCHEDULED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |
| `notes` | TEXT | NULLABLE | Clinical or scheduling remarks |
| `created_by` | UUID | FK → `users.id`, NOT NULL | User who created booking |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Update timestamp |

---

### 2.6 `medical_records`
EMR clinical documentation.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Record identifier |
| `patient_id` | UUID | FK → `patient_profiles.id`, NOT NULL | Patient reference |
| `doctor_id` | UUID | FK → `doctor_profiles.id`, NOT NULL | Attending doctor |
| `appointment_id` | UUID | FK → `appointments.id`, NULLABLE | Linked appointment if applicable |
| `record_date` | DATE | NOT NULL | Encounter date |
| `chief_complaint` | TEXT | NULLABLE | Primary symptoms reported |
| `clinical_notes` | TEXT | NULLABLE | Physical examination and observations |
| `diagnosis` | TEXT | NULLABLE | Clinical diagnosis |
| `treatment_notes` | TEXT | NULLABLE | Treatment provided or plan |
| `follow_up_date` | DATE | NULLABLE | Recommended follow-up date |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Update timestamp |

---

### 2.7 `prescriptions`
Prescription header entity.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Prescription identifier |
| `patient_id` | UUID | FK → `patient_profiles.id`, NOT NULL | Patient reference |
| `doctor_id` | UUID | FK → `doctor_profiles.id`, NOT NULL | Prescribing doctor |
| `appointment_id` | UUID | FK → `appointments.id`, NULLABLE | Linked appointment |
| `prescription_date` | DATE | NOT NULL | Issuing date |
| `instructions` | TEXT | NULLABLE | General guidance (diet, fluids, precautions) |
| `status` | ENUM | NOT NULL | `ACTIVE`, `COMPLETED`, `CANCELLED` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Update timestamp |

---

### 2.8 `prescription_items`
Individual medication line items in a prescription.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Item identifier |
| `prescription_id` | UUID | FK → `prescriptions.id`, NOT NULL | Parent prescription |
| `medicine_name` | VARCHAR(200) | NOT NULL | Medication name |
| `dosage` | VARCHAR(100) | NOT NULL | Dosage strength (e.g. `500mg`) |
| `frequency` | VARCHAR(100) | NOT NULL | Administration schedule (e.g. `1-0-1`, `TDS`) |
| `duration` | VARCHAR(100) | NOT NULL | Course duration (e.g. `5 days`) |
| `route` | VARCHAR(50) | NULLABLE | Route (e.g. `Oral`, `Topical`, `IV`) |
| `instructions` | TEXT | NULLABLE | Specific medicine notes (e.g. `After food`) |

---

### 2.9 `invoices`
Billing invoice header.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Invoice identifier |
| `invoice_number` | VARCHAR(32) | UNIQUE, NOT NULL | Human-readable invoice number (e.g., `INV-00001`) |
| `patient_id` | UUID | FK → `patient_profiles.id`, NOT NULL | Billing patient |
| `appointment_id` | UUID | FK → `appointments.id`, NULLABLE | Linked appointment |
| `invoice_date` | DATE | NOT NULL | Issue date |
| `subtotal` | NUMERIC(10, 2) | NOT NULL | Sum of item amounts |
| `discount` | NUMERIC(10, 2) | NOT NULL, DEFAULT 0.00 | Total discount applied |
| `tax` | NUMERIC(10, 2) | NOT NULL, DEFAULT 0.00 | Total tax applied |
| `total` | NUMERIC(10, 2) | NOT NULL | Net total (`subtotal - discount + tax`) |
| `status` | ENUM | NOT NULL | `DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `CANCELLED` |
| `created_by` | UUID | FK → `users.id`, NOT NULL | User who issued invoice |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Update timestamp |

---

### 2.10 `invoice_items`
Detailed line items for services, consultations, and medications billed.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Line item identifier |
| `invoice_id` | UUID | FK → `invoices.id`, NOT NULL | Parent invoice |
| `description` | TEXT | NOT NULL | Item or service description |
| `quantity` | NUMERIC(10, 2) | NOT NULL, DEFAULT 1.00 | Units billed |
| `unit_price` | NUMERIC(10, 2) | NOT NULL | Price per unit |
| `amount` | NUMERIC(10, 2) | NOT NULL | Calculated line total (`quantity * unit_price`) |

---

### 2.11 `payments`
Recorded financial transactions against invoices.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Payment identifier |
| `invoice_id` | UUID | FK → `invoices.id`, NOT NULL | Targeted invoice |
| `amount` | NUMERIC(10, 2) | NOT NULL | Amount paid |
| `payment_method` | ENUM | NOT NULL | `CASH`, `CARD`, `UPI`, `BANK_TRANSFER`, `OTHER` |
| `payment_reference` | VARCHAR(100) | NULLABLE | Transaction reference / UPI ID / receipt ID |
| `paid_at` | TIMESTAMPTZ | NOT NULL | Transaction occurrence timestamp |
| `recorded_by` | UUID | FK → `users.id`, NOT NULL | Staff user who recorded payment |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

---

### 2.12 `audit_logs`
Immutable compliance and access audit trail.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Audit event identifier |
| `user_id` | UUID | FK → `users.id`, NULLABLE | Acting user (null for system events) |
| `action` | VARCHAR(100) | NOT NULL | Action executed (e.g., `CREATE`, `UPDATE`, `LOGIN`, `STATUS_CHANGE`) |
| `entity_type` | VARCHAR(100) | NOT NULL | Affected entity (e.g., `appointment`, `patient_profile`) |
| `entity_id` | VARCHAR(100) | NULLABLE | Primary key string of affected entity |
| `old_values` | JSONB | NULLABLE | State before mutation |
| `new_values` | JSONB | NULLABLE | State after mutation |
| `ip_address` | VARCHAR(45) | NULLABLE | Client IPv4/IPv6 address |
| `user_agent` | TEXT | NULLABLE | Client user agent string |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Occurrence timestamp |

---

## 3. Relationships and Cardinality

```text
users
 ├─────────────── patient_profiles (1:1)
 │                       │
 │                       ├──── appointments (1:N)
 │                       ├──── medical_records (1:N)
 │                       ├──── prescriptions (1:N)
 │                       └──── invoices (1:N)
 │
 └─────────────── doctor_profiles (1:1)
                         │
                         ├──── doctor_availability (1:N)
                         ├──── appointments (1:N)
                         ├──── medical_records (1:N)
                         └──── prescriptions (1:N)

prescriptions
 └──── prescription_items (1:N, cascade delete)

invoices
 ├──── invoice_items (1:N, cascade delete)
 └──── payments (1:N)

users
 └──── audit_logs (1:N)
```

---

## 4. Key Performance Indexes

```sql
-- Users
CREATE INDEX ix_users_email ON users(email);
CREATE INDEX ix_users_role ON users(role);

-- Patients
CREATE INDEX ix_patient_profiles_patient_code ON patient_profiles(patient_code);
CREATE INDEX ix_patient_profiles_phone ON patient_profiles(phone);

-- Doctors
CREATE INDEX ix_doctor_profiles_doctor_code ON doctor_profiles(doctor_code);
CREATE INDEX ix_doctor_profiles_specialization ON doctor_profiles(specialization);

-- Appointments
CREATE INDEX ix_appointments_patient_id ON appointments(patient_id);
CREATE INDEX ix_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX ix_appointments_appointment_date ON appointments(appointment_date);
CREATE INDEX ix_appointments_status ON appointments(status);

-- Medical Records
CREATE INDEX ix_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX ix_medical_records_doctor_id ON medical_records(doctor_id);

-- Prescriptions
CREATE INDEX ix_prescriptions_patient_id ON prescriptions(patient_id);

-- Invoices & Payments
CREATE INDEX ix_invoices_patient_id ON invoices(patient_id);
CREATE INDEX ix_invoices_status ON invoices(status);
CREATE INDEX ix_payments_invoice_id ON payments(invoice_id);

-- Audit Logs
CREATE INDEX ix_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX ix_audit_logs_entity_lookup ON audit_logs(entity_type, entity_id);
```

---

## 5. Transaction Safety Requirements

Multi-write operations must execute in atomic database transactions:
1. **Patient Registration**: `users` row + `patient_profiles` row in a single atomic transaction.
2. **Doctor Registration**: `users` row + `doctor_profiles` row in a single atomic transaction.
3. **Prescription Issuance**: `prescriptions` header + `prescription_items` lines in a single atomic transaction.
4. **Billing Generation**: `invoices` header + `invoice_items` lines in a single atomic transaction.
5. **Payment Recording**: Insert `payments` row + update `invoices.status` atomically.
