"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAppointments } from "@/hooks/use-appointments";
import { Appointment } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Calendar, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/forms/appointment-form";

export default function AppointmentsPage() {
  const { user } = useAuth();
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const { appointments, pagination, isLoading, error } = useAppointments({
    page,
    page_size: 20,
    status: statusFilter ? (statusFilter as any) : undefined,
    date: dateFilter || undefined,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();

  const handleCreate = () => {
    setSelectedAppointment(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAppointment(undefined);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Scheduled</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Confirmed</Badge>;
      case "COMPLETED":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "NO_SHOW":
        return <Badge className="bg-orange-500 hover:bg-orange-600">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage consultations and bookings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Book Appointment
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row p-4 border rounded-md bg-muted/20">
        <div className="flex flex-col space-y-1.5 flex-1">
          <label className="text-sm font-medium">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
        <div className="flex flex-col space-y-1.5 flex-1">
          <label className="text-sm font-medium">Filter by Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={() => {
              setStatusFilter("");
              setDateFilter("");
              setPage(1);
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load appointments."}
          </AlertDescription>
        </Alert>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description="There are no appointments matching your criteria."
          action={{
            label: "Book Appointment",
            onClick: handleCreate,
          }}
        />
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Date & Time</TableHead>
                {user.role !== "PATIENT" && <TableHead>Patient</TableHead>}
                {user.role !== "DOCTOR" && <TableHead>Doctor</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    {appointment.appointment_code}
                  </TableCell>
                  <TableCell>
                    {appointment.appointment_date} <br />
                    <span className="text-xs text-muted-foreground">
                      {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
                    </span>
                  </TableCell>
                  {user.role !== "PATIENT" && (
                    <TableCell className="text-sm">
                      ID: {appointment.patient_id.substring(0, 8)}...
                    </TableCell>
                  )}
                  {user.role !== "DOCTOR" && (
                    <TableCell className="text-sm">
                      ID: {appointment.doctor_id.substring(0, 8)}...
                    </TableCell>
                  )}
                  <TableCell>
                    {renderStatusBadge(appointment.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(appointment)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {pagination.total_pages}
          </span>
          <Button
            variant="outline"
            disabled={page === pagination.total_pages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? "Manage Appointment" : "Book New Appointment"}
            </DialogTitle>
          </DialogHeader>
          <AppointmentForm
            initialData={selectedAppointment}
            onSuccess={handleCloseDialog}
            onCancel={handleCloseDialog}
            userRole={user.role}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
