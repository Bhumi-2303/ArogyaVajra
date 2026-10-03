import { fetchAPI } from "./fetch";
import {
  PrescriptionListResponse,
  PrescriptionDetailResponse,
  PrescriptionCreateInput,
  PrescriptionUpdateInput,
  PrescriptionSearchParams,
} from "./types";

export const prescriptionsApi = {
  list: (params: PrescriptionSearchParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.page_size) query.append("page_size", params.page_size.toString());
    if (params.patient_id) query.append("patient_id", params.patient_id);
    if (params.doctor_id) query.append("doctor_id", params.doctor_id);
    if (params.appointment_id) query.append("appointment_id", params.appointment_id);

    const qs = query.toString();
    const url = `/api/v1/prescriptions${qs ? `?${qs}` : ""}`;
    return fetchAPI<PrescriptionListResponse>(url);
  },

  get: (id: string) => fetchAPI<PrescriptionDetailResponse>(`/api/v1/prescriptions/${id}`),

  create: (data: PrescriptionCreateInput) =>
    fetchAPI<PrescriptionDetailResponse>("/api/v1/prescriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: PrescriptionUpdateInput) =>
    fetchAPI<PrescriptionDetailResponse>(`/api/v1/prescriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
