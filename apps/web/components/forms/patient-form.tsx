"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Patient, PatientCreateInput, PatientUpdateInput } from "@/lib/api/types";

export interface PatientFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Patient> | null;
  onSubmit: (data: PatientCreateInput | PatientUpdateInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  general?: string;
}

export function PatientForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PatientFormProps) {
  const [formData, setFormData] = React.useState({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    date_of_birth: initialData?.date_of_birth || "",
    gender: initialData?.gender || "",
    address: initialData?.address || "",
    emergency_contact_name: initialData?.emergency_contact_name || "",
    emergency_contact_phone: initialData?.emergency_contact_phone || "",
  });

  const [errors, setErrors] = React.useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required.";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number (e.g. +91 98765 43210).";
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (
      formData.emergency_contact_phone.trim() &&
      !/^\+?[0-9\s\-()]{7,20}$/.test(formData.emergency_contact_phone.trim())
    ) {
      newErrors.emergency_contact_phone = "Please enter a valid emergency phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload: PatientCreateInput | PatientUpdateInput = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        address: formData.address.trim() || null,
        emergency_contact_name: formData.emergency_contact_name.trim() || null,
        emergency_contact_phone: formData.emergency_contact_phone.trim() || null,
      };

      if (mode === "create" && formData.email.trim()) {
        (payload as PatientCreateInput).email = formData.email.trim();
      }

      await onSubmit(payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save patient profile.";
      setErrors((prev) => ({ ...prev, general: msg }));
    }
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {errors.general && (
        <Alert variant="danger" title="Error">
{errors.general}
</Alert>
      )}

      {/* Basic Demographics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="patient-first-name"
          label="First Name"
          required
          placeholder="e.g. Ramesh"
          value={formData.first_name}
          onChange={(e) => handleChange("first_name", e.target.value)}
          error={errors.first_name}
          disabled={isLoading}
        />

        <Input
          id="patient-last-name"
          label="Last Name"
          required
          placeholder="e.g. Patel"
          value={formData.last_name}
          onChange={(e) => handleChange("last_name", e.target.value)}
          error={errors.last_name}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="patient-phone"
          label="Phone Number"
          type="tel"
          required
          placeholder="e.g. +91 98765 43210"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={errors.phone}
          disabled={isLoading}
        />

        {mode === "create" ? (
          <Input
            id="patient-email"
            label="Email Address"
            type="email"
            placeholder="patient@example.com"
            helperText="Creates or links patient login account"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
            disabled={isLoading}
          />
        ) : (
          <Input
            id="patient-email-disabled"
            label="Email Address"
            type="email"
            value={formData.email}
            disabled
            helperText="Account email cannot be modified from demographics"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="patient-dob"
          label="Date of Birth"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => handleChange("date_of_birth", e.target.value)}
          error={errors.date_of_birth}
          disabled={isLoading}
        />

        <div className="w-full space-y-1.5">
          <Label htmlFor="patient-gender">Gender</Label>
          <select
            id="patient-gender"
            value={formData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            disabled={isLoading}
            className="flex h-10 w-full rounded-lg border border-app-border bg-white px-3 py-2 text-sm text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal focus-visible:border-royal disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="w-full space-y-1.5">
        <Input
          id="patient-address"
          label="Residential Address"
          placeholder="e.g. 42 MG Road, Bengaluru, Karnataka"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          error={errors.address}
          disabled={isLoading}
        />
      </div>

      {/* Emergency Contact */}
      <div className="border-t border-app-border/60 pt-4">
        <h4 className="text-sm font-semibold text-navy mb-3">
          Emergency Contact Information
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="emergency-contact-name"
            label="Contact Person Name"
            placeholder="e.g. Anita Patel (Spouse)"
            value={formData.emergency_contact_name}
            onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
            error={errors.emergency_contact_name}
            disabled={isLoading}
          />

          <Input
            id="emergency-contact-phone"
            label="Contact Phone"
            type="tel"
            placeholder="e.g. +91 98765 00000"
            value={formData.emergency_contact_phone}
            onChange={(e) => handleChange("emergency_contact_phone", e.target.value)}
            error={errors.emergency_contact_phone}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-border/60">
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
          variant="primary"
          isLoading={isLoading}
          loadingText={mode === "create" ? "Creating Profile..." : "Saving Changes..."}
        >
          {mode === "create" ? "Create Patient Profile" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
