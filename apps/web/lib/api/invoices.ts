import { fetchAPI } from "./fetch";
import {
  InvoiceCreateInput,
  InvoiceDetailResponse,
  InvoiceListResponse,
  InvoiceSearchParams,
  InvoiceUpdateInput,
  Payment,
  PaymentCreateInput,
  PaymentReceiptData,
} from "./types";

export const invoicesApi = {
  list: (params: InvoiceSearchParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.page_size) query.append("page_size", params.page_size.toString());
    if (params.q) query.append("q", params.q);
    if (params.status) query.append("status", params.status);
    if (params.start_date) query.append("start_date", params.start_date);
    if (params.end_date) query.append("end_date", params.end_date);
    if (params.patient_id) query.append("patient_id", params.patient_id);
    if (params.invoice_number) query.append("invoice_number", params.invoice_number);
    if (params.date) query.append("date", params.date);

    const qs = query.toString();
    const url = `/invoices${qs ? `?${qs}` : ""}`;
    return fetchAPI<InvoiceListResponse>(url);
  },

  get: (id: string) => fetchAPI<InvoiceDetailResponse>(`/invoices/${id}`),

  create: (data: InvoiceCreateInput) =>
    fetchAPI<InvoiceDetailResponse>("/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: InvoiceUpdateInput) =>
    fetchAPI<InvoiceDetailResponse>(`/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  recordPayment: (id: string, data: PaymentCreateInput) =>
    fetchAPI<Payment>(`/invoices/${id}/payments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getReceipt: (id: string, paymentId: string) =>
    fetchAPI<{ data: PaymentReceiptData; message: string }>(
      `/invoices/${id}/payments/${paymentId}/receipt`
    ),
};
