"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  UserPlus,
  Users,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  RotateCcw,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { BreadcrumbItem } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PatientForm } from "@/components/forms/patient-form";
import { useAuthorization } from "@/hooks/use-authorization";
import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
} from "@/hooks/use-patients";
import {
  Patient,
  PatientCreateInput,
  PatientSearchParams,
  PatientUpdateInput,
} from "@/lib/api/types";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Patients", current: true },
];

export default function PatientsPage() {
  const { hasRole, role } = useAuthorization();
  const canCreate = hasRole(["ADMIN", "RECEPTIONIST"]);

  // Search & Filter State
  const [page, setPage] = React.useState<number>(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState<boolean>(false);
  const [codeFilter, setCodeFilter] = React.useState<string>("");
  const [nameFilter, setNameFilter] = React.useState<string>("");
  const [phoneFilter, setPhoneFilter] = React.useState<string>("");
  const [emailFilter, setEmailFilter] = React.useState<string>("");

  // Modals & Feedback State
  const [isCreateOpen, setIsCreateOpen] = React.useState<boolean>(false);
  const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = React.useState<string | null>(null);

  // Applied Query Params
  const queryParams: PatientSearchParams = React.useMemo(() => {
    const params: PatientSearchParams = {
      page,
      page_size: pageSize,
    };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (codeFilter.trim()) params.code = codeFilter.trim();
    if (nameFilter.trim()) params.name = nameFilter.trim();
    if (phoneFilter.trim()) params.phone = phoneFilter.trim();
    if (emailFilter.trim()) params.email = emailFilter.trim();
    return params;
  }, [page, pageSize, searchTerm, codeFilter, nameFilter, phoneFilter, emailFilter]);

  const {
    data: patientsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = usePatients(queryParams);

  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient(editingPatient?.id || "");

  const handleResetFilters = () => {
    setSearchTerm("");
    setCodeFilter("");
    setNameFilter("");
    setPhoneFilter("");
    setEmailFilter("");
    setPage(1);
  };

  const handleCreateSubmit = async (data: PatientCreateInput | PatientUpdateInput) => {
    await createMutation.mutateAsync(data as PatientCreateInput);
    setIsCreateOpen(false);
    setFeedbackSuccess("Patient profile successfully registered with generated patient code.");
    setTimeout(() => setFeedbackSuccess(null), 6000);
  };

  const handleEditSubmit = async (data: PatientCreateInput | PatientUpdateInput) => {
    if (!editingPatient) return;
    await updateMutation.mutateAsync(data as PatientUpdateInput);
    setEditingPatient(null);
    setFeedbackSuccess(`Patient ${editingPatient.patient_code} updated successfully.`);
    setTimeout(() => setFeedbackSuccess(null), 6000);
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      codeFilter.trim() ||
      nameFilter.trim() ||
      phoneFilter.trim() ||
      emailFilter.trim()
  );

  const patients = patientsResponse?.data || [];
  const pagination = patientsResponse?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Search, view, and manage patient profiles, medical registration, and contact information."
        breadcrumbs={breadcrumbs}
        actions={
          canCreate && (
            <Button
              variant="primary"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => setIsCreateOpen(true)}
              id="btn-add-patient"
            >
              Register Patient
            </Button>
          )
        }
      />

      {feedbackSuccess && (
        <Alert
          variant="success"
          title="Operation Completed"
          onDismiss={() =>
setFeedbackSuccess(null)}
        >
          {feedbackSuccess}
</Alert>
      )}

      {/* Search & Filter Bar */}
      <div className="rounded-card border border-app-border bg-white p-4 shadow-card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Input
              id="patient-search-input"
              placeholder="Search by name, code, phone, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={showAdvancedFilters ? "secondary" : "outline"}
              size="sm"
              leftIcon={<Filter className="h-3.5 w-3.5" />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? "Hide Filters" : "Filters"}
            </Button>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Documented Fields Filter Panel: code, name, phone, email */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-3 border-t border-app-border/60 pt-3 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in-50 duration-200">
            <Input
              id="filter-patient-code"
              placeholder="Filter by Code (PAT-...)"
              value={codeFilter}
              onChange={(e) => {
                setCodeFilter(e.target.value);
                setPage(1);
              }}
            />
            <Input
              id="filter-patient-name"
              placeholder="Filter by Name"
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value);
                setPage(1);
              }}
            />
            <Input
              id="filter-patient-phone"
              placeholder="Filter by Phone"
              value={phoneFilter}
              onChange={(e) => {
                setPhoneFilter(e.target.value);
                setPage(1);
              }}
            />
            <Input
              id="filter-patient-email"
              placeholder="Filter by Email"
              value={emailFilter}
              onChange={(e) => {
                setEmailFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Data Presentation Area */}
      {isLoading ? (
        <TableSkeleton columns={6} rows={8} />
      ) : isError ? (
        <Alert
          variant="danger"
          title="Failed to Load Patients"
          action={
            <Button size="sm" variant="outline" onClick={() =>
refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error
            ? error.message
            : "Unable to retrieve patient directory. Please check network connectivity."}
</Alert>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={
            hasActiveFilters ? (
              <Search className="h-7 w-7" />
            ) : (
              <Users className="h-7 w-7" />
            )
          }
          title={hasActiveFilters ? "No matching patients found" : "No registered patients yet"}
          description={
            hasActiveFilters
              ? "We couldn't find any patient records matching your filter parameters. Try broadening your query or clear the active filters."
              : "There are currently no patient profiles in the directory. Receptionists and administrators can register walk-in or new clinical patients."
          }
          actionLabel={
            hasActiveFilters ? "Clear All Filters" : canCreate ? "Register First Patient" : undefined
          }
          onAction={
            hasActiveFilters ? handleResetFilters : canCreate ? () => setIsCreateOpen(true) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-app-border bg-white shadow-subtle overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Patient Code</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Contact Phone</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => {
                  const registeredDate = new Date(patient.created_at).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  );

                  return (
                    <TableRow key={patient.id}>
                      <TableCell className="font-mono font-medium">
                        <Badge variant="outline" className="bg-slate-50 text-royal font-semibold">
                          {patient.patient_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-navy">
                          {patient.first_name} {patient.last_name}
                        </div>
                        {patient.date_of_birth && (
                          <div className="text-xs text-app-muted">
                            DOB: {patient.date_of_birth}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-navy">{patient.phone}</TableCell>
                      <TableCell className="text-sm text-app-muted">
                        {patient.email || "—"}
                      </TableCell>
                      <TableCell>
                        {patient.gender ? (
                          <Badge variant="default" className="text-xs">
                            {patient.gender}
                          </Badge>
                        ) : (
                          <span className="text-app-muted text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-app-muted">
                        {registeredDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/patients/${patient.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View Patient Profile"
                              leftIcon={<Eye className="h-3.5 w-3.5" />}
                            >
                              View
                            </Button>
                          </Link>
                          {canCreate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit Patient Demographics"
                              onClick={() => setEditingPatient(patient)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 px-2 sm:flex-row text-xs text-app-muted">
              <div>
                Showing{" "}
                <span className="font-medium text-navy">
                  {(pagination.page - 1) * pagination.page_size + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-navy">
                  {Math.min(pagination.page * pagination.page_size, pagination.total)}
                </span>{" "}
                of <span className="font-medium text-navy">{pagination.total}</span> patients
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
                >
                  Previous
                </Button>
                <span className="px-2.5 font-medium text-navy">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.total_pages}
                  onClick={() => setPage((prev) => Math.min(pagination.total_pages, prev + 1))}
                  rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Register Patient Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
            <DialogDescription>
              Complete the patient demographics. A unique, sequential patient code (e.g. PAT-00001) will automatically be generated.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <PatientForm
              mode="create"
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateOpen(false)}
              isLoading={createMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog
        open={Boolean(editingPatient)}
        onOpenChange={(open) => !open && setEditingPatient(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient Profile</DialogTitle>
            <DialogDescription>
              Updating clinical demographics for {editingPatient?.first_name}{" "}
              {editingPatient?.last_name} ({editingPatient?.patient_code}).
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <PatientForm
              mode="edit"
              initialData={editingPatient}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingPatient(null)}
              isLoading={updateMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
