"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  Pill,
  Receipt,
  Shield,
  Stethoscope,
  User,
  Users,
  X,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type UserRole =
  | "PATIENT"
  | "DOCTOR"
  | "RECEPTIONIST"
  | "BILLING_STAFF"
  | "ADMIN";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const ROLE_NAV_CONFIG: Record<UserRole, NavItem[]> = {
  PATIENT: [
    { label: "Dashboard", href: "/dashboard", icon: Activity },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Medical Records", href: "/medical-records", icon: FileText },
    { label: "Prescriptions", href: "/prescriptions", icon: Pill },
    { label: "Invoices", href: "/invoices", icon: Receipt },
    { label: "Profile", href: "/profile", icon: User },
  ],
  DOCTOR: [
    { label: "Dashboard", href: "/dashboard", icon: Activity },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Patients", href: "/patients", icon: Users },
    { label: "Medical Records", href: "/medical-records", icon: FileText },
    { label: "Prescriptions", href: "/prescriptions", icon: Pill },
    { label: "Invoices", href: "/invoices", icon: Receipt },
    { label: "Availability", href: "/availability", icon: Clock },
    { label: "Profile", href: "/profile", icon: User },
  ],
  RECEPTIONIST: [
    { label: "Dashboard", href: "/dashboard", icon: Activity },
    { label: "Patients", href: "/patients", icon: Users },
    { label: "Doctors", href: "/doctors", icon: Stethoscope },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Invoices", href: "/invoices", icon: Receipt },
    { label: "Profile", href: "/profile", icon: User },
  ],
  BILLING_STAFF: [
    { label: "Dashboard", href: "/dashboard", icon: Activity },
    { label: "Invoices", href: "/invoices", icon: Receipt },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Patients", href: "/patients", icon: Users },
    { label: "Profile", href: "/profile", icon: User },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: Activity },
    { label: "Users", href: "/users", icon: Users },
    { label: "Patients", href: "/patients", icon: Users },
    { label: "Doctors", href: "/doctors", icon: Stethoscope },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Medical Records", href: "/medical-records", icon: FileText },
    { label: "Prescriptions", href: "/prescriptions", icon: Pill },
    { label: "Invoices", href: "/invoices", icon: Receipt },
    { label: "Billing", href: "/billing", icon: Receipt },
    { label: "Audit Logs", href: "/audit-logs", icon: Shield },
    { label: "Profile", href: "/profile", icon: User },
  ],
};

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  role?: UserRole;
  items?: NavItem[];
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

export function Sidebar({
  role = "ADMIN",
  items,
  isOpen = false,
  onClose,
  onLogout,
  className,
  ...props
}: SidebarProps) {
  const pathname = usePathname();
  const navItems = items || ROLE_NAV_CONFIG[role];

  return (
    <>
      {/* Mobile / Tablet overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-app-border bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0 shadow-dialog" : "-translate-x-full",
          className
        )}
        aria-label="Sidebar Navigation"
        {...props}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-app-border px-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-navy"
            onClick={onClose}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-subtle">
              <Shield className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-base tracking-tight font-bold text-navy">
                Arogyavajra
              </span>
              <span className="text-[10px] uppercase font-semibold text-app-muted tracking-wider">
                आरोग्यवज्र
              </span>
            </div>
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-app-muted hover:bg-slate-100 hover:text-navy lg:hidden focus:outline-none focus:ring-2 focus:ring-royal"
              aria-label="Close navigation sidebar"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Role indicator banner */}
        <div className="border-b border-app-border/60 bg-slate-50/70 px-5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-app-muted">
              Role Workspace
            </span>
            <Badge variant="confirmed" className="text-[10px] py-0 px-2">
              {role.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors select-none",
                  isActive
                    ? "bg-soft text-royal font-semibold shadow-subtle"
                    : "text-navy hover:bg-slate-50 hover:text-royal"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-royal" : "text-app-muted"
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-soft px-2 py-0.5 text-[10px] font-semibold text-royal">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer / Logout */}
        <div className="border-t border-app-border p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger-light/60 transition-colors focus:outline-none focus:ring-2 focus:ring-danger"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
