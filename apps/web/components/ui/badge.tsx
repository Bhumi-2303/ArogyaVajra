import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-royal focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-soft text-primary hover:bg-soft-hover",
        scheduled:
          "border border-blue-200 bg-soft text-royal",
        confirmed:
          "border border-blue-300 bg-blue-100 text-primary font-semibold",
        completed:
          "border border-emerald-200 bg-success-light text-success-dark font-medium",
        cancelled:
          "border border-red-200 bg-danger-light text-danger-dark font-medium",
        no_show:
          "border border-slate-300 bg-slate-100 text-slate-700",
        issued:
          "border border-amber-200 bg-amber-50 text-amber-800",
        paid:
          "border border-emerald-200 bg-success-light text-success-dark font-medium",
        partially_paid:
          "border border-yellow-200 bg-yellow-50 text-yellow-800",
        draft:
          "border border-slate-200 bg-slate-100 text-slate-600",
        active:
          "border border-emerald-200 bg-emerald-50 text-emerald-700",
        danger:
          "border border-red-200 bg-danger-light text-danger-dark font-medium",
        outline:
          "border border-app-border text-navy bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;
export { Badge, badgeVariants };
