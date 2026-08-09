import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Search } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ChartCard, EmptyState, PageHeader } from "@/components/common/PageHeader";
import { RiskBadge, StatusBadge } from "@/components/common/StatusBadge";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { assets, inspectionHistory } from "@/data/infrastructureData";
import { predictions } from "@/data/analyticsData";

export function InfrastructurePage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All types");
  const [health, setHealth] = useState("All health");
  const [risk, setRisk] = useState("All risk");

  const rows = useMemo(
    () =>
      assets.filter((a) => {
        const q = query.toLowerCase();
        return (
          (a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)) &&
          (type === "All types" || a.type === type) &&
          (health === "All health" || a.health === health.toLowerCase()) &&
          (risk === "All risk" || a.risk === risk.toLowerCase())
        );
      }),
    [query, type, health, risk],
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Digital Infrastructure"
          title="Infrastructure Assets"
          description="Central register of monitored structures with condition, risk and inspection state."
          actions={
            <Button variant="outline">
              <Download className="size-4" />
              Export
            </Button>
          }
        />

        <section aria-label="Filters" className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="asset-search" className="text-xs text-muted-foreground">
              Search
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="asset-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Asset ID, name or location" className="pl-9" />
            </div>
          </div>
          {[
            { id: "type", label: "Asset Type", value: type, set: setType, options: ["All types", "Bridge", "Road", "Building", "Water", "Utility", "Other"] },
            { id: "health", label: "Health", value: health, set: setHealth, options: ["All health", "Healthy", "Warning", "Critical"] },
            { id: "risk", label: "Risk", value: risk, set: setRisk, options: ["All risk", "Low", "Medium", "High"] },
          ].map((f) => (
            <div key={f.id} className="min-w-0 space-y-1.5">
              <Label htmlFor={`f-${f.id}`} className="text-xs text-muted-foreground">
                {f.label}
              </Label>
              <Select value={f.value} onValueChange={f.set}>
                <SelectTrigger id={`f-${f.id}`} className="w-full">
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

        <ChartCard title="Asset Register" subtitle={`${rows.length} assets`}>
          {rows.length === 0 ? (
            <EmptyState title="No assets match these filters" description="Adjust the search or filter criteria." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Last Inspection</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <Link to="/infrastructure/$id" params={{ id: a.id }} className="font-mono text-xs text-primary underline underline-offset-4">
                          {a.id}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{a.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.location}</TableCell>
                      <TableCell>
                        <StatusBadge status={a.health} />
                      </TableCell>
                      <TableCell>
                        <RiskBadge risk={a.risk} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.lastInspection}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}

export function AssetDetailsPage({ id }: { id: string }) {
  const asset = assets.find((a) => a.id === id);
  const history = inspectionHistory["default"] ?? [];
  const prediction = predictions.find((p) => p.assetId === id);

  if (!asset) {
    return (
      <DashboardLayout>
        <EmptyState title="Asset not found" description={`No monitored asset matches the identifier ${id}.`} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link to="/infrastructure" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Infrastructure Assets
        </Link>

        <PageHeader
          eyebrow={`${asset.id} · ${asset.type}`}
          title={asset.name}
          description={`${asset.location}, ${asset.district} district · Commissioned ${asset.builtYear}`}
          actions={
            <>
              <StatusBadge status={asset.health} />
              <RiskBadge risk={asset.risk} />
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Health Score" value={asset.healthScore} tone={asset.health === "healthy" ? "success" : asset.health === "warning" ? "warning" : "danger"} />
          <StatCard label="Risk Score" value={asset.riskScore} tone={asset.risk === "low" ? "success" : asset.risk === "medium" ? "warning" : "danger"} />
          <StatCard label="Remaining Useful Life" value={`${asset.rulYears} yrs`} tone="accent" />
          <StatCard label="Status" value={asset.status} />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard title="Overview" subtitle="Asset attributes and spatial reference">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                { k: "Asset ID", v: asset.id },
                { k: "Type", v: asset.type },
                { k: "Location", v: `${asset.location}, ${asset.district}` },
                { k: "Coordinates", v: `${asset.lat.toFixed(4)}, ${asset.lng.toFixed(4)}` },
                { k: "Commissioned", v: String(asset.builtYear) },
                { k: "Last inspection", v: asset.lastInspection },
              ].map((r) => (
                <div key={r.k}>
                  <dt className="eyebrow text-muted-foreground">{r.k}</dt>
                  <dd className="mt-1">{r.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 border-t pt-5">
              <p className="eyebrow text-muted-foreground">Condition index</p>
              <Progress value={asset.healthScore} className="mt-2" />
            </div>
          </ChartCard>

          <ChartCard title="AI Prediction" subtitle="Latest model output for this asset">
            {prediction ? (
              <div className="space-y-4">
                <p className="text-sm">{prediction.prediction}</p>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="eyebrow text-muted-foreground">Risk level</p>
                    <div className="mt-1.5">
                      <RiskBadge risk={prediction.risk} />
                    </div>
                  </div>
                  <div>
                    <p className="eyebrow text-muted-foreground">Confidence</p>
                    <p className="mt-1 font-display text-xl font-bold tabular-nums">{prediction.confidence.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="eyebrow text-muted-foreground">Generated</p>
                    <p className="mt-1 text-sm">{prediction.predictedAt}</p>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState title="No prediction in the current cycle" description="This asset will be scored in the next model run." />
            )}
          </ChartCard>
        </div>

        <ChartCard
          title="Inspection History"
          subtitle="Field observations recorded against this asset"
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/infrastructure/$id/history" params={{ id: asset.id }}>
                Full history
              </Link>
            </Button>
          }
        >
          <ul className="divide-y">
            {history.slice(0, 3).map((h) => (
              <li key={h.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 py-3.5 first:pt-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{h.finding}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {h.id} · {h.date} · {h.inspector}
                  </p>
                </div>
                <StatusBadge status={h.health} />
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}

export function AssetHistoryPage({ id }: { id: string }) {
  const asset = assets.find((a) => a.id === id);
  const history = inspectionHistory["default"] ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link to="/infrastructure/$id" params={{ id }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to asset
        </Link>
        <PageHeader eyebrow={id} title="Inspection History" description={asset ? asset.name : "Asset record"} />
        <ChartCard title="All Inspections" subtitle={`${history.length} records`}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inspection ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead className="min-w-[280px]">Finding</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-mono text-xs">{h.id}</TableCell>
                    <TableCell className="text-sm">{h.date}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{h.inspector}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{h.finding}</TableCell>
                    <TableCell>
                      <StatusBadge status={h.health} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{h.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
