"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAppointment } from "@/hooks/use-appointments";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  ArrowLeft,
  XCircle,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function AppointmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { appointment, isLoading, error, updateAppointment, isUpdating } =
    useAppointment(params.id);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
          </Link>
        </Button>
        <Alert variant="danger" title="Appointment Not Found">
          {error instanceof Error
            ? error.message
            : "The requested appointment record does not exist or you lack authorization to view it."}
        </Alert>
      </div>
    );
  }

  const handleCancelAppointment = async () => {
    setActionError(null);
    try {
      await updateAppointment({ status: "CANCELLED" });
      setIsCancelDialogOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to cancel appointment.");
      }
    }
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

  const canCancel =
    (appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED") &&
    (user?.role === "PATIENT" ||
      user?.role === "RECEPTIONIST" ||
      user?.role === "ADMIN" ||
      user?.role === "DOCTOR");

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelDialogOpen(true)}
              className="text-danger hover:text-danger hover:bg-danger-light border-danger/30"
            >
              <XCircle className="mr-1.5 h-4 w-4" /> Cancel Appointment
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <Alert variant="danger" title="Action Failed">
          {actionError}
        </Alert>
      )}

      {/* Main Details Card */}
      <Card className="shadow-sm border-app-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-app-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-app-muted uppercase tracking-wider">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Clinical Consultation</span>
            </div>
            <CardTitle className="text-2xl font-bold text-navy">
              Appointment {appointment.appointment_code}
            </CardTitle>
            <CardDescription className="text-xs">
              Created on {new Date(appointment.created_at).toLocaleString()}
            </CardDescription>
          </div>
          <div>{renderStatusBadge(appointment.status)}</div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consultation Timing */}
            <div className="rounded-lg border border-app-border p-4 bg-muted/10 space-y-3">
              <h4 className="text-xs font-bold text-app-muted uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>Date & Time</span>
              </h4>
              <div className="space-y-1">
                <div className="text-lg font-semibold text-navy">
                  {new Date(appointment.appointment_date).toLocaleDateString(
                    undefined,
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
                <div className="text-sm font-medium text-primary">
                  {appointment.start_time.substring(0, 5)} -{" "}
                  {appointment.end_time.substring(0, 5)}
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="rounded-lg border border-app-border p-4 bg-muted/10 space-y-3">
              <h4 className="text-xs font-bold text-app-muted uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-primary" />
                <span>Medical Practitioner</span>
              </h4>
              <div className="space-y-1">
                <div className="text-lg font-semibold text-navy">
                  {appointment.doctor_name || "Assigned Doctor"}
                </div>
                {appointment.doctor_specialization && (
                  <Badge variant="confirmed">
                    {appointment.doctor_specialization}
                  </Badge>
                )}
              </div>
            </div>

            {/* Patient Info */}
            <div className="rounded-lg border border-app-border p-4 bg-muted/10 space-y-3">
              <h4 className="text-xs font-bold text-app-muted uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                <span>Patient</span>
              </h4>
              <div className="space-y-1">
                <div className="text-lg font-semibold text-navy">
                  {appointment.patient_name || "Patient Record"}
                </div>
                {appointment.patient_code_display && (
                  <div className="text-xs font-mono text-app-muted">
                    ID: {appointment.patient_code_display}
                  </div>
                )}
              </div>
            </div>

            {/* Consultation Purpose */}
            <div className="rounded-lg border border-app-border p-4 bg-muted/10 space-y-3">
              <h4 className="text-xs font-bold text-app-muted uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" />
                <span>Consultation Reason</span>
              </h4>
              <div className="text-sm text-navy">
                {appointment.reason || "No specific reason recorded."}
              </div>
            </div>
          </div>

          {/* Clinical Notes (Staff & Doctors Only) */}
          {user?.role !== "PATIENT" && appointment.notes && (
            <div className="rounded-lg border border-app-border p-4 bg-soft space-y-2">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider">
                Clinical / Internal Staff Notes
              </h4>
              <p className="text-sm text-navy whitespace-pre-wrap">
                {appointment.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-5 w-5" /> Cancel Appointment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel appointment{" "}
              <strong>{appointment.appointment_code}</strong> scheduled for{" "}
              <strong>{appointment.appointment_date}</strong> at{" "}
              <strong>{appointment.start_time.substring(0, 5)}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isUpdating}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelAppointment}
              isLoading={isUpdating}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
