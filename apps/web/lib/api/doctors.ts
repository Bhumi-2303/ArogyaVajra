/**
 * Doctor Management API methods adhering to Arogyavajra backend contract.
 */

import { apiClient } from "./client";
import {
  DoctorCreateInput,
  DoctorDetailResponse,
  DoctorListResponse,
  DoctorSearchParams,
  DoctorUpdateInput,
  SimpleMessageResponse,
} from "./types";

/**
 * Fetch a paginated list of doctors with search filtering across name, specialization, and doctor code.
 */
export async function getDoctorsApi(
  params?: DoctorSearchParams
): Promise<DoctorListResponse> {
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
  if (params?.specialization) {
    searchParams.set("specialization", params.specialization);
  }
  if (params?.code) {
    searchParams.set("code", params.code);
  }
  if (params?.name) {
    searchParams.set("name", params.name);
  }
  if (params?.is_active !== undefined) {
    searchParams.set("is_active", String(params.is_active));
  }

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/doctors?${queryString}` : "/doctors";

  return apiClient<DoctorListResponse>(endpoint, {
    method: "GET",
  });
}

/**
 * Fetch doctor profile detail by ID.
 */
export async function getDoctorApi(
  doctorId: string
): Promise<DoctorDetailResponse> {
  return apiClient<DoctorDetailResponse>(`/doctors/${doctorId}`, {
    method: "GET",
  });
}

/**
 * Register a new doctor profile (Admin only).
 */
export async function createDoctorApi(
  data: DoctorCreateInput
): Promise<DoctorDetailResponse> {
  return apiClient<DoctorDetailResponse>("/doctors", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing doctor profile (Admin or owning doctor).
 */
export async function updateDoctorApi(
  doctorId: string,
  data: DoctorUpdateInput
): Promise<DoctorDetailResponse> {
  return apiClient<DoctorDetailResponse>(`/doctors/${doctorId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a doctor profile (Admin only).
 */
export async function deleteDoctorApi(
  doctorId: string
): Promise<SimpleMessageResponse> {
  return apiClient<SimpleMessageResponse>(`/doctors/${doctorId}`, {
    method: "DELETE",
  });
}
