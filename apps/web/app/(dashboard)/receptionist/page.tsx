"use client";

import { useAppointments } from "@/hooks/use-appointments";
import { usePatients } from "@/hooks/use-patients";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Calendar, Users, Clock, CalendarCheck, AlertCircle, Plus, UserPlus, ListTodo } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ReceptionistDashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Front Desk Dashboard</h1>
          <p className="text-muted-foreground">
            Manage patient registrations and daily clinic schedules.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/patients/new">
              <UserPlus className="mr-2 h-4 w-4" /> Register Patient
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/appointments/new">
              <Plus className="mr-2 h-4 w-4" /> Book Appointment
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <TodayAppointmentsSection />
        <PendingAppointmentsSection />
        <UpcomingAppointmentsSection />
        <RecentPatientsSection />
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

function TodayAppointmentsSection() {
  const today = getTodayString();
  const { appointments, isLoading, error } = useAppointments({ date: today });
  const { data: patientsData } = usePatients();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today's Schedule
          </CardTitle>
          <CardDescription>Appointments scheduled for today</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/appointments?date=${today}`}>
            <ListTodo className="h-4 w-4 mr-2" /> Manage
          </Link>
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
<>Failed to load today's schedule.</>
</Alert>
        ) : appointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No appointments scheduled for today.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{getPatientName(apt.patient_id, patientsData)}</div>
                  <div className="text-sm text-muted-foreground">
                    {apt.start_time} - {apt.end_time} | Dr. {apt.doctor_id.slice(0,8)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge>{apt.status}</Badge>
                  <Button size="sm" variant="link" className="h-auto p-0 text-xs" asChild>
                    <Link href={`/appointments/${apt.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PendingAppointmentsSection() {
  const { appointments, isLoading, error } = useAppointments({ status: "SCHEDULED" });
  const { data: patientsData } = usePatients();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Pending Appointments
          </CardTitle>
          <CardDescription>Appointments requiring confirmation</CardDescription>
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
<>Failed to load pending appointments.</>
</Alert>
        ) : appointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No pending appointments.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {appointments.slice(0, 4).map((apt) => (
              <div key={apt.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{getPatientName(apt.patient_id, patientsData)}</div>
                  <div className="text-sm text-orange-600 font-medium">
                    {new Date(apt.appointment_date).toLocaleDateString()} at {apt.start_time}
                  </div>
                </div>
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`/appointments/${apt.id}`}>Review</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingAppointmentsSection() {
  const today = getTodayString();
  const { appointments, isLoading, error } = useAppointments({ status: "CONFIRMED" });
  const { data: patientsData } = usePatients();
  
  const upcoming = appointments
    .filter(a => a.appointment_date > today)
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-blue-500" />
            Upcoming Confirmed
          </CardTitle>
          <CardDescription>Future confirmed appointments</CardDescription>
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
<>Failed to load upcoming appointments.</>
</Alert>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No upcoming confirmed appointments.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {upcoming.slice(0, 4).map((apt) => (
              <div key={apt.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{getPatientName(apt.patient_id, patientsData)}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(apt.appointment_date).toLocaleDateString()} at {apt.start_time}
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50">Confirmed</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentPatientsSection() {
  const { data: patientsData, isLoading, error } = usePatients();
  const patients = patientsData?.data || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            Recent Registrations
          </CardTitle>
          <CardDescription>Newly registered patients</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/patients">View Directory</Link>
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
<>Failed to load patients.</>
</Alert>
        ) : patients.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No patients found in the system.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {patients.slice(0, 4).map((patient) => (
              <div key={patient.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                  <div className="text-sm text-muted-foreground flex gap-2">
                    <span>{patient.patient_code}</span>
                    <span>•</span>
                    <span>{patient.phone}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/patients/${patient.id}`}>Profile</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
