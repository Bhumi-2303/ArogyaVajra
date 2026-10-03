"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePatients } from "@/hooks/use-patients";
import { useAppointments } from "@/hooks/use-appointments";
import { usePrescriptions } from "@/hooks/use-prescriptions";
import { useMedicalRecords } from "@/hooks/use-medical-records";
import { useInvoices } from "@/hooks/use-invoices";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Calendar, FileText, Pill, Receipt, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const { data: patientsData, isLoading: isLoadingPatient, error: patientError } = usePatients({ email: user?.email });
  
  const patient = patientsData?.data?.[0];
  const patientId = patient?.id;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{patient?.first_name ? `, ${patient.first_name}` : ""}. Here is an overview of your health records.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/appointments/new">
              <Plus className="mr-2 h-4 w-4" /> Book Appointment
            </Link>
          </Button>
        </div>
      </div>

      {isLoadingPatient ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      ) : patientError ? (
        <Alert variant="danger">
<>Error</>
          <>Failed to load patient profile.</>
</Alert>
      ) : !patientId ? (
        <Alert variant="danger">
<>No Profile Found</>
          <>We could not find a patient profile associated with your account.</>
</Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <AppointmentsSection patientId={patientId} />
          <PrescriptionsSection patientId={patientId} />
          <MedicalRecordsSection patientId={patientId} />
          <BillsSection patientId={patientId} />
        </div>
      )}
    </div>
  );
}

function AppointmentsSection({ patientId }: { patientId: string }) {
  const { appointments, isLoading, error } = useAppointments({ patient_id: patientId, status: "SCHEDULED" });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Appointments
          </CardTitle>
          <CardDescription>Your scheduled visits</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/appointments">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mt-4">
<>Failed to load appointments.</>
</Alert>
        ) : appointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No upcoming appointments.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {appointments.slice(0, 3).map((apt) => (
              <div key={apt.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{new Date(apt.appointment_date).toLocaleDateString()}</div>
                  <div className="text-sm text-muted-foreground">{apt.start_time} - {apt.end_time}</div>
                </div>
                <Badge>{apt.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PrescriptionsSection({ patientId }: { patientId: string }) {
  const { prescriptions, isLoading, error } = usePrescriptions({ patient_id: patientId });
  const activePrescriptions = prescriptions.filter(p => p.status === "ACTIVE");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Active Prescriptions
          </CardTitle>
          <CardDescription>Currently prescribed medications</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/prescriptions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mt-4">
<>Failed to load prescriptions.</>
</Alert>
        ) : activePrescriptions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No active prescriptions.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {activePrescriptions.slice(0, 3).map((rx) => (
              <div key={rx.id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div className="font-medium mb-1">{new Date(rx.prescription_date).toLocaleDateString()}</div>
                <div className="space-y-1">
                  {rx.items.slice(0, 2).map(item => (
                    <div key={item.id} className="text-sm flex justify-between">
                      <span>{item.medicine_name}</span>
                      <span className="text-muted-foreground">{item.dosage}</span>
                    </div>
                  ))}
                  {rx.items.length > 2 && (
                    <div className="text-xs text-muted-foreground italic">+{rx.items.length - 2} more...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MedicalRecordsSection({ patientId }: { patientId: string }) {
  const { records, isLoading, error } = useMedicalRecords({ patient_id: patientId });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Recent Medical Records
          </CardTitle>
          <CardDescription>Your latest visit notes</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/medical-records">View Records</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mt-4">
<>Failed to load medical records.</>
</Alert>
        ) : records.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No medical records found.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {records.slice(0, 3).map((record) => (
              <div key={record.id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">{new Date(record.record_date).toLocaleDateString()}</div>
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {record.diagnosis || record.chief_complaint || "No description provided."}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BillsSection({ patientId }: { patientId: string }) {
  const { invoices, isLoading, error } = useInvoices({ patient_id: patientId });
  const outstandingInvoices = invoices.filter(inv => inv.status === "ISSUED" || inv.status === "PARTIALLY_PAID");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Outstanding Bills
          </CardTitle>
          <CardDescription>Invoices requiring payment</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/invoices">View Bills</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="mt-4">
<>Failed to load bills.</>
</Alert>
        ) : outstandingInvoices.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No outstanding bills.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {outstandingInvoices.slice(0, 3).map((inv) => (
              <div key={inv.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{inv.invoice_number}</div>
                  <div className="text-sm text-muted-foreground">Due: ${Number(inv.balance || inv.total).toFixed(2)}</div>
                </div>
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`/invoices/${inv.id}`}>Pay Now</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
