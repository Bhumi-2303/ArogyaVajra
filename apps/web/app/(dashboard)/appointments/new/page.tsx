"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { AppointmentForm } from "@/components/forms/appointment-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";

export default function NewAppointmentPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-sm text-muted-foreground animate-pulse">
          Loading booking workspace...
        </div>
      </div>
    );
  }

  const role = user?.role || "PATIENT";
  const returnPath = role === "PATIENT" ? "/patient" : "/appointments";

  if (role === "DOCTOR" || role === "BILLING_STAFF") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
          </Link>
        </Button>
        <Card className="shadow-sm border-app-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-navy">
              Appointment Booking Restricted
            </CardTitle>
            <CardDescription>
              {role === "DOCTOR"
                ? "Doctors manage their assigned patient consultation schedule from the Appointments workspace. Direct appointment booking is reserved for patients and clinic reception staff."
                : "Billing staff do not schedule patient appointments."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/appointments">Go to Appointments Schedule</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={returnPath}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {role === "PATIENT" ? "Dashboard" : "Appointments"}
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm border-app-border">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Calendar className="h-4 w-4" />
            <span>Consultation Scheduling</span>
          </div>
          <CardTitle className="text-2xl font-bold text-navy">
            Book New Appointment
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {role === "PATIENT"
              ? "Select your practitioner and choose an available consultation slot."
              : "Schedule a patient consultation with an active clinical practitioner."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentForm
            userRole={role}
            onSuccess={() => {
              router.push(role === "PATIENT" ? "/appointments" : "/appointments");
            }}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
