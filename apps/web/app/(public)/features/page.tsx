import * as React from "react";
import Link from "next/link";
import {
  Users,
  Stethoscope,
  Calendar,
  FileText,
  Pill,
  CreditCard,
  UserCheck,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Platform Features — Arogyavajra",
  description:
    "Explore the eight core modules of Arogyavajra: patient management, doctor workflows, appointments, records, prescriptions, billing, RBAC, and audit logs.",
};

const FEATURE_MODULES = [
  {
    id: "patients",
    title: "Patient Management",
    icon: Users,
    badge: "Core Clinical",
    description:
      "Centralized patient demographic profiles, emergency contacts, medical history summaries, and allergy tracking for comprehensive care continuity.",
    highlights: [
      "Structured demographic profiles and contact info",
      "Known allergy tracking with clinical severity tags",
      "Past medical conditions and surgical histories",
      "Emergency contact linkage for urgent notifications",
    ],
  },
  {
    id: "doctors",
    title: "Doctor Management",
    icon: Stethoscope,
    badge: "Clinical Staff",
    description:
      "Physician profile management, clinical specializations, consultation fee configurations, and active weekly availability schedules.",
    highlights: [
      "Clinical specialization and license identification",
      "Configurable appointment duration and consultation fees",
      "Recurring weekly availability schedules",
      "Date-specific slot override and leave management",
    ],
  },
  {
    id: "appointments",
    title: "Appointment Management",
    icon: Calendar,
    badge: "Workflow",
    description:
      "Conflict-free appointment scheduling, multi-status progression tracking, and coordinated front-desk booking workflows.",
    highlights: [
      "Real-time slot availability without double-booking",
      "Formal status lifecycle: Scheduled, Confirmed, Completed, Cancelled, No-Show",
      "Patient self-service and receptionist desk booking",
      "Appointment timeline and cancellation tracking",
    ],
  },
  {
    id: "records",
    title: "Medical Records",
    icon: FileText,
    badge: "Clinical Care",
    description:
      "Structured documentation of clinical encounters, physical examinations, physician diagnoses, and follow-up directives.",
    highlights: [
      "Chronological encounter documentation per patient",
      "Structured Chief Complaint, Diagnosis, and Treatment Plan",
      "Linked directly to verified doctor consultations",
      "Access strictly restricted to treating doctors and the patient",
    ],
  },
  {
    id: "prescriptions",
    title: "Prescription Management",
    icon: Pill,
    badge: "Pharmacy",
    description:
      "Standardized digital medication orders detailing precise drug names, dosage amounts, frequencies, durations, and clinical instructions.",
    highlights: [
      "Itemized prescription medication items with intake directives",
      "Dosage, timing (e.g., after food), and duration validation",
      "Direct linkage to specific clinical encounters",
      "Patient-accessible digital prescription summaries",
    ],
  },
  {
    id: "billing",
    title: "Billing & Invoicing",
    icon: CreditCard,
    badge: "Financial",
    description:
      "Transparent itemized invoices with exact decimal financial calculations, multi-state payment tracking, and receipt generation.",
    highlights: [
      "Line-item consultation, medication, and procedure fees",
      "Exact decimal precision avoiding floating-point rounding errors",
      "Lifecycle tracking: Draft, Issued, Paid, Partially Paid, Cancelled",
      "Multi-payment method logging (Cash, Card, Digital)",
    ],
  },
  {
    id: "rbac",
    title: "Role-Based Access Control",
    icon: UserCheck,
    badge: "Security",
    description:
      "Five distinct user roles with server-enforced authorization policies ensuring strict principle-of-least-privilege across all routes.",
    highlights: [
      "Tailored portals for Patient, Doctor, Receptionist, Billing, Admin",
      "Server-side JWT token and database permission validation",
      "Protected clinical records hidden from unauthorized staff",
      "Zero cross-tenant or unauthenticated data leakage",
    ],
  },
  {
    id: "audit",
    title: "Immutable Audit Logging",
    icon: Shield,
    badge: "Governance",
    description:
      "Traceable, append-only audit trail recording user authentication, data modifications, and sensitive financial transactions.",
    highlights: [
      "Append-only log storage preventing record tampering",
      "Records actor user ID, client IP, action type, and target resource",
      "Timestamped in UTC with microsecond precision",
      "Directly auditable by system administrators",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="border-b border-app-border pb-8 mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-app-muted mb-3">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-navy font-bold">Features</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Platform Capabilities &amp; Feature Modules
          </h1>
          <p className="mt-3 max-w-3xl text-base text-app-muted leading-relaxed">
            Arogyavajra integrates eight foundational healthcare modules into a cohesive,
            auditable clinical management environment.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {FEATURE_MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary shadow-subtle">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="scheduled">{module.badge}</Badge>
                  </div>
                  <CardTitle className="text-lg text-navy">{module.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed mt-2 text-app-muted">
                    {module.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-navy mb-3">
                    Key Technical Highlights:
                  </h4>
                  <ul className="space-y-2 text-xs text-app-muted">
                    {module.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="mt-16 rounded-2xl border border-app-border bg-white p-8 text-center sm:p-12 shadow-subtle">
          <h2 className="text-2xl font-bold text-navy">
            Ready to explore Arogyavajra in action?
          </h2>
          <p className="mt-2 text-sm text-app-muted max-w-xl mx-auto leading-relaxed">
            Log in with your clinical credentials or explore role-tailored dashboards.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Access Platform
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
