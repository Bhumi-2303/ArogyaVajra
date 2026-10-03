"use client";

import { usePatients } from "@/hooks/use-patients";
import { useDoctors } from "@/hooks/use-doctors";
import { useAppointments } from "@/hooks/use-appointments";
import { useInvoices } from "@/hooks/use-invoices";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Users, UserCog, Calendar, Receipt, AlertCircle, Plus, ShieldAlert, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground">
            Manage clinic staff, monitor daily operations, and view system metrics.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/doctors/new">
              <Plus className="mr-2 h-4 w-4" /> Add Doctor
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/users/new?role=RECEPTIONIST">
              <Plus className="mr-2 h-4 w-4" /> Add Staff
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/users">
              <UsersIcon className="mr-2 h-4 w-4" /> Manage Users
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/audit-logs">
              <ShieldAlert className="mr-2 h-4 w-4" /> Audit Logs
            </Link>
          </Button>
        </div>
      </div>

      <Alert>
<>Access Control Note</>
        <>
          Administrative access permits system and user management. It does not grant unrestricted rights to modify clinical records or prescriptions.
        </>
</Alert>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <TotalPatientsSection />
        <ActiveDoctorsSection />
        <TodayAppointmentsSection />
        <OutstandingBillingSection />
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

function formatMoney(amount: number | string | undefined | null) {
  if (amount == null) return "$0.00";
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

function TotalPatientsSection() {
  const { data, isLoading, error } = usePatients({ page_size: 5 });
  const patients = data?.data || [];
  const total = data?.pagination?.total || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Total Patients
          </CardTitle>
          <CardDescription>Global patient registry</CardDescription>
        </div>
        <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : total}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mt-4">
<>Failed to load patient metrics.</>
</Alert>
        ) : patients.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No patients registered in the system.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Recently Registered</h4>
            {patients.slice(0, 3).map((patient) => (
              <div key={patient.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                  <div className="text-sm text-muted-foreground">{patient.patient_code}</div>
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/patients/${patient.id}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActiveDoctorsSection() {
  const { data, isLoading, error } = useDoctors({ is_active: true, page_size: 5 });
  const doctors = data?.data || [];
  const total = data?.pagination?.total || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCog className="h-5 w-5 text-emerald-500" />
            Active Doctors
          </CardTitle>
          <CardDescription>Currently active practitioners</CardDescription>
        </div>
        <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : total}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mt-4">
<>Failed to load doctor metrics.</>
</Alert>
        ) : doctors.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No active doctors in the system.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Active Roster</h4>
            {doctors.slice(0, 3).map((doc) => (
              <div key={doc.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">Dr. {doc.first_name} {doc.last_name}</div>
                  <div className="text-sm text-muted-foreground">{doc.specialization}</div>
                </div>
                <Badge className="bg-emerald-500">Active</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TodayAppointmentsSection() {
  const today = getTodayString();
  const { appointments, pagination, isLoading, error } = useAppointments({ date: today, page_size: 5 });
  const total = pagination?.total || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Today's Appointments
          </CardTitle>
          <CardDescription>Clinic schedule for today</CardDescription>
        </div>
        <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : total}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mt-4">
<>Failed to load appointment metrics.</>
</Alert>
        ) : appointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No appointments scheduled for today.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Upcoming Slots</h4>
            {appointments.slice(0, 3).map((apt) => (
              <div key={apt.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{apt.start_time} - {apt.end_time}</div>
                  <div className="text-sm text-muted-foreground">Dr. {apt.doctor_id.slice(0, 8)}</div>
                </div>
                <Badge variant="outline">{apt.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OutstandingBillingSection() {
  // Fetch up to 100 recent invoices to summarize outstanding balance.
  // In a real large-scale system, a dedicated /stats endpoint is required.
  const { invoices, isLoading, error } = useInvoices({ page_size: 100 });
  
  // Calculate total outstanding only from currently fetched active balances
  const outstandingInvoices = invoices.filter(inv => inv.status === 'ISSUED' || inv.status === 'PARTIALLY_PAID');
  const totalOutstandingAmount = outstandingInvoices.reduce((sum, inv) => {
    return sum + (typeof inv.balance === 'string' ? parseFloat(inv.balance) : (inv.balance || 0));
  }, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-orange-500" />
            Outstanding Billing
          </CardTitle>
          <CardDescription>Open balances (Recent 100)</CardDescription>
        </div>
        <div className="text-2xl font-bold text-orange-600">
          {isLoading ? <Skeleton className="h-8 w-24" /> : formatMoney(totalOutstandingAmount)}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mt-4">
<>Failed to load billing metrics.</>
</Alert>
        ) : outstandingInvoices.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No outstanding balances found.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Largest Open Invoices</h4>
            {outstandingInvoices
              .sort((a, b) => Number(b.balance) - Number(a.balance))
              .slice(0, 3)
              .map((inv) => (
              <div key={inv.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{inv.invoice_number}</div>
                  <div className="text-sm text-muted-foreground">Patient: {inv.patient_id.slice(0,8)}</div>
                </div>
                <div className="font-medium text-orange-600">{formatMoney(inv.balance)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
