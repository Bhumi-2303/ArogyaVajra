/**
 * TypeScript types for API payloads and authentication state.
 */

export type UserRole =
  | "PATIENT"
  | "DOCTOR"
  | "RECEPTIONIST"
  | "BILLING_STAFF"
  | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  last_login_at?: string | null;
}

export interface UserUpdateInput {
  role?: UserRole;
  is_active?: boolean;
}

export interface UserListResponse {
  data: User[];
  pagination: PaginationMeta;
  message: string;
}

export interface UserDetailResponse {
  data: User;
  message: string;
}

export interface UserSearchParams {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export type TokenResponse = AuthTokens;
export type UserResponse = User;

export interface AuthData {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface APIResponse<T> {
  data: T;
  message: string;
}

export interface SimpleMessageResponse {
  message: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  role?: UserRole;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}

export interface Patient {
  id: string;
  user_id: string;
  patient_code: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone: string;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  created_at: string;
  updated_at: string;
  email?: string | null;
}

export interface PatientCreateInput {
  email?: string;
  password?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone: string;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
}

export interface PatientUpdateInput {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PatientListResponse {
  data: Patient[];
  pagination: PaginationMeta;
  message: string;
}

export interface PatientDetailResponse {
  data: Patient;
  message: string;
}

export interface PatientSubresourceListResponse<T = unknown> {
  data: T[];
  message: string;
}

export interface PatientSearchParams {
  search?: string;
  code?: string;
  name?: string;
  phone?: string;
  email?: string;
  page?: number;
  page_size?: number;
}

export interface Doctor {
  id: string;
  user_id: string;
  doctor_code: string;
  first_name: string;
  last_name: string;
  specialization: string;
  qualification?: string | null;
  license_number?: string | null;
  phone?: string | null;
  consultation_fee: number;
  bio?: string | null;
  created_at: string;
  updated_at: string;
  email?: string | null;
  is_active: boolean;
}

export interface DoctorCreateInput {
  email?: string;
  password?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  specialization: string;
  qualification?: string | null;
  license_number?: string | null;
  phone?: string | null;
  consultation_fee?: number;
  bio?: string | null;
}

export interface DoctorUpdateInput {
  first_name?: string;
  last_name?: string;
  specialization?: string;
  qualification?: string | null;
  license_number?: string | null;
  phone?: string | null;
  consultation_fee?: number;
  bio?: string | null;
  is_active?: boolean;
}

export interface DoctorListResponse {
  data: Doctor[];
  pagination: PaginationMeta;
  message: string;
}

export interface DoctorDetailResponse {
  data: Doctor;
  message: string;
}

export interface DoctorSearchParams {
  search?: string;
  specialization?: string;
  code?: string;
  name?: string;
  email?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorAvailabilityCreateInput {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active?: boolean;
}

export interface DoctorAvailabilityUpdateInput {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  is_active?: boolean;
}

export interface DoctorAvailabilityListResponse {
  data: DoctorAvailability[];
  message: string;
}

export interface DoctorAvailabilityDetailResponse {
  data: DoctorAvailability;
  message: string;
}

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  id: string;
  appointment_code: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason?: string | null;
  status: AppointmentStatus;
  notes?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface AuditLogSearchParams {
  user_id?: string;
  entity_type?: string;
  entity_id?: string;
  action?: string;
  page?: number;
  page_size?: number;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  pagination: PaginationMeta;
  message: string;
}

export interface AppointmentCreateInput {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason?: string | null;
  notes?: string | null;
}

export interface AppointmentUpdateInput {
  status?: AppointmentStatus;
  notes?: string | null;
  reason?: string | null;
}

export interface AppointmentListResponse {
  data: Appointment[];
  pagination: PaginationMeta;
  message: string;
}

export interface AppointmentDetailResponse {
  data: Appointment;
  message: string;
}

export interface AppointmentSearchParams {
  patient_id?: string;
  doctor_id?: string;
  date?: string;
  status?: AppointmentStatus;
  page?: number;
  page_size?: number;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string | null;
  record_date: string;
  chief_complaint?: string | null;
  clinical_notes?: string | null;
  diagnosis?: string | null;
  treatment_notes?: string | null;
  follow_up_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecordCreateInput {
  patient_id: string;
  doctor_id: string;
  appointment_id?: string | null;
  record_date: string;
  chief_complaint?: string | null;
  clinical_notes?: string | null;
  diagnosis?: string | null;
  treatment_notes?: string | null;
  follow_up_date?: string | null;
}

export interface MedicalRecordUpdateInput {
  chief_complaint?: string | null;
  clinical_notes?: string | null;
  diagnosis?: string | null;
  treatment_notes?: string | null;
  follow_up_date?: string | null;
}

export interface MedicalRecordListResponse {
  data: MedicalRecord[];
  pagination: PaginationMeta;
  message: string;
}

export interface MedicalRecordDetailResponse {
  data: MedicalRecord;
  message: string;
}

export interface MedicalRecordSearchParams {
  patient_id?: string;
  doctor_id?: string;
  appointment_id?: string;
  page?: number;
  page_size?: number;
}

export type PrescriptionStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface PrescriptionItem {
  id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string | null;
  instructions?: string | null;
}

export interface PrescriptionItemCreateInput {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string | null;
  instructions?: string | null;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string | null;
  prescription_date: string;
  instructions?: string | null;
  status: PrescriptionStatus;
  created_at: string;
  updated_at: string;
  items: PrescriptionItem[];
}

export interface PrescriptionCreateInput {
  patient_id: string;
  doctor_id: string;
  appointment_id?: string | null;
  prescription_date: string;
  instructions?: string | null;
  status: PrescriptionStatus;
  items: PrescriptionItemCreateInput[];
}

export interface PrescriptionUpdateInput {
  instructions?: string | null;
  status?: PrescriptionStatus;
  items?: PrescriptionItemCreateInput[];
}

export interface PrescriptionListResponse {
  data: Prescription[];
  pagination: PaginationMeta;
  message: string;
}

export interface PrescriptionDetailResponse {
  data: Prescription;
  message: string;
}

export interface PrescriptionSearchParams {
  patient_id?: string;
  doctor_id?: string;
  appointment_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";

export type PaymentMethod = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER";

export interface Payment {
  id: string;
  invoice_id: string;
  amount: string | number;
  payment_method: PaymentMethod;
  reference?: string | null;
  created_by: string;
  created_at: string;
}

export interface PaymentCreateInput {
  amount: number;
  payment_method: PaymentMethod;
  reference?: string | null;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: string | number;
  unit_price: string | number;
  amount: string | number;
}

export interface InvoiceItemCreateInput {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  appointment_id?: string | null;
  invoice_date: string;
  subtotal: string | number;
  discount: string | number;
  tax: string | number;
  total: string | number;
  paid_amount: string | number;
  balance: string | number;
  status: InvoiceStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  items: InvoiceItem[];
  payments: Payment[];
}

export interface InvoiceCreateInput {
  patient_id: string;
  appointment_id?: string | null;
  invoice_date: string;
  discount?: number;
  tax?: number;
  status: InvoiceStatus;
  items: InvoiceItemCreateInput[];
}

export interface InvoiceUpdateInput {
  status: InvoiceStatus;
}

export interface InvoiceListResponse {
  data: Invoice[];
  pagination: PaginationMeta;
  message: string;
}

export interface InvoiceDetailResponse {
  data: Invoice;
  message: string;
}

export interface InvoiceSearchParams {
  patient_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

