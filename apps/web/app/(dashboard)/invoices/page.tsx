"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useInvoices } from "@/hooks/use-invoices";
import { Invoice } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Receipt, FileSearch, Edit } from "lucide-react";
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
import { InvoiceForm } from "@/components/forms/invoice-form";
import Link from "next/link";

export default function InvoicesPage() {
  const { user } = useAuth();
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { invoices, pagination, isLoading, error } = useInvoices({
    page,
    page_size: 20,
    status: statusFilter ? (statusFilter as any) : undefined,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();

  const handleCreate = () => {
    setSelectedInvoice(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedInvoice(undefined);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "ISSUED":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Issued</Badge>;
      case "PARTIALLY_PAID":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">Partially Paid</Badge>;
      case "PAID":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Paid</Badge>;
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
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage billing and patient invoices.
          </p>
        </div>
        <div className="flex gap-2">
          {["ADMIN", "RECEPTIONIST"].includes(user.role) && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              New Invoice
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
            <option value="DRAFT">Draft</option>
            <option value="ISSUED">Issued</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
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
            {error instanceof Error ? error.message : "Failed to load invoices."}
          </AlertDescription>
        </Alert>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices found"
          description="There are no invoices matching your criteria."
          action={
            ["ADMIN", "RECEPTIONIST"].includes(user.role) ? {
              label: "Create Invoice",
              onClick: handleCreate,
            } : undefined
          }
        />
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Date</TableHead>
                {user.role !== "PATIENT" && <TableHead>Patient</TableHead>}
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium font-mono">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {invoice.invoice_date}
                  </TableCell>
                  {user.role !== "PATIENT" && (
                    <TableCell className="text-sm">
                      ID: {invoice.patient_id.substring(0, 8)}...
                    </TableCell>
                  )}
                  <TableCell className="font-semibold text-primary">
                    ${Number(invoice.total).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/invoices/${invoice.id}`}>
                          <FileSearch className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      {["ADMIN", "RECEPTIONIST"].includes(user.role) && 
                       !["PAID", "CANCELLED"].includes(invoice.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(invoice)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Status
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
              {selectedInvoice ? "Manage Invoice Status" : "Create New Invoice"}
            </DialogTitle>
          </DialogHeader>
          <InvoiceForm
            initialData={selectedInvoice}
            onSuccess={handleCloseDialog}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
