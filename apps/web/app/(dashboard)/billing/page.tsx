"use client";

import { useInvoices } from "@/hooks/use-invoices";
import { usePatients } from "@/hooks/use-patients";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Receipt, CreditCard, Clock, AlertCircle, Plus, Search, DollarSign } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function BillingDashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Dashboard</h1>
          <p className="text-muted-foreground">
            Manage patient invoices, record payments, and track outstanding balances.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/invoices/new">
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/invoices">
              <Search className="mr-2 h-4 w-4" /> Search Invoices
            </Link>
          </Button>
        </div>
      </div>

      <Alert>
<>Financial Policy</>
        <>
          All displayed monetary values (total, paid amount, and outstanding balance) are authoritative figures strictly fetched from the backend system.
        </>
</Alert>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <TodayInvoicesSection />
        <PendingPaymentsSection />
        <PartiallyPaidSection />
        <RecentlyPaidSection />
      </div>
    </div>
  );
}

function getTodayString() {
  const d = new Date();
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

function getPatientName(patientId: string, patientsData: any) {
  const p = patientsData?.data?.find((p: any) => p.id === patientId);
  return p ? `${p.first_name} ${p.last_name}` : patientId;
}

function formatMoney(amount: number | string | undefined | null) {
  if (amount == null) return "$0.00";
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

function TodayInvoicesSection() {
  const today = getTodayString();
  const { invoices, isLoading, error } = useInvoices();
  const { data: patientsData } = usePatients();

  // Filter for invoices issued today
  const todayInvoices = invoices.filter(inv => inv.invoice_date && inv.invoice_date.startsWith(today));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Today's Invoices
          </CardTitle>
          <CardDescription>Invoices generated today</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/invoices">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mt-4">
<>Failed to load today's invoices.</>
</Alert>
        ) : todayInvoices.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No invoices generated today.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {todayInvoices.slice(0, 4).map((inv) => (
              <div key={inv.id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{inv.invoice_number}</div>
                    <div className="text-sm text-muted-foreground">{getPatientName(inv.patient_id, patientsData)}</div>
                  </div>
                  <Badge variant="outline">{inv.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2 pt-2 border-t">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Total</span>
                    <span className="font-medium">{formatMoney(inv.total)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-muted-foreground text-xs">Outstanding</span>
                    <span className="font-medium text-orange-600">{formatMoney(inv.balance)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PendingPaymentsSection() {
  const { invoices, isLoading, error } = useInvoices({ status: "ISSUED" });
  const { data: patientsData } = usePatients();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-500" />
            Pending Payments
          </CardTitle>
          <CardDescription>Unpaid issued invoices</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mt-4">
<>Failed to load pending payments.</>
</Alert>
        ) : invoices.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No pending payments.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {invoices.slice(0, 4).map((inv) => (
              <div key={inv.id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium">{inv.invoice_number}</div>
                    <div className="text-sm text-muted-foreground">{getPatientName(inv.patient_id, patientsData)}</div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/invoices/${inv.id}`}>Record Payment</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2 pt-2 border-t">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Total</span>
                    <span className="font-medium">{formatMoney(inv.total)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-muted-foreground text-xs">Outstanding</span>
                    <span className="font-medium text-red-600">{formatMoney(inv.balance)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PartiallyPaidSection() {
  const { invoices, isLoading, error } = useInvoices({ status: "PARTIALLY_PAID" });
  const { data: patientsData } = usePatients();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-500" />
            Partially Paid
          </CardTitle>
          <CardDescription>Invoices with remaining balances</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mt-4">
<>Failed to load invoices.</>
</Alert>
        ) : invoices.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No partially paid invoices.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {invoices.slice(0, 4).map((inv) => (
              <div key={inv.id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium">{inv.invoice_number}</div>
                    <div className="text-sm text-muted-foreground">{getPatientName(inv.patient_id, patientsData)}</div>
                  </div>
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/invoices/${inv.id}`}>Pay Balance</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm mt-2 pt-2 border-t">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Total</span>
                    <span>{formatMoney(inv.total)}</span>
                  </div>
                  <div className="flex flex-col text-center">
                    <span className="text-muted-foreground text-xs">Paid Amount</span>
                    <span className="text-emerald-600">{formatMoney(inv.paid_amount)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-muted-foreground text-xs">Outstanding</span>
                    <span className="font-medium text-orange-600">{formatMoney(inv.balance)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentlyPaidSection() {
  const { invoices, isLoading, error } = useInvoices({ status: "PAID" });
  const { data: patientsData } = usePatients();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Recently Paid
          </CardTitle>
          <CardDescription>Fully settled invoices</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mt-4">
<>Failed to load paid invoices.</>
</Alert>
        ) : invoices.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No paid invoices found.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {invoices.slice(0, 4).map((inv) => (
              <div key={inv.id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium">{inv.invoice_number}</div>
                    <div className="text-sm text-muted-foreground">{getPatientName(inv.patient_id, patientsData)}</div>
                  </div>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">Paid</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2 pt-2 border-t">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Total</span>
                    <span>{formatMoney(inv.total)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-muted-foreground text-xs">Paid Amount</span>
                    <span className="font-medium text-emerald-600">{formatMoney(inv.paid_amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
