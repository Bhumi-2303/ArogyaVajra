"use client";

import * as React from "react";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  FolderOpen,
} from "lucide-react";

import { AppShell, UserRole } from "@/components/layout";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  type BadgeVariant,
  Alert,
  EmptyState,
  ConfirmationDialog,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableSkeleton,
  CardSkeleton,
} from "@/components/ui";

export default function DesignSystemShowcasePage() {
  const [currentRole, setCurrentRole] = React.useState<UserRole>("ADMIN");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [buttonLoading, setButtonLoading] = React.useState(false);
  const [showSkeletons, setShowSkeletons] = React.useState(false);
  const [alertDismissed, setAlertDismissed] = React.useState(false);

  const roles: UserRole[] = [
    "ADMIN",
    "DOCTOR",
    "PATIENT",
    "RECEPTIONIST",
    "BILLING_STAFF",
  ];

  const clinicalBadges: { variant: BadgeVariant; label: string }[] = [
    { variant: "scheduled", label: "Scheduled" },
    { variant: "confirmed", label: "Confirmed" },
    { variant: "completed", label: "Completed" },
    { variant: "cancelled", label: "Cancelled" },
    { variant: "no_show", label: "No Show" },
    { variant: "issued", label: "Issued" },
    { variant: "paid", label: "Paid" },
    { variant: "partially_paid", label: "Partially Paid" },
    { variant: "draft", label: "Draft" },
    { variant: "active", label: "Active" },
  ];

  return (
    <AppShell
      role={currentRole}
      userName="Chief Medical Administrator"
      userRole={currentRole}
      userEmail="admin@arogyavajra.local"
      unreadNotifications={3}
      headerActions={
        <div className="flex items-center gap-2">
          <label
            htmlFor="role-select"
            className="text-xs font-semibold uppercase text-app-muted hidden sm:inline"
          >
            Preview Role:
          </label>
          <select
            id="role-select"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="rounded-md border border-app-border bg-white px-2.5 py-1.5 text-xs font-medium text-navy focus:outline-none focus:ring-2 focus:ring-royal"
            aria-label="Select preview role for sidebar navigation"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="space-y-8 pb-12">
        {/* Page Header Primitive */}
        <PageHeader
          breadcrumbs={[
            { label: "Infrastructure", href: "/" },
            { label: "Frontend Design System" },
          ]}
          title="Shared Frontend Infrastructure"
          description="Authoritative Arogyavajra visual tokens, layout shell, accessible UI primitives, and feedback components conforming to UI-UX-BRIEF.md."
          badge={<Badge variant="issued">Foundation Active</Badge>}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={
                  <RefreshCw
                    className={`h-4 w-4 ${buttonLoading ? "animate-spin" : ""}`}
                  />
                }
                onClick={() => {
                  setButtonLoading(true);
                  setTimeout(() => setButtonLoading(false), 800);
                }}
              >
                Test Loading State
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ShieldCheck className="h-4 w-4" />}
                onClick={() => setDialogOpen(true)}
              >
                Open Dialog Modal
              </Button>
            </div>
          }
        />

        {/* Feedback Alert Banners */}
        {!alertDismissed && (
          <div className="space-y-3">
            <Alert
              variant="info"
              title="Design System & Component Architecture Notice"
              onDismiss={() =>
setAlertDismissed(true)}
            >
              All components are built using strict CSS variables, Tailwind tokens, WCAG 2.1 AA accessibility guidelines, and zero third-party UI libraries.
</Alert>
          </div>
        )}

        {/* Section 1: Color Palette & Visual Tokens */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Healthcare Color Palette</CardTitle>
            <CardDescription>
              Documented blue-and-white theme providing high contrast, clinical authority, and clear hierarchy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              <div className="rounded-lg border border-app-border p-3 bg-white space-y-1.5">
                <div className="h-10 w-full rounded bg-navy" />
                <p className="text-xs font-semibold text-navy">Deep Navy</p>
                <p className="font-mono text-[11px] text-app-muted">#021C48</p>
              </div>
              <div className="rounded-lg border border-app-border p-3 bg-white space-y-1.5">
                <div className="h-10 w-full rounded bg-primary" />
                <p className="text-xs font-semibold text-navy">Primary Blue</p>
                <p className="font-mono text-[11px] text-app-muted">#012C7D</p>
              </div>
              <div className="rounded-lg border border-app-border p-3 bg-white space-y-1.5">
                <div className="h-10 w-full rounded bg-royal" />
                <p className="text-xs font-semibold text-navy">Royal Blue</p>
                <p className="font-mono text-[11px] text-app-muted">#0B5ED7</p>
              </div>
              <div className="rounded-lg border border-app-border p-3 bg-white space-y-1.5">
                <div className="h-10 w-full rounded bg-soft border border-app-border" />
                <p className="text-xs font-semibold text-navy">Soft Blue</p>
                <p className="font-mono text-[11px] text-app-muted">#E5F0FE</p>
              </div>
              <div className="rounded-lg border border-app-border p-3 bg-white space-y-1.5">
                <div className="h-10 w-full rounded bg-app-bg border border-app-border" />
                <p className="text-xs font-semibold text-navy">Background</p>
                <p className="font-mono text-[11px] text-app-muted">#F6F9FD</p>
              </div>
              <div className="rounded-lg border border-app-border p-3 bg-white space-y-1.5">
                <div className="h-10 w-full rounded bg-app-border" />
                <p className="text-xs font-semibold text-navy">Border</p>
                <p className="font-mono text-[11px] text-app-muted">#DDE6F2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Reusable Button Primitives */}
        <Card>
          <CardHeader>
            <CardTitle>Button Primitives</CardTitle>
            <CardDescription>
              Explicit action hierarchy with visible focus rings, defined states, and no pill shapes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline Action</Button>
              <Button variant="ghost">Ghost Action</Button>
              <Button variant="danger">Destructive</Button>
              <Button variant="success">Success</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-app-border">
              <Button size="sm" variant="primary">Small (sm)</Button>
              <Button size="md" variant="primary">Medium (md)</Button>
              <Button size="lg" variant="primary">Large (lg)</Button>
              <Button size="md" variant="primary" isLoading={buttonLoading}>
                Loading State
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Input & Form Primitives */}
        <Card>
          <CardHeader>
            <CardTitle>Input & Form Primitives</CardTitle>
            <CardDescription>
              Accessible form fields with uppercase clinical labels, helper text, and validation feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                label="Standard Field"
                placeholder="Enter value..."
                helperText="Helper guidance text"
              />
              <Input
                label="Search Filter"
                placeholder="Search resources..."
                leftIcon={<Search className="h-4 w-4" />}
              />
              <Input
                label="Required Validation"
                required
                defaultValue="invalid_input"
                error="Format validation error message"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Clinical Status Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Status Badge Primitives</CardTitle>
            <CardDescription>
              Color-coded clinical badges adhering to Section 22 of UI-UX-BRIEF.md.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2.5">
              {clinicalBadges.map((badge) => (
                <Badge key={badge.variant} variant={badge.variant}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Table Primitives */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Table Primitives & Data Display</CardTitle>
              <CardDescription>
                Clean clinical table with uppercase tracking headers, alternating hover, and keyboard focus.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSkeletons(!showSkeletons)}
            >
              {showSkeletons ? "Show Content" : "Preview Skeleton"}
            </Button>
          </CardHeader>
          <CardContent>
            {showSkeletons ? (
              <TableSkeleton columns={4} rows={4} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component Primitive</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Accessibility Foundation</TableHead>
                    <TableHead>Design Token</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold text-navy">AppShell</TableCell>
                    <TableCell>Layout Shell</TableCell>
                    <TableCell>Skip-to-content landmark, ARIA aside drawer</TableCell>
                    <TableCell className="font-mono text-xs">fixed 256px / responsive</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="completed">Active</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold text-navy">PageHeader</TableCell>
                    <TableCell>Layout Primitive</TableCell>
                    <TableCell>H1 semantic heading, aria-label breadcrumb</TableCell>
                    <TableCell className="font-mono text-xs">border-b, flex wrap</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="completed">Active</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold text-navy">Dialog Modal</TableCell>
                    <TableCell>Overlay Primitive</TableCell>
                    <TableCell>Focus trap, ESC listener, backdrop blur</TableCell>
                    <TableCell className="font-mono text-xs">rounded-card, shadow-dialog</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="completed">Active</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold text-navy">Alert Banner</TableCell>
                    <TableCell>Feedback Primitive</TableCell>
                    <TableCell>role=&quot;alert&quot;, aria-live=&quot;polite&quot;, dismiss key</TableCell>
                    <TableCell className="font-mono text-xs">semantic colors, soft bg</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="completed">Active</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Section 6: Empty State Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Empty State Feedback Primitive</CardTitle>
            <CardDescription>
              Clear visual guidance when data sets, tables, or filters yield zero results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<FolderOpen className="h-10 w-10 text-royal" />}
              title="No Feature Modules Loaded"
              description="Domain pages (Patients, Appointments, Records, Invoices) will be implemented in subsequent feature commits following this foundation baseline."
              actionLabel="Trigger Confirmation Modal"
              onAction={() => setConfirmOpen(true)}
              actionVariant="outline"
            />
          </CardContent>
        </Card>

        {/* Section 7: Skeleton Loading States */}
        <Card>
          <CardHeader>
            <CardTitle>Skeleton Loading Primitives</CardTitle>
            <CardDescription>
              Pulsing placeholders preventing content shift during asynchronous data loading.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </CardContent>
        </Card>

        {/* Standard Modal Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent onClose={() => setDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>Arogyavajra Component Dialog</DialogTitle>
              <DialogDescription>
                This accessible dialog primitive features an animated backdrop blur, keyboard ESC dismissal, and automatic focus management.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-sm text-slate-700">
              <p>
                Verify that clicking outside this modal or pressing the{" "}
                <kbd className="rounded border border-app-border bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
                  Esc
                </kbd>{" "}
                key closes the overlay.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setDialogOpen(false)}>
                Confirm Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Destructive Confirmation Modal */}
        <ConfirmationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={() => setConfirmOpen(false)}
          title="Verify Infrastructure Action"
          description="Are you sure you want to trigger this action? This modal primitive conforms to UI-UX-BRIEF.md Section 25.1."
          confirmLabel="Proceed"
          cancelLabel="Cancel"
          variant="danger"
        />
      </div>
    </AppShell>
  );
}
