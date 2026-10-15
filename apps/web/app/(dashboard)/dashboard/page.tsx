"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardDispatcherPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    const role = user.role;
    const targetDashboard =
      role === "ADMIN"
        ? "/admin"
        : role === "DOCTOR"
        ? "/doctor"
        : role === "RECEPTIONIST"
        ? "/receptionist"
        : role === "BILLING_STAFF"
        ? "/billing"
        : "/patient";

    router.replace(targetDashboard);
  }, [user, isLoading, isAuthenticated, router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Opening Arogyavajra role workspace...
        </p>
      </div>
    </div>
  );
}
