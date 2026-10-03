import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { availabilityApi } from "@/lib/api/availability";
import {
  DoctorAvailabilityCreateInput,
  DoctorAvailabilityUpdateInput,
} from "@/lib/api/types";

export function useAvailability(doctorId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["doctors", doctorId, "availability"];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => availabilityApi.list(doctorId),
    enabled: !!doctorId,
  });

  const createMutation = useMutation({
    mutationFn: (input: DoctorAvailabilityCreateInput) =>
      availabilityApi.create(doctorId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      slotId,
      data,
    }: {
      slotId: string;
      data: DoctorAvailabilityUpdateInput;
    }) => availabilityApi.update(doctorId, slotId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (slotId: string) => availabilityApi.delete(doctorId, slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    availability: data?.data || [],
    isLoading,
    error,
    createSlot: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSlot: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteSlot: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
