/**
 * Client-side authorization capabilities and role-permission matrix.
 *
 * NOTE: Frontend authorization is strictly for user experience (UX) and navigation.
 * Security boundaries are always verified and enforced by the backend.
 */

import { UserRole } from "@/lib/api/types";

export type Permission =
  | "users:read"
  | "users:write"
  | "audit_logs:read"
  | "dashboard:read"
  | "profile:read"
  | "profile:write"
  | "patients:read"
  | "patients:write"
  | "doctors:read"
  | "doctors:write"
  | "appointments:read"
  | "appointments:write"
  | "availability:read"
  | "availability:write"
  | "records:read"
  | "records:write"
  | "prescriptions:read"
  | "prescriptions:write"
  | "invoices:read"
  | "invoices:write"
  | "payments:read"
  | "payments:write";

export const ALL_PERMISSIONS: readonly Permission[] = [
  "users:read",
  "users:write",
  "audit_logs:read",
  "dashboard:read",
  "profile:read",
  "profile:write",
  "patients:read",
  "patients:write",
  "doctors:read",
  "doctors:write",
  "appointments:read",
  "appointments:write",
  "availability:read",
  "availability:write",
  "records:read",
  "records:write",
  "prescriptions:read",
  "prescriptions:write",
  "invoices:read",
  "invoices:write",
  "payments:read",
  "payments:write",
];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  ADMIN: ALL_PERMISSIONS,
  DOCTOR: [
    "dashboard:read",
    "profile:read",
    "profile:write",
    "patients:read",
    "doctors:read",
    "appointments:read",
    "appointments:write",
    "availability:read",
    "availability:write",
    "records:read",
    "records:write",
    "prescriptions:read",
    "prescriptions:write",
  ],
  RECEPTIONIST: [
    "dashboard:read",
    "profile:read",
    "profile:write",
    "patients:read",
    "patients:write",
    "doctors:read",
    "appointments:read",
    "appointments:write",
    "availability:read",
    "records:read",
    "prescriptions:read",
  ],
  BILLING_STAFF: [
    "dashboard:read",
    "profile:read",
    "profile:write",
    "patients:read",
    "doctors:read",
    "appointments:read",
    "invoices:read",
    "invoices:write",
    "payments:read",
    "payments:write",
  ],
  PATIENT: [
    "dashboard:read",
    "profile:read",
    "profile:write",
    "doctors:read",
    "appointments:read",
    "appointments:write",
    "records:read",
    "prescriptions:read",
    "invoices:read",
    "payments:read",
  ],
};

export function getRolePermissions(role?: UserRole | null): readonly Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] || [];
}

export function hasRole(
  userRole?: UserRole | null,
  roles?: UserRole | readonly UserRole[]
): boolean {
  if (!userRole || !roles) return false;
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  return userRole === roles;
}

export function hasPermission(
  userRole?: UserRole | null,
  permission?: Permission
): boolean {
  if (!userRole || !permission) return false;
  const granted = ROLE_PERMISSIONS[userRole] || [];
  return granted.includes(permission);
}

export function hasAnyPermission(
  userRole?: UserRole | null,
  permissions: readonly Permission[] = []
): boolean {
  if (!userRole || permissions.length === 0) return false;
  const granted = ROLE_PERMISSIONS[userRole] || [];
  return permissions.some((p) => granted.includes(p));
}

export function hasAllPermissions(
  userRole?: UserRole | null,
  permissions: readonly Permission[] = []
): boolean {
  if (!userRole || permissions.length === 0) return false;
  const granted = ROLE_PERMISSIONS[userRole] || [];
  return permissions.every((p) => granted.includes(p));
}
