"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDoctorApi,
  deleteDoctorApi,
  getDoctorApi,
  getDoctorsApi,
  getDoctorSlotsApi,
  updateDoctorApi,
} from "@/lib/api/doctors";
import {
  DoctorCreateInput,
  DoctorSearchParams,
  DoctorUpdateInput,
} from "@/lib/api/types";

export const DOCTORS_QUERY_KEY = ["doctors"];

export function useDoctors(params?: DoctorSearchParams) {
  return useQuery({
    queryKey: [...DOCTORS_QUERY_KEY, params],
    queryFn: () => getDoctorsApi(params),
  });
}

export function useDoctor(doctorId: string | null | undefined) {
  return useQuery({
    queryKey: [...DOCTORS_QUERY_KEY, doctorId],
    queryFn: () => {
      if (!doctorId) throw new Error("Doctor ID is required");
      return getDoctorApi(doctorId);
    },
    enabled: Boolean(doctorId),
  });
}

export function useDoctorSlots(
  doctorId: string | null | undefined,
  date: string | null | undefined
) {
  return useQuery({
    queryKey: [...DOCTORS_QUERY_KEY, doctorId, "slots", date],
    queryFn: () => {
      if (!doctorId || !date) throw new Error("Doctor ID and date are required");
      return getDoctorSlotsApi(doctorId, date);
    },
    enabled: Boolean(doctorId && date),
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DoctorCreateInput) => createDoctorApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_QUERY_KEY });
    },
  });
}

export function useUpdateDoctor(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DoctorUpdateInput) => updateDoctorApi(doctorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...DOCTORS_QUERY_KEY, doctorId] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doctorId: string) => deleteDoctorApi(doctorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_QUERY_KEY });
    },
  });
}
