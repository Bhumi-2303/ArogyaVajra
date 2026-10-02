import * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Reusable summary card skeleton for metric/summary widgets.
 * Defined in UI-UX Brief Section 27.2.
 */
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-card border border-app-border bg-app-surface p-5 shadow-card space-y-4",
        className
      )}
      aria-label="Loading card content"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-3.5 w-36" />
      </div>
    </div>
  );
}

/**
 * Reusable table skeleton with configurable columns and rows.
 * Defined in UI-UX Brief Section 27.2.
 */
function TableSkeleton({
  columns = 4,
  rows = 5,
  className,
}: {
  columns?: number;
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-lg border border-app-border bg-white p-4 space-y-4 shadow-subtle overflow-hidden",
        className
      )}
      aria-label="Loading table data"
    >
      {/* Table header skeleton */}
      <div className="flex items-center justify-between gap-4 border-b border-app-border pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`th-${i}`}
            className="h-4"
            style={{ width: `${Math.max(15, 100 / columns - 5)}%` }}
          />
        ))}
      </div>
      {/* Table rows skeleton */}
      <div className="space-y-3 pt-1">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={`tr-${r}`}
            className="flex items-center justify-between gap-4 py-2 border-b border-app-border/40 last:border-none"
          >
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={`td-${r}-${c}`}
                className="h-4"
                style={{
                  width: `${Math.max(12, 100 / columns - (c % 2 === 0 ? 8 : 4))}%`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Reusable profile information skeleton.
 */
function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-card border border-app-border bg-app-surface p-6 shadow-card space-y-6",
        className
      )}
      aria-label="Loading profile details"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Reusable list skeleton for appointments and clinical records.
 */
function ListSkeleton({
  items = 3,
  className,
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} aria-label="Loading list items">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={`item-${i}`}
          className="rounded-lg border border-app-border bg-white p-4 shadow-subtle flex items-center justify-between"
        >
          <div className="space-y-2 w-2/3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ProfileSkeleton,
  ListSkeleton,
};
