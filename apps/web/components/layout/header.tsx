"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Menu, Shield } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  onMenuToggle?: () => void;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  unreadNotifications?: number;
  actions?: React.ReactNode;
}

export function Header({
  onMenuToggle,
  userName = "Clinical Staff",
  userRole = "ADMIN",
  userEmail,
  unreadNotifications = 0,
  actions,
  className,
  ...props
}: HeaderProps) {
  // Generate user initials from name
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-app-border bg-white px-4 sm:px-6 shadow-subtle",
        className
      )}
      {...props}
    >
      {/* Left side: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex items-center justify-center rounded-lg p-2 text-app-muted hover:bg-slate-100 hover:text-navy focus:outline-none focus:ring-2 focus:ring-royal lg:hidden transition-colors"
            aria-label="Open navigation sidebar"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-navy lg:hidden"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Shield className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-base font-bold tracking-tight text-navy">
            Arogyavajra
          </span>
        </Link>
      </div>

      {/* Right side: Actions, Notifications, Profile chip */}
      <div className="flex items-center gap-3 sm:gap-4">
        {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

        {/* Notifications button */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-app-muted hover:bg-slate-100 hover:text-navy focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
          aria-label={`Notifications ${unreadNotifications > 0 ? `(${unreadNotifications} unread)` : ""}`}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-danger" />
            </span>
          )}
        </button>

        {/* User profile capsule */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-app-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft text-primary font-semibold text-xs border border-blue-200">
            {initials}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-navy leading-none">
              {userName}
            </span>
            <span className="text-[10px] text-app-muted leading-tight mt-0.5">
              {userEmail || userRole}
            </span>
          </div>
          <Badge variant="confirmed" className="hidden sm:inline-flex text-[10px] py-0 px-1.5 ml-1">
            {userRole}
          </Badge>
        </div>
      </div>
    </header>
  );
}
