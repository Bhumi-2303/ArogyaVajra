"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAvailability } from "@/hooks/use-availability";
import { DoctorAvailability } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Clock, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AvailabilityForm } from "@/components/forms/availability-form";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function DoctorAvailabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: doctorId } = use(params);

  const { availability, isLoading, error, deleteSlot } = useAvailability(doctorId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DoctorAvailability | undefined>();

  const handleCreate = () => {
    setSelectedSlot(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (slot: DoctorAvailability) => {
    setSelectedSlot(slot);
    setIsDialogOpen(true);
  };

  const handleDelete = async (slotId: string) => {
    if (confirm("Are you sure you want to delete this availability slot?")) {
      try {
        await deleteSlot(slotId);
      } catch (err: any) {
        alert(err.message || "Failed to delete slot");
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSlot(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
          <p className="text-muted-foreground">
            Manage weekly working hours and slot durations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/doctors/${doctorId}`)}>
            Back to Profile
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Slot
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load availability."}
          </AlertDescription>
        </Alert>
      ) : availability.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No availability slots"
          description="Add your first availability slot to start scheduling appointments."
          action={{
            label: "Add Slot",
            onClick: handleCreate,
          }}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availability.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">
                    {DAYS_OF_WEEK[slot.day_of_week]}
                  </TableCell>
                  <TableCell>
                    {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                  </TableCell>
                  <TableCell>{slot.slot_duration_minutes} mins</TableCell>
                  <TableCell>
                    {slot.is_active ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(slot)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSlot ? "Edit Availability Slot" : "Add Availability Slot"}
            </DialogTitle>
          </DialogHeader>
          <AvailabilityForm
            doctorId={doctorId}
            initialData={selectedSlot}
            onSuccess={handleCloseDialog}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
