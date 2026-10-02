import * as React from "react";
import Link from "next/link";
import { Shield, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions — Arogyavajra",
  description:
    "Terms & Conditions governing the use of the Arogyavajra Healthcare Management Platform, including operational scope and clinical disclaimers.",
};

export default function TermsConditionsPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="border-b border-app-border pb-8 mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-app-muted mb-3">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-navy font-bold">Terms &amp; Conditions</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-xs text-app-muted font-mono">
            Last Updated: October 2026 &bull; Arogyavajra Platform Governance
          </p>
        </div>

        {/* Legal Review Disclaimer Notice */}
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <span className="font-semibold text-navy">Legal Notice &amp; Production Disclaimer:</span>
            <p className="text-app-muted">
              These terms outline the acceptable operational parameters for using the Arogyavajra
              software platform. Prior to deploying Arogyavajra in an active production hospital or
              clinic setting, this document must be reviewed and formally authorized by the
              institution&apos;s legal counsel.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm text-app-muted leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">1. Acceptance of Terms &amp; Platform Scope</h2>
            <p>
              By accessing or using the Arogyavajra platform, users agree to be bound by these Terms &amp;
              Conditions. Arogyavajra provides centralized software infrastructure for clinic scheduling,
              patient recordkeeping, physician consultation documentation, digital prescription generation,
              and invoice tracking.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">2. Healthcare Management &amp; Non-Diagnostic Disclaimer</h2>
            <div className="rounded-md border border-app-border bg-app-bg p-4 space-y-2">
              <p className="font-semibold text-navy">CRITICAL MEDICAL DISCLAIMER:</p>
              <p className="text-xs text-app-muted leading-relaxed">
                Arogyavajra is an administrative management and records platform. The software DOES NOT
                provide medical diagnosis, automated clinical triage, or direct emergency response
                services. All clinical findings, diagnoses, prescriptions, and treatments are generated
                solely by independent, licensed healthcare practitioners exercising their independent
                medical judgment.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">3. User Accounts &amp; Authentication Responsibilities</h2>
            <p>
              Access to protected platform modules requires authorized credentials. Users are responsible
              for:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintaining the confidentiality of their authentication credentials and session tokens.</li>
              <li>Immediately reporting unauthorized access or security compromises to administrators.</li>
              <li>Ensuring that credentials are not shared across multiple staff members or individuals.</li>
              <li>Logging out of shared clinical workstations following the conclusion of consultation shifts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">4. Acceptable Use Policy</h2>
            <p>Users agree not to engage in prohibited activities, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Attempting to bypass server-side role authorizations or access patient charts outside assigned care scopes.</li>
              <li>Introducing malware, automated scraping agents, or malicious payloads into the system.</li>
              <li>Inputting intentionally fraudulent clinical entries, duplicate billing claims, or false demographic records.</li>
              <li>Interfering with the operational availability, database transactions, or audit logs of the platform.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">5. Intellectual Property &amp; Data Ownership</h2>
            <p>
              The Arogyavajra software architecture, user interface components, and codebase remain
              the intellectual property of the project contributors. All clinical records, patient health
              data, and institutional financial records remain the exclusive property of the deploying
              healthcare provider or patient as determined by applicable jurisdiction law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">6. System Availability &amp; Maintenance</h2>
            <p>
              While Arogyavajra is engineered for high reliability through PostgreSQL transactional
              integrity, occasional planned maintenance or unscheduled service interruptions may occur.
              Clinical institutions must maintain offline paper contingency protocols for emergency care
              continuity during unexpected infrastructure downtimes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Arogyavajra and its software contributors
              shall not be liable for any direct, indirect, incidental, or consequential damages resulting
              from clinical treatment decisions made by medical practitioners, software downtime, or data
              entry errors committed by operating personnel.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">8. Account Termination &amp; Access Revocation</h2>
            <p>
              System administrators reserve the authority to suspend or revoke account access immediately
              upon detection of security breaches, credential misuse, policy violations, or upon the
              termination of a staff member&apos;s employment status.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">9. Modifications to Terms</h2>
            <p>
              These terms may be updated periodically to reflect system enhancements or legal modifications.
              Continued access to Arogyavajra following notice of changes constitutes acceptance of the
              revised terms.
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-12 border-t border-app-border pt-6">
          <Link
            href="/"
            className="text-xs font-semibold text-royal hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
          >
            &larr; Return to Public Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
