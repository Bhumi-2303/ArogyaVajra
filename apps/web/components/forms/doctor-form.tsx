"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Doctor, DoctorCreateInput, DoctorUpdateInput } from "@/lib/api/types";

export interface DoctorFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Doctor> | null;
  onSubmit: (data: DoctorCreateInput | DoctorUpdateInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isAdmin?: boolean;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  specialization?: string;
  qualification?: string;
  license_number?: string;
  phone?: string;
  email?: string;
  consultation_fee?: string;
  general?: string;
}

export function DoctorForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isAdmin = false,
}: DoctorFormProps) {
  const [formData, setFormData] = React.useState({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    email: initialData?.email || "",
    password: "",
    specialization: initialData?.specialization || "",
    qualification: initialData?.qualification || "",
    license_number: initialData?.license_number || "",
    phone: initialData?.phone || "",
    consultation_fee:
      initialData?.consultation_fee !== undefined
        ? String(initialData.consultation_fee)
        : "500.00",
    bio: initialData?.bio || "",
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
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

    if (!formData.specialization.trim()) {
      newErrors.specialization = "Specialization is required (e.g., Cardiology, Pediatrics).";
    }

    const fee = parseFloat(formData.consultation_fee);
    if (isNaN(fee) || fee < 0) {
      newErrors.consultation_fee = "Please provide a valid non-negative consultation fee.";
    }

    if (mode === "create") {
      if (!formData.email.trim()) {
        newErrors.email = "Account email is required to associate doctor profile.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    } else if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (
      formData.phone.trim() &&
      !/^\+?[0-9\s\-()]{7,20}$/.test(formData.phone.trim())
    ) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const feeNum = parseFloat(formData.consultation_fee) || 0;
      if (mode === "create") {
        const payload: DoctorCreateInput = {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password || undefined,
          specialization: formData.specialization.trim(),
          qualification: formData.qualification.trim() || null,
          license_number: formData.license_number.trim() || null,
          phone: formData.phone.trim() || null,
          consultation_fee: feeNum,
          bio: formData.bio.trim() || null,
        };
        await onSubmit(payload);
      } else {
        const payload: DoctorUpdateInput = {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          specialization: formData.specialization.trim(),
          qualification: formData.qualification.trim() || null,
          license_number: formData.license_number.trim() || null,
          phone: formData.phone.trim() || null,
          consultation_fee: feeNum,
          bio: formData.bio.trim() || null,
          is_active: isAdmin ? formData.is_active : undefined,
        };
        await onSubmit(payload);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save doctor profile. Please verify fields.";
      setErrors((prev) => ({ ...prev, general: message }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {errors.general && (
        <Alert variant="danger" id="doctor-form-error">
{errors.general}
</Alert>
      )}

      {/* Basic Demographics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="doc_first_name" required>
            First Name
          </Label>
          <Input
            id="doc_first_name"
            placeholder="e.g. Ananya"
            value={formData.first_name}
            onChange={(e) => {
              setFormData({ ...formData, first_name: e.target.value });
              if (errors.first_name) setErrors({ ...errors, first_name: undefined });
            }}
            error={errors.first_name}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="doc_last_name" required>
            Last Name
          </Label>
          <Input
            id="doc_last_name"
            placeholder="e.g. Sharma"
            value={formData.last_name}
            onChange={(e) => {
              setFormData({ ...formData, last_name: e.target.value });
              if (errors.last_name) setErrors({ ...errors, last_name: undefined });
            }}
            error={errors.last_name}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      {/* Account Email & Password (for create mode) */}
      {mode === "create" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="doc_email" required>
              Doctor User Email
            </Label>
            <Input
              id="doc_email"
              type="email"
              placeholder="doctor@arogyavajra.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              error={errors.email}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc_password">
              Initial Password <span className="text-muted font-normal text-xs">(Optional)</span>
            </Label>
            <Input
              id="doc_password"
              type="password"
              placeholder="Defaults to secure temporary token"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Clinical Specialization & Qualification */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="doc_specialization" required>
            Specialization
          </Label>
          <Input
            id="doc_specialization"
            placeholder="e.g. Cardiology, Pediatrics, Neurology"
            value={formData.specialization}
            onChange={(e) => {
              setFormData({ ...formData, specialization: e.target.value });
              if (errors.specialization) setErrors({ ...errors, specialization: undefined });
            }}
            error={errors.specialization}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="doc_qualification">
            Qualification / Degrees
          </Label>
          <Input
            id="doc_qualification"
            placeholder="e.g. MBBS, MD (Medicine), DM"
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* License, Phone, Fee */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="doc_license">Medical License #</Label>
          <Input
            id="doc_license"
            placeholder="e.g. MCI-2018-94812"
            value={formData.license_number}
            onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="doc_phone">Contact Phone</Label>
          <Input
            id="doc_phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
              if (errors.phone) setErrors({ ...errors, phone: undefined });
            }}
            error={errors.phone}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="doc_fee" required>
            Consultation Fee (₹)
          </Label>
          <Input
            id="doc_fee"
            type="number"
            step="0.01"
            min="0"
            placeholder="500.00"
            value={formData.consultation_fee}
            onChange={(e) => {
              setFormData({ ...formData, consultation_fee: e.target.value });
              if (errors.consultation_fee)
                setErrors({ ...errors, consultation_fee: undefined });
            }}
            error={errors.consultation_fee}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      {/* Professional Bio */}
      <div className="space-y-2">
        <Label htmlFor="doc_bio">Professional Summary / Bio</Label>
        <textarea
          id="doc_bio"
          rows={3}
          placeholder="Brief clinical background, specialties, and experience..."
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal disabled:cursor-not-allowed disabled:opacity-50"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          disabled={isLoading}
        />
      </div>

      {/* Active Status (Admin edit only) */}
      {mode === "edit" && isAdmin && (
        <div className="flex items-center space-x-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
          <input
            id="doc_is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-royal focus:ring-royal"
            disabled={isLoading}
          />
          <div>
            <label htmlFor="doc_is_active" className="text-sm font-medium text-navy cursor-pointer">
              Active Clinical Status
            </label>
            <p className="text-xs text-slate-500">
              When inactive, doctor profile is archived and cannot receive clinical assignments.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-2">
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
          disabled={isLoading}
          id="doctor-form-submit"
        >
          {isLoading
            ? "Saving..."
            : mode === "create"
            ? "Register Doctor"
            : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
