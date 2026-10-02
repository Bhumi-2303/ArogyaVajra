"use client";

import { useMemo } from "react";
import { useAuth } from "./use-auth";
import { UserRole } from "@/lib/api/types";
import { Permission } from "@/lib/auth/permissions";

/**
 * Hook providing ergonomic authorization and role helpers for the active session.
 */
export function useAuthorization() {
  const {
    user,
    role,
    permissions,
    isAuthenticated,
    isLoading,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = useAuth();

  const isPatient = role === "PATIENT";
  const isDoctor = role === "DOCTOR";
  const isReceptionist = role === "RECEPTIONIST";
  const isBillingStaff = role === "BILLING_STAFF";
  const isAdmin = role === "ADMIN";

  const isClinicalStaff = useMemo(
    () => hasRole(["DOCTOR", "RECEPTIONIST", "ADMIN"] as const),
    [hasRole]
  );

  const isStaff = useMemo(
    () => hasRole(["DOCTOR", "RECEPTIONIST", "BILLING_STAFF", "ADMIN"] as const),
    [hasRole]
  );

  return {
    user,
    role,
    permissions,
    isAuthenticated,
    isLoading,
    isPatient,
    isDoctor,
    isReceptionist,
    isBillingStaff,
    isAdmin,
    isClinicalStaff,
    isStaff,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
