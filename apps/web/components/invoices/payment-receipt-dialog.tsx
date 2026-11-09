"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { usePaymentReceipt } from "@/hooks/use-invoices";
import { Receipt, Printer, Building2, Calendar, CreditCard } from "lucide-react";

interface PaymentReceiptDialogProps {
  invoiceId: string;
  paymentId: string;
}

export function PaymentReceiptDialog({ invoiceId, paymentId }: PaymentReceiptDialogProps) {
  const [open, setOpen] = useState(false);
  const { receipt, isLoading, error } = usePaymentReceipt(
    open ? invoiceId : null,
    open ? paymentId : null
  );

  const handlePrint = () => {
    document.body.classList.add("print-receipt-only");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("print-receipt-only");
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <Receipt className="h-3.5 w-3.5 mr-1" />
          Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-6 receipt-modal-content">
        <DialogHeader className="no-print">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Payment Receipt
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error || !receipt ? (
          <Alert variant="danger" className="my-4">
            <>Failed to load receipt</>
            <>{error instanceof Error ? error.message : "Unable to load receipt details."}</>
          </Alert>
        ) : (
          <div id="receipt-voucher" className="space-y-6 pt-2">
            {/* Printable Voucher Header */}
            <div className="text-center border-b pb-4">
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-xl tracking-tight">
                <Building2 className="h-6 w-6" />
                <span>{receipt.hospital_name || "ArogyaVajra Health"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Hospital Management System</p>
              <div className="mt-3 inline-block px-3 py-1 bg-muted rounded-full text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Official Payment Receipt
              </div>
            </div>

            {/* Receipt & Invoice Meta */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-muted/20 p-3 rounded-lg border">
              <div>
                <span className="text-muted-foreground block">Receipt Number</span>
                <span className="font-mono font-bold text-sm text-foreground">{receipt.receipt_number}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Payment Date</span>
                <span className="font-medium flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {new Date(receipt.payment_date).toLocaleDateString()} {new Date(receipt.payment_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Invoice Reference</span>
                <span className="font-mono font-medium">{receipt.invoice_number}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Patient</span>
                <span className="font-medium text-xs truncate block">
                  {receipt.patient_name || receipt.patient_code || receipt.patient_id.substring(0, 8)}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div>
                  <span className="text-xs text-emerald-800 font-medium block">Amount Paid</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CreditCard className="h-4 w-4 text-emerald-700" />
                    <span className="text-xs text-emerald-900 font-semibold">{receipt.payment_method}</span>
                    {receipt.reference && (
                      <span className="text-xs text-muted-foreground font-mono">
                        ({receipt.reference})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-700">
                  ${Number(receipt.amount_paid).toFixed(2)}
                </div>
              </div>

              {/* Invoice Breakdown */}
              <div className="border rounded-lg p-3 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Invoice Total:</span>
                  <span className="font-medium text-foreground">${Number(receipt.invoice_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Paid to Date:</span>
                  <span className="font-medium text-emerald-600">${Number(receipt.invoice_paid_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold text-sm">
                  <span>Remaining Balance:</span>
                  <span className={Number(receipt.invoice_balance) > 0 ? "text-amber-600" : "text-foreground"}>
                    ${Number(receipt.invoice_balance).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-[11px] text-center text-muted-foreground italic border-t pt-3">
              Thank you for your payment. This is a computer-generated receipt from ArogyaVajra HMS.
            </p>

            {/* Actions (hidden in print) */}
            <div className="flex justify-end gap-3 pt-2 no-print">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
