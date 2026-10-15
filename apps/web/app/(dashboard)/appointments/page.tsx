"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useAppointments,
  useConfirmAppointment,
  useCompleteAppointment,
  useCancelAppointment,
} from "@/hooks/use-appointments";
import { Appointment } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";

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
import { MedicalRecordForm } from "@/components/forms/medical-record-form";
import { PrescriptionForm } from "@/components/forms/prescription-form";
import { Plus, Calendar, Edit, FileText, Pill, CheckCircle, Check, XCircle } from "lucide-react";

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

  const { confirmAppointment, isConfirming } = useConfirmAppointment();
  const { completeAppointment, isCompleting } = useCompleteAppointment();
  const { cancelAppointment, isCancelling } = useCancelAppointment();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();

  const [isConsultDialogOpen, setIsConsultDialogOpen] = useState(false);
  const [isPrescribeDialogOpen, setIsPrescribeDialogOpen] = useState(false);

  const handleConfirm = async (id: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await confirmAppointment(id);
      setActionSuccess("Appointment confirmed successfully.");
    } catch (err: any) {
      setActionError(err.message || "Failed to confirm appointment.");
    }
  };

  const handleComplete = async (id: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await completeAppointment(id);
      setActionSuccess("Appointment marked as completed.");
    } catch (err: any) {
      setActionError(err.message || "Failed to complete appointment.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      await cancelAppointment(id);
      setActionSuccess("Appointment cancelled.");
    } catch (err: any) {
      setActionError(err.message || "Failed to cancel appointment.");
    }
  };

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

  const handleConsult = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsConsultDialogOpen(true);
  };

  const handleCloseConsultDialog = () => {
    setIsConsultDialogOpen(false);
    setSelectedAppointment(undefined);
  };

  const handlePrescribe = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsPrescribeDialogOpen(true);
  };

  const handleClosePrescribeDialog = () => {
    setIsPrescribeDialogOpen(false);
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
        return <Badge variant="danger">Cancelled</Badge>;
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
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.role === "DOCTOR" ? "Clinical Appointments" : "Appointments"}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "DOCTOR"
              ? "Review and manage your clinical schedule and consultations."
              : "Manage consultations and bookings."}
          </p>
        </div>
        {user?.role !== "DOCTOR" && user?.role !== "BILLING_STAFF" && (
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Book Appointment
            </Button>
          </div>
        )}
      </div>

      {actionSuccess && (
        <Alert variant="success" className="py-2.5">
          {actionSuccess}
        </Alert>
      )}
      {actionError && (
        <Alert variant="danger" className="py-2.5">
          {actionError}
        </Alert>
      )}

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
        <Alert variant="danger">
          <div>Error</div>
          <div>
            {error instanceof Error ? error.message : "Failed to load appointments."}
          </div>
        </Alert>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-7 w-7" />}
          title={user?.role === "DOCTOR" ? "No appointments scheduled" : "No appointments found"}
          description={
            user?.role === "DOCTOR"
              ? "You have no appointments scheduled matching your criteria."
              : "There are no appointments matching your criteria."
          }
          actionLabel={
            user?.role === "DOCTOR" || user?.role === "BILLING_STAFF"
              ? undefined
              : "Book Appointment"
          }
          onAction={
            user?.role === "DOCTOR" || user?.role === "BILLING_STAFF"
              ? undefined
              : handleCreate
          }
        />
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Date & Time</TableHead>
                {user!.role !== "PATIENT" && <TableHead>Patient</TableHead>}
                {user!.role !== "DOCTOR" && <TableHead>Doctor</TableHead>}
                <TableHead>Reason</TableHead>
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
                  {user!.role !== "PATIENT" && (
                    <TableCell className="text-sm">
                      <div className="font-medium text-navy">
                        {appointment.patient_name || `Patient (${appointment.patient_id.substring(0, 8)}...)`}
                      </div>
                      {appointment.patient_code_display && (
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {appointment.patient_code_display}
                        </div>
                      )}
                    </TableCell>
                  )}
                  {user!.role !== "DOCTOR" && (
                    <TableCell className="text-sm">
                      <div className="font-medium text-navy">
                        {appointment.doctor_name || `Doctor (${appointment.doctor_id.substring(0, 8)}...)`}
                      </div>
                      {appointment.doctor_specialization && (
                        <div className="text-[11px] text-muted-foreground">
                          {appointment.doctor_specialization}
                        </div>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="max-w-[180px] truncate text-sm">
                    {appointment.reason ? (
                      <span title={appointment.reason}>{appointment.reason}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">General consultation</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(appointment.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1.5 flex-wrap">
                      {user!.role === "DOCTOR" && (
                        <>
                          {appointment.status === "SCHEDULED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 h-8 px-2 text-xs"
                              disabled={isConfirming}
                              onClick={() => handleConfirm(appointment.id)}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                              Confirm
                            </Button>
                          )}
                          {appointment.status === "CONFIRMED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 h-8 px-2 text-xs"
                              disabled={isCompleting}
                              onClick={() => handleComplete(appointment.id)}
                            >
                              <Check className="h-3.5 w-3.5 mr-1 text-blue-600" />
                              Complete
                            </Button>
                          )}
                          {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2 text-xs"
                              disabled={isCancelling}
                              onClick={() => handleCancel(appointment.id)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => handleConsult(appointment)}
                          >
                            <FileText className="h-3.5 w-3.5 mr-1 text-primary" />
                            Record
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => handlePrescribe(appointment)}
                          >
                            <Pill className="h-3.5 w-3.5 mr-1 text-teal-600" />
                            Rx
                          </Button>
                        </>
                      )}
                      {user!.role === "PATIENT" && appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2 text-xs"
                          disabled={isCancelling}
                          onClick={() => handleCancel(appointment.id)}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Cancel
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleEdit(appointment)}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Manage
                      </Button>
                    </div>
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
            userRole={user!.role}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isConsultDialogOpen} onOpenChange={setIsConsultDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Consultation Record</DialogTitle>
          </DialogHeader>
          <MedicalRecordForm
            appointmentId={selectedAppointment?.id}
            patientId={selectedAppointment?.patient_id}
            doctorId={selectedAppointment?.doctor_id}
            onSuccess={handleCloseConsultDialog}
            onCancel={handleCloseConsultDialog}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isPrescribeDialogOpen} onOpenChange={setIsPrescribeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Prescription</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <PrescriptionForm
              patientId={selectedAppointment.patient_id}
              doctorId={selectedAppointment.doctor_id}
              appointmentId={selectedAppointment.id}
              onSuccess={handleClosePrescribeDialog}
              onCancel={handleClosePrescribeDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
