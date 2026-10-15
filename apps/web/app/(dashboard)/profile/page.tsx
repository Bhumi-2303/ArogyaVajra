"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePatients } from "@/hooks/use-patients";
import { useDoctors } from "@/hooks/use-doctors";
import { changePasswordApi } from "@/lib/api/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Heart,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  // Load patient profile if patient
  const { data: patientsData, isLoading: isLoadingPatient } = usePatients(
    user?.role === "PATIENT" && user?.email ? { email: user.email } : undefined
  );
  const patient = user?.role === "PATIENT" ? patientsData?.data?.[0] : undefined;

  // Load doctor profile if doctor
  const { data: doctorsData, isLoading: isLoadingDoctor } = useDoctors(
    user?.role === "DOCTOR" && user?.email ? { email: user.email } : undefined
  );
  const doctor = user?.role === "DOCTOR" ? doctorsData?.data?.[0] : undefined;

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword.length < 8) {
      setPwdError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New password and confirmation do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePasswordApi({
        current_password: oldPassword,
        new_password: newPassword,
      });
      setPwdSuccess("Password updated successfully. Session preserved.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPwdError(err.message);
      } else {
        setPwdError("Failed to update password. Please check your old password.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const roleLabel =
    user?.role === "PATIENT"
      ? "Patient"
      : user?.role === "DOCTOR"
      ? "Doctor"
      : user?.role === "RECEPTIONIST"
      ? "Receptionist"
      : user?.role === "BILLING_STAFF"
      ? "Billing Staff"
      : "System Administrator";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Account Profile & Security
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal details, clinical role credentials, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Account Card */}
        <Card className="md:col-span-1 shadow-sm border-app-border flex flex-col justify-between">
          <div>
            <CardHeader className="text-center pb-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-soft text-primary font-bold text-xl border border-blue-200 mb-2">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <CardTitle className="text-lg font-bold text-navy">
                {patient
                  ? `${patient.first_name} ${patient.last_name}`
                  : doctor
                  ? `Dr. ${doctor.first_name} ${doctor.last_name}`
                  : roleLabel}
              </CardTitle>
              <CardDescription className="text-xs break-all">
                {user?.email}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-2 text-xs border-t border-app-border">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground font-medium">Assigned Role:</span>
                <Badge variant="confirmed">{user?.role}</Badge>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground font-medium">Account Status:</span>
                <span className="text-success font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active • Verified
                </span>
              </div>
              {patient?.patient_code && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground font-medium">Patient Code:</span>
                  <span className="font-mono font-bold text-navy">
                    {patient.patient_code}
                  </span>
                </div>
              )}
              {doctor?.doctor_code && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground font-medium">Doctor Code:</span>
                  <span className="font-mono font-bold text-navy">
                    {doctor.doctor_code}
                  </span>
                </div>
              )}
            </CardContent>
          </div>

          <CardFooter className="pt-4 border-t border-app-border">
            <Button
              variant="outline"
              className="w-full text-danger hover:bg-danger-light border-danger/30 gap-2"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" /> Sign Out of Session
            </Button>
          </CardFooter>
        </Card>

        {/* Detailed Profile Information */}
        <div className="md:col-span-2 space-y-6">
          {user?.role === "PATIENT" && (
            <Card className="shadow-sm border-app-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>Patient Demographics</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Official clinical registry details on file.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {isLoadingPatient ? (
                  <div className="space-y-2 py-4">
                    <div className="h-4 w-full bg-slate-100 animate-pulse rounded" />
                    <div className="h-4 w-3/4 bg-slate-100 animate-pulse rounded" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground block">Full Name</span>
                      <span className="font-medium text-navy">
                        {patient?.first_name} {patient?.last_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Date of Birth</span>
                      <span className="font-medium text-navy">
                        {patient?.date_of_birth || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Gender</span>
                      <span className="font-medium text-navy">
                        {patient?.gender || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Contact Phone</span>
                      <span className="font-medium text-navy">
                        {patient?.phone || "None registered"}
                      </span>
                    </div>
                    {patient?.address && (
                      <div className="col-span-2">
                        <span className="text-xs text-muted-foreground block">Residential Address</span>
                        <span className="font-medium text-navy">{patient.address}</span>
                      </div>
                    )}
                    {patient?.emergency_contact_name && (
                      <div className="col-span-2 border-t pt-2 text-xs">
                        <span className="text-muted-foreground block">Emergency Contact</span>
                        <span className="font-semibold text-navy">
                          {patient.emergency_contact_name}{" "}
                          {patient.emergency_contact_phone && `(${patient.emergency_contact_phone})`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {user?.role === "DOCTOR" && (
            <Card className="shadow-sm border-app-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <span>Clinical Practitioner Credentials</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Professional qualifications and practice information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {isLoadingDoctor ? (
                  <div className="space-y-2 py-4">
                    <div className="h-4 w-full bg-slate-100 animate-pulse rounded" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground block">Specialization</span>
                      <span className="font-medium text-navy">{doctor?.specialization}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Medical License</span>
                      <span className="font-medium font-mono text-navy">
                        {doctor?.license_number || "Verified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Qualifications</span>
                      <span className="font-medium text-navy">
                        {doctor?.qualification || "General Medicine"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Consultation Fee</span>
                      <span className="font-medium text-navy">
                        ₹{Number(doctor?.consultation_fee || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security & Password Change */}
          <Card className="shadow-sm border-app-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                <span>Change Password</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Update your account security password. Must be at least 8 characters.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-3">
                {pwdError && (
                  <Alert variant="danger" title="Error">
                    {pwdError}
                  </Alert>
                )}
                {pwdSuccess && (
                  <Alert variant="success" title="Success">
                    {pwdSuccess}
                  </Alert>
                )}

                <div className="space-y-1">
                  <Label htmlFor="old_password">Current Password</Label>
                  <Input
                    id="old_password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t border-app-border flex justify-end">
                <Button type="submit" isLoading={isChangingPassword}>
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
