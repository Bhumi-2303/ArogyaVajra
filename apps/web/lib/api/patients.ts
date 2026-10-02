/**
 * Patient Management API methods adhering to Arogyavajra backend contract.
 */

import { apiClient } from "./client";
import {
  Patient,
  PatientCreateInput,
  PatientDetailResponse,
  PatientListResponse,
  PatientSearchParams,
  PatientSubresourceListResponse,
  PatientUpdateInput,
  SimpleMessageResponse,
} from "./types";

/**
 * Fetch a paginated list of patients with search filtering.
 */
export async function getPatientsApi(
  params?: PatientSearchParams
): Promise<PatientListResponse> {
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
  if (params?.code) {
    searchParams.set("code", params.code);
  }
  if (params?.name) {
    searchParams.set("name", params.name);
  }
  if (params?.phone) {
    searchParams.set("phone", params.phone);
  }
  if (params?.email) {
    searchParams.set("email", params.email);
  }

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/patients?${queryString}` : "/patients";

  return apiClient<PatientListResponse>(endpoint, {
    method: "GET",
  });
}

/**
 * Fetch patient detail by UUID.
 */
export async function getPatientApi(
  patientId: string
): Promise<PatientDetailResponse> {
  return apiClient<PatientDetailResponse>(`/patients/${patientId}`, {
    method: "GET",
  });
}

/**
 * Register a new patient profile.
 */
export async function createPatientApi(
  data: PatientCreateInput
): Promise<PatientDetailResponse> {
  return apiClient<PatientDetailResponse>("/patients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing patient profile.
 */
export async function updatePatientApi(
  patientId: string,
  data: PatientUpdateInput
): Promise<PatientDetailResponse> {
  return apiClient<PatientDetailResponse>(`/patients/${patientId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a patient profile (Admin only).
 */
export async function deletePatientApi(
  patientId: string
): Promise<SimpleMessageResponse> {
  return apiClient<SimpleMessageResponse>(`/patients/${patientId}`, {
    method: "DELETE",
  });
}

/**
 * Retrieval integration: Patient appointments.
 */
export async function getPatientAppointmentsApi(
  patientId: string
): Promise<PatientSubresourceListResponse> {
  return apiClient<PatientSubresourceListResponse>(
    `/patients/${patientId}/appointments`,
    {
      method: "GET",
    }
  );
}

/**
 * Retrieval integration: Patient medical records.
 */
export async function getPatientMedicalRecordsApi(
  patientId: string
): Promise<PatientSubresourceListResponse> {
  return apiClient<PatientSubresourceListResponse>(
    `/patients/${patientId}/medical-records`,
    {
      method: "GET",
    }
  );
}

/**
 * Retrieval integration: Patient prescriptions.
 */
export async function getPatientPrescriptionsApi(
  patientId: string
): Promise<PatientSubresourceListResponse> {
  return apiClient<PatientSubresourceListResponse>(
    `/patients/${patientId}/prescriptions`,
    {
      method: "GET",
    }
  );
}

/**
 * Retrieval integration: Patient invoices.
 */
export async function getPatientInvoicesApi(
  patientId: string
): Promise<PatientSubresourceListResponse> {
  return apiClient<PatientSubresourceListResponse>(
    `/patients/${patientId}/invoices`,
    {
      method: "GET",
    }
  );
}
