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
