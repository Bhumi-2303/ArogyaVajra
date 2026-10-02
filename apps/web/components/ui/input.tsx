import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      required,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className="absolute left-3 flex items-center pointer-events-none text-app-muted"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              "flex h-10 w-full rounded-lg border border-app-border bg-white px-3 py-2 text-sm text-navy placeholder:text-app-muted/70 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal focus-visible:border-royal disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-danger focus-visible:ring-danger focus-visible:border-danger text-danger",
              className
            )}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            required={required}
            {...props}
          />
          {rightIcon && (
            <span
              className="absolute right-3 flex items-center pointer-events-none text-app-muted"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <p id={errorId} className="text-xs font-medium text-danger">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-app-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
