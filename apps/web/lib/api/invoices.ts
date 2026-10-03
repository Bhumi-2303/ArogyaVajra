import { fetchAPI } from "./fetch";
import {
  InvoiceListResponse,
  InvoiceDetailResponse,
  InvoiceCreateInput,
  InvoiceUpdateInput,
  InvoiceSearchParams,
  PaymentCreateInput,
  Payment,
} from "./types";

export const invoicesApi = {
  list: (params: InvoiceSearchParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.page_size) query.append("page_size", params.page_size.toString());
    if (params.patient_id) query.append("patient_id", params.patient_id);
    if (params.status) query.append("status", params.status);

    const qs = query.toString();
    const url = `/api/v1/invoices${qs ? `?${qs}` : ""}`;
    return fetchAPI<InvoiceListResponse>(url);
  },

  get: (id: string) => fetchAPI<InvoiceDetailResponse>(`/api/v1/invoices/${id}`),

  create: (data: InvoiceCreateInput) =>
    fetchAPI<InvoiceDetailResponse>("/api/v1/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: InvoiceUpdateInput) =>
    fetchAPI<InvoiceDetailResponse>(`/api/v1/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  recordPayment: (id: string, data: PaymentCreateInput) =>
    fetchAPI<Payment>(`/api/v1/invoices/${id}/payments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
