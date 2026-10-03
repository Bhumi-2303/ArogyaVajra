import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoicesApi } from "@/lib/api/invoices";
import {
  InvoiceCreateInput,
  InvoiceUpdateInput,
  InvoiceSearchParams,
  PaymentCreateInput,
} from "@/lib/api/types";

export const INVOICES_QUERY_KEY = ["invoices"];

export function useInvoices(params: InvoiceSearchParams = {}) {
  const queryKey = [...INVOICES_QUERY_KEY, params];

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
  const queryKey = [...INVOICES_QUERY_KEY, id];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => invoicesApi.get(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: InvoiceUpdateInput) => invoicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...INVOICES_QUERY_KEY, id] });
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
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
    },
  });

  return {
    createInvoice: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

export function useRecordPayment(invoiceId: string) {
  const queryClient = useQueryClient();

  const recordMutation = useMutation({
    mutationFn: (data: PaymentCreateInput) => invoicesApi.recordPayment(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...INVOICES_QUERY_KEY, invoiceId] });
    },
  });

  return {
    recordPayment: recordMutation.mutateAsync,
    isRecording: recordMutation.isPending,
  };
}
