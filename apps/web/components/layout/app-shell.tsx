"use client";

import * as React from "react";
import { Header } from "./header";
import { Sidebar, UserRole } from "./sidebar";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: React.ReactNode;
  role?: UserRole;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  unreadNotifications?: number;
  headerActions?: React.ReactNode;
  onLogout?: () => void;
  className?: string;
}

/**
 * AppShell provides the responsive layout infrastructure for Arogyavajra:
 * - Desktop: Fixed 256px sidebar + full-width content area
 * - Tablet & Mobile: Off-canvas slide-out sidebar drawer with backdrop blur
 * - Sticky header with mobile drawer toggle and user profile capsule
 * - Accessibility: Skip to main content link for keyboard/screen-reader users
 */
export function AppShell({
  children,
  role = "ADMIN",
  userName = "Clinical Staff",
  userRole = "ADMIN",
  userEmail,
  unreadNotifications = 0,
  headerActions,
  onLogout,
  className,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-app-bg text-navy antialiased">
      {/* Skip to Main Content Accessibility Landmark */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Authenticated Sidebar Shell */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />

      {/* Main Application Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(true)}
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          unreadNotifications={unreadNotifications}
          actions={headerActions}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            "flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 focus:outline-none",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
