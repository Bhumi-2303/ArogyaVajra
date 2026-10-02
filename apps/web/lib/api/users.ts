/**
 * Administrative User Management API client methods.
 */

import { apiClient } from "./client";
import {
  UserDetailResponse,
  UserListResponse,
  UserSearchParams,
  UserUpdateInput,
} from "./types";

/**
 * Fetch paginated list of users with optional filtering (search, role, active status).
 */
export async function getUsersApi(
  params?: UserSearchParams
): Promise<UserListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.set("page", params.page.toString());
  }
  if (params?.page_size) {
    searchParams.set("page_size", params.page_size.toString());
  }
  if (params?.search) {
    searchParams.set("search", params.search);
  }
  if (params?.role) {
    searchParams.set("role", params.role);
  }
  if (params?.is_active !== undefined) {
    searchParams.set("is_active", params.is_active.toString());
  }

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/users?${queryString}` : "/users";

  return apiClient<UserListResponse>(endpoint, {
    method: "GET",
  });
}

/**
 * Fetch a single user's detail by UUID.
 */
export async function getUserApi(userId: string): Promise<UserDetailResponse> {
  return apiClient<UserDetailResponse>(`/users/${userId}`, {
    method: "GET",
  });
}

/**
 * Update user role or account status.
 */
export async function updateUserApi(
  userId: string,
  data: UserUpdateInput
): Promise<UserDetailResponse> {
  return apiClient<UserDetailResponse>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Activate a user account.
 */
export async function activateUserApi(
  userId: string
): Promise<UserDetailResponse> {
  return apiClient<UserDetailResponse>(`/users/${userId}/activate`, {
    method: "POST",
  });
}

/**
 * Deactivate a user account.
 */
export async function deactivateUserApi(
  userId: string
): Promise<UserDetailResponse> {
  return apiClient<UserDetailResponse>(`/users/${userId}/deactivate`, {
    method: "POST",
  });
}
