"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppointmentCreateInput, AppointmentUpdateInput, Appointment } from "@/lib/api/types";
import { useCreateAppointment, useAppointment } from "@/hooks/use-appointments";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AppointmentFormProps {
  initialData?: Appointment;
  onSuccess: () => void;
  onCancel: () => void;
  userRole: string;
}

export function AppointmentForm({
  initialData,
  onSuccess,
  onCancel,
  userRole,
}: AppointmentFormProps) {
  const { createAppointment, isCreating } = useCreateAppointment();
  
  // Custom hook for updating if initialData exists
  const { updateAppointment, isUpdating } = useAppointment(initialData?.id || "");
  
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patient_id: initialData?.patient_id || "",
    doctor_id: initialData?.doctor_id || "",
    appointment_date: initialData?.appointment_date || "",
    start_time: initialData?.start_time.substring(0, 5) || "",
    end_time: initialData?.end_time.substring(0, 5) || "",
    reason: initialData?.reason || "",
    notes: initialData?.notes || "",
    status: initialData?.status || "SCHEDULED",
  });

  const isLoading = isCreating || isUpdating;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formatTime = (time: string) => {
      if (time.length === 5) return `${time}:00`;
      return time;
    };

    try {
      if (initialData) {
        const payload: AppointmentUpdateInput = {};
        if (formData.status !== initialData.status) payload.status = formData.status as any;
        if (formData.notes !== initialData.notes && userRole !== "PATIENT") payload.notes = formData.notes;
        if (formData.reason !== initialData.reason) payload.reason = formData.reason;
        
        await updateAppointment(payload);
      } else {
        const payload: AppointmentCreateInput = {
          patient_id: formData.patient_id,
          doctor_id: formData.doctor_id,
          appointment_date: formData.appointment_date,
          start_time: formatTime(formData.start_time),
          end_time: formatTime(formData.end_time),
          reason: formData.reason,
          notes: userRole !== "PATIENT" ? formData.notes : undefined,
        };
        await createAppointment(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save appointment. Please check for conflicts.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!initialData && (
        <>
          <div className="space-y-2">
            <Label htmlFor="patient_id">Patient ID</Label>
            <Input
              id="patient_id"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctor_id">Doctor ID</Label>
            <Input
              id="doctor_id"
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment_date">Date</Label>
            <Input
              id="appointment_date"
              name="appointment_date"
              type="date"
              value={formData.appointment_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Visit</Label>
        <Input
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
        />
      </div>

      {initialData && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
      )}

      {userRole !== "PATIENT" && (
        <div className="space-y-2">
          <Label htmlFor="notes">Clinical / Internal Notes</Label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange as any}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
