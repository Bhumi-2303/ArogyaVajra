"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPatientApi,
  deletePatientApi,
  getPatientApi,
  getPatientAppointmentsApi,
  getPatientInvoicesApi,
  getPatientMedicalRecordsApi,
  getPatientPrescriptionsApi,
  getPatientsApi,
  updatePatientApi,
} from "@/lib/api/patients";
import {
  PatientCreateInput,
  PatientSearchParams,
  PatientUpdateInput,
} from "@/lib/api/types";

export const PATIENTS_QUERY_KEY = ["patients"];

export function usePatients(params?: PatientSearchParams) {
  return useQuery({
    queryKey: [...PATIENTS_QUERY_KEY, params],
    queryFn: () => getPatientsApi(params),
  });
}

export function usePatient(patientId: string | null | undefined) {
  return useQuery({
    queryKey: [...PATIENTS_QUERY_KEY, patientId],
    queryFn: () => {
      if (!patientId) throw new Error("Patient ID is required");
      return getPatientApi(patientId);
    },
    enabled: Boolean(patientId),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatientCreateInput) => createPatientApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
    },
  });
}

export function useUpdatePatient(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatientUpdateInput) => updatePatientApi(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PATIENTS_QUERY_KEY, patientId] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) => deletePatientApi(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
    },
  });
}

export type PatientSubresourceType =
  | "appointments"
  | "medical-records"
  | "prescriptions"
  | "invoices";

export function usePatientSubresource(
  patientId: string | null | undefined,
  resourceType: PatientSubresourceType
) {
  return useQuery({
    queryKey: [...PATIENTS_QUERY_KEY, patientId, resourceType],
    queryFn: () => {
      if (!patientId) throw new Error("Patient ID is required");
      switch (resourceType) {
        case "appointments":
          return getPatientAppointmentsApi(patientId);
        case "medical-records":
          return getPatientMedicalRecordsApi(patientId);
        case "prescriptions":
          return getPatientPrescriptionsApi(patientId);
        case "invoices":
          return getPatientInvoicesApi(patientId);
        default:
          throw new Error(`Unknown subresource: ${resourceType}`);
      }
    },
    enabled: Boolean(patientId),
  });
}
