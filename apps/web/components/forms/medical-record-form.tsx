"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MedicalRecord, MedicalRecordCreateInput, MedicalRecordUpdateInput } from "@/lib/api/types";
import { useCreateMedicalRecord, useMedicalRecord } from "@/hooks/use-medical-records";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

interface MedicalRecordFormProps {
  initialData?: MedicalRecord;
  appointmentId?: string;
  patientId?: string;
  doctorId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MedicalRecordForm({
  initialData,
  appointmentId,
  patientId,
  doctorId,
  onSuccess,
  onCancel,
}: MedicalRecordFormProps) {
  const { createRecord, isCreating } = useCreateMedicalRecord();
  const { updateRecord, isUpdating } = useMedicalRecord(initialData?.id || "");

  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    patient_id: initialData?.patient_id || patientId || "",
    doctor_id: initialData?.doctor_id || doctorId || "",
    appointment_id: initialData?.appointment_id || appointmentId || "",
    record_date: initialData?.record_date || today,
    chief_complaint: initialData?.chief_complaint || "",
    clinical_notes: initialData?.clinical_notes || "",
    diagnosis: initialData?.diagnosis || "",
    treatment_notes: initialData?.treatment_notes || "",
    follow_up_date: initialData?.follow_up_date || "",
  });

  const isLoading = isCreating || isUpdating;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (initialData) {
        const payload: MedicalRecordUpdateInput = {
          chief_complaint: formData.chief_complaint || null,
          clinical_notes: formData.clinical_notes || null,
          diagnosis: formData.diagnosis || null,
          treatment_notes: formData.treatment_notes || null,
          follow_up_date: formData.follow_up_date || null,
        };
        await updateRecord(payload);
      } else {
        const payload: MedicalRecordCreateInput = {
          patient_id: formData.patient_id,
          doctor_id: formData.doctor_id,
          appointment_id: formData.appointment_id || null,
          record_date: formData.record_date,
          chief_complaint: formData.chief_complaint || null,
          clinical_notes: formData.clinical_notes || null,
          diagnosis: formData.diagnosis || null,
          treatment_notes: formData.treatment_notes || null,
          follow_up_date: formData.follow_up_date || null,
        };
        await createRecord(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save medical record.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!initialData && (
        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="appointment_id">Appointment ID (Optional)</Label>
            <Input
              id="appointment_id"
              name="appointment_id"
              value={formData.appointment_id}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="record_date">Record Date</Label>
            <Input
              id="record_date"
              name="record_date"
              type="date"
              value={formData.record_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      )}

      <div className="space-y-4 rounded-md border p-4 bg-muted/10">
        <h3 className="font-semibold text-lg">Consultation Details</h3>

        <div className="space-y-2">
          <Label htmlFor="chief_complaint">Chief Complaint</Label>
          <Textarea
            id="chief_complaint"
            name="chief_complaint"
            placeholder="Primary symptoms reported by the patient..."
            value={formData.chief_complaint}
            onChange={handleChange}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clinical_notes">Clinical Notes / Examination</Label>
          <Textarea
            id="clinical_notes"
            name="clinical_notes"
            placeholder="Physical examination, observations, vitals..."
            value={formData.clinical_notes}
            onChange={handleChange}
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="diagnosis">Diagnosis / Assessment</Label>
          <Textarea
            id="diagnosis"
            name="diagnosis"
            placeholder="Clinical diagnosis based on findings..."
            value={formData.diagnosis}
            onChange={handleChange}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="treatment_notes">Treatment Plan</Label>
          <Textarea
            id="treatment_notes"
            name="treatment_notes"
            placeholder="Medications, lifestyle changes, procedures..."
            value={formData.treatment_notes}
            onChange={handleChange}
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="follow_up_date">Follow-up Date (Optional)</Label>
          <Input
            id="follow_up_date"
            name="follow_up_date"
            type="date"
            value={formData.follow_up_date}
            onChange={handleChange}
            className="w-full sm:w-[200px]"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Record"}
        </Button>
      </div>
    </form>
  );
}
