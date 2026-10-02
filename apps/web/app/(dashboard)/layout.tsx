"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-app-bg p-6"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-royal border-t-transparent" />
            <span className="text-sm font-semibold text-navy">
              Loading Arogyavajra workspace...
            </span>
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
