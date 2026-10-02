"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  FileBadge,
  Mail,
  Phone,
  Stethoscope,
  Trash2,
  User,
  AlertTriangle,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { BreadcrumbItem } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DoctorForm } from "@/components/forms/doctor-form";
import { useAuthorization } from "@/hooks/use-authorization";
import {
  useDoctor,
  useUpdateDoctor,
  useDeleteDoctor,
} from "@/hooks/use-doctors";
import { DoctorCreateInput, DoctorUpdateInput } from "@/lib/api/types";

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params?.id as string;

  const { user, isAdmin } = useAuthorization();

  // Doctor Query
  const {
    data: doctorResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useDoctor(doctorId);

  const doctor = doctorResponse?.data;

  // Authorization checks
  const isOwner = Boolean(user && doctor && user.id === doctor.user_id);
  const canEdit = isAdmin || isOwner;
  const canDelete = isAdmin;

  // Edit / Delete Modals
  const [isEditOpen, setIsEditOpen] = React.useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = React.useState<string | null>(null);

  const updateMutation = useUpdateDoctor(doctorId);
  const deleteMutation = useDeleteDoctor();

  const handleEditSubmit = async (data: DoctorCreateInput | DoctorUpdateInput) => {
    await updateMutation.mutateAsync(data as DoctorUpdateInput);
    setIsEditOpen(false);
    setFeedbackSuccess("Doctor profile updated successfully.");
    setTimeout(() => setFeedbackSuccess(null), 6000);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(doctorId);
      setIsDeleteOpen(false);
      router.push("/doctors");
    } catch {
      // Handled by deleteMutation.error
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" id="doctor-profile-loading">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Doctor Not Found"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Doctors", href: "/doctors" },
            { label: "Detail", current: true },
          ]}
        />
        <EmptyState
          icon={<AlertTriangle className="h-7 w-7" />}
          title="Doctor profile unavailable"
          description={
            error instanceof Error
              ? error.message
              : "The requested doctor profile could not be found or you do not have permission to view it."
          }
          actionLabel="Back to Doctors"
          onAction={() => router.push("/doctors")}
        />
      </div>
    );
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Doctors", href: "/doctors" },
    { label: `Dr. ${doctor.first_name} ${doctor.last_name}`, current: true },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 mb-1">
            <Link
              href="/doctors"
              className="flex items-center hover:text-royal transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back to Doctors Directory
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-navy" id="doctor-title">
              Dr. {doctor.first_name} {doctor.last_name}
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {doctor.doctor_code}
            </Badge>
            {doctor.is_active ? (
              <Badge variant="active">Active Status</Badge>
            ) : (
              <Badge variant="default">Inactive Status</Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {doctor.specialization}
            {doctor.qualification ? ` • ${doctor.qualification}` : ""}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              id="edit-profile-btn"
              className="flex items-center space-x-1.5"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </Button>
          )}

          {canDelete && (
            <Button
              variant="danger"
              onClick={() => setIsDeleteOpen(true)}
              id="delete-doctor-btn"
              className="flex items-center space-x-1.5"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Doctor</span>
            </Button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {feedbackSuccess && (
        <Alert variant="success" id="doctor-profile-success-alert">
          {feedbackSuccess}
        </Alert>
      )}

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Clinical Profile */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center space-x-2 text-base font-semibold text-navy">
              <Stethoscope className="h-4 w-4 text-royal" />
              <span>Clinical Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div>
              <div className="text-xs font-medium text-slate-400">Doctor Code</div>
              <div className="font-mono text-sm font-semibold text-navy">
                {doctor.doctor_code}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-400">Specialization</div>
              <div className="text-sm font-medium text-slate-800">
                {doctor.specialization}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-400">Qualification</div>
              <div className="text-sm text-slate-700">
                {doctor.qualification || "Not provided"}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-400">Medical License #</div>
              <div className="text-sm font-mono text-slate-700">
                {doctor.license_number || "Not on file"}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-400">Consultation Fee</div>
              <div className="text-base font-bold text-royal flex items-center">
                <span>₹{Number(doctor.consultation_fee).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Contact & Account Link */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center space-x-2 text-base font-semibold text-navy">
              <User className="h-4 w-4 text-royal" />
              <span>User & Contact Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div>
              <div className="text-xs font-medium text-slate-400">Account Email</div>
              <div className="flex items-center space-x-2 text-sm text-slate-700">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{doctor.email || "No email linked"}</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-400">Direct Phone</div>
              <div className="flex items-center space-x-2 text-sm text-slate-700">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{doctor.phone || "Not provided"}</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-400">Linked User Account ID</div>
              <div className="font-mono text-xs text-slate-500 truncate" title={doctor.user_id}>
                {doctor.user_id}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-400">Created At</div>
              <div className="text-xs text-slate-600">
                {new Date(doctor.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-400">Last Profile Update</div>
              <div className="text-xs text-slate-600">
                {new Date(doctor.updated_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Professional Summary / Bio */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center space-x-2 text-base font-semibold text-navy">
              <FileBadge className="h-4 w-4 text-royal" />
              <span>Professional Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {doctor.bio ? (
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {doctor.bio}
              </p>
            ) : (
              <div className="text-sm italic text-slate-400 py-4">
                No professional biography or summary added yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Doctor Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit Doctor Profile: Dr. {doctor.first_name} {doctor.last_name}
            </DialogTitle>
            <DialogDescription>
              Update clinical qualifications, specialization, consultation rates, and bio.
            </DialogDescription>
          </DialogHeader>
          <DoctorForm
            mode="edit"
            initialData={doctor}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditOpen(false)}
            isLoading={updateMutation.isPending}
            isAdmin={isAdmin}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirm Doctor Profile Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to permanently delete the profile for{" "}
              <strong>
                Dr. {doctor.first_name} {doctor.last_name} ({doctor.doctor_code})
              </strong>
              ? This action is restricted to administrators and will be logged in the immutable
              audit trail.
            </DialogDescription>
          </DialogHeader>

          {deleteMutation.isError && (
            <Alert variant="danger" className="mt-2">
              {deleteMutation.error instanceof Error
                ? deleteMutation.error.message
                : "Failed to delete doctor profile."}
            </Alert>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              id="confirm-delete-doctor-btn"
            >
              {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
