"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMedicalRecords } from "@/hooks/use-medical-records";
import { MedicalRecord } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, FileText, FileSearch, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MedicalRecordForm } from "@/components/forms/medical-record-form";
import Link from "next/link";

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  
  const [page, setPage] = useState(1);
  const [patientFilter, setPatientFilter] = useState<string>("");

  const { records, pagination, isLoading, error } = useMedicalRecords({
    page,
    page_size: 20,
    patient_id: patientFilter || undefined,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | undefined>();

  const handleCreate = () => {
    setSelectedRecord(undefined);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRecord(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground">
            Manage clinical documentation and patient histories.
          </p>
        </div>
        <div className="flex gap-2">
          {user.role === "DOCTOR" && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              New Record
            </Button>
          )}
        </div>
      </div>

      {(user.role === "ADMIN" || user.role === "RECEPTIONIST" || user.role === "DOCTOR") && (
        <div className="flex flex-col gap-4 sm:flex-row p-4 border rounded-md bg-muted/20">
          <div className="flex flex-col space-y-1.5 flex-1">
            <label className="text-sm font-medium">Filter by Patient ID</label>
            <input
              type="text"
              placeholder="Enter UUID..."
              value={patientFilter}
              onChange={(e) => {
                setPatientFilter(e.target.value);
                setPage(1);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setPatientFilter("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load medical records."}
          </AlertDescription>
        </Alert>
      ) : records.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No medical records found"
          description="There are no consultation records matching your criteria."
          action={
            user.role === "DOCTOR" ? {
              label: "Create Record",
              onClick: handleCreate,
            } : undefined
          }
        />
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {user.role !== "PATIENT" && <TableHead>Patient</TableHead>}
                {user.role !== "DOCTOR" && <TableHead>Doctor</TableHead>}
                <TableHead>Diagnosis / Chief Complaint</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {record.record_date}
                  </TableCell>
                  {user.role !== "PATIENT" && (
                    <TableCell className="text-sm">
                      ID: {record.patient_id.substring(0, 8)}...
                    </TableCell>
                  )}
                  {user.role !== "DOCTOR" && (
                    <TableCell className="text-sm">
                      ID: {record.doctor_id.substring(0, 8)}...
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="line-clamp-2 text-sm max-w-[300px]">
                      {record.diagnosis ? (
                        <span className="font-medium">{record.diagnosis}</span>
                      ) : record.chief_complaint ? (
                        <span className="italic text-muted-foreground">{record.chief_complaint}</span>
                      ) : (
                        <span className="text-muted-foreground">No summary</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/medical-records/${record.id}`}>
                        <FileSearch className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {pagination.total_pages}
          </span>
          <Button
            variant="outline"
            disabled={page === pagination.total_pages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord ? "Edit Medical Record" : "New Medical Record"}
            </DialogTitle>
          </DialogHeader>
          <MedicalRecordForm
            initialData={selectedRecord}
            onSuccess={handleCloseDialog}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
