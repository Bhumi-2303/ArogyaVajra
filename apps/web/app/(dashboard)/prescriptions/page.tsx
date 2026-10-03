"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePrescriptions } from "@/hooks/use-prescriptions";
import { Prescription } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Pill, FileSearch, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrescriptionForm } from "@/components/forms/prescription-form";
import Link from "next/link";

export default function PrescriptionsPage() {
  const { user } = useAuth();
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { prescriptions, pagination, isLoading, error } = usePrescriptions({
    page,
    page_size: 20,
    status: statusFilter ? (statusFilter as any) : undefined,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | undefined>();

  const handleCreate = () => {
    setSelectedPrescription(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPrescription(undefined);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>;
      case "COMPLETED":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">
            Manage patient medications and instructions.
          </p>
        </div>
        <div className="flex gap-2">
          {user.role === "DOCTOR" && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              New Prescription
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row p-4 border rounded-md bg-muted/20">
        <div className="flex flex-col space-y-1.5 flex-1">
          <label className="text-sm font-medium">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={() => {
              setStatusFilter("");
              setPage(1);
            }}
          >
            Clear
          </Button>
        </div>
      </div>

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
            {error instanceof Error ? error.message : "Failed to load prescriptions."}
          </AlertDescription>
        </Alert>
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No prescriptions found"
          description="There are no prescriptions matching your criteria."
          action={
            user.role === "DOCTOR" ? {
              label: "Create Prescription",
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
                <TableHead>Medicines</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {prescription.prescription_date}
                  </TableCell>
                  {user.role !== "PATIENT" && (
                    <TableCell className="text-sm">
                      ID: {prescription.patient_id.substring(0, 8)}...
                    </TableCell>
                  )}
                  {user.role !== "DOCTOR" && (
                    <TableCell className="text-sm">
                      ID: {prescription.doctor_id.substring(0, 8)}...
                    </TableCell>
                  )}
                  <TableCell>
                    {prescription.items.length} item(s)
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(prescription.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/prescriptions/${prescription.id}`}>
                          <FileSearch className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      {user.role === "DOCTOR" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(prescription)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      )}
                    </div>
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) handleCloseDialog();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPrescription ? "Manage Prescription" : "New Prescription"}
            </DialogTitle>
          </DialogHeader>
          <PrescriptionForm
            initialData={selectedPrescription}
            onSuccess={handleCloseDialog}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
