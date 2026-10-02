"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
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
 * - Auth-aware: Automatically derives user role, profile details, and logout flow from active session
 */
export function AppShell({
  children,
  role,
  userName,
  userRole,
  userEmail,
  unreadNotifications = 0,
  headerActions,
  onLogout,
  className,
}: AppShellProps) {
  const { user, role: authRole, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const effectiveRole: UserRole = role || authRole || "PATIENT";
  const effectiveUserRole = userRole || effectiveRole;
  const effectiveEmail = userEmail || user?.email || "";
  const effectiveUserName =
    userName || (user?.email ? user.email.split("@")[0] : "Clinical Staff");
  const handleLogout = onLogout || logout;

  return (
    <div className="flex min-h-screen bg-app-bg text-navy antialiased">
      {/* Skip to Main Content Accessibility Landmark */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Authenticated Sidebar Shell */}
      <Sidebar
        role={effectiveRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Application Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(true)}
          userName={effectiveUserName}
          userRole={effectiveUserRole}
          userEmail={effectiveEmail}
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
