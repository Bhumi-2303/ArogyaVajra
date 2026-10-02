"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  UserPlus,
  Stethoscope,
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
import { DoctorForm } from "@/components/forms/doctor-form";
import { useAuthorization } from "@/hooks/use-authorization";
import {
  useDoctors,
  useCreateDoctor,
  useUpdateDoctor,
} from "@/hooks/use-doctors";
import {
  Doctor,
  DoctorCreateInput,
  DoctorSearchParams,
  DoctorUpdateInput,
} from "@/lib/api/types";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Doctors", current: true },
];

export default function DoctorsPage() {
  const { user, isAdmin } = useAuthorization();
  const canCreate = isAdmin;

  // Search & Filter State
  const [page, setPage] = React.useState<number>(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState<boolean>(false);
  const [codeFilter, setCodeFilter] = React.useState<string>("");
  const [nameFilter, setNameFilter] = React.useState<string>("");
  const [specializationFilter, setSpecializationFilter] = React.useState<string>("");
  const [activeFilter, setActiveFilter] = React.useState<string>("all");

  // Modals & Feedback State
  const [isCreateOpen, setIsCreateOpen] = React.useState<boolean>(false);
  const [editingDoctor, setEditingDoctor] = React.useState<Doctor | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = React.useState<string | null>(null);

  // Applied Query Params
  const queryParams: DoctorSearchParams = React.useMemo(() => {
    const params: DoctorSearchParams = {
      page,
      page_size: pageSize,
    };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (codeFilter.trim()) params.code = codeFilter.trim();
    if (nameFilter.trim()) params.name = nameFilter.trim();
    if (specializationFilter.trim()) params.specialization = specializationFilter.trim();
    if (activeFilter === "active") params.is_active = true;
    if (activeFilter === "inactive") params.is_active = false;
    return params;
  }, [page, pageSize, searchTerm, codeFilter, nameFilter, specializationFilter, activeFilter]);

  const {
    data: doctorsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useDoctors(queryParams);

  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor(editingDoctor?.id || "");

  const handleResetFilters = () => {
    setSearchTerm("");
    setCodeFilter("");
    setNameFilter("");
    setSpecializationFilter("");
    setActiveFilter("all");
    setPage(1);
  };

  const handleCreateSubmit = async (data: DoctorCreateInput | DoctorUpdateInput) => {
    await createMutation.mutateAsync(data as DoctorCreateInput);
    setIsCreateOpen(false);
    setFeedbackSuccess("Doctor profile successfully registered with generated doctor code.");
    setTimeout(() => setFeedbackSuccess(null), 6000);
  };

  const handleEditSubmit = async (data: DoctorCreateInput | DoctorUpdateInput) => {
    if (!editingDoctor) return;
    await updateMutation.mutateAsync(data as DoctorUpdateInput);
    setEditingDoctor(null);
    setFeedbackSuccess(`Doctor profile (${editingDoctor.doctor_code}) updated successfully.`);
    setTimeout(() => setFeedbackSuccess(null), 6000);
  };

  const doctors = doctorsResponse?.data || [];
  const pagination = doctorsResponse?.pagination;
  const totalPages = pagination?.total_pages || 1;
  const totalCount = pagination?.total || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Doctor Directory"
        description="Search, view, and manage medical specialists, credentials, and consultation rates."
        breadcrumbs={breadcrumbs}
        actions={
          canCreate ? (
            <Button
              onClick={() => setIsCreateOpen(true)}
              id="register-doctor-btn"
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Register Doctor</span>
            </Button>
          ) : undefined
        }
      />

      {/* Success Notification Banner */}
      {feedbackSuccess && (
        <Alert
          variant="success"
          id="doctor-success-banner"
          className="flex items-center justify-between"
        >
          <span>{feedbackSuccess}</span>
          <button
            onClick={() => setFeedbackSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900"
            aria-label="Dismiss feedback"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      {/* Search and Filter Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="doctor-global-search"
              placeholder="Search doctors by name, specialization, or doctor code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-1.5"
              id="toggle-filters-btn"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {(codeFilter || nameFilter || specializationFilter || activeFilter !== "all") && (
                <span className="flex h-2 w-2 rounded-full bg-royal" />
              )}
            </Button>

            {(searchTerm ||
              codeFilter ||
              nameFilter ||
              specializationFilter ||
              activeFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                className="text-slate-500 hover:text-slate-800"
                title="Reset filters"
                id="reset-filters-btn"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                <span className="text-xs">Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-4">
            <div>
              <label htmlFor="filter-name" className="text-xs font-semibold text-slate-600">
                Doctor Name
              </label>
              <Input
                id="filter-name"
                placeholder="e.g. Ananya"
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value);
                  setPage(1);
                }}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <label htmlFor="filter-spec" className="text-xs font-semibold text-slate-600">
                Specialization
              </label>
              <Input
                id="filter-spec"
                placeholder="e.g. Cardiology"
                value={specializationFilter}
                onChange={(e) => {
                  setSpecializationFilter(e.target.value);
                  setPage(1);
                }}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <label htmlFor="filter-code" className="text-xs font-semibold text-slate-600">
                Doctor Code
              </label>
              <Input
                id="filter-code"
                placeholder="e.g. DOC-00001"
                value={codeFilter}
                onChange={(e) => {
                  setCodeFilter(e.target.value);
                  setPage(1);
                }}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <label htmlFor="filter-status" className="text-xs font-semibold text-slate-600">
                Active Status
              </label>
              <select
                id="filter-status"
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setPage(1);
                }}
                className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-navy focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isError && (
        <Alert variant="danger" id="doctors-fetch-error">
          <div className="flex items-center justify-between">
            <span>
              Failed to load doctor directory:{" "}
              {error instanceof Error ? error.message : "Network error"}
            </span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={<Stethoscope className="h-7 w-7" />}
          title="No doctors found"
          description={
            searchTerm || codeFilter || nameFilter || specializationFilter || activeFilter !== "all"
              ? "No clinical profiles match your active search filters. Try adjusting or clearing filters."
              : "No doctor profiles have been provisioned in the directory yet."
          }
          actionLabel={
            searchTerm || codeFilter || nameFilter || specializationFilter || activeFilter !== "all"
              ? "Clear Search Filters"
              : canCreate
              ? "Register First Doctor"
              : undefined
          }
          onAction={
            searchTerm || codeFilter || nameFilter || specializationFilter || activeFilter !== "all"
              ? handleResetFilters
              : canCreate
              ? () => setIsCreateOpen(true)
              : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table id="doctors-table">
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Consultation Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => {
                const canEditDoctor = isAdmin || user?.id === doctor.user_id;

                return (
                  <TableRow key={doctor.id} id={`doctor-row-${doctor.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-royal/10 text-xs font-bold text-royal">
                          {doctor.first_name[0]}
                          {doctor.last_name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-navy">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {doctor.email || "No email linked"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {doctor.doctor_code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-700">
                        {doctor.specialization}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600 text-xs">
                        {doctor.qualification || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-navy text-sm">
                        ₹{Number(doctor.consultation_fee).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {doctor.is_active ? (
                        <Badge variant="active">Active</Badge>
                      ) : (
                        <Badge variant="default">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/doctors/${doctor.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Profile"
                            id={`view-doctor-${doctor.id}`}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View profile</span>
                          </Button>
                        </Link>
                        {canEditDoctor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit Doctor"
                            id={`edit-doctor-${doctor.id}`}
                            onClick={() => setEditingDoctor(doctor)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit profile</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row">
            <div className="text-xs text-slate-500" id="doctors-pagination-info">
              Showing{" "}
              <span className="font-medium text-navy">
                {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-navy">
                {Math.min(page * pageSize, totalCount)}
              </span>{" "}
              of <span className="font-medium text-navy">{totalCount}</span> doctors
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                id="pagination-prev-btn"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-xs text-slate-600 px-2 font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                id="pagination-next-btn"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Register Doctor */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register New Doctor</DialogTitle>
            <DialogDescription>
              Create a clinical doctor profile and link to their user account. An official
              doctor code (e.g. DOC-00001) will be generated automatically.
            </DialogDescription>
          </DialogHeader>
          <DoctorForm
            mode="create"
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={createMutation.isPending}
            isAdmin={isAdmin}
          />
        </DialogContent>
      </Dialog>

      {/* Modal: Quick Edit Doctor */}
      <Dialog
        open={Boolean(editingDoctor)}
        onOpenChange={(open) => {
          if (!open) setEditingDoctor(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit Doctor Profile: Dr. {editingDoctor?.first_name} {editingDoctor?.last_name}
            </DialogTitle>
            <DialogDescription>
              Update clinical details, consultation rates, and professional credentials.
            </DialogDescription>
          </DialogHeader>
          {editingDoctor && (
            <DoctorForm
              mode="edit"
              initialData={editingDoctor}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingDoctor(null)}
              isLoading={updateMutation.isPending}
              isAdmin={isAdmin}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
