"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ShieldCheck, LogOut, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const { user, login, logout, isLoading: sessionLoading, isAuthenticated } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      setSuccessMessage("Authentication successful. Session active.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected authentication error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already authenticated in session
  if (isAuthenticated && user) {
    return (
      <Card className="shadow-card">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success mb-3">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl text-navy">Active Authenticated Session</CardTitle>
          <CardDescription className="text-xs">
            You are currently authenticated in the Arogyavajra system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-app-border bg-app-bg p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-app-muted">Account:</span>
              <span className="font-medium text-navy">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-app-muted">Assigned Role:</span>
              <Badge variant="confirmed">{user.role}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-app-muted">Status:</span>
              <span className="text-xs font-medium text-success">Active &bull; Verified</span>
            </div>
          </div>

          <p className="text-xs text-app-muted text-center leading-relaxed">
            Role-specific dashboards will be unlocked in subsequent feature modules.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full justify-center"
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={() => logout()}
            isLoading={sessionLoading}
          >
            Log Out of Session
          </Button>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full justify-center text-xs">
              Return to Public Portal
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-soft text-primary mb-2 shadow-subtle">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl text-navy">Account Login</CardTitle>
        <CardDescription className="text-xs text-app-muted">
          Enter your registered clinical staff or patient credentials to sign in.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="danger" title="Authentication Failed" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" title="Success" onDismiss={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          <Input
            id="login-email"
            type="email"
            label="Email Address"
            placeholder="doctor@hospital.org or patient@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            leftIcon={<Mail className="h-4 w-4 text-app-muted" />}
            required
            autoComplete="email"
            disabled={isSubmitting}
          />

          <Input
            id="login-password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            leftIcon={<Lock className="h-4 w-4 text-app-muted" />}
            required
            autoComplete="current-password"
            disabled={isSubmitting}
          />
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            size="lg"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Sign In
          </Button>

          <div className="text-center text-xs text-app-muted">
            Do not have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-royal hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
            >
              Register as Patient
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
