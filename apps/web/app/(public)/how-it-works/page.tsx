import * as React from "react";
import Link from "next/link";
import {
  UserCheck,
  Calendar,
  Stethoscope,
  FileText,
  Pill,
  CreditCard,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "How It Works — Arogyavajra",
  description:
    "Learn how Arogyavajra orchestrates connected clinical workflows from patient intake and consultation to prescription, billing, and audit verification.",
};

const WORKFLOW_STEPS = [
  {
    step: "01",
    role: "Patient & Receptionist",
    title: "Patient Intake & Profile Registration",
    icon: UserCheck,
    description:
      "A patient registers online or presents at the clinic front desk. Receptionists verify personal demographics, register emergency contacts, and record known drug allergies and medical histories.",
    outcome: "Verified patient profile created with unique identifier and baseline clinical history.",
  },
  {
    step: "02",
    role: "Patient or Staff",
    title: "Availability Discovery & Appointment Booking",
    icon: Calendar,
    description:
      "The scheduler queries the doctor's weekly consultation availability. A specific unbooked time slot is selected, triggering atomic conflict checks to prevent overlapping reservations.",
    outcome: "Appointment confirmed with formal status tracking and notification readiness.",
  },
  {
    step: "03",
    role: "Doctor",
    title: "In-Person Clinical Consultation",
    icon: Stethoscope,
    description:
      "The physician accesses the patient's verified history prior to examination. During the clinical encounter, the doctor assesses symptoms, vital indicators, and physical findings.",
    outcome: "Active clinical encounter initiated within the secure doctor portal.",
  },
  {
    step: "04",
    role: "Doctor",
    title: "Structured Medical Record Documentation",
    icon: FileText,
    description:
      "The doctor records the Chief Complaint, objective clinical findings, formal diagnosis, and therapeutic plan directly into the medical record database.",
    outcome: "Encrypted, structured medical encounter permanently linked to patient history.",
  },
  {
    step: "05",
    role: "Doctor & Pharmacy",
    title: "Itemized Digital Prescription Issuance",
    icon: Pill,
    description:
      "When medication is indicated, the physician creates a structured prescription. Each medication specifies generic or brand name, exact dosage, intake frequency, duration, and instructions.",
    outcome: "Legible, tamper-resistant digital prescription available immediately to patient and staff.",
  },
  {
    step: "06",
    role: "Billing Staff",
    title: "Line-Item Billing & Payment Settlement",
    icon: CreditCard,
    description:
      "An itemized invoice is automatically compiled from consultation fees and prescribed services. The billing desk records payment transactions with exact decimal accuracy.",
    outcome: "Transparent financial invoice issued and reconciled with paid status.",
  },
  {
    step: "07",
    role: "Administrator",
    title: "Immutable Operational Audit Trail",
    icon: Shield,
    description:
      "Every appointment update, medical record creation, prescription issuance, and payment event writes an immutable entry into the system audit log with actor ID and timestamp.",
    outcome: "Complete transparency and governance across all clinical operations.",
  },
];

export default function HowItWorksPage() {
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
            <span className="text-navy font-bold">How It Works</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Connected Clinical Healthcare Workflow
          </h1>
          <p className="mt-3 max-w-3xl text-base text-app-muted leading-relaxed">
            Discover how Arogyavajra coordinates multi-role collaboration to ensure
            data integrity, operational speed, and clinical continuity across every visit.
          </p>
        </div>

        {/* Workflow Timeline Cards */}
        <div className="space-y-6">
          {WORKFLOW_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.step} className="border-l-4 border-l-royal">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-soft font-mono text-xs font-bold text-royal">
                        {item.step}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-soft text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg text-navy">{item.title}</CardTitle>
                    </div>
                    <Badge variant="scheduled">{item.role}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <p className="text-sm text-app-muted leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium text-navy bg-app-bg p-3 rounded-lg border border-app-border">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span><strong className="text-navy">Outcome:</strong> {item.outcome}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl border border-app-border bg-white p-8 text-center sm:p-12 shadow-subtle">
          <h2 className="text-2xl font-bold text-navy">
            Experience the Arogyavajra Workflow
          </h2>
          <p className="mt-2 text-sm text-app-muted max-w-xl mx-auto leading-relaxed">
            Built from the ground up to prevent clinical bottlenecks and data fragmentation.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
