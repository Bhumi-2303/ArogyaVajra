"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  Pill,
  Shield,
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
import { PatientForm } from "@/components/forms/patient-form";
import { useAuthorization } from "@/hooks/use-authorization";
import {
  usePatient,
  useUpdatePatient,
  useDeletePatient,
  usePatientSubresource,
  PatientSubresourceType,
} from "@/hooks/use-patients";
import { PatientCreateInput, PatientUpdateInput } from "@/lib/api/types";

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;

  const { role, hasRole, isAdmin } = useAuthorization();
  const canEdit = hasRole(["ADMIN", "RECEPTIONIST"]);

  // Patient Query
  const {
    data: patientResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = usePatient(patientId);

  const patient = patientResponse?.data;

  // Active Subresource Tab
  const [activeTab, setActiveTab] = React.useState<PatientSubresourceType>("appointments");

  // Subresource Query
  const subresourceQuery = usePatientSubresource(patientId, activeTab);

  // Edit / Delete Modals
  const [isEditOpen, setIsEditOpen] = React.useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = React.useState<string | null>(null);

  const updateMutation = useUpdatePatient(patientId);
  const deleteMutation = useDeletePatient();

  const handleEditSubmit = async (data: PatientCreateInput | PatientUpdateInput) => {
    await updateMutation.mutateAsync(data as PatientUpdateInput);
    setIsEditOpen(false);
    setFeedbackSuccess("Patient demographics updated successfully.");
    setTimeout(() => setFeedbackSuccess(null), 6000);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(patientId);
      setIsDeleteOpen(false);
      router.push("/patients");
    } catch {
      // Handled by deleteMutation.error
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl md:col-span-2" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="space-y-6">
        <Link href="/patients">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Patients
          </Button>
        </Link>
        <Alert
          variant="danger"
          title="Patient Not Found"
          action={
            <Button size="sm" variant="outline" onClick={() =>
refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error
            ? error.message
            : "Unable to retrieve patient profile. The record may have been removed or you do not have permission to view it."}
</Alert>
      </div>
    );
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Patients", href: "/patients" },
    { label: patient.patient_code, current: true },
  ];

  const fullName = `${patient.first_name} ${patient.last_name}`;
  const registeredDate = new Date(patient.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updatedDate = new Date(patient.updated_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/patients">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="text-app-muted hover:text-navy"
          >
            Back to Directory
          </Button>
        </Link>
      </div>

      <PageHeader
        title={fullName}
        description={`Clinical profile and registration details for patient ${patient.patient_code}.`}
        breadcrumbs={breadcrumbs}
        badge={
          <Badge variant="outline" className="bg-soft text-royal font-bold text-sm px-3 py-1">
            {patient.patient_code}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit className="h-4 w-4" />}
                onClick={() => setIsEditOpen(true)}
                id="btn-edit-patient-profile"
              >
                Edit Demographics
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => setIsDeleteOpen(true)}
                id="btn-delete-patient-profile"
              >
                Delete
              </Button>
            )}
          </div>
        }
      />

      {feedbackSuccess && (
        <Alert
          variant="success"
          title="Updated"
          onDismiss={() =>
setFeedbackSuccess(null)}
        >
          {feedbackSuccess}
</Alert>
      )}

      {/* Profile Information Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Core Demographics */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b border-app-border/60">
            <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
              <User className="h-4 w-4 text-royal" />
              Patient Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="text-xs text-app-muted uppercase tracking-wider font-semibold">
                  Full Legal Name
                </span>
                <p className="text-sm font-medium text-navy mt-0.5">{fullName}</p>
              </div>

              <div>
                <span className="text-xs text-app-muted uppercase tracking-wider font-semibold">
                  Patient Code
                </span>
                <p className="text-sm font-mono font-medium text-royal mt-0.5">
                  {patient.patient_code}
                </p>
              </div>

              <div>
                <span className="text-xs text-app-muted uppercase tracking-wider font-semibold">
                  Contact Phone
                </span>
                <p className="text-sm font-medium text-navy mt-0.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-app-muted" />
                  {patient.phone}
                </p>
              </div>

              <div>
                <span className="text-xs text-app-muted uppercase tracking-wider font-semibold">
                  Email Address
                </span>
                <p className="text-sm font-medium text-navy mt-0.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-app-muted" />
                  {patient.email || "No email linked"}
                </p>
              </div>

              <div>
                <span className="text-xs text-app-muted uppercase tracking-wider font-semibold">
                  Date of Birth
                </span>
                <p className="text-sm font-medium text-navy mt-0.5">
                  {patient.date_of_birth || "Not specified"}
                </p>
              </div>

              <div>
                <span className="text-xs text-app-muted uppercase tracking-wider font-semibold">
                  Gender
                </span>
                <p className="text-sm font-medium text-navy mt-0.5">
                  {patient.gender || "Not specified"}
                </p>
              </div>
            </div>

            <div className="border-t border-app-border/40 pt-3">
              <span className="text-xs text-app-muted uppercase tracking-wider font-semibold">
                Residential Address
              </span>
              <p className="text-sm font-medium text-navy mt-0.5 flex items-start gap-1.5">
                <MapPin className="h-4 w-4 text-app-muted mt-0.5 shrink-0" />
                <span>{patient.address || "No residential address on record."}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact & Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-app-border/60">
              <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
                <Shield className="h-4 w-4 text-royal" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <span className="text-xs text-app-muted uppercase tracking-wider font-semibold">
                  Contact Person
                </span>
                <p className="text-sm font-medium text-navy mt-0.5">
                  {patient.emergency_contact_name || "None designated"}
                </p>
              </div>

              <div>
                <span className="text-xs text-app-muted uppercase tracking-wider font-semibold">
                  Emergency Phone
                </span>
                <p className="text-sm font-medium text-navy mt-0.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-danger" />
                  {patient.emergency_contact_phone || "None designated"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-app-border/60">
              <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
                <Clock className="h-4 w-4 text-royal" />
                Audit Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-xs text-app-muted">
              <div className="flex justify-between">
                <span>Profile Created:</span>
                <span className="font-medium text-navy">{registeredDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-medium text-navy">{updatedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Record ID:</span>
                <span className="font-mono text-[11px] truncate max-w-[150px]">{patient.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subresource Retrieval Integration Section */}
      <Card>
        <CardHeader className="pb-0 border-b border-app-border/60">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-navy">
                Clinical Subresources & Operations
              </CardTitle>
              <p className="text-xs text-app-muted mt-0.5">
                Retrieval contract endpoints for appointments, medical records, prescriptions, and billing.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 border-b border-transparent -mb-px">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "appointments"
                  ? "border-royal text-royal"
                  : "border-transparent text-app-muted hover:text-navy"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Appointments
            </button>

            <button
              onClick={() => setActiveTab("medical-records")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "medical-records"
                  ? "border-royal text-royal"
                  : "border-transparent text-app-muted hover:text-navy"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Medical Records
            </button>

            <button
              onClick={() => setActiveTab("prescriptions")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "prescriptions"
                  ? "border-royal text-royal"
                  : "border-transparent text-app-muted hover:text-navy"
              }`}
            >
              <Pill className="h-3.5 w-3.5" />
              Prescriptions
            </button>

            <button
              onClick={() => setActiveTab("invoices")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "invoices"
                  ? "border-royal text-royal"
                  : "border-transparent text-app-muted hover:text-navy"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Invoices & Billing
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {subresourceQuery.isLoading ? (
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-royal border-t-transparent" />
              <p className="text-xs text-app-muted">Querying patient subresource contract endpoint...</p>
            </div>
          ) : subresourceQuery.isError ? (
            <Alert
              variant="warning"
              title="Access Restricted or Unavailable"
            >
{subresourceQuery.error instanceof Error
                ? subresourceQuery.error.message
                : `Role ${role} does not have authorization to retrieve ${activeTab} for this patient, or the resource is restricted.`}
</Alert>
          ) : (
            <EmptyState
              icon={
                activeTab === "appointments" ? (
                  <Calendar className="h-7 w-7" />
                ) : activeTab === "medical-records" ? (
                  <FileText className="h-7 w-7" />
                ) : activeTab === "prescriptions" ? (
                  <Pill className="h-7 w-7" />
                ) : (
                  <CreditCard className="h-7 w-7" />
                )
              }
              title={`No ${activeTab.replace("-", " ")} recorded`}
              description={`Contract endpoint GET /api/v1/patients/${patient.id}/${activeTab} is integrated. No clinical records are scheduled or generated yet.`}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient Profile</DialogTitle>
            <DialogDescription>
              Update demographic and emergency contact details for {fullName} ({patient.patient_code}).
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <PatientForm
              mode="edit"
              initialData={patient}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditOpen(false)}
              isLoading={updateMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Patient Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-5 w-5" />
<DialogTitle>Delete Patient Record</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-sm text-app-muted">
              Are you sure you want to permanently delete patient profile{" "}
              <strong className="text-navy">{fullName}</strong> ({patient.patient_code})?
              This action creates an immutable audit trail entry and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteMutation.isError && (
            <div className="mt-3">
              <Alert
                variant="danger"
                title="Deletion Failed"
              >
                {deleteMutation.error instanceof Error
                  ? deleteMutation.error.message
                  : "Unable to delete patient."}
</Alert>
            </div>
          )}

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={deleteMutation.isPending}
              loadingText="Deleting..."
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
