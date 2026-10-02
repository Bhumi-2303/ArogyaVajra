import * as React from "react";
import { FolderOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: "primary" | "secondary" | "outline";
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = "primary",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-app-border bg-white/60 p-8 text-center sm:p-12 shadow-subtle",
        className
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-soft text-primary shadow-subtle mb-4" aria-hidden="true">
        {icon || <FolderOpen className="h-7 w-7" />}
      </div>
      <h3 className="text-base font-semibold text-navy">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-app-muted font-normal leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant={actionVariant} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
