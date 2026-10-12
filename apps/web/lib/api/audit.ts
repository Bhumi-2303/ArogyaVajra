import { apiClient } from "./client";
import { AuditLogListResponse, AuditLogSearchParams } from "./types";

export const auditApi = {
  list: async (params?: AuditLogSearchParams): Promise<AuditLogListResponse> => {
    const qs = params ? new URLSearchParams(params as any).toString() : "";
    return apiClient<AuditLogListResponse>(`/audit-logs${qs ? `?${qs}` : ""}`);
  },
};
