import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoicesApi } from "@/lib/api/invoices";
import {
  InvoiceCreateInput,
  InvoiceUpdateInput,
  InvoiceSearchParams,
} from "@/lib/api/types";

export function useInvoices(params: InvoiceSearchParams = {}) {
  const queryKey = ["invoices", params];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => invoicesApi.list(params),
  });

  return {
    invoices: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
}

export function useInvoice(id: string) {
  const queryClient = useQueryClient();
  const queryKey = ["invoices", id];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => invoicesApi.get(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: InvoiceUpdateInput) => invoicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  return {
    invoice: data?.data,
    isLoading,
    error,
    updateInvoice: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: InvoiceCreateInput) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  return {
    createInvoice: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
