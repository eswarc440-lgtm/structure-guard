import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ChartCard, EmptyState, PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { reports } from "@/data/analyticsData";

const categories = ["All", "AI Prediction", "Infrastructure", "Risk", "Analytics", "Inspection"] as const;

const statusTone: Record<string, string> = {
  Ready: "text-success",
  Processing: "text-warning",
  Archived: "text-muted-foreground",
};

export function ReportsPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const rows = reports.filter((r) => category === "All" || r.category === category);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Reports"
          title="Infrastructure Reports"
          description="Generated risk, condition, analytics and inspection reporting."
          actions={<Button>Generate Report</Button>}
        />

        <nav aria-label="Report categories" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex min-w-max gap-2">
            {categories.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                    category === c ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {rows.length === 0 ? (
          <EmptyState title="No reports in this category" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {rows.map((r) => (
              <article key={r.id} className="flex h-full flex-col rounded-lg border bg-card p-5 shadow-panel">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md border border-primary/20 bg-primary/8 text-primary">
                    <FileText className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold">{r.title}</h2>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{r.id}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">{r.summary}</p>

                <dl className="mt-5 grid grid-cols-3 gap-3 border-t pt-4 text-xs">
                  <div>
                    <dt className="eyebrow text-muted-foreground">Type</dt>
                    <dd className="mt-1">{r.type}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-muted-foreground">Generated</dt>
                    <dd className="mt-1">{r.generated}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-muted-foreground">Status</dt>
                    <dd className={`mt-1 font-medium ${statusTone[r.status]}`}>{r.status}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link to="/reports/$id" params={{ id: r.id }}>
                      View
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="size-4" />
                    Download
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export function ReportDetailsPage({ id }: { id: string }) {
  const report = reports.find((r) => r.id === id);

  if (!report) {
    return (
      <DashboardLayout>
        <EmptyState title="Report not found" description={`No report matches the identifier ${id}.`} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link to="/reports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Reports
        </Link>

        <PageHeader
          eyebrow={`${report.id} · ${report.category}`}
          title={report.title}
          description={`${report.type} · Generated ${report.generated} · ${report.pages} pages`}
          actions={
            <Button variant="outline">
              <Download className="size-4" />
              Download
            </Button>
          }
        />

        <ChartCard title="Report Viewer" subtitle={`Status: ${report.status}`}>
          <div className="rounded-md border bg-surface p-6">
            <p className="text-sm leading-relaxed">{report.summary}</p>
            <div className="mt-6 space-y-4">
              {["Scope and methodology", "Condition assessment", "Risk findings", "Recommended actions"].map((section, i) => (
                <div key={section} className="border-t pt-4 first:border-0 first:pt-0">
                  <p className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1.5 text-sm font-semibold">{section}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Demonstration content. Once connected to the reporting service, generated sections render here with
                    charts, asset tables and model evidence.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
