"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  LogOut,
  User as UserIcon,
  Calendar,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, logout, isLoading: sessionLoading, isAuthenticated } = useAuth();

  const [fullName, setFullName] = React.useState("");
  const [age, setAge] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [requestedRole, setRequestedRole] = React.useState("PATIENT");
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{
    fullName?: string;
    age?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const validate = () => {
    const errors: {
      fullName?: string;
      age?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }

    if (!age.trim()) {
      errors.age = "Age is required.";
    } else {
      const parsedAge = parseInt(age.trim(), 10);
      if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 125) {
        errors.age = "Please enter a valid age between 1 and 125.";
      }
    }

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
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
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        age: parseInt(age.trim(), 10),
        requested_role: requestedRole,
      });
      setSuccessMessage("Account created successfully! Directing to your health workspace...");
      setTimeout(() => {
        router.push("/patient");
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected registration error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already authenticated
  if (isAuthenticated && user) {
    const role = user.role;
    const targetDashboard =
      role === "ADMIN"
        ? "/admin"
        : role === "DOCTOR"
        ? "/doctor"
        : role === "RECEPTIONIST"
        ? "/receptionist"
        : role === "BILLING_STAFF"
        ? "/billing"
        : "/patient";

    return (
      <Card className="shadow-card">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success mb-3">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl text-navy">Account Active &amp; Verified</CardTitle>
          <CardDescription className="text-xs">
            You are currently signed in as an authenticated user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-app-border bg-app-bg p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-app-muted">Registered Email:</span>
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
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="primary"
            className="w-full justify-center"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            onClick={() => router.push(targetDashboard)}
          >
            Go to {user.role === "ADMIN" ? "Admin" : user.role === "DOCTOR" ? "Doctor" : user.role === "RECEPTIONIST" ? "Receptionist" : user.role === "BILLING_STAFF" ? "Billing" : "Patient"} Dashboard
          </Button>
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
          <UserPlus className="h-6 w-6" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl text-navy">Patient Registration</CardTitle>
        <CardDescription className="text-xs text-app-muted">
          Create an Arogyavajra patient account to book appointments and access medical records.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="danger" title="Registration Failed" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" title="Success" onDismiss={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Input
                id="register-fullname"
                type="text"
                label="Full Name"
                placeholder="e.g. Ramesh Gupta"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={fieldErrors.fullName}
                leftIcon={<UserIcon className="h-4 w-4 text-app-muted" />}
                required
                autoComplete="name"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Input
                id="register-age"
                type="number"
                label="Age"
                placeholder="Years (e.g. 28)"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                error={fieldErrors.age}
                leftIcon={<Calendar className="h-4 w-4 text-app-muted" />}
                required
                min={1}
                max={125}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Input
            id="register-email"
            type="email"
            label="Email Address"
            placeholder="patient@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            leftIcon={<Mail className="h-4 w-4 text-app-muted" />}
            required
            autoComplete="email"
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              id="register-password"
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              leftIcon={<Lock className="h-4 w-4 text-app-muted" />}
              required
              autoComplete="new-password"
              disabled={isSubmitting}
            />

            <Input
              id="register-confirm-password"
              type="password"
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword}
              leftIcon={<Lock className="h-4 w-4 text-app-muted" />}
              required
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </div>

          {/* Role selection & Policy */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-role"
              className="text-xs font-semibold text-navy uppercase tracking-wider block"
            >
              Account Type / Role Request
            </label>
            <select
              id="register-role"
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-md border border-app-border bg-white px-3 py-2 text-sm text-navy shadow-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal"
            >
              <option value="PATIENT">Patient (Standard Self-Registration)</option>
              <option value="DOCTOR">Doctor (Medical Practitioner)</option>
              <option value="STAFF">Clinic Staff (Receptionist / Billing)</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          {requestedRole !== "PATIENT" && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 mb-0.5">Role Verification Policy</p>
                <p>
                  Privileged roles (Doctor, Staff, Admin) cannot be self-activated through public registration.
                  Your account will be provisioned with standard Patient access. Privileged roles require
                  administrative onboarding or pre-seeded test credentials.
                </p>
              </div>
            </div>
          )}
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
            Create Account
          </Button>

          <div className="text-center text-xs text-app-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-royal hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
            >
              Sign In
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
