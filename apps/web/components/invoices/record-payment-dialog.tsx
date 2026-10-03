"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Invoice, PaymentMethod } from "@/lib/api/types";
import { useRecordPayment } from "@/hooks/use-invoices";

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  payment_method: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER"]),
  reference: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface RecordPaymentDialogProps {
  invoice: Invoice;
}

export function RecordPaymentDialog({ invoice }: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const { recordPayment, isRecording } = useRecordPayment(invoice.id);
  const maxAmount = Number(invoice.balance);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: maxAmount,
      payment_method: "CASH",
      reference: "",
    },
  });

  async function onSubmit(data: PaymentFormValues) {
    if (data.amount > maxAmount) {
      form.setError("amount", {
        type: "manual",
        message: `Amount cannot exceed balance of $${maxAmount.toFixed(2)}`,
      });
      return;
    }
    
    try {
      await recordPayment(data);
      toast.success("Payment recorded successfully");
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to record payment");
    }
  }

  const isFullyPaid = invoice.status === "PAID" || maxAmount <= 0;
  const isCancelled = invoice.status === "CANCELLED";

  if (isFullyPaid || isCancelled) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Record Payment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for Invoice {invoice.invoice_number}.
            <br />
            Remaining Balance: <strong className="text-primary">${maxAmount.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Transaction ID, Cheque No, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isRecording}>
                {isRecording ? "Saving..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
