import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { prescriptionsApi } from "@/lib/api/prescriptions";
import {
  PrescriptionCreateInput,
  PrescriptionUpdateInput,
  PrescriptionSearchParams,
} from "@/lib/api/types";

export function usePrescriptions(params: PrescriptionSearchParams = {}) {
  const queryKey = ["prescriptions", params];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => prescriptionsApi.list(params),
  });

  return {
    prescriptions: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
}

export function usePrescription(id: string) {
  const queryClient = useQueryClient();
  const queryKey = ["prescriptions", id];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => prescriptionsApi.get(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: PrescriptionUpdateInput) => prescriptionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });

  return {
    prescription: data?.data,
    isLoading,
    error,
    updatePrescription: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: PrescriptionCreateInput) => prescriptionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });

  return {
    createPrescription: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
