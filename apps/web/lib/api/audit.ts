import { apiClient } from "./client";
import { AuditLogListResponse, AuditLogSearchParams } from "./types";

export const auditApi = {
  list: async (params?: AuditLogSearchParams): Promise<AuditLogListResponse> => {
    const { data } = await apiClient.get<AuditLogListResponse>("/audit-logs", {
      params,
    });
    return data;
  },
};
