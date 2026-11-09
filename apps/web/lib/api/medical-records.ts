import { fetchAPI } from "./fetch";
import {
  MedicalRecordListResponse,
  MedicalRecordDetailResponse,
  MedicalRecordCreateInput,
  MedicalRecordUpdateInput,
  MedicalRecordSearchParams,
} from "./types";

export const medicalRecordsApi = {
  list: (params: MedicalRecordSearchParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.page_size) query.append("page_size", params.page_size.toString());
    if (params.q) query.append("q", params.q);
    if (params.start_date) query.append("start_date", params.start_date);
    if (params.end_date) query.append("end_date", params.end_date);
    if (params.patient_id) query.append("patient_id", params.patient_id);
    if (params.doctor_id) query.append("doctor_id", params.doctor_id);
    if (params.appointment_id) query.append("appointment_id", params.appointment_id);

    const qs = query.toString();
    const url = `/medical-records${qs ? `?${qs}` : ""}`;
    return fetchAPI<MedicalRecordListResponse>(url);
  },

  get: (id: string) => fetchAPI<MedicalRecordDetailResponse>(`/medical-records/${id}`),

  create: (data: MedicalRecordCreateInput) =>
    fetchAPI<MedicalRecordDetailResponse>("/medical-records", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: MedicalRecordUpdateInput) =>
    fetchAPI<MedicalRecordDetailResponse>(`/medical-records/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
