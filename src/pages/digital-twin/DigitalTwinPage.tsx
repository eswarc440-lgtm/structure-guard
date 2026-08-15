import { useEffect, useState } from "react";
import { Box, Layers, Search, Settings2 } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiskBadge, StatusBadge } from "@/components/common/StatusBadge";
import digitalTwinImage from "@/assets/digital-twin.jpg";
import { apiRequest } from "@/services/api";
import type { InfrastructureAsset } from "@/types";

function getHealthStatus(score: number | null): "healthy" | "warning" | "critical" {
  if (score === null || score === undefined) return "healthy";
  if (score >= 80) return "healthy";
  if (score >= 50) return "warning";
  return "critical";
}

function getRiskLevel(level: string | null): "low" | "medium" | "high" {
  if (!level) return "low";
  const value = level.toLowerCase();
  if (value.includes("high") || value.includes("critical")) return "high";
  if (value.includes("medium")) return "medium";
  return "low";
}

export function DigitalTwinPage() {
  const [mode, setMode] = useState<"2d" | "3d">("3d");
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [selected, setSelected] = useState<InfrastructureAsset | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await apiRequest<{ features?: Array<{ properties?: any }>; items?: Array<any> }>('/api/v1/digital-twin/assets?limit=20');
        const featureItems = response.features ?? [];
        const liveAssets = (featureItems.length > 0 ? featureItems : (response.items ?? [])).map((entry, index) => {
          const payload = 'properties' in (entry as Record<string, unknown>) ? (entry as { properties?: any }).properties ?? {} : entry as any;
          const latitude = Number(payload.latitude ?? payload.lat ?? 0);
          const longitude = Number(payload.longitude ?? payload.lng ?? 0);

          return {
            id: payload.id || `asset-${index}`,
            name: payload.name || 'Unnamed Asset',
            type: (payload.asset_type || payload.type || 'Other') as any,
            location: payload.location || payload.district || 'Unknown',
            district: payload.district || 'Unknown',
            lat: latitude,
            lng: longitude,
            health: getHealthStatus(Number(payload.health_score ?? 0)),
            healthScore: Number(payload.health_score ?? 0),
            risk: getRiskLevel(payload.risk_level),
            riskScore: Number(payload.risk_score ?? 0),
            lastInspection: 'Live',
            status: 'Operational' as any,
            builtYear: Number(payload.built_year ?? 2000),
            rulYears: Number(payload.remaining_life ?? payload.remaining_useful_life ?? 10),
          };
        }).filter((asset) => Number.isFinite(asset.lat) && Number.isFinite(asset.lng) && asset.lat !== 0 && asset.lng !== 0);

        setAssets(liveAssets);
        setSelected(liveAssets[0] ?? null);
      } catch (error) {
        console.error('Digital twin assets fetch failed', error);
        setAssets([]);
        setSelected(null);
      }
    };

    void loadAssets();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="inline-flex shrink-0 rounded-md border p-0.5">
              {(["2d", "3d"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-[5px] px-3 py-1.5 text-xs font-medium transition-colors ${
                    mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "2d" ? "2D GIS" : "3D Twin"}
                </button>
              ))}
            </div>
            <div className="relative hidden min-w-0 flex-1 sm:block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input placeholder="Search asset…" aria-label="Search asset" className="pl-9" />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="icon" aria-label="Layers" className="min-h-11 min-w-11">
              <Layers className="size-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="View settings" className="min-h-11 min-w-11">
              <Settings2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative overflow-hidden rounded-lg border bg-navy">
            <img
              src={digitalTwinImage}
              alt="Digital twin wireframe view of monitored infrastructure"
              width={1600}
              height={1008}
              className="h-[52vh] min-h-[380px] w-full object-cover lg:h-[calc(100vh-16rem)]"
            />
            <div className="absolute top-4 left-4 rounded-md border border-navy-foreground/15 bg-navy/80 px-3 py-2 backdrop-blur">
              <p className="eyebrow text-navy-foreground/50">Digital Twin View</p>
              <p className="mt-1 text-sm text-navy-foreground">
                {mode === "3d" ? "3D infrastructure model" : "2D GIS projection"}
              </p>
            </div>
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {assets.slice(0, 5).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelected(a)}
                  className={`rounded-md border px-2.5 py-1.5 font-mono text-[11px] backdrop-blur transition-colors ${
                    selected?.id === a.id
                      ? "border-accent bg-accent/20 text-navy-foreground"
                      : "border-navy-foreground/15 bg-navy/70 text-navy-foreground/70 hover:text-navy-foreground"
                  }`}
                >
                  {a.id}
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border bg-card p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Box className="size-4" aria-hidden="true" /> Selected Asset
              </h2>
              {selected ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="font-mono text-[11px] text-muted-foreground">{selected.id}</p>
                    <p className="text-base font-semibold">{selected.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={selected.health} />
                    <RiskBadge risk={selected.risk} />
                  </div>
                  <dl className="grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                    <div>
                      <dt className="eyebrow text-muted-foreground">Health</dt>
                      <dd className="mt-1 capitalize">{selected.health}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-muted-foreground">Risk</dt>
                      <dd className="mt-1 capitalize">{selected.risk}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-muted-foreground">Last inspection</dt>
                      <dd className="mt-1">{selected.lastInspection}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-muted-foreground">AI prediction</dt>
                      <dd className="mt-1 capitalize">{selected.risk} risk</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No asset selected.</p>
              )}
            </section>

            <section className="rounded-lg border bg-card p-4">
              <h2 className="text-sm font-semibold">Model Layers</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {["Structural geometry", "Condition overlay", "Risk heat layer", "Inspection markers", "Terrain"].map((l) => (
                  <li key={l} className="flex items-center justify-between gap-3 border-b pb-2 last:border-0 last:pb-0">
                    <span className="min-w-0 truncate">{l}</span>
                    <span className="shrink-0 font-mono text-[10px] text-success">ON</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
