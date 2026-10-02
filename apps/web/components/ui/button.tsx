import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-royal text-white shadow-subtle hover:bg-royal-hover active:bg-royal-active",
        secondary:
          "bg-soft text-primary hover:bg-soft-hover active:bg-blue-200",
        outline:
          "border border-app-border bg-white text-navy shadow-subtle hover:bg-app-subtle hover:text-primary active:bg-slate-100",
        ghost:
          "text-navy hover:bg-soft hover:text-primary active:bg-blue-100",
        danger:
          "bg-danger text-white shadow-subtle hover:bg-danger-hover active:bg-danger-dark",
        success:
          "bg-success text-white shadow-subtle hover:bg-success-hover active:bg-success-dark",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md gap-1.5",
        md: "h-10 px-4 py-2 text-sm rounded-lg gap-2",
        lg: "h-12 px-6 text-base rounded-lg gap-2.5",
        icon: "h-10 w-10 p-0 rounded-lg justify-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-current" aria-hidden="true" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0" aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
