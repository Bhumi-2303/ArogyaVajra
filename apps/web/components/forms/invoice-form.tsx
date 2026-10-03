"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Invoice,
  InvoiceCreateInput,
  InvoiceUpdateInput,
  InvoiceItemCreateInput,
} from "@/lib/api/types";
import {
  useCreateInvoice,
  useInvoice,
} from "@/hooks/use-invoices";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

interface InvoiceFormProps {
  initialData?: Invoice;
  patientId?: string;
  appointmentId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InvoiceForm({
  initialData,
  patientId,
  appointmentId,
  onSuccess,
  onCancel,
}: InvoiceFormProps) {
  const { createInvoice, isCreating } = useCreateInvoice();
  const { updateInvoice, isUpdating } = useInvoice(initialData?.id || "");

  const [error, setError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    patient_id: initialData?.patient_id || patientId || "",
    appointment_id: initialData?.appointment_id || appointmentId || "",
    invoice_date: initialData?.invoice_date || today,
    discount: initialData?.discount ? Number(initialData.discount) : 0,
    tax: initialData?.tax ? Number(initialData.tax) : 0,
    status: initialData?.status || "DRAFT",
  });

  const [items, setItems] = useState<InvoiceItemCreateInput[]>(
    initialData?.items
      ? initialData.items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
        }))
      : []
  );

  const isLoading = isCreating || isUpdating;

  // Derive calculated totals for display purposes (Backend is authoritative for final save)
  const { subtotal, discount, tax, total } = useMemo(() => {
    let s = 0;
    items.forEach((item) => {
      s += (item.quantity || 0) * (item.unit_price || 0);
    });
    const d = formData.discount || 0;
    const t = formData.tax || 0;
    const tot = s - d + t;
    return {
      subtotal: s,
      discount: d,
      tax: t,
      total: tot,
    };
  }, [items, formData.discount, formData.tax]);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItemCreateInput,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (initialData) return true; // Just updating status

    if (items.length === 0) {
      setError("At least one item is required.");
      return false;
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description || item.quantity <= 0 || item.unit_price < 0) {
        setError(
          `Item ${
            i + 1
          } is missing required fields or has invalid negative values.`
        );
        return false;
      }
    }
    if (total < 0) {
      setError("Total cannot be negative.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleProceedToReview = () => {
    if (validateForm()) {
      setReviewMode(true);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    try {
      if (initialData) {
        const payload: InvoiceUpdateInput = {
          status: formData.status as any,
        };
        await updateInvoice(payload);
      } else {
        const payload: InvoiceCreateInput = {
          patient_id: formData.patient_id,
          appointment_id: formData.appointment_id || null,
          invoice_date: formData.invoice_date,
          discount: formData.discount,
          tax: formData.tax,
          status: formData.status as any,
          items: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        };
        await createInvoice(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save invoice.");
      setReviewMode(false);
    }
  };

  if (showCancelConfirm) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTitle>Discard Changes?</AlertTitle>
          <AlertDescription>
            Are you sure you want to cancel? Any unsaved work will be lost.
          </AlertDescription>
        </Alert>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
            No, keep editing
          </Button>
          <Button variant="destructive" onClick={onCancel}>
            Yes, discard
          </Button>
        </div>
      </div>
    );
  }

  if (reviewMode) {
    return (
      <div className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Review Invoice</AlertTitle>
          <AlertDescription className="text-blue-700">
            Please review the totals before issuing. Once an invoice is issued, items cannot be modified.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border p-4 space-y-4">
          <h4 className="font-semibold text-lg border-b pb-2">Header</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Patient ID: </span>
              {formData.patient_id}
            </div>
            <div>
              <span className="font-medium">Date: </span>
              {formData.invoice_date}
            </div>
            <div>
              <span className="font-medium">Status: </span>
              {formData.status}
            </div>
          </div>

          <h4 className="font-semibold text-lg border-b pb-2 pt-2">Line Items ({items.length})</h4>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                <div>
                  <div className="font-medium">{item.description}</div>
                  <div className="text-muted-foreground text-xs">
                    {item.quantity} x ${item.unit_price.toFixed(2)}
                  </div>
                </div>
                <div className="font-medium">
                  ${(item.quantity * item.unit_price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 pt-4 text-sm flex flex-col items-end">
            <div className="grid grid-cols-2 gap-8 w-64">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="text-right">${subtotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-8 w-64 text-red-600">
              <span>Discount:</span>
              <span className="text-right">-${discount.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-8 w-64 text-muted-foreground">
              <span>Tax:</span>
              <span className="text-right">${tax.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-8 w-64 pt-2 border-t border-dashed mt-2 font-bold text-lg">
              <span>Total:</span>
              <span className="text-right">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setReviewMode(false)}
            disabled={isLoading}
          >
            Back to Edit
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Confirm & Save"}
          </Button>
        </div>
      </div>
    );
  }

  // If updating, only allow changing status
  if (initialData) {
    return (
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleFieldChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="ISSUED">Issued</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Status"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient_id">Patient ID</Label>
          <Input
            id="patient_id"
            name="patient_id"
            value={formData.patient_id}
            onChange={handleFieldChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="appointment_id">Appointment ID (Optional)</Label>
          <Input
            id="appointment_id"
            name="appointment_id"
            value={formData.appointment_id}
            onChange={handleFieldChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice_date">Date</Label>
          <Input
            id="invoice_date"
            name="invoice_date"
            type="date"
            value={formData.invoice_date}
            onChange={handleFieldChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Initial Status</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleFieldChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="ISSUED">Issued</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Line Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border rounded-md border-dashed">
            No items added yet. Click "Add Item" to begin.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-end gap-4 p-4 border rounded-md relative bg-muted/20"
              >
                <div className="flex-1 space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    placeholder="e.g. Consultation Fee"
                  />
                </div>
                <div className="w-24 space-y-2">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", Number(e.target.value))
                    }
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Unit Price ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) =>
                      handleItemChange(index, "unit_price", Number(e.target.value))
                    }
                  />
                </div>
                <div className="w-32 pb-2 font-medium flex items-center justify-end text-sm">
                  ${(item.quantity * item.unit_price).toFixed(2)}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 -mb-1"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end space-y-2 pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 w-72 items-center">
          <Label className="text-right">Subtotal:</Label>
          <div className="text-right font-medium">${subtotal.toFixed(2)}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-72 items-center">
          <Label className="text-right">Discount ($):</Label>
          <Input
            type="number"
            name="discount"
            min="0"
            step="0.01"
            value={formData.discount}
            onChange={handleFieldChange}
            className="text-right"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 w-72 items-center">
          <Label className="text-right">Tax ($):</Label>
          <Input
            type="number"
            name="tax"
            min="0"
            step="0.01"
            value={formData.tax}
            onChange={handleFieldChange}
            className="text-right"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 w-72 items-center pt-2 border-t font-bold text-lg">
          <Label className="text-right text-lg">Total:</Label>
          <div className="text-right">${total.toFixed(2)}</div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setShowCancelConfirm(true)}>
          Cancel
        </Button>
        <Button onClick={handleProceedToReview}>Review Invoice</Button>
      </div>
    </div>
  );
}
