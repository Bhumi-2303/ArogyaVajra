"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/api/types";
import { Permission } from "@/lib/auth/permissions";
import { ForbiddenState } from "./forbidden-state";
import { Skeleton } from "@/components/ui/skeleton";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole | readonly UserRole[];
  requiredPermissions?: Permission | readonly Permission[];
  redirectTo?: string;
  fallback?: React.ReactNode;
  resourceName?: string;
}

/**
 * Route protection wrapper verifying authentication and role authorization.
 *
 * Enforces UX protection:
 * - Unauthenticated users are redirected to login with return path.
 * - Authenticated users lacking required role are presented with 403 ForbiddenState.
 * - Does NOT render protected children until authorization is confirmed.
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
  redirectTo = "/login",
  fallback,
  resourceName,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isLoading, isAuthenticated, hasRole, hasAllPermissions } =
    useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${redirectTo}?redirect=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, pathname, redirectTo, router]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center p-6 space-y-4"
        aria-busy="true"
        aria-label="Verifying clinical session..."
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-app-muted">
          Verifying security credentials...
        </p>
        <div className="w-full max-w-md space-y-2">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  // Unauthenticated: return null while redirection executes
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check role authorization
  if (allowedRoles) {
    const isRolePermitted = hasRole(allowedRoles);
    if (!isRolePermitted) {
      if (fallback) return <>{fallback}</>;
      return (
        <ForbiddenState
          currentRole={role}
          requiredRoles={allowedRoles}
          resourceName={resourceName}
        />
      );
    }
  }

  // Check permission authorization
  if (requiredPermissions) {
    const perms = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];
    const isPermitted = hasAllPermissions(perms);
    if (!isPermitted) {
      if (fallback) return <>{fallback}</>;
      return (
        <ForbiddenState
          currentRole={role}
          resourceName={resourceName}
        />
      );
    }
  }

  // Authorized
  return <>{children}</>;
}
