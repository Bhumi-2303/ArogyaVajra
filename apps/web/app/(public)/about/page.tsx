import * as React from "react";
import Link from "next/link";
import {
  Shield,
  Layers,
  Database,
  Lock,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "About Arogyavajra — Healthcare Management Platform",
  description:
    "Learn about the mission, engineering philosophy, and architectural foundations behind Arogyavajra: The Indomitable Shield for Healthcare Management.",
};

export default function AboutPage() {
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
            <span className="text-navy font-bold">About</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              About Arogyavajra
            </h1>
            <Badge variant="scheduled">Platform Overview</Badge>
          </div>
          <p className="mt-2 text-base font-semibold text-royal">
            आरोग्यवज्र &bull; The Indomitable Shield for Healthcare Management
          </p>
          <p className="mt-3 max-w-3xl text-sm text-app-muted leading-relaxed">
            Arogyavajra is an enterprise-grade healthcare management platform designed to
            eliminate operational fragmentation across clinics, hospitals, and outpatient
            care facilities.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 mb-16">
          <div className="lg:col-span-2 space-y-6 text-sm text-app-muted leading-relaxed">
            <h2 className="text-xl font-bold text-navy">
              The Mission: Structured, Unified Healthcare Operations
            </h2>
            <p>
              Healthcare institutions frequently struggle with disconnected software islands:
              appointment books maintained in isolation, medical charts stored on paper or
              incompatible drives, prescriptions handwritten without standardization, and
              billing departments scrambling to reconstruct care encounters after the fact.
            </p>
            <p>
              Arogyavajra was conceived to establish a single, robust, and auditable operational
              source of truth. By bringing patient registration, doctor scheduling, consultation
              documentation, digital prescribing, itemized billing, and audit governance into
              one unified system, Arogyavajra restores operational clarity so healthcare
              professionals can focus wholly on patient care.
            </p>

            <h2 className="text-xl font-bold text-navy pt-4">
              Etymology &amp; Philosophy
            </h2>
            <p>
              The name derives from Sanskrit: <strong className="text-navy">Arogya</strong> (health,
              well-being, freedom from disease) and <strong className="text-navy">Vajra</strong> (the
              diamond shield, unbreakable strength). It represents our core commitment: providing
              an indomitable foundation for healthcare operations that protects patient data,
              ensures accountability, and withstands the rigorous demands of clinical workflows.
            </p>
          </div>

          {/* Clinical Disclaimer Callout Card */}
          <div className="rounded-xl border border-app-border bg-white p-6 shadow-subtle space-y-4 h-fit">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Shield className="h-5 w-5 text-royal" />
              <span>Operational Scope &amp; Disclaimer</span>
            </div>
            <p className="text-xs text-app-muted leading-relaxed">
              Arogyavajra is an administrative, clinical documentation, and healthcare workflow
              software system.
            </p>
            <div className="rounded-md border border-app-border bg-app-bg p-3.5 text-xs text-navy space-y-2">
              <p className="font-semibold text-royal">Important Medical Disclaimer:</p>
              <p className="text-app-muted text-[11px] leading-relaxed">
                The platform does not provide autonomous clinical diagnosis, medical decision-making,
                or triage advice. All diagnosis and treatment decisions remain the sole responsibility
                of licensed medical practitioners.
              </p>
            </div>
          </div>
        </div>

        {/* Engineering & Architectural Principles */}
        <div className="border-t border-app-border pt-12">
          <h2 className="text-2xl font-bold text-navy mb-8 text-center sm:text-left">
            Core Engineering Principles
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-3">
                  <Database className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Relational Authority</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-app-muted leading-relaxed">
                Built on authoritative PostgreSQL with strict foreign keys, check constraints,
                and atomic ACID transactions preventing orphaned records or corrupted states.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-3">
                  <Lock className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Server-Enforced RBAC</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-app-muted leading-relaxed">
                Zero client-side security reliance. Every API endpoint strictly validates
                cryptographic session tokens and enforces role-specific permissions.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-3">
                  <Activity className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Financial Precision</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-app-muted leading-relaxed">
                Monetary calculations and invoice line-items utilize exact decimal arithmetic,
                guaranteeing zero floating-point rounding discrepancies across billing cycles.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-primary mb-3">
                  <Layers className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Accessibility (WCAG 2.1 AA)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-app-muted leading-relaxed">
                High-contrast blue-and-white clinical palette, full keyboard navigation,
                screen-reader landmarks, and visible focus rings across all interactive primitives.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl border border-app-border bg-white p-8 text-center sm:p-12 shadow-subtle">
          <h2 className="text-2xl font-bold text-navy">
            Join the Arogyavajra Network
          </h2>
          <p className="mt-2 text-sm text-app-muted max-w-xl mx-auto leading-relaxed">
            Experience structured healthcare management built for clinical clarity.
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
