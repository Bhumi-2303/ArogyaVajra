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
  last_login_at?: string | null;
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

