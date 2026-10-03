import { fetchAPI } from "./fetch";
import {
  AppointmentListResponse,
  AppointmentDetailResponse,
  AppointmentCreateInput,
  AppointmentUpdateInput,
  AppointmentSearchParams,
} from "./types";

export const appointmentsApi = {
  /**
   * List appointments with optional filters and pagination
   */
  list: (params: AppointmentSearchParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.page_size) query.append("page_size", params.page_size.toString());
    if (params.patient_id) query.append("patient_id", params.patient_id);
    if (params.doctor_id) query.append("doctor_id", params.doctor_id);
    if (params.date) query.append("date", params.date);
    if (params.status) query.append("status", params.status);

    const qs = query.toString();
    const url = `/api/v1/appointments${qs ? `?${qs}` : ""}`;
    return fetchAPI<AppointmentListResponse>(url);
  },

  /**
   * Get appointment details
   */
  get: (id: string) => fetchAPI<AppointmentDetailResponse>(`/api/v1/appointments/${id}`),

  /**
   * Create an appointment
   */
  create: (data: AppointmentCreateInput) =>
    fetchAPI<AppointmentDetailResponse>("/api/v1/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Update an appointment
   */
  update: (id: string, data: AppointmentUpdateInput) =>
    fetchAPI<AppointmentDetailResponse>(`/api/v1/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
