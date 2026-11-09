"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FileQuestion,
  FileText,
  Pill,
  Printer,
  Shield,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrescription } from "@/hooks/use-prescriptions";

export default function PrescriptionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { prescription, isLoading, error } = usePrescription(params.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/prescriptions">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Prescriptions
          </Link>
        </Button>
        <Alert variant="danger">
          <p className="font-semibold">Error</p>
          <p>{error instanceof Error ? error.message : "Prescription not found."}</p>
        </Alert>
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-lg py-1 px-3">Active</Badge>;
      case "COMPLETED":
        return <Badge className="bg-gray-500 hover:bg-gray-600 text-lg py-1 px-3">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="danger" className="text-lg py-1 px-3">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-lg py-1 px-3">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto printable-document">
      {/* Formal Medical Letterhead for Print */}
      <div className="print-only border-b-2 border-primary pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-navy">
                ArogyaVajra Healthcare Management
              </h1>
              <p className="text-xs text-muted-foreground">
                Central Clinical Center • Healthcare Blvd • Tel: (555) 019-2834
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">Rx</span>
            <p className="text-xs text-muted-foreground">Medical Prescription</p>
          </div>
        </div>
      </div>

      {/* Screen Header (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <Button variant="ghost" className="mb-2 -ml-4" asChild>
            <Link href="/prescriptions">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Prescriptions
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Prescription Details
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </Button>
          {renderStatusBadge(prescription.status)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Date Issued:</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {prescription.prescription_date}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Patient ID:</span>
              <span className="font-medium font-mono text-xs">{prescription.patient_id}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Doctor ID:</span>
              <span className="font-medium font-mono text-xs">{prescription.doctor_id}</span>
            </div>
            {prescription.appointment_id && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Appointment ID:</span>
                <span className="font-medium font-mono text-xs">{prescription.appointment_id}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
              <span className="text-muted-foreground">Created:</span>
              <span className="text-muted-foreground text-xs">{new Date(prescription.created_at).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              General Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prescription.instructions ? (
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {prescription.instructions}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No general instructions provided.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            Prescribed Medications ({prescription.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prescription.items.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              No medications listed for this prescription.
            </div>
          ) : (
            <div className="space-y-4">
              {prescription.items.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-lg border bg-card shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 border-b pb-3">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                      <span className="flex items-center justify-center bg-primary/10 text-primary w-6 h-6 rounded-full text-xs">
                        {idx + 1}
                      </span>
                      {item.medicine_name}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Dosage</span>
                      <span className="font-semibold">{item.dosage}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Frequency</span>
                      <span className="font-semibold">{item.frequency}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Duration</span>
                      <span className="font-semibold">{item.duration}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Route</span>
                      <span className="font-medium">{item.route || "Oral"}</span>
                    </div>
                  </div>

                  {item.instructions && (
                    <div className="mt-3 bg-muted/50 p-3 rounded-md text-sm">
                      <span className="font-semibold block mb-1">Directions for Patient:</span>
                      {item.instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Signature Block for Print */}
      <div className="print-only pt-12 mt-12 border-t">
        <div className="flex justify-between items-end">
          <div className="text-xs text-muted-foreground">
            <p>This is a legally valid computer-generated clinical prescription.</p>
            <p>Issued by certified medical personnel at ArogyaVajra Healthcare Platform.</p>
          </div>
          <div className="text-center w-64 border-t border-black pt-2">
            <p className="font-semibold text-sm">Attending Physician</p>
            <p className="text-xs text-muted-foreground">Authorized Signature & Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
