import * as React from "react";
import Link from "next/link";
import {
  Shield,
  Calendar,
  Users,
  FileText,
  Pill,
  CreditCard,
  Lock,
  ArrowRight,
  Stethoscope,
  Activity,
  UserCheck,
  Clock,
  Layers,
  CheckCircle2,
  FileCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PublicLandingPage() {
  return (
    <div className="flex flex-col">
      {/* 1. Product Introduction Section (Compact Hero per AGENT.md Section 14 & APP-FLOW.md Section 3.2) */}
      <section
        className="border-b border-app-border bg-white py-16 sm:py-20 lg:py-24"
        aria-labelledby="product-intro-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-app-border bg-soft px-3.5 py-1 text-xs font-semibold text-primary">
              <Shield className="h-3.5 w-3.5 text-royal" aria-hidden="true" />
              <span>Arogyavajra Healthcare Management Platform</span>
            </div>

            <h1
              id="product-intro-heading"
              className="text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl"
            >
              Intelligent Healthcare Management
            </h1>

            <p className="text-base text-app-muted sm:text-lg leading-relaxed">
              A unified platform connecting patients, doctors, reception, billing,
              and administration workflows into one structured healthcare system.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/login">
                <Button
                  size="lg"
                  variant="primary"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline">
                  Explore Platform
                </Button>
              </Link>
            </div>
          </div>

          {/* Healthcare Platform Visual / Architecture Overview */}
          <div className="mt-12 rounded-xl border border-app-border bg-app-bg p-6 sm:p-8 shadow-subtle">
            <div className="flex items-center justify-between border-b border-app-border pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-slate-300" />
                <div className="h-3 w-3 rounded-full bg-slate-300" />
                <div className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="ml-2 font-mono text-xs font-medium text-app-muted">
                  Arogyavajra Unified Clinical Architecture
                </span>
              </div>
              <Badge variant="scheduled">Multi-Role Integration</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-lg border border-app-border bg-white p-4 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-2">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h2 className="text-xs font-semibold text-navy">Patient Care</h2>
                <p className="text-[11px] text-app-muted mt-1">Self-service &amp; history</p>
              </div>

              <div className="rounded-lg border border-app-border bg-white p-4 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-2">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <h2 className="text-xs font-semibold text-navy">Doctor Workflows</h2>
                <p className="text-[11px] text-app-muted mt-1">Consults &amp; records</p>
              </div>

              <div className="rounded-lg border border-app-border bg-white p-4 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-2">
                  <Calendar className="h-5 w-5" />
                </div>
                <h2 className="text-xs font-semibold text-navy">Reception</h2>
                <p className="text-[11px] text-app-muted mt-1">Desk &amp; schedules</p>
              </div>

              <div className="rounded-lg border border-app-border bg-white p-4 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-2">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="text-xs font-semibold text-navy">Billing Staff</h2>
                <p className="text-[11px] text-app-muted mt-1">Invoices &amp; payments</p>
              </div>

              <div className="rounded-lg border border-app-border bg-white p-4 text-center col-span-2 sm:col-span-1">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-2">
                  <Shield className="h-5 w-5" />
                </div>
                <h2 className="text-xs font-semibold text-navy">Administration</h2>
                <p className="text-[11px] text-app-muted mt-1">Governance &amp; audit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Why Arogyavajra? (APP-FLOW.md Section 3.3.3) */}
      <section
        className="py-16 sm:py-20 bg-app-bg border-b border-app-border"
        aria-labelledby="why-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2
              id="why-heading"
              className="text-2xl font-bold tracking-tight text-navy sm:text-3xl"
            >
              Why Arogyavajra?
            </h2>
            <p className="mt-2 text-sm text-app-muted">
              Structured healthcare management addressing operational fragmentation
              across hospital and clinic environments.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-card transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-3">
                  <UserCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Patient-Centered</CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-1.5">
                  Manage appointments, records, prescriptions, and billing
                  information through a structured patient experience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-card transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-3">
                  <Layers className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Connected Workflows</CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-1.5">
                  Connect reception, doctors, patients, and billing operations
                  through one integrated web application.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-card transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-3">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Organized Healthcare Data</CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-1.5">
                  Keep clinical information structured, consistent, and accessible
                  according to user role authorizations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-card transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-3">
                  <Lock className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Controlled Access</CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-1.5">
                  Use strict role-based access control and immutable auditability
                  for sensitive healthcare operations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Core Capabilities (APP-FLOW.md Section 3.3.4) */}
      <section
        id="capabilities"
        className="py-16 sm:py-20 bg-white border-b border-app-border"
        aria-labelledby="capabilities-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2
              id="capabilities-heading"
              className="text-2xl font-bold tracking-tight text-navy sm:text-3xl"
            >
              Core Platform Capabilities
            </h2>
            <p className="mt-2 text-sm text-app-muted">
              Eight integrated modules supporting the full operational lifecycle of
              clinical healthcare.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-app-border p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-soft p-2 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-navy">Patient Management</h3>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Centralized demographic profiles, emergency contacts, medical
                history, and allergy records.
              </p>
            </div>

            <div className="rounded-lg border border-app-border p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-soft p-2 text-primary">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-navy">Doctor Management</h3>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Clinical specializations, availability schedule slots, and consultation
                fee configurations.
              </p>
            </div>

            <div className="rounded-lg border border-app-border p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-soft p-2 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-navy">Appointments</h3>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Slot booking, conflict prevention, schedule views, and status
                progression management.
              </p>
            </div>

            <div className="rounded-lg border border-app-border p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-soft p-2 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-navy">Medical Records</h3>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Structured clinical encounters, physician notes, diagnoses, and
                treatment plans.
              </p>
            </div>

            <div className="rounded-lg border border-app-border p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-soft p-2 text-primary">
                  <Pill className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-navy">Prescriptions</h3>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Itemized medications with precise dosage, frequency, duration, and
                intake instructions.
              </p>
            </div>

            <div className="rounded-lg border border-app-border p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-soft p-2 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-navy">Billing &amp; Invoices</h3>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Transparent itemized billing, multi-status invoice tracking, and
                payment recording.
              </p>
            </div>

            <div className="rounded-lg border border-app-border p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-soft p-2 text-primary">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-navy">Role-Based Access</h3>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Five distinct roles with server-enforced authorization and scoped
                module access.
              </p>
            </div>

            <div className="rounded-lg border border-app-border p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-soft p-2 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-navy">Audit Logging</h3>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Immutable, append-only operational audit trail recording actor,
                action, and timestamp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How Arogyavajra Works (APP-FLOW.md Section 3.3.5) */}
      <section
        id="how-it-works"
        className="py-16 sm:py-20 bg-app-bg border-b border-app-border"
        aria-labelledby="how-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2
              id="how-heading"
              className="text-2xl font-bold tracking-tight text-navy sm:text-3xl"
            >
              How Arogyavajra Works
            </h2>
            <p className="mt-2 text-sm text-app-muted">
              A cohesive healthcare journey connecting front desk, clinical care,
              pharmacy, and financial administration.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-7 items-center">
            <div className="rounded-lg border border-app-border bg-white p-4 text-center">
              <span className="text-[11px] font-bold text-royal uppercase">Step 1</span>
              <p className="text-xs font-semibold text-navy mt-1">Patient / Reception</p>
              <p className="text-[10px] text-app-muted mt-1">Registration</p>
            </div>

            <div className="hidden md:flex justify-center text-app-muted">
              <ArrowRight className="h-4 w-4" />
            </div>

            <div className="rounded-lg border border-app-border bg-white p-4 text-center">
              <span className="text-[11px] font-bold text-royal uppercase">Step 2</span>
              <p className="text-xs font-semibold text-navy mt-1">Appointment</p>
              <p className="text-[10px] text-app-muted mt-1">Slot scheduled</p>
            </div>

            <div className="hidden md:flex justify-center text-app-muted">
              <ArrowRight className="h-4 w-4" />
            </div>

            <div className="rounded-lg border border-app-border bg-white p-4 text-center">
              <span className="text-[11px] font-bold text-royal uppercase">Step 3</span>
              <p className="text-xs font-semibold text-navy mt-1">Doctor Consultation</p>
              <p className="text-[10px] text-app-muted mt-1">Clinical encounter</p>
            </div>

            <div className="hidden md:flex justify-center text-app-muted">
              <ArrowRight className="h-4 w-4" />
            </div>

            <div className="rounded-lg border border-app-border bg-white p-4 text-center">
              <span className="text-[11px] font-bold text-royal uppercase">Step 4</span>
              <p className="text-xs font-semibold text-navy mt-1">Record &amp; Script</p>
              <p className="text-[10px] text-app-muted mt-1">Prescription logged</p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-4 py-1.5 text-xs text-app-muted">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Full lifecycle concludes with transparent billing and immutable audit verification.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Role-Based Platform Section (APP-FLOW.md Section 3.3.6) */}
      <section
        className="py-16 sm:py-20 bg-white border-b border-app-border"
        aria-labelledby="roles-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2
              id="roles-heading"
              className="text-2xl font-bold tracking-tight text-navy sm:text-3xl"
            >
              Built for Every Healthcare Role
            </h2>
            <p className="mt-2 text-sm text-app-muted">
              Tailored workspace interfaces designed specifically for clinical and
              operational responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-app-border p-6 bg-app-bg/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-navy">Patient</h3>
                <Badge variant="scheduled">Self-Service</Badge>
              </div>
              <ul className="text-xs text-app-muted space-y-2">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-royal" />
                  View confirmed appointments &amp; doctor availability
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-royal" />
                  Access personal medical records &amp; visit summaries
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-royal" />
                  Download active and past prescriptions
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-royal" />
                  Review itemized billing invoices &amp; receipts
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-app-border p-6 bg-app-bg/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-navy">Doctor</h3>
                <Badge variant="confirmed">Clinical Care</Badge>
              </div>
              <ul className="text-xs text-app-muted space-y-2">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Manage daily appointment schedule &amp; consultations
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Inspect patient history and document encounters
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Issue structured digital prescriptions
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Configure slot availability &amp; consultation hours
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-app-border p-6 bg-app-bg/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-navy">Receptionist</h3>
                <Badge variant="active">Front Desk</Badge>
              </div>
              <ul className="text-xs text-app-muted space-y-2">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-navy" />
                  Register new patients &amp; update contact details
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-navy" />
                  Schedule, reschedule, or cancel patient bookings
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-navy" />
                  Verify doctor rosters and daily clinic capacity
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-navy" />
                  Direct patients to respective consultation rooms
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-app-border p-6 bg-app-bg/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-navy">Billing Staff</h3>
                <Badge variant="issued">Finance</Badge>
              </div>
              <ul className="text-xs text-app-muted space-y-2">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                  Generate itemized invoices for consultations &amp; services
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                  Record cash, card, and electronic payment transactions
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                  Track outstanding, partial, and completed invoice balances
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                  Maintain exact decimal financial precision
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-app-border p-6 bg-app-bg/50 space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-navy">Administrator</h3>
                <Badge variant="outline">Governance</Badge>
              </div>
              <ul className="text-xs text-app-muted space-y-2">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                  Manage user accounts &amp; role assignment
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                  Inspect immutable operational audit logs
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                  Oversee clinic-wide system configurations
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                  Ensure strict security policy enforcement
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Security & Trust Section (APP-FLOW.md Section 3.3.7) */}
      <section
        className="py-16 sm:py-20 bg-app-bg border-b border-app-border"
        aria-labelledby="security-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2
              id="security-heading"
              className="text-2xl font-bold tracking-tight text-navy sm:text-3xl"
            >
              {"Security & Trust: Architectural Foundations"}
            </h2>
            <p className="mt-2 text-sm text-app-muted">
              Built on transparent engineering principles ensuring transactional safety
              and healthcare data confidentiality.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-app-border bg-white p-5 space-y-2">
              <div className="flex items-center gap-2.5 font-semibold text-sm text-navy">
                <Lock className="h-4 w-4 text-royal" />
                <span>Role-Based Access Control</span>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Strict server-side validation enforcing that clinical and administrative
                records are only accessible by authorized roles.
              </p>
            </div>

            <div className="rounded-lg border border-app-border bg-white p-5 space-y-2">
              <div className="flex items-center gap-2.5 font-semibold text-sm text-navy">
                <FileCheck className="h-4 w-4 text-royal" />
                <span>Immutable Audit Logging</span>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Key system events, record updates, and financial operations generate
                traceable, append-only audit entries.
              </p>
            </div>

            <div className="rounded-lg border border-app-border bg-white p-5 space-y-2">
              <div className="flex items-center gap-2.5 font-semibold text-sm text-navy">
                <Activity className="h-4 w-4 text-royal" />
                <span>Transaction-Safe Operations</span>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Atomic database transactions prevent partial states across appointment
                schedules, medical records, and billing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final Call-to-Action (APP-FLOW.md Section 3.3.8) */}
      <section
        className="py-16 sm:py-20 bg-white"
        aria-labelledby="cta-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-app-border bg-soft/50 p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-5">
            <h2
              id="cta-heading"
              className="text-2xl font-bold tracking-tight text-navy sm:text-3xl"
            >
              Ready to use Arogyavajra?
            </h2>
            <p className="text-sm text-app-muted max-w-xl mx-auto leading-relaxed">
              Explore structured, auditable healthcare management designed to bring
              clarity and efficiency to clinical operations.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button
                  size="lg"
                  variant="primary"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
