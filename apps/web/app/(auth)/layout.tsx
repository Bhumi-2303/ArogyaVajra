import * as React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-app-bg text-navy">
      {/* Skip to Main Content Accessibility Landmark */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Auth Top Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-app-border bg-white px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded-md"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-subtle">
            <Shield className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-navy">
              Arogyavajra
            </span>
            <span className="text-[10px] uppercase font-semibold text-app-muted tracking-wider">
              Healthcare Platform
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-royal hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded"
        >
          &larr; Back to Home
        </Link>
      </header>

      {/* Main Auth Viewport */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 focus:outline-none"
      >
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Minimal Auth Footer */}
      <footer className="border-t border-app-border bg-white py-4 text-center text-xs text-app-muted">
        <p>&copy; {new Date().getFullYear()} Arogyavajra. Authorized clinical &amp; patient access only.</p>
      </footer>
    </div>
  );
}
