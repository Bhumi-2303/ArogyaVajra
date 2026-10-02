"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { BreadcrumbItem } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthorization } from "@/hooks/use-authorization";
import {
  useActivateUser,
  useDeactivateUser,
  useUpdateUser,
  useUsers,
} from "@/hooks/use-users";
import { User, UserRole, UserSearchParams } from "@/lib/api/types";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Users", current: true },
];

const ROLE_DESCRIPTIONS: Record<UserRole, { label: string; desc: string }> = {
  PATIENT: {
    label: "Patient",
    desc: "Self-service patient portal access, personal appointments and medical history",
  },
  DOCTOR: {
    label: "Doctor",
    desc: "Clinical workspace, patient consultations, records, prescriptions, and schedule",
  },
  RECEPTIONIST: {
    label: "Receptionist",
    desc: "Front desk operations, patient intake registration, and appointment coordination",
  },
  BILLING_STAFF: {
    label: "Billing Staff",
    desc: "Financial operations, invoice generation, payment reconciliation, and accounts",
  },
  ADMIN: {
    label: "Administrator",
    desc: "Full system administration, user provisioning, role assignments, and audit logging",
  },
};

export default function UsersManagementPage() {
  const { user: currentUser, isAdmin, isLoading: isAuthLoading } = useAuthorization();

  // Search & Filter State
  const [page, setPage] = React.useState<number>(1);
  const pageSize = 15;
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [roleFilter, setRoleFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");

  // Modals & Feedback State
  const [editingRoleUser, setEditingRoleUser] = React.useState<User | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<UserRole>("PATIENT");
  const [deactivatingUser, setDeactivatingUser] = React.useState<User | null>(null);
  const [activatingUser, setActivatingUser] = React.useState<User | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = React.useState<string | null>(null);
  const [feedbackError, setFeedbackError] = React.useState<string | null>(null);

  // Applied Query Params
  const queryParams: UserSearchParams = React.useMemo(() => {
    const params: UserSearchParams = {
      page,
      page_size: pageSize,
    };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (roleFilter) params.role = roleFilter as UserRole;
    if (statusFilter === "active") params.is_active = true;
    if (statusFilter === "inactive") params.is_active = false;
    return params;
  }, [page, pageSize, searchTerm, roleFilter, statusFilter]);

  const {
    data: usersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useUsers(queryParams);

  const updateMutation = useUpdateUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const handleOpenRoleModal = (targetUser: User) => {
    setEditingRoleUser(targetUser);
    setSelectedRole(targetUser.role);
    setFeedbackError(null);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoleUser) return;

    try {
      await updateMutation.mutateAsync({
        userId: editingRoleUser.id,
        data: { role: selectedRole },
      });
      setFeedbackSuccess(
        `Role for ${editingRoleUser.email} successfully updated to ${selectedRole}.`
      );
      setEditingRoleUser(null);
      setTimeout(() => setFeedbackSuccess(null), 5000);
    } catch (err: unknown) {
      setFeedbackError(
        err instanceof Error ? err.message : "Failed to update user role."
      );
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivatingUser) return;
    try {
      await deactivateMutation.mutateAsync(deactivatingUser.id);
      setFeedbackSuccess(
        `User account ${deactivatingUser.email} has been deactivated.`
      );
      setDeactivatingUser(null);
      setTimeout(() => setFeedbackSuccess(null), 5000);
    } catch (err: unknown) {
      setFeedbackError(
        err instanceof Error ? err.message : "Failed to deactivate account."
      );
      setDeactivatingUser(null);
    }
  };

  const handleActivateConfirm = async () => {
    if (!activatingUser) return;
    try {
      await activateMutation.mutateAsync(activatingUser.id);
      setFeedbackSuccess(
        `User account ${activatingUser.email} has been reactivated.`
      );
      setActivatingUser(null);
      setTimeout(() => setFeedbackSuccess(null), 5000);
    } catch (err: unknown) {
      setFeedbackError(
        err instanceof Error ? err.message : "Failed to activate account."
      );
      setActivatingUser(null);
    }
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() || roleFilter || statusFilter
  );

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination;

  // Authorization Guard: Only ADMIN
  if (!isAuthLoading && !isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          breadcrumbs={breadcrumbs}
        />
        <Alert variant="danger" title="Access Denied">
          Only administrators have authorization to view and manage user accounts.
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Search, view, and manage system user credentials, clinical role assignments, and account access statuses."
        breadcrumbs={breadcrumbs}
      />

      {feedbackSuccess && (
        <Alert
          variant="success"
          title="Operation Completed"
          onDismiss={() => setFeedbackSuccess(null)}
        >
          {feedbackSuccess}
        </Alert>
      )}

      {feedbackError && (
        <Alert
          variant="danger"
          title="Operation Failed"
          onDismiss={() => setFeedbackError(null)}
        >
          {feedbackError}
        </Alert>
      )}

      {/* Filter and Search Controls */}
      <div className="rounded-card border border-app-border bg-white p-4 shadow-card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Input
              id="user-search-input"
              placeholder="Search by user email address..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Role */}
            <div className="w-40">
              <select
                id="filter-user-role"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="flex h-10 w-full rounded-lg border border-app-border bg-white px-3 py-2 text-xs font-medium text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal focus-visible:border-royal"
                aria-label="Filter by role"
              >
                <option value="">All Roles</option>
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="BILLING_STAFF">Billing Staff</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="w-36">
              <select
                id="filter-user-status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="flex h-10 w-full rounded-lg border border-app-border bg-white px-3 py-2 text-xs font-medium text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal focus-visible:border-royal"
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

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
      </div>

      {/* Presentation Table */}
      {isLoading ? (
        <TableSkeleton columns={6} rows={8} />
      ) : isError ? (
        <Alert
          variant="danger"
          title="Failed to Load Users"
          action={
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error
            ? error.message
            : "Unable to retrieve users directory. Please check network connectivity."}
        </Alert>
      ) : users.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? <Search className="h-7 w-7" /> : <Users className="h-7 w-7" />}
          title={hasActiveFilters ? "No matching accounts found" : "No users found"}
          description={
            hasActiveFilters
              ? "We couldn't find any registered accounts matching your filter parameters. Try clearing your filters."
              : "No user accounts exist in the database."
          }
          actionLabel={hasActiveFilters ? "Clear All Filters" : undefined}
          onAction={hasActiveFilters ? handleResetFilters : undefined}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-app-border bg-white shadow-subtle overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Account (Email)</TableHead>
                  <TableHead className="w-36">Role</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Last Authentication</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((account) => {
                  const createdDate = new Date(account.created_at).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  );

                  const lastLogin = account.last_login_at
                    ? new Date(account.last_login_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never logged in";

                  const isSelf = account.id === currentUser?.id;

                  return (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div className="font-semibold text-navy flex items-center gap-2">
                          <span>{account.email}</span>
                          {isSelf && (
                            <Badge variant="outline" className="text-[10px] bg-soft text-royal">
                              You
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-app-muted">
                          {account.id}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            account.role === "ADMIN"
                              ? "outline"
                              : account.role === "DOCTOR"
                              ? "default"
                              : account.role === "BILLING_STAFF"
                              ? "issued"
                              : "default"
                          }
                          className="font-medium text-xs uppercase"
                        >
                          {account.role.replace("_", " ")}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {account.is_active ? (
                          <Badge variant="active" className="text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-app-muted">
                        {createdDate}
                      </TableCell>

                      <TableCell className="text-xs text-app-muted">
                        {lastLogin}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRoleModal(account)}
                            title="Edit Role Assignment"
                            id={`btn-edit-role-${account.id}`}
                          >
                            Edit Role
                          </Button>

                          {account.is_active ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-danger hover:bg-danger-light hover:text-danger-dark"
                              onClick={() => setDeactivatingUser(account)}
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? "Cannot deactivate your own active account"
                                  : "Deactivate user account"
                              }
                              id={`btn-deactivate-${account.id}`}
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-success hover:bg-success-light hover:text-success-dark"
                              onClick={() => setActivatingUser(account)}
                              title="Reactivate user account"
                              id={`btn-activate-${account.id}`}
                            >
                              <UserCheck className="h-3.5 w-3.5" />
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
                of <span className="font-medium text-navy">{pagination.total}</span> users
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

      {/* Role Editing Dialog */}
      <Dialog
        open={Boolean(editingRoleUser)}
        onOpenChange={(open) => !open && setEditingRoleUser(null)}
      >
        <DialogContent className="max-w-md">
          <form onSubmit={handleRoleSubmit}>
            <DialogHeader>
              <div className="flex items-center gap-2 text-royal">
                <Shield className="h-5 w-5" />
                <DialogTitle>Edit Role Assignment</DialogTitle>
              </div>
              <DialogDescription className="pt-2 text-xs text-app-muted">
                Assign a platform role to <strong className="text-navy">{editingRoleUser?.email}</strong>.
                Role changes take effect on subsequent token requests and generate an immutable audit trail.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="select-user-role">System Role</Label>
                <select
                  id="select-user-role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="flex h-10 w-full rounded-lg border border-app-border bg-white px-3 py-2 text-sm text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal focus-visible:border-royal"
                >
                  <option value="PATIENT">PATIENT — Patient Portal</option>
                  <option value="DOCTOR">DOCTOR — Clinical Care</option>
                  <option value="RECEPTIONIST">RECEPTIONIST — Front Desk</option>
                  <option value="BILLING_STAFF">BILLING_STAFF — Financials</option>
                  <option value="ADMIN">ADMIN — Platform Administrator</option>
                </select>
              </div>

              <div className="rounded-lg bg-soft/50 border border-blue-100 p-3 text-xs text-navy">
                <p className="font-semibold text-royal">
                  {ROLE_DESCRIPTIONS[selectedRole].label}
                </p>
                <p className="mt-0.5 text-app-muted">
                  {ROLE_DESCRIPTIONS[selectedRole].desc}
                </p>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingRoleUser(null)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={updateMutation.isPending}
                loadingText="Updating..."
                id="btn-confirm-role-update"
              >
                Save Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivation Confirmation Dialog */}
      <Dialog
        open={Boolean(deactivatingUser)}
        onOpenChange={(open) => !open && setDeactivatingUser(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Deactivate User Account</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-sm text-app-muted">
              Are you sure you want to deactivate account{" "}
              <strong className="text-navy">{deactivatingUser?.email}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 text-xs text-app-muted space-y-2">
            <p>
              • The user will immediately be blocked from logging into the platform.
            </p>
            <p>
              • Active sessions and credentials will be revoked.
            </p>
            <p>
              • An immutable audit log entry will record this action with your administrative identity.
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeactivatingUser(null)}
              disabled={deactivateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeactivateConfirm}
              isLoading={deactivateMutation.isPending}
              loadingText="Deactivating..."
              id="btn-confirm-deactivation"
            >
              Confirm Deactivation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activation Confirmation Dialog */}
      <Dialog
        open={Boolean(activatingUser)}
        onOpenChange={(open) => !open && setActivatingUser(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <DialogTitle>Reactivate User Account</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-sm text-app-muted">
              Reactivate account for{" "}
              <strong className="text-navy">{activatingUser?.email}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 text-xs text-app-muted space-y-1">
            <p>
              The user will regain login access according to their assigned role (
              {activatingUser?.role}).
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActivatingUser(null)}
              disabled={activateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={handleActivateConfirm}
              isLoading={activateMutation.isPending}
              loadingText="Activating..."
              id="btn-confirm-activation"
            >
              Confirm Activation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
