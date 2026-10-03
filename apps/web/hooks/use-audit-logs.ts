import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/lib/api/audit";
import { AuditLogSearchParams } from "@/lib/api/types";

export const AUDIT_LOGS_QUERY_KEY = ["audit-logs"];

export function useAuditLogs(params: AuditLogSearchParams = {}) {
  const queryKey = [...AUDIT_LOGS_QUERY_KEY, params];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => auditApi.list(params),
  });

  return {
    logs: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
}
