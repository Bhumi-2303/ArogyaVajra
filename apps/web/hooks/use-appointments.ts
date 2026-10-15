import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi } from "@/lib/api/appointments";
import {
  AppointmentCreateInput,
  AppointmentUpdateInput,
  AppointmentSearchParams,
} from "@/lib/api/types";

export const APPOINTMENTS_QUERY_KEY = ["appointments"];

export function useAppointments(params: AppointmentSearchParams = {}) {
  const queryKey = [...APPOINTMENTS_QUERY_KEY, params];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => appointmentsApi.list(params),
  });

  return {
    appointments: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
}

export function useAppointment(id: string) {
  const queryClient = useQueryClient();
  const queryKey = [...APPOINTMENTS_QUERY_KEY, id];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => appointmentsApi.get(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: AppointmentUpdateInput) => appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_QUERY_KEY, id] });
    },
  });

  return {
    appointment: data?.data,
    isLoading,
    error,
    updateAppointment: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: AppointmentCreateInput) => appointmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
    },
  });

  return {
    createAppointment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
    },
  });

  return {
    confirmAppointment: confirmMutation.mutateAsync,
    isConfirming: confirmMutation.isPending,
  };
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
    },
  });

  return {
    completeAppointment: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
  };
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
    },
  });

  return {
    cancelAppointment: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
  };
}
