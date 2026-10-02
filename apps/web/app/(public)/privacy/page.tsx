import * as React from "react";
import Link from "next/link";
import { Shield, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Arogyavajra",
  description:
    "Privacy Policy for the Arogyavajra Healthcare Management Platform detailing data collection, processing purposes, access controls, and security principles.",
};

export default function PrivacyPolicyPage() {
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
            <span className="text-navy font-bold">Privacy Policy</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Privacy Policy
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
              This document outlines the architectural and organizational privacy practices of the
              Arogyavajra software platform. This text must be reviewed and customized by the
              deploying institution&apos;s legal and compliance team prior to active clinical deployment.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm text-app-muted leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">1. Information Collected</h2>
            <p>
              Arogyavajra processes information provided directly by users, clinic administrative
              staff, and treating physicians. Depending on your assigned platform role, this includes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-navy">Account Information:</strong> Name, professional or personal email address, hashed authentication credentials, phone number, and system role.
              </li>
              <li>
                <strong className="text-navy">Patient Demographics:</strong> Date of birth, gender, address, and emergency contact details.
              </li>
              <li>
                <strong className="text-navy">Healthcare Information:</strong> Medical histories, documented allergies, clinical encounter notes, diagnostic codes, prescription items, and consultation timelines.
              </li>
              <li>
                <strong className="text-navy">Billing &amp; Financial Information:</strong> Itemized consultation invoices, payment transaction records, and outstanding balances.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">2. Purpose of Data Processing</h2>
            <p>
              Information within Arogyavajra is processed exclusively for healthcare management and
              administrative operational purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Facilitating conflict-free appointment scheduling and clinical consultations.</li>
              <li>Enabling licensed physicians to record and review patient medical histories.</li>
              <li>Issuing and verifying structured digital prescriptions for pharmacy fulfillment.</li>
              <li>Generating transparent, line-item billing invoices and tracking payments.</li>
              <li>Maintaining system operational integrity and administrative accountability.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">3. Access Control &amp; Role Separation</h2>
            <p>
              Arogyavajra enforces strict server-side Role-Based Access Control (RBAC). Data access
              is restricted strictly by the principle of least privilege:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-navy">Patients:</strong> Can access only their own appointments, personal medical records, prescriptions, and invoices.
              </li>
              <li>
                <strong className="text-navy">Doctors:</strong> Can access medical records of patients under their clinical care and manage their own availability.
              </li>
              <li>
                <strong className="text-navy">Receptionists:</strong> Can access scheduling, patient demographics, and doctor rosters, with zero access to confidential clinical consultation notes.
              </li>
              <li>
                <strong className="text-navy">Billing Staff:</strong> Can manage financial invoices and payment transactions without access to diagnostic narratives.
              </li>
              <li>
                <strong className="text-navy">Administrators:</strong> Manage system users and review audit logs without unrestricted direct visibility into clinical medical notes.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">4. Data Security &amp; Storage Integrity</h2>
            <p>
              The platform employs defensive engineering measures to safeguard data:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cryptographic password hashing utilizing industry-standard argon2/bcrypt algorithms.</li>
              <li>Encrypted transport protocols (HTTPS/TLS) across all clients and API communications.</li>
              <li>Atomic database transactions ensuring consistent state and preventing partial write corruptions.</li>
              <li>Append-only audit logs recording the user ID, timestamp, and action for significant data modifications.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">5. Data Retention &amp; Disposal</h2>
            <p>
              Clinical records and financial transaction data are retained in accordance with the
              operational policies of the deploying healthcare institution and applicable statutory
              health record retention guidelines. Inactive accounts and associated logs are archived
              or expunged following authorized administrative procedures.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">6. Sharing &amp; Disclosure</h2>
            <p>
              Arogyavajra does not sell, rent, or commercialize user or patient data to third parties,
              advertisers, or data brokers. Data is shared exclusively within the deploying institution
              among authorized clinical and administrative personnel involved in the patient&apos;s direct care.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">7. User Rights</h2>
            <p>
              Users and patients maintain the right to inspect their personal data, request corrections
              to inaccurate demographic information, and review past consultation and billing histories
              through their authenticated portal or by contacting the clinic&apos;s administrative office.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">8. Policy Updates &amp; Contact</h2>
            <p>
              This policy may be amended as system capabilities evolve. For questions regarding the
              technical operation or privacy practices of Arogyavajra, contact the platform administration
              team or your institution&apos;s designated privacy officer.
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
