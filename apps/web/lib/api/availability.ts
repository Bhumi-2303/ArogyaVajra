import { fetchAPI } from "./fetch";
import {
  DoctorAvailabilityListResponse,
  DoctorAvailabilityDetailResponse,
  DoctorAvailabilityCreateInput,
  DoctorAvailabilityUpdateInput,
  SimpleMessageResponse,
} from "./types";

export const availabilityApi = {
  /**
   * List all availability slots for a doctor.
   */
  list: (doctorId: string) =>
    fetchAPI<DoctorAvailabilityListResponse>(`/api/v1/doctors/${doctorId}/availability`),

  /**
   * Create a new availability slot.
   */
  create: (doctorId: string, data: DoctorAvailabilityCreateInput) =>
    fetchAPI<DoctorAvailabilityDetailResponse>(`/api/v1/doctors/${doctorId}/availability`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Update an existing availability slot.
   */
  update: (doctorId: string, slotId: string, data: DoctorAvailabilityUpdateInput) =>
    fetchAPI<DoctorAvailabilityDetailResponse>(
      `/api/v1/doctors/${doctorId}/availability/${slotId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),

  /**
   * Delete an availability slot.
   */
  delete: (doctorId: string, slotId: string) =>
    fetchAPI<SimpleMessageResponse>(`/api/v1/doctors/${doctorId}/availability/${slotId}`, {
      method: "DELETE",
    }),
};
