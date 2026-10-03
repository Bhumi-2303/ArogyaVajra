"use client";

import { useMedicalRecord } from "@/hooks/use-medical-records";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MedicalRecordForm } from "@/components/forms/medical-record-form";

export default function MedicalRecordDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const { record, isLoading, error } = useMedicalRecord(params.id);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/medical-records">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Records
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Medical record not found or you don't have permission to view it."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/medical-records">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Consultation Record</h1>
            <p className="text-muted-foreground">
              {record.record_date}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {user.role === "DOCTOR" && (
            <Button onClick={() => setIsEditDialogOpen(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Record
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Information</h3>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient ID</p>
                <p className="font-mono text-sm break-all">{record.patient_id}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doctor ID</p>
                <p className="font-mono text-sm break-all">{record.doctor_id}</p>
              </div>

              {record.appointment_id && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Linked Appointment</p>
                  <p className="font-mono text-sm break-all">{record.appointment_id}</p>
                </div>
              )}

              {record.follow_up_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Follow-up Date</p>
                  <p className="font-medium text-blue-600 dark:text-blue-400">{record.follow_up_date}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-6">
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center border-b pb-2">
                  Chief Complaint
                </h3>
                {record.chief_complaint ? (
                  <p className="text-sm whitespace-pre-wrap">{record.chief_complaint}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">Not provided.</p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center border-b pb-2">
                  Clinical Notes & Findings
                </h3>
                {record.clinical_notes ? (
                  <p className="text-sm whitespace-pre-wrap">{record.clinical_notes}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">Not provided.</p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center border-b pb-2">
                  Diagnosis / Assessment
                </h3>
                {record.diagnosis ? (
                  <p className="text-sm whitespace-pre-wrap font-medium">{record.diagnosis}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">Not provided.</p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center border-b pb-2">
                  Treatment Plan & Notes
                </h3>
                {record.treatment_notes ? (
                  <p className="text-sm whitespace-pre-wrap">{record.treatment_notes}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">Not provided.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Medical Record</DialogTitle>
          </DialogHeader>
          <MedicalRecordForm
            initialData={record}
            onSuccess={() => setIsEditDialogOpen(false)}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
