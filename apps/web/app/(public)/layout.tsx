import * as React from "react";
import { PublicHeader, PublicFooter } from "@/components/public";

export default function PublicLayout({
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

      {/* Public Navigation Bar */}
      <PublicHeader />

      {/* Main Public Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
