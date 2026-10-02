/**
 * Authentication API methods matching backend contract.
 */

import { apiClient } from "./client";
import {
  APIResponse,
  AuthData,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  SimpleMessageResponse,
  TokenResponse,
  User,
  UserResponse,
} from "./types";

export async function loginApi(credentials: LoginInput): Promise<AuthData> {
  const response = await apiClient<APIResponse<AuthData>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return response.data;
}

export async function registerApi(data: RegisterInput): Promise<AuthData> {
  const response = await apiClient<APIResponse<AuthData>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function refreshApi(refreshToken: string): Promise<TokenResponse> {
  const response = await apiClient<APIResponse<TokenResponse>>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return response.data;
}

export async function getCurrentUserApi(): Promise<User> {
  const response = await apiClient<APIResponse<UserResponse>>("/auth/me", {
    method: "GET",
  });
  return response.data;
}

export async function logoutApi(): Promise<void> {
  await apiClient<SimpleMessageResponse>("/auth/logout", {
    method: "POST",
  });
}

export async function changePasswordApi(data: ChangePasswordInput): Promise<void> {
  await apiClient<SimpleMessageResponse>("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
