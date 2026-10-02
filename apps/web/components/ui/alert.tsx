import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 text-sm transition-all flex items-start gap-3",
  {
    variants: {
      variant: {
        info: "border-blue-200 bg-soft text-navy [&>svg]:text-royal",
        success: "border-emerald-200 bg-success-light text-navy [&>svg]:text-success",
        warning: "border-amber-200 bg-amber-50 text-navy [&>svg]:text-warning",
        danger: "border-red-200 bg-danger-light text-navy [&>svg]:text-danger",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

const defaultIcons = {
  info: <Info className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />,
  success: <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />,
  warning: <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />,
  danger: <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />,
};

function Alert({
  className,
  variant = "info",
  title,
  children,
  onDismiss,
  action,
  ...props
}: AlertProps) {
  const icon = defaultIcons[variant || "info"];

  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon}
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight text-navy">{title}</h5>}
        <div className="text-sm font-normal text-navy/90 leading-relaxed">{children}</div>
        {action && <div className="pt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-1 text-app-muted hover:bg-black/5 hover:text-navy focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export { Alert, alertVariants };
