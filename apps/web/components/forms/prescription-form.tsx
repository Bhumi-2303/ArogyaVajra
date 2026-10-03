"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Prescription,
  PrescriptionCreateInput,
  PrescriptionUpdateInput,
  PrescriptionItemCreateInput,
} from "@/lib/api/types";
import {
  useCreatePrescription,
  usePrescription,
} from "@/hooks/use-prescriptions";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

interface PrescriptionFormProps {
  initialData?: Prescription;
  patientId?: string;
  doctorId?: string;
  appointmentId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PrescriptionForm({
  initialData,
  patientId,
  doctorId,
  appointmentId,
  onSuccess,
  onCancel,
}: PrescriptionFormProps) {
  const { createPrescription, isCreating } = useCreatePrescription();
  const { updatePrescription, isUpdating } = usePrescription(
    initialData?.id || ""
  );

  const [error, setError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    patient_id: initialData?.patient_id || patientId || "",
    doctor_id: initialData?.doctor_id || doctorId || "",
    appointment_id: initialData?.appointment_id || appointmentId || "",
    prescription_date: initialData?.prescription_date || today,
    instructions: initialData?.instructions || "",
    status: initialData?.status || "ACTIVE",
  });

  const [items, setItems] = useState<PrescriptionItemCreateInput[]>(
    initialData?.items
      ? initialData.items.map((i) => ({
          medicine_name: i.medicine_name,
          dosage: i.dosage,
          frequency: i.frequency,
          duration: i.duration,
          route: i.route || "",
          instructions: i.instructions || "",
        }))
      : []
  );

  const isLoading = isCreating || isUpdating;

  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof PrescriptionItemCreateInput,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        medicine_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        route: "",
        instructions: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (items.length === 0) {
      setError("At least one medication is required.");
      return false;
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.medicine_name || !item.dosage || !item.frequency || !item.duration) {
        setError(
          `Medication ${
            i + 1
          } is missing required fields (Name, Dosage, Frequency, Duration).`
        );
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleProceedToReview = () => {
    if (validateForm()) {
      setReviewMode(true);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    try {
      if (initialData) {
        const payload: PrescriptionUpdateInput = {
          instructions: formData.instructions || null,
          status: formData.status as any,
          items: items.map((item) => ({
            ...item,
            route: item.route || null,
            instructions: item.instructions || null,
          })),
        };
        await updatePrescription(payload);
      } else {
        const payload: PrescriptionCreateInput = {
          patient_id: formData.patient_id,
          doctor_id: formData.doctor_id,
          appointment_id: formData.appointment_id || null,
          prescription_date: formData.prescription_date,
          instructions: formData.instructions || null,
          status: formData.status as any,
          items: items.map((item) => ({
            ...item,
            route: item.route || null,
            instructions: item.instructions || null,
          })),
        };
        await createPrescription(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save prescription.");
      setReviewMode(false);
    }
  };

  if (showCancelConfirm) {
    return (
      <div className="space-y-4">
        <Alert title="Discard Changes?" variant="danger">
Are you sure you want to cancel? Any unsaved work will be lost.
</Alert>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
            No, keep editing
          </Button>
          <Button variant="danger" onClick={onCancel}>
            Yes, discard
          </Button>
        </div>
      </div>
    );
  }

  if (reviewMode) {
    return (
      <div className="space-y-6">
        <Alert title="Review Prescription" variant="success" className="bg-green-50 border-green-200">
Please review the details below before saving.
</Alert>
        
        {error && (
          <Alert variant="danger">
{error}
</Alert>
        )}

        <div className="rounded-md border p-4 space-y-4">
          <h4 className="font-semibold text-lg border-b pb-2">Header</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Patient ID: </span>
              {formData.patient_id}
            </div>
            <div>
              <span className="font-medium">Date: </span>
              {formData.prescription_date}
            </div>
          </div>
          
          <h4 className="font-semibold text-lg border-b pb-2 pt-2">Medications ({items.length})</h4>
          <ul className="space-y-4">
            {items.map((item, idx) => (
              <li key={idx} className="bg-muted p-3 rounded-md text-sm space-y-1">
                <div className="font-bold text-base">{item.medicine_name}</div>
                <div>
                  <span className="font-medium">Dosage:</span> {item.dosage} |{" "}
                  <span className="font-medium">Freq:</span> {item.frequency} |{" "}
                  <span className="font-medium">Dur:</span> {item.duration}
                  {item.route && <span> | <span className="font-medium">Route:</span> {item.route}</span>}
                </div>
                {item.instructions && (
                  <div className="italic text-muted-foreground mt-1">
                    "{item.instructions}"
                  </div>
                )}
              </li>
            ))}
          </ul>
          
          {formData.instructions && (
            <>
              <h4 className="font-semibold text-lg border-b pb-2 pt-2">General Instructions</h4>
              <p className="text-sm">{formData.instructions}</p>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setReviewMode(false)} disabled={isLoading}>
            Back to Edit
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Confirm & Save"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="danger">
{error}
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
              onChange={handleFieldChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctor_id">Doctor ID</Label>
            <Input
              id="doctor_id"
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleFieldChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment_id">Appointment ID (Optional)</Label>
            <Input
              id="appointment_id"
              name="appointment_id"
              value={formData.appointment_id}
              onChange={handleFieldChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prescription_date">Date</Label>
            <Input
              id="prescription_date"
              name="prescription_date"
              type="date"
              value={formData.prescription_date}
              onChange={handleFieldChange}
              required
            />
          </div>
        </div>
      )}

      {initialData && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleFieldChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Medications</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border rounded-md border-dashed">
            No medications added yet. Click "Add Medicine" to begin.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border rounded-md relative bg-muted/20">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <h4 className="font-medium mb-3">Item {index + 1}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Medicine Name *</Label>
                    <Input
                      value={item.medicine_name}
                      onChange={(e) => handleItemChange(index, "medicine_name", e.target.value)}
                      placeholder="e.g. Paracetamol"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage *</Label>
                    <Input
                      value={item.dosage}
                      onChange={(e) => handleItemChange(index, "dosage", e.target.value)}
                      placeholder="e.g. 500mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency *</Label>
                    <Input
                      value={item.frequency}
                      onChange={(e) => handleItemChange(index, "frequency", e.target.value)}
                      placeholder="e.g. 1-0-1 (Twice a day)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration *</Label>
                    <Input
                      value={item.duration}
                      onChange={(e) => handleItemChange(index, "duration", e.target.value)}
                      placeholder="e.g. 5 days"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Route</Label>
                    <Input
                      value={item.route || ""}
                      onChange={(e) => handleItemChange(index, "route", e.target.value)}
                      placeholder="e.g. Oral"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Item Instructions</Label>
                    <Input
                      value={item.instructions || ""}
                      onChange={(e) => handleItemChange(index, "instructions", e.target.value)}
                      placeholder="e.g. After food"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 pt-4">
        <Label htmlFor="instructions">General Instructions</Label>
        <Textarea
          id="instructions"
          name="instructions"
          value={formData.instructions}
          onChange={handleFieldChange}
          placeholder="General advice, diet, rest, precautions..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setShowCancelConfirm(true)}>
          Cancel
        </Button>
        <Button onClick={handleProceedToReview}>Review Prescription</Button>
      </div>
    </div>
  );
}
