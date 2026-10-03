import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { medicalRecordsApi } from "@/lib/api/medical-records";
import {
  MedicalRecordCreateInput,
  MedicalRecordUpdateInput,
  MedicalRecordSearchParams,
} from "@/lib/api/types";

export function useMedicalRecords(params: MedicalRecordSearchParams = {}) {
  const queryKey = ["medical-records", params];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => medicalRecordsApi.list(params),
  });

  return {
    records: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
}

export function useMedicalRecord(id: string) {
  const queryClient = useQueryClient();
  const queryKey = ["medical-records", id];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => medicalRecordsApi.get(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: MedicalRecordUpdateInput) => medicalRecordsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });

  return {
    record: data?.data,
    isLoading,
    error,
    updateRecord: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: MedicalRecordCreateInput) => medicalRecordsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });

  return {
    createRecord: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
