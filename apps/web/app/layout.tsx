import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Arogyavajra — Healthcare Management Platform",
  description:
    "Centralized, secure, role-based healthcare management platform connecting patients, healthcare professionals, administrative staff, and billing operations.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#012C7D",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-app-bg text-navy antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
