import { Activity, Database, Layers, Server, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header Section */}
        <header className="rounded-card border border-app-border bg-app-surface p-8 shadow-sm">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-soft text-primary">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-navy md:text-3xl">
                  Arogyavajra <span className="text-muted font-normal">(आरोग्यवज्र)</span>
                </h1>
                <p className="text-sm font-medium text-muted">
                  The Indomitable Shield for Healthcare Management
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-app-border bg-soft px-3 py-1.5 text-xs font-semibold text-primary">
              <Activity className="h-4 w-4 text-royal animate-pulse" />
              <span>Phase 0 Foundation Baseline Active</span>
            </div>
          </div>
        </header>

        {/* System Architecture Status Grid */}
        <section aria-labelledby="foundation-heading" className="space-y-4">
          <h2 id="foundation-heading" className="text-lg font-semibold text-navy">
            System Infrastructure Status
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-app-border bg-app-surface p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-soft p-2 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy">Frontend Web</h3>
                  <p className="text-xs text-muted">Next.js 14 / TypeScript</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-success">
                <span className="h-2 w-2 rounded-full bg-success"></span>
                <span>Initialized & Running</span>
              </div>
            </div>

            <div className="rounded-lg border border-app-border bg-app-surface p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-soft p-2 text-primary">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy">Backend API</h3>
                  <p className="text-xs text-muted">FastAPI / Python 3.12+</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-success">
                <span className="h-2 w-2 rounded-full bg-success"></span>
                <span>Health & Ready Probes</span>
              </div>
            </div>

            <div className="rounded-lg border border-app-border bg-app-surface p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-soft p-2 text-primary">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy">Database</h3>
                  <p className="text-xs text-muted">PostgreSQL 16+</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-success">
                <span className="h-2 w-2 rounded-full bg-success"></span>
                <span>SQLAlchemy 2.0 Session</span>
              </div>
            </div>

            <div className="rounded-lg border border-app-border bg-app-surface p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-soft p-2 text-primary">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy">Migrations</h3>
                  <p className="text-xs text-muted">Alembic Configured</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-success">
                <span className="h-2 w-2 rounded-full bg-success"></span>
                <span>Versioned Schema Pipeline</span>
              </div>
            </div>
          </div>
        </section>

        {/* Foundation Notice */}
        <footer className="rounded-lg border border-app-border bg-app-surface p-6 text-center text-xs text-muted">
          <p>
            Arogyavajra Healthcare Management System &bull; Phase 0 Foundation Infrastructure
          </p>
          <p className="mt-1">
            Compliant with PRD, TRD, UI/UX Brief, and Agent Architecture Rules.
          </p>
        </footer>
      </div>
    </main>
  );
}
