"use client";

import { useState } from "react";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import { useUsers } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShieldAlert, Search, AlertCircle, Calendar, Server, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { AuditLog } from "@/lib/api/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [entityFilter, setEntityFilter] = useState<string>("ALL");

  const searchParams: any = { page, page_size: 20 };
  if (actionFilter !== "ALL") searchParams.action = actionFilter;
  if (entityFilter !== "ALL") searchParams.entity_type = entityFilter;

  const { logs, pagination, isLoading, error } = useAuditLogs(searchParams);
  
  // Need users to map actor IDs to names/emails
  const { data: usersData } = useUsers({ page_size: 100 });
  const users = usersData?.data || [];

  const getActorInfo = (userId?: string | null) => {
    if (!userId) return "System";
    const user = users.find((u: any) => u.id === userId);
    return user ? `${user.email} (${user!.role})` : userId.slice(0, 8);
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.total_pages) setPage(p => p + 1);
  };
  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-indigo-600" />
          System Audit Logs
        </h1>
        <p className="text-muted-foreground mt-2">
          Immutable, cryptographically-secure log of all critical system mutations.
        </p>
      </div>

      <Alert
        variant="warning"
        title="Compliance Notice"
        className="bg-amber-50 text-amber-900 border-amber-200"
      >
        These logs are immutable. No user, including administrators, has permission to modify or delete these records. Only non-sensitive resource identifiers and safe state diffs are retained.
      </Alert>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <CardTitle>Event Explorer</CardTitle>
              <CardDescription>Filter and inspect system events</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={actionFilter} onValueChange={(val) => { setActionFilter(val); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="USER_LOGIN">Logins</SelectItem>
                  <SelectItem value="PATIENT_CREATE">Create Patient</SelectItem>
                  <SelectItem value="PATIENT_UPDATE">Update Patient</SelectItem>
                  <SelectItem value="APPOINTMENT_CREATE">Create Appointment</SelectItem>
                  <SelectItem value="APPOINTMENT_UPDATE">Update Appointment</SelectItem>
                  <SelectItem value="MEDICAL_RECORD_CREATE">Create Record</SelectItem>
                  <SelectItem value="INVOICE_CREATE">Create Invoice</SelectItem>
                  <SelectItem value="PAYMENT_RECORD">Payments</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={(val) => { setEntityFilter(val); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Entities</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="patient_profile">Patients</SelectItem>
                  <SelectItem value="appointment">Appointments</SelectItem>
                  <SelectItem value="medical_record">Medical Records</SelectItem>
                  <SelectItem value="prescription">Prescriptions</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert variant="danger" title="Access Denied">
                You do not have permission to view audit logs, or the service is unavailable.
              </Alert>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-muted/10">
              <ShieldAlert className="h-8 w-8 mx-auto mb-3 opacity-20" />
              <p>No audit logs found matching your filters.</p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
                  <tr>
                    <th scope="col" className="px-4 py-3">Timestamp</th>
                    <th scope="col" className="px-4 py-3">Action</th>
                    <th scope="col" className="px-4 py-3">Actor</th>
                    <th scope="col" className="px-4 py-3">Target Resource</th>
                    <th scope="col" className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <Badge variant="outline" className="bg-background">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {getActorInfo(log.user_id)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded mr-2">
                          {log.entity_type}
                        </span>
                        <span className="text-muted-foreground font-mono text-xs">
                          {log.entity_id?.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <AuditLogDetailDialog log={log} actorName={getActorInfo(log.user_id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pagination Controls */}
      {!isLoading && !error && pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing page {pagination.page} of {pagination.total_pages} ({pagination.total} records)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page >= pagination.total_pages}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditLogDetailDialog({ log, actorName }: { log: AuditLog, actorName: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8">Inspect</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-600" />
            Audit Event Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 border rounded-md bg-muted/20">
              <p className="text-muted-foreground text-xs uppercase mb-1">Event ID</p>
              <p className="font-mono">{log.id}</p>
            </div>
            <div className="p-3 border rounded-md bg-muted/20">
              <p className="text-muted-foreground text-xs uppercase mb-1">Timestamp</p>
              <p>{new Date(log.created_at).toLocaleString()}</p>
            </div>
            <div className="p-3 border rounded-md bg-muted/20">
              <p className="text-muted-foreground text-xs uppercase mb-1">Action</p>
              <Badge>{log.action}</Badge>
            </div>
            <div className="p-3 border rounded-md bg-muted/20">
              <p className="text-muted-foreground text-xs uppercase mb-1">Actor</p>
              <p>{actorName}</p>
            </div>
            <div className="p-3 border rounded-md bg-muted/20">
              <p className="text-muted-foreground text-xs uppercase mb-1">Target Entity</p>
              <p className="font-mono text-xs">{log.entity_type} {log.entity_id}</p>
            </div>
            <div className="p-3 border rounded-md bg-muted/20">
              <p className="text-muted-foreground text-xs uppercase mb-1">Client Info</p>
              <p className="text-xs text-muted-foreground line-clamp-2" title={log.user_agent || "N/A"}>
                {log.ip_address || "No IP"} | {log.user_agent || "Unknown Agent"}
              </p>
            </div>
          </div>

          {(log.old_values || log.new_values) && (
            <div className="mt-6 border rounded-md overflow-hidden">
              <div className="bg-muted px-4 py-2 border-b">
                <h4 className="text-sm font-medium">State Mutation</h4>
              </div>
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x text-sm">
                <div className="p-4 bg-rose-50/30">
                  <h5 className="font-medium text-rose-800 mb-2">Previous State (old_values)</h5>
                  <pre className="text-xs text-rose-900 bg-rose-100/50 p-2 rounded overflow-x-auto">
                    {log.old_values ? JSON.stringify(log.old_values, null, 2) : "None"}
                  </pre>
                </div>
                <div className="p-4 bg-emerald-50/30">
                  <h5 className="font-medium text-emerald-800 mb-2">New State (new_values)</h5>
                  <pre className="text-xs text-emerald-900 bg-emerald-100/50 p-2 rounded overflow-x-auto">
                    {log.new_values ? JSON.stringify(log.new_values, null, 2) : "None"}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
