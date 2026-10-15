"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AppointmentCreateInput,
  AppointmentUpdateInput,
  Appointment,
} from "@/lib/api/types";
import { useCreateAppointment, useAppointment } from "@/hooks/use-appointments";
import { useDoctors, useDoctorSlots } from "@/hooks/use-doctors";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Calendar,
  Clock,
  Check,
  Search,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";

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
  const { updateAppointment, isUpdating } = useAppointment(initialData?.id || "");

  const [error, setError] = useState<string | null>(null);

  // Form State
  const [patientId, setPatientId] = useState(initialData?.patient_id || "");
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    initialData?.doctor_id || ""
  );
  const [doctorSearch, setDoctorSearch] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(
    initialData?.appointment_date || ""
  );
  const [startTime, setStartTime] = useState(
    initialData?.start_time ? initialData.start_time.substring(0, 5) : ""
  );
  const [endTime, setEndTime] = useState(
    initialData?.end_time ? initialData.end_time.substring(0, 5) : ""
  );
  const [reason, setReason] = useState(initialData?.reason || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [status, setStatus] = useState(initialData?.status || "SCHEDULED");

  // Query real doctors from backend
  const {
    data: doctorsData,
    isLoading: isLoadingDoctors,
    error: doctorsError,
  } = useDoctors({ is_active: true, page_size: 100 });

  const doctors = useMemo(() => doctorsData?.data || [], [doctorsData]);

  const filteredDoctors = useMemo(() => {
    if (!doctorSearch.trim()) return doctors;
    const term = doctorSearch.toLowerCase();
    return doctors.filter(
      (doc) =>
        doc.first_name.toLowerCase().includes(term) ||
        doc.last_name.toLowerCase().includes(term) ||
        doc.specialization.toLowerCase().includes(term) ||
        doc.doctor_code.toLowerCase().includes(term)
    );
  }, [doctors, doctorSearch]);

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === selectedDoctorId),
    [doctors, selectedDoctorId]
  );

  // Query available slots for the selected doctor and date
  const {
    data: slotsData,
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useDoctorSlots(
    selectedDoctorId || null,
    appointmentDate || null
  );

  const availableSlots = useMemo(() => slotsData?.slots || [], [slotsData]);

  // Today's date string in YYYY-MM-DD for min date constraint
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  const isLoading = isCreating || isUpdating;

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
        if (status !== initialData.status) payload.status = status as any;
        if (notes !== initialData.notes && userRole !== "PATIENT") {
          payload.notes = notes;
        }
        if (reason !== initialData.reason) payload.reason = reason;

        await updateAppointment(payload);
      } else {
        if (!selectedDoctorId) {
          setError("Please select a medical practitioner.");
          return;
        }
        if (!appointmentDate) {
          setError("Please select a consultation date.");
          return;
        }
        if (!startTime || !endTime) {
          setError("Please choose an available appointment time slot.");
          return;
        }
        if (userRole !== "PATIENT" && !patientId.trim()) {
          setError("Patient ID is required for clinic staff bookings.");
          return;
        }

        const payload: AppointmentCreateInput = {
          doctor_id: selectedDoctorId,
          appointment_date: appointmentDate,
          start_time: formatTime(startTime),
          end_time: formatTime(endTime),
          reason: reason.trim() || undefined,
          notes: userRole !== "PATIENT" ? notes.trim() || undefined : undefined,
          ...(userRole !== "PATIENT" && patientId ? { patient_id: patientId } : {}),
        };

        await createAppointment(payload);
      }
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to process appointment. Please verify details.");
      }
    }
  };

  if (!initialData && (userRole === "DOCTOR" || userRole === "BILLING_STAFF")) {
    return (
      <div className="space-y-4 py-2">
        <Alert variant="danger">
          <div className="font-semibold">Access Restricted</div>
          <div className="text-sm mt-1">
            {userRole === "DOCTOR"
              ? "Doctors cannot book appointments. New bookings must be scheduled by patients directly or by hospital receptionists."
              : "Billing staff do not have authorization to schedule appointments."}
          </div>
        </Alert>
        <div className="flex justify-end pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="danger" title="Booking Error">
          {error}
        </Alert>
      )}

      {/* Editing Existing Appointment */}
      {initialData ? (
        <div className="space-y-4">
          <div className="rounded-md border p-4 bg-muted/20 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Appointment Code:</span>
              <span className="font-semibold">{initialData.appointment_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & Time:</span>
              <span>
                {initialData.appointment_date} ({initialData.start_time.substring(0, 5)} - {initialData.end_time.substring(0, 5)})
              </span>
            </div>
            {initialData.patient_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient:</span>
                <span className="font-medium">
                  {initialData.patient_name}
                  {initialData.patient_code_display ? ` (${initialData.patient_code_display})` : ""}
                </span>
              </div>
            )}
            {initialData.doctor_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor:</span>
                <span className="font-medium">{initialData.doctor_name}</span>
              </div>
            )}
            {initialData.reason && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason:</span>
                <span className="font-medium">{initialData.reason}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {userRole === "PATIENT" ? (
                <>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CANCELLED">Cancel Appointment</option>
                </>
              ) : (
                <>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Primary consultation reason"
            />
          </div>

          {userRole !== "PATIENT" && (
            <div className="space-y-2">
              <Label htmlFor="notes">Clinical / Staff Notes</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>
      ) : (
        /* Booking New Appointment */
        <div className="space-y-4">
          {/* For non-patients: Patient ID is required */}
          {userRole !== "PATIENT" && (
            <div className="space-y-2">
              <Label htmlFor="patient_id" className="flex items-center gap-1.5">
                <UserIcon className="h-4 w-4 text-app-muted" />
                <span>Patient ID / UUID</span>
              </Label>
              <Input
                id="patient_id"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient primary key UUID"
                required
              />
            </div>
          )}

          {/* Doctor Selection by Name */}
          <div className="space-y-2">
            <Label htmlFor="doctor_selector" className="flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-primary" />
              <span>Select Doctor by Name & Specialty</span>
            </Label>

            {isLoadingDoctors ? (
              <div className="text-xs text-muted-foreground animate-pulse py-2">
                Loading clinical practitioners roster...
              </div>
            ) : doctorsError ? (
              <Alert variant="danger">
                Failed to load doctors list. Please check connection.
              </Alert>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search doctor by name or specialty..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>

                <select
                  id="doctor_selector"
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    setStartTime("");
                    setEndTime("");
                  }}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-medium"
                  required
                >
                  <option value="">-- Choose a Medical Practitioner --</option>
                  {filteredDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.first_name} {doc.last_name} — {doc.specialization} ({doc.doctor_code})
                    </option>
                  ))}
                </select>

                {selectedDoctor && (
                  <div className="rounded-md border p-3 bg-soft text-navy space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}</span>
                      <Badge variant="confirmed">{selectedDoctor.specialization}</Badge>
                    </div>
                    {selectedDoctor.qualification && (
                      <div className="text-app-muted">
                        Qualifications: {selectedDoctor.qualification}
                      </div>
                    )}
                    {selectedDoctor.consultation_fee && Number(selectedDoctor.consultation_fee) > 0 && (
                      <div className="text-app-muted">
                        Consultation Fee: ₹{Number(selectedDoctor.consultation_fee).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="appointment_date" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Consultation Date</span>
            </Label>
            <Input
              id="appointment_date"
              type="date"
              min={todayStr}
              value={appointmentDate}
              onChange={(e) => {
                setAppointmentDate(e.target.value);
                setStartTime("");
                setEndTime("");
              }}
              required
            />
          </div>

          {/* Interactive Available Slots Picker */}
          {selectedDoctorId && appointmentDate && (
            <div className="space-y-2 pt-1">
              <Label className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Available Consultation Slots</span>
                </span>
                {startTime && endTime && (
                  <span className="text-xs font-semibold text-primary">
                    Selected: {startTime} - {endTime}
                  </span>
                )}
              </Label>

              {isLoadingSlots ? (
                <div className="text-xs text-muted-foreground animate-pulse py-3 text-center border rounded-md bg-muted/10">
                  Retrieving available slots for selected doctor...
                </div>
              ) : slotsError ? (
                <div className="text-xs text-danger py-2 border rounded-md p-3 bg-danger-light">
                  Could not retrieve schedule slots. Please try another date.
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-xs text-muted-foreground py-4 text-center border rounded-md bg-muted/20">
                  <AlertCircle className="h-4 w-4 inline mr-1 text-amber-500" />
                  No slots available on this date for the selected practitioner.
                  Please select another working day.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                  {availableSlots.map((slot, idx) => {
                    const isSelected =
                      startTime === slot.start_time && endTime === slot.end_time;
                    return (
                      <button
                        key={`${slot.start_time}-${idx}`}
                        type="button"
                        disabled={!slot.is_available}
                        onClick={() => {
                          setStartTime(slot.start_time);
                          setEndTime(slot.end_time);
                        }}
                        className={`text-xs px-2.5 py-2 rounded-md border flex items-center justify-between transition-colors ${
                          !slot.is_available
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-primary text-white border-primary font-semibold shadow-sm"
                            : "bg-white hover:bg-slate-50 border-app-border text-navy"
                        }`}
                      >
                        <span>
                          {slot.start_time} - {slot.end_time}
                        </span>
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-white ml-1 shrink-0" />
                        ) : !slot.is_available ? (
                          <span className="text-[10px] text-slate-400">Booked</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Reason for Visit */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit (Optional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Routine health checkup, fever, symptom follow-up"
            />
          </div>

          {/* Notes (Non-patients only) */}
          {userRole !== "PATIENT" && (
            <div className="space-y-2">
              <Label htmlFor="notes">Staff Notes (Internal)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes or special accommodations"
                className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-3 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isLoading ||
            (!initialData && (!selectedDoctorId || !appointmentDate || !startTime || !endTime))
          }
        >
          {isLoading
            ? initialData
              ? "Saving..."
              : "Booking..."
            : initialData
            ? "Save Changes"
            : "Confirm Booking"}
        </Button>
      </div>
    </form>
  );
}
