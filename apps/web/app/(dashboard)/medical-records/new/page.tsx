"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useDoctors } from "@/hooks/use-doctors";
import { MedicalRecordForm } from "@/components/forms/medical-record-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ArrowLeft, FileText } from "lucide-react";

export default function NewMedicalRecordPage() {
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
          Only authorized medical practitioners can record clinical documentation and consultation notes.
        </Alert>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
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
            <FileText className="h-4 w-4" />
            <span>Clinical Documentation</span>
          </div>
          <CardTitle className="text-2xl font-bold text-navy">
            Create Consultation Record
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Document clinical observations, diagnoses, and treatment plans for this patient visit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MedicalRecordForm
            appointmentId={appointmentId}
            patientId={patientId}
            doctorId={doctor?.id}
            onSuccess={() => router.push("/medical-records")}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
