import * as React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-app-border bg-white text-navy" aria-label="Footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand & Mission Column */}
          <div className="space-y-4 md:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded-md w-fit"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-subtle">
                <Shield className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold tracking-tight text-navy">
                Arogyavajra
              </span>
            </Link>
            <p className="text-sm font-normal text-app-muted leading-relaxed max-w-sm">
              A unified healthcare management platform connecting patient records,
              doctor consultations, appointments, prescriptions, and billing
              workflows into one structured system.
            </p>
            <div className="rounded-md border border-app-border bg-app-bg p-3 text-xs text-app-muted">
              <span className="font-semibold text-navy">Clinical Disclaimer:</span> Arogyavajra is an administrative and healthcare workflow management platform. It does not provide automated clinical diagnosis or emergency medical care.
            </div>
          </div>

          {/* Navigation Column: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-app-muted">
              <li>
                <Link
                  href="/features"
                  className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
                >
                  About Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column: Access & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
              Portals
            </h4>
            <ul className="space-y-2 text-sm text-app-muted">
              <li>
                <Link
                  href="/login"
                  className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
                >
                  Patient Access
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
                >
                  Clinical Staff Login
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
                >
                  Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column: Legal & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
              Governance
            </h4>
            <ul className="space-y-2 text-sm text-app-muted">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-app-border pt-6 sm:flex-row text-xs text-app-muted">
          <p>&copy; {new Date().getFullYear()} Arogyavajra Healthcare Management System. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">
            Security &bull; Role-Based Access &bull; Auditable Workflows
          </p>
        </div>
      </div>
    </footer>
  );
}
