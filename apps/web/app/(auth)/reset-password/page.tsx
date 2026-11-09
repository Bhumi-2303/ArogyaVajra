"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import * as z from "zod";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resetPasswordApi } from "@/lib/api/auth";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .max(128, "Password must not exceed 128 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  if (!token) {
    return (
      <Card className="border-app-border shadow-card bg-white">
        <CardHeader>
          <div className="flex items-center gap-2 text-error font-semibold text-xs uppercase tracking-wider mb-1">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <span>Missing Reset Token</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-navy">
            Invalid Recovery Link
          </CardTitle>
          <CardDescription className="text-sm text-app-muted">
            The password reset link is invalid or incomplete. Please request a new password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push("/forgot-password")}
            className="w-full"
          >
            Request New Reset Link
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-app-border pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Sign In</span>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const result = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!result.success) {
      const formattedErrors: { password?: string; confirmPassword?: string } = {};
      for (const err of result.error.errors) {
        if (err.path[0] === "password") formattedErrors.password = err.message;
        if (err.path[0] === "confirmPassword") formattedErrors.confirmPassword = err.message;
      }
      setFieldErrors(formattedErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordApi({
        token,
        new_password: result.data.password,
      });
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Failed to reset password. The link may have expired.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-app-border shadow-card bg-white">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-royal font-semibold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>Credential Security</span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-navy">
          Set New Password
        </CardTitle>
        <CardDescription className="text-sm text-app-muted">
          Choose a strong password to secure your Arogyavajra account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {serverError && (
          <Alert variant="danger" className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-semibold">{serverError}</p>
              <Link
                href="/forgot-password"
                className="mt-1 block font-medium underline hover:text-navy"
              >
                Request a fresh reset link
              </Link>
            </div>
          </Alert>
        )}

        {success ? (
          <div className="space-y-4">
            <Alert variant="success" className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-950">Password Updated</p>
                <p className="mt-1 text-emerald-800">
                  Your password has been successfully reset. You can now log in with your new credentials.
                </p>
              </div>
            </Alert>
            <Button
              onClick={() => router.push("/login")}
              className="w-full"
            >
              Sign In with New Password
            </Button>
          </div>
        ) : (
          <form id="reset-password-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-navy"
              >
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-app-muted"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-9 ${fieldErrors.password ? "border-error focus-visible:ring-error" : ""}`}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                />
              </div>
              {fieldErrors.password ? (
                <p id="password-error" className="text-xs font-medium text-error" role="alert">
                  {fieldErrors.password}
                </p>
              ) : (
                <p className="text-[11px] text-app-muted">Must be at least 8 characters long.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-navy"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-app-muted"
                  aria-hidden="true"
                />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-9 ${fieldErrors.confirmPassword ? "border-error focus-visible:ring-error" : ""}`}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p id="confirmPassword-error" className="text-xs font-medium text-error" role="alert">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Reset Password
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-app-border pt-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Return to Sign In</span>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-royal border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
