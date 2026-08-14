import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  FileBarChart,
  Map,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader, ChartCard } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { analyticsService, type AnalyticsSummary } from "@/services/analyticsService";
import { useEffect, useState } from "react";

const riskColors = [
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
];

const quickActions = [
  { to: "/infrastructure", label: "View Infrastructure", icon: Building2 },
  { to: "/gis", label: "Open GIS", icon: Map },
  { to: "/digital-twin", label: "Open Digital Twin", icon: Building2 },
  { to: "/ai/predictions", label: "View Predictions", icon: Sparkles },
  { to: "/reports", label: "Generate Report", icon: FileBarChart },
] as const;

export function DashboardPage() {
  const { user } = useAuth();

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
        ? "Good afternoon"
        : "Good evening";

  useEffect(() => {
    analyticsService
      .summary()
      .then((data) => {
        setSummary(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Analytics API error:", err);
        setError("Unable to load live analytics");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const total = summary?.total_assets ?? 0;
  const healthy = Math.max(
    total -
      (summary?.high_risk_assets ?? 0) -
      (summary?.medium_risk_assets ?? 0),
    0
  );

  const riskDistribution = summary
    ? [
        {
          name: "Low Risk",
          value: summary.low_risk_assets,
        },
        {
          name: "Medium Risk",
          value: summary.medium_risk_assets,
        },
        {
          name: "High Risk",
          value: summary.high_risk_assets,
        },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <PageHeader
          eyebrow={`${greeting}, ${user?.name ?? "Officer"}`}
          title="Infrastructure Overview"
          description={
            loading
              ? "Loading live infrastructure analytics..."
              : "Live analytics from the Structure Guard backend."
          }
          actions={
            <Button asChild>
              <Link to="/reports">
                Generate Report
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />

        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Assets"
            value={loading ? "..." : total.toLocaleString()}
            icon={Building2}
            delta="Live PostgreSQL asset database"
          />

          <StatCard
            label="Healthy"
            value={loading ? "..." : healthy.toLocaleString()}
            icon={TrendingUp}
            tone="success"
            delta={
              total
                ? `${((healthy / total) * 100).toFixed(1)}% of portfolio`
                : "Live calculation"
            }
          />

          <StatCard
            label="At Risk"
            value={
              loading
                ? "..."
                : (
                    (summary?.high_risk_assets ?? 0) +
                    (summary?.medium_risk_assets ?? 0)
                  ).toLocaleString()
            }
            icon={ShieldAlert}
            tone="warning"
            delta={
              loading
                ? "Loading..."
                : `${summary?.high_risk_assets ?? 0} high risk`
            }
          />

          <StatCard
            label="AI Predictions"
            value={
              loading
                ? "..."
                : (summary?.predicted_assets ?? 0).toLocaleString()
            }
            icon={Sparkles}
            tone="accent"
            delta="Live prediction coverage"
          />

        </div>

        <div className="grid gap-4 xl:grid-cols-2">

          <ChartCard
            title="Risk Overview"
            subtitle="Live portfolio risk classification"
          >
            <div className="h-72">

              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Loading risk data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>

                    <Pie
                      data={riskDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="58%"
                      outerRadius="82%"
                      paddingAngle={2}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={riskColors[index]}
                          stroke="var(--color-card)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>

                    <Legend wrapperStyle={{ fontSize: 12 }} />

                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />

                  </PieChart>
                </ResponsiveContainer>
              )}

            </div>
          </ChartCard>

          <ChartCard
            title="Live AI Metrics"
            subtitle="Calculated from the infrastructure database"
          >
            <div className="grid gap-4 sm:grid-cols-3">

              <div className="rounded-lg border bg-surface p-4">
                <p className="text-xs text-muted-foreground">
                  Avg Health Score
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {loading
                    ? "..."
                    : summary?.average_health_score.toFixed(2)}
                </p>
              </div>

              <div className="rounded-lg border bg-surface p-4">
                <p className="text-xs text-muted-foreground">
                  Avg Risk Score
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {loading
                    ? "..."
                    : summary?.average_risk_score.toFixed(2)}
                </p>
              </div>

              <div className="rounded-lg border bg-surface p-4">
                <p className="text-xs text-muted-foreground">
                  High Risk
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {loading
                    ? "..."
                    : summary?.high_risk_assets.toLocaleString()}
                </p>
              </div>

            </div>
          </ChartCard>

        </div>

        <ChartCard
          title="Portfolio Risk Breakdown"
          subtitle="Real-time database statistics"
        >
          <div className="grid gap-4 md:grid-cols-3">

            <div className="rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">
                Low Risk
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {loading
                  ? "..."
                  : summary?.low_risk_assets.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">
                Medium Risk
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {loading
                  ? "..."
                  : summary?.medium_risk_assets.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">
                High Risk
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {loading
                  ? "..."
                  : summary?.high_risk_assets.toLocaleString()}
              </p>
            </div>

          </div>
        </ChartCard>

        <section
          aria-label="Quick actions"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          {quickActions.map((qa) => (
            <Link
              key={qa.to}
              to={qa.to}
              className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-secondary"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md border border-primary/20 bg-primary/8 text-primary">
                <qa.icon className="size-4" aria-hidden="true" />
              </span>

              <span className="min-w-0 truncate text-sm font-medium">
                {qa.label}
              </span>
            </Link>
          ))}
        </section>

      </div>
    </DashboardLayout>
  );
}



