import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/lib/api/audit";
import { AuditLogSearchParams } from "@/lib/api/types";

export function useAuditLogs(params: AuditLogSearchParams = {}) {
  const queryKey = ["audit-logs", params];

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
