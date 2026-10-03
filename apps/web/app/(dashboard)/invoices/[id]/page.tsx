"use client";

import { useInvoice } from "@/hooks/use-invoices";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, ArrowLeft, Calendar, FileQuestion, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { invoice, isLoading, error } = useInvoice(params.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Invoice not found."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline" className="text-lg py-1 px-3">Draft</Badge>;
      case "ISSUED":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-lg py-1 px-3">Issued</Badge>;
      case "PARTIALLY_PAID":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 text-lg py-1 px-3">Partially Paid</Badge>;
      case "PAID":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-lg py-1 px-3">Paid</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive" className="text-lg py-1 px-3">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-lg py-1 px-3">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" className="mb-2 -ml-4" asChild>
            <Link href="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="h-8 w-8 text-primary" />
            Invoice {invoice.invoice_number}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => window.print()}>
            Print Invoice
          </Button>
          {renderStatusBadge(invoice.status)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Date Issued:</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {invoice.invoice_date}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Invoice No:</span>
              <span className="font-medium font-mono">{invoice.invoice_number}</span>
            </div>
            {invoice.appointment_id && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Linked Appointment:</span>
                <span className="font-medium font-mono text-xs">{invoice.appointment_id}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
              <span className="text-muted-foreground">Created By:</span>
              <span className="font-medium font-mono text-xs">{invoice.created_by}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Bill To
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Patient ID:</span>
              <span className="font-medium font-mono text-xs col-span-2">{invoice.patient_id}</span>
            </div>
            <div className="p-4 bg-muted/30 rounded-md">
              <p className="text-muted-foreground italic text-xs">
                Additional patient profile details would render here, integrated from the patient service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right w-[100px]">Qty</TableHead>
                <TableHead className="text-right w-[150px]">Unit Price</TableHead>
                <TableHead className="text-right w-[150px]">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No line items found.
                  </TableCell>
                </TableRow>
              ) : (
                invoice.items.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right">{Number(item.quantity)}</TableCell>
                    <TableCell className="text-right">${Number(item.unit_price).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">${Number(item.amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <div className="p-6 flex justify-end bg-muted/10 border-t">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount:</span>
                <span>-${Number(invoice.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tax:</span>
                <span>${Number(invoice.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-dashed pt-3 mt-3">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-xl text-primary">${Number(invoice.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
