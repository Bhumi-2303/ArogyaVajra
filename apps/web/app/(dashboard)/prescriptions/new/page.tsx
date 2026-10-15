"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useDoctors } from "@/hooks/use-doctors";
import { PrescriptionForm } from "@/components/forms/prescription-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ArrowLeft, Pill } from "lucide-react";

export default function NewPrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const appointmentId = searchParams.get("appointment_id") || undefined;
  const patientId = searchParams.get("patient_id") || undefined;

  const { data: doctorsData } = useDoctors(user?.email ? { email: user.email } : undefined);
  const doctor = doctorsData?.data?.[0];

  if (user?.role !== "DOCTOR" && user?.role !== "ADMIN") {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-8">
        <Alert variant="danger" title="Access Restricted">
          Only licensed medical practitioners can issue patient prescriptions.
        </Alert>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm border-app-border">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Pill className="h-4 w-4" />
            <span>Prescription Authorization</span>
          </div>
          <CardTitle className="text-2xl font-bold text-navy">
            Issue Medical Prescription
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Prescribe medications, dosage guidelines, frequencies, and administration instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrescriptionForm
            appointmentId={appointmentId}
            patientId={patientId}
            doctorId={doctor?.id}
            onSuccess={() => router.push("/prescriptions")}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
