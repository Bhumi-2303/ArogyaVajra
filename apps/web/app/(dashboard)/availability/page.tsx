"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useDoctors } from "@/hooks/use-doctors";
import { useAvailability } from "@/hooks/use-availability";
import { DoctorAvailability } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Clock, Edit, Trash2, CalendarCheck, Shield } from "lucide-react";
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
import { AvailabilityForm } from "@/components/forms/availability-form";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AvailabilityPage() {
  const { user } = useAuth();

  // Load doctor profile associated with current authenticated account
  const {
    data: doctorsData,
    isLoading: isLoadingDoctor,
    error: doctorError,
  } = useDoctors(user?.email ? { email: user.email } : undefined);

  const doctor = doctorsData?.data?.[0];
  const doctorId = doctor?.id;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="h-4 w-4" />
            <span>Schedule Configuration</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Doctor Availability
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure your recurring weekly consultation hours and appointment slot durations.
          </p>
        </div>
      </div>

      {isLoadingDoctor ? (
        <div className="space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : doctorError ? (
        <Alert variant="danger" title="Error Loading Profile">
          Failed to load doctor profile. Please refresh the page or check your connection.
        </Alert>
      ) : !doctorId ? (
        <Alert variant="warning" title="No Clinical Profile Associated">
          Your account is registered as a practitioner, but no active doctor profile was found.
          Please contact the clinic administrator.
        </Alert>
      ) : (
        <DoctorAvailabilityManager
          doctorId={doctorId}
          doctorName={`Dr. ${doctor.first_name} ${doctor.last_name}`}
          specialization={doctor.specialization}
        />
      )}
    </div>
  );
}

function DoctorAvailabilityManager({
  doctorId,
  doctorName,
  specialization,
}: {
  doctorId: string;
  doctorName: string;
  specialization: string;
}) {
  const { availability, isLoading, error, deleteSlot } = useAvailability(doctorId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DoctorAvailability | undefined>();

  const handleCreate = () => {
    setSelectedSlot(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (slot: DoctorAvailability) => {
    setSelectedSlot(slot);
    setIsDialogOpen(true);
  };

  const handleDelete = async (slotId: string) => {
    if (confirm("Are you sure you want to remove this recurring availability window?")) {
      try {
        await deleteSlot(slotId);
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert("Failed to delete availability slot.");
        }
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSlot(undefined);
  };

  // Sort slots by day of week then start time
  const sortedAvailability = [...availability].sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) {
      return a.day_of_week - b.day_of_week;
    }
    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <div className="space-y-6">
      {/* Doctor Summary Badge */}
      <div className="rounded-xl border border-app-border bg-card p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-soft text-royal flex items-center justify-center font-bold">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-navy text-sm sm:text-base">
              {doctorName}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{specialization}</span>
              <span>•</span>
              <span className="text-success font-medium">Active Schedule</span>
            </div>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Working Hours
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="danger" title="Error">
          Failed to load availability slots.
        </Alert>
      ) : sortedAvailability.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-7 w-7" />}
          title="No availability configured"
          description="You have not set any recurring consultation working hours yet. Patients will not be able to book appointments until working hours are configured."
          actionLabel="Add Working Hours"
          onAction={handleCreate}
        />
      ) : (
        <div className="rounded-xl border border-app-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold text-navy">Day of Week</TableHead>
                <TableHead className="font-semibold text-navy">Working Hours</TableHead>
                <TableHead className="font-semibold text-navy">Slot Duration</TableHead>
                <TableHead className="font-semibold text-navy">Status</TableHead>
                <TableHead className="text-right font-semibold text-navy">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAvailability.map((slot) => (
                <TableRow key={slot.id} className="hover:bg-muted/30">
                  <TableCell className="font-semibold text-navy">
                    {DAYS_OF_WEEK[slot.day_of_week] || `Day ${slot.day_of_week}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="font-mono font-medium text-navy">
                      {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {slot.slot_duration_minutes} mins / consultation
                  </TableCell>
                  <TableCell>
                    {slot.is_active ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-xs">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(slot)}
                        title="Edit slot"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(slot.id)}
                        className="text-danger hover:text-danger hover:bg-danger/10"
                        title="Delete slot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSlot ? "Edit Working Hours" : "Add Working Hours"}
            </DialogTitle>
          </DialogHeader>
          <AvailabilityForm
            doctorId={doctorId}
            initialData={selectedSlot}
            onSuccess={handleCloseDialog}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
