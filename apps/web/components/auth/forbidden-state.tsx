"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/api/types";

export interface ForbiddenStateProps {
  currentRole?: UserRole | null;
  requiredRoles?: UserRole | readonly UserRole[];
  resourceName?: string;
  onLogout?: () => void;
  className?: string;
}

/**
 * Accessible 403 Forbidden state displayed when an authenticated user lacks required privileges.
 */
export function ForbiddenState({
  currentRole,
  requiredRoles,
  resourceName = "clinical resource",
  onLogout,
  className,
}: ForbiddenStateProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await logout();
    }
  };

  const formattedRequiredRoles = React.useMemo(() => {
    if (!requiredRoles) return null;
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return rolesArray.join(", ");
  }, [requiredRoles]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex min-h-[60vh] items-center justify-center p-4 sm:p-6"
    >
      <Card className="w-full max-w-lg shadow-card border-danger/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-light text-danger mb-3 shadow-subtle">
            <ShieldAlert className="h-7 w-7" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl text-navy">
            Access Restricted (403 Forbidden)
          </CardTitle>
          <CardDescription className="text-xs text-app-muted">
            You do not have the required permissions to access this {resourceName}.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-app-border bg-app-bg p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-app-muted">Your Active Role:</span>
              <Badge variant="danger" className="text-xs">
                {currentRole ?? "UNRESOLVED"}
              </Badge>
            </div>
            {formattedRequiredRoles && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-app-muted">Required Role(s):</span>
                <span className="text-xs font-mono font-medium text-navy">
                  {formattedRequiredRoles}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-app-muted">Security Policy:</span>
              <span className="text-xs font-medium text-app-muted">
                Role-Based Access Control (RBAC)
              </span>
            </div>
          </div>

          <p className="text-xs text-app-muted text-center leading-relaxed">
            Healthcare regulations and internal security policies restrict access to patient data,
            clinical documentation, and billing tools to authorized personnel.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/" className="w-full sm:w-1/2">
            <Button
              variant="outline"
              className="w-full justify-center"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Public Portal
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full sm:w-1/2 justify-center text-danger hover:bg-danger-light/50"
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={handleLogout}
          >
            Switch Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
