import { Download, FileBarChart } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ChartCard, PageHeader } from "@/components/common/PageHeader";
import { AITabs } from "@/components/ai/AITabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { healthTrend, regionalAnalysis } from "@/data/analyticsData";
import { assetTypeSummary } from "@/data/infrastructureData";

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

const filters = [
  { id: "date", label: "Date Range", options: ["Last 7 months", "Last 12 months", "Year to date"] },
  { id: "region", label: "Region", options: ["All regions", "NTR", "Guntur", "Visakhapatnam", "East Godavari"] },
  { id: "type", label: "Infrastructure Type", options: ["All types", "Bridges", "Roads", "Buildings", "Water", "Utilities"] },
  { id: "risk", label: "Risk Level", options: ["All levels", "High", "Medium", "Low"] },
  { id: "status", label: "Asset Status", options: ["All statuses", "Operational", "Under Inspection", "Under Repair", "Restricted"] },
];

export function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="AI Intelligence"
          title="Analytics"
          description="Portfolio-level infrastructure analytics across condition, risk and region."
          actions={
            <>
              <Button variant="outline">
                <Download className="size-4" />
                Export
              </Button>
              <Button>
                <FileBarChart className="size-4" />
                Generate Report
              </Button>
            </>
          }
        />
        <AITabs />

        <section aria-label="Filters" className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
          {filters.map((f) => (
            <div key={f.id} className="min-w-0 space-y-1.5">
              <Label htmlFor={`filter-${f.id}`} className="text-xs text-muted-foreground">
                {f.label}
              </Label>
              <Select defaultValue={f.options[0]!}>
                <SelectTrigger id={`filter-${f.id}`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {f.options.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard title="Infrastructure Health Trend" subtitle="Condition classes over time">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthTrend} margin={{ left: -16, right: 8, top: 8 }}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="healthy" name="Healthy" stroke="var(--color-success)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="warning" name="Warning" stroke="var(--color-warning)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="critical" name="Critical" stroke="var(--color-danger)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Asset Distribution by Category" subtitle="Total monitored assets per structure type">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetTypeSummary} margin={{ left: -16, right: 8, top: 8 }}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="type" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="healthy" name="Healthy" stackId="a" fill="var(--color-success)" />
                  <Bar dataKey="warning" name="Warning" stackId="a" fill="var(--color-warning)" />
                  <Bar dataKey="critical" name="Critical" stackId="a" fill="var(--color-danger)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Regional Analysis" subtitle="Assets and at-risk counts by district">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalAnalysis} margin={{ left: -16, right: 8, top: 8 }}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="region" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="assets" name="Assets" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="atRisk" name="At risk" fill="var(--color-chart-4)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Prediction Trend" subtitle="Prediction volume and risk index">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthTrend} margin={{ left: -16, right: 8, top: 8 }}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="predictions" name="Predictions" stroke="var(--color-primary)" strokeWidth={2} />
                  <Line type="monotone" dataKey="riskIndex" name="Risk index" stroke="var(--color-accent)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
