"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DoctorAvailabilityCreateInput, DoctorAvailabilityUpdateInput, DoctorAvailability } from "@/lib/api/types";
import { useAvailability } from "@/hooks/use-availability";
import { Alert } from "@/components/ui/alert";

interface AvailabilityFormProps {
  doctorId: string;
  initialData?: DoctorAvailability;
  onSuccess: () => void;
  onCancel: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function AvailabilityForm({
  doctorId,
  initialData,
  onSuccess,
  onCancel,
}: AvailabilityFormProps) {
  const { createSlot, updateSlot, isCreating, isUpdating } = useAvailability(doctorId);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    day_of_week: initialData ? initialData.day_of_week : 1,
    start_time: initialData ? initialData.start_time : "09:00:00",
    end_time: initialData ? initialData.end_time : "17:00:00",
    slot_duration_minutes: initialData ? initialData.slot_duration_minutes : 30,
    is_active: initialData ? initialData.is_active : true,
  });

  const isLoading = isCreating || isUpdating;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "day_of_week" || name === "slot_duration_minutes") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Format times to ensure HH:MM:SS format
    const formatTime = (time: string) => {
      if (time.length === 5) return `${time}:00`;
      return time;
    };

    const payload = {
      ...formData,
      start_time: formatTime(formData.start_time),
      end_time: formatTime(formData.end_time),
    };

    try {
      if (initialData) {
        await updateSlot({
          slotId: initialData.id,
          data: payload as DoctorAvailabilityUpdateInput,
        });
      } else {
        await createSlot(payload as DoctorAvailabilityCreateInput);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save availability slot");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="danger">
<>{error}</>
</Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="day_of_week">Day of Week</Label>
        <select
          id="day_of_week"
          name="day_of_week"
          value={formData.day_of_week}
          onChange={handleChange}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          {DAYS_OF_WEEK.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time</Label>
          <Input
            id="start_time"
            name="start_time"
            type="time"
            step="60"
            value={formData.start_time.substring(0, 5)}
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
            step="60"
            value={formData.end_time.substring(0, 5)}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slot_duration_minutes">Slot Duration (Minutes)</Label>
        <Input
          id="slot_duration_minutes"
          name="slot_duration_minutes"
          type="number"
          min="1"
          value={formData.slot_duration_minutes}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Input
          id="is_active"
          name="is_active"
          type="checkbox"
          className="h-4 w-4"
          checked={formData.is_active}
          onChange={handleChange}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

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
