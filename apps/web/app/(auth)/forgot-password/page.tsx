"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from "lucide-react";
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
import { forgotPasswordApi } from "@/lib/api/auth";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address."),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [serverMessage, setServerMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    const result = forgotPasswordSchema.safeParse({ email: email.trim() });
    if (!result.success) {
      setFieldError(result.error.errors[0]?.message ?? "Invalid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPasswordApi(result.data.email);
      setServerMessage(
        res.message || "If the email is registered, a password reset link has been sent."
      );
      setSubmitted(true);
    } catch {
      // Non-enumerating error message to prevent account enumeration
      setServerMessage(
        "If the email is registered, a password reset link has been sent."
      );
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-app-border shadow-card bg-white">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-royal font-semibold text-xs uppercase tracking-wider mb-1">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          <span>Security & Access</span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-navy">
          Reset Your Password
        </CardTitle>
        <CardDescription className="text-sm text-app-muted">
          Enter your registered email address to receive a secure, single-use password recovery link.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {submitted ? (
          <div className="space-y-4">
            <Alert variant="success" className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-950">Reset Instructions Sent</p>
                <p className="mt-1 text-emerald-800">{serverMessage}</p>
              </div>
            </Alert>
            <p className="text-xs text-app-muted">
              Didn&apos;t receive an email? Check your spam folder or verify with your hospital administrator.
            </p>
          </div>
        ) : (
          <form id="forgot-password-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-navy"
              >
                Registered Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-app-muted"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="doctor@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-9 ${fieldError ? "border-error focus-visible:ring-error" : ""}`}
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={fieldError ? "email-error" : undefined}
                />
              </div>
              {fieldError && (
                <p id="email-error" className="text-xs font-medium text-error" role="alert">
                  {fieldError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Send Password Reset Link
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
