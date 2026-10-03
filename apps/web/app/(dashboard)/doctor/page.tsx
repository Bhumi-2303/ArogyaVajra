"use client";

import { useAuth } from "@/hooks/use-auth";
import { useDoctors } from "@/hooks/use-doctors";
import { useAppointments } from "@/hooks/use-appointments";
import { useMedicalRecords } from "@/hooks/use-medical-records";
import { usePatients } from "@/hooks/use-patients";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Users, FileText, Activity, AlertCircle, Eye, Plus, FilePlus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/lib/api/types";

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const { data: doctorsData, isLoading: isLoadingDoctor, error: doctorError } = useDoctors({ email: user?.email });
  
  const doctor = doctorsData?.data?.[0];
  const doctorId = doctor?.id;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{doctor?.first_name ? `, Dr. ${doctor.last_name}` : ""}. Here is your clinical overview.
          </p>
        </div>
      </div>

      {isLoadingDoctor ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      ) : doctorError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load doctor profile.</AlertDescription>
        </Alert>
      ) : !doctorId ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Profile Found</AlertTitle>
          <AlertDescription>We could not find a doctor profile associated with your account.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <TodayAppointmentsSection doctorId={doctorId} />
          <UpcomingAppointmentsSection doctorId={doctorId} />
          <AssignedPatientsSection doctorId={doctorId} />
          <PendingFollowUpsSection doctorId={doctorId} />
        </div>
      )}
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

function TodayAppointmentsSection({ doctorId }: { doctorId: string }) {
  const today = getTodayString();
  const { appointments, isLoading, error } = useAppointments({ doctor_id: doctorId, date: today });
  
  // Also fetch patients to map names
  const { data: patientsData } = usePatients();
  const patients = patientsData?.data || [];
  
  const getPatientName = (patientId: string) => {
    const p = patients.find(p => p.id === patientId);
    return p ? `${p.first_name} ${p.last_name}` : patientId;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today's Appointments
          </CardTitle>
          <CardDescription>Your schedule for today</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/appointments">View Calendar</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load appointments.</AlertDescription>
          </Alert>
        ) : appointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No appointments scheduled for today.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex flex-col p-3 border rounded-md hover:bg-muted/50 transition-colors gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{getPatientName(apt.patient_id)}</div>
                    <div className="text-sm text-muted-foreground">{apt.start_time} - {apt.end_time}</div>
                  </div>
                  <Badge>{apt.status}</Badge>
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/appointments/${apt.id}`}><Eye className="h-3 w-3 mr-1"/> View</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/medical-records/new?appointment_id=${apt.id}&patient_id=${apt.patient_id}`}><FileText className="h-3 w-3 mr-1"/> Record</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/prescriptions/new?appointment_id=${apt.id}&patient_id=${apt.patient_id}`}><FilePlus className="h-3 w-3 mr-1"/> Rx</Link>
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

function UpcomingAppointmentsSection({ doctorId }: { doctorId: string }) {
  const today = getTodayString();
  const { appointments, isLoading, error } = useAppointments({ doctor_id: doctorId, status: "SCHEDULED" });
  
  const upcoming = appointments.filter(a => a.appointment_date > today).sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));
  
  // Also fetch patients to map names
  const { data: patientsData } = usePatients();
  const patients = patientsData?.data || [];
  
  const getPatientName = (patientId: string) => {
    const p = patients.find(p => p.id === patientId);
    return p ? `${p.first_name} ${p.last_name}` : patientId;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Upcoming Appointments
          </CardTitle>
          <CardDescription>Future scheduled visits</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load upcoming appointments.</AlertDescription>
          </Alert>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No upcoming appointments found.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {upcoming.slice(0, 4).map((apt) => (
              <div key={apt.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{getPatientName(apt.patient_id)}</div>
                  <div className="text-sm text-muted-foreground">{new Date(apt.appointment_date).toLocaleDateString()} at {apt.start_time}</div>
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/appointments/${apt.id}`}><Eye className="h-4 w-4"/></Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AssignedPatientsSection({ doctorId }: { doctorId: string }) {
  const { appointments, isLoading: isLoadingApts, error: aptsError } = useAppointments({ doctor_id: doctorId });
  const { data: patientsData, isLoading: isLoadingPts, error: ptsError } = usePatients();
  
  const isLoading = isLoadingApts || isLoadingPts;
  const error = aptsError || ptsError;
  const patients = patientsData?.data || [];
  
  // Extract unique patients from appointments
  const uniquePatientIds = Array.from(new Set(appointments.map(a => a.patient_id)));
  const assignedPatients = patients.filter(p => uniquePatientIds.includes(p.id));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            Assigned Patients
          </CardTitle>
          <CardDescription>Patients you have seen or will see</CardDescription>
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
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load patients.</AlertDescription>
          </Alert>
        ) : assignedPatients.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No assigned patients found.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {assignedPatients.slice(0, 4).map((patient) => (
              <div key={patient.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                  <div className="text-sm text-muted-foreground">{patient.patient_code}</div>
                </div>
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`/patients/${patient.id}`}><Eye className="h-3 w-3 mr-1"/> View Patient</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PendingFollowUpsSection({ doctorId }: { doctorId: string }) {
  const today = getTodayString();
  const { records, isLoading, error } = useMedicalRecords({ doctor_id: doctorId });
  
  // Filter for records with a follow up date >= today
  const pendingFollowUps = records
    .filter(r => r.follow_up_date && r.follow_up_date >= today)
    .sort((a, b) => (a.follow_up_date as string).localeCompare(b.follow_up_date as string));

  const { data: patientsData } = usePatients();
  const patients = patientsData?.data || [];
  
  const getPatientName = (patientId: string) => {
    const p = patients.find(p => p.id === patientId);
    return p ? `${p.first_name} ${p.last_name}` : patientId;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            Pending Follow-ups
          </CardTitle>
          <CardDescription>Patients requiring follow-up</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load follow-ups.</AlertDescription>
          </Alert>
        ) : pendingFollowUps.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md mt-4 bg-muted/20">
            No pending follow-ups.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {pendingFollowUps.slice(0, 4).map((record) => (
              <div key={record.id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{getPatientName(record.patient_id)}</div>
                    <div className="text-sm text-orange-600 font-medium">Follow-up on {new Date(record.follow_up_date!).toLocaleDateString()}</div>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/medical-records/${record.id}`}><Eye className="h-4 w-4"/></Link>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground line-clamp-1 border-t pt-2">
                  Original note: {record.diagnosis || record.chief_complaint || "No notes."}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
