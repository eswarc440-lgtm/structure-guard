import { useState, useEffect } from "react";
import { Box, Layers, Search, Settings2 } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiskBadge, StatusBadge } from "@/components/common/StatusBadge";
import { apiRequest } from "@/services/api";
import digitalTwinImage from "@/assets/digital-twin.jpg";
import type { InfrastructureAsset } from "@/types";

/**
 * Digital Twin workspace.
 * The viewport below is a visual stand-in; swap `TwinViewport` for a CesiumJS
 * `Viewer` mounted on the same container once the 3D tileset is available.
 */
export function DigitalTwinPage() {
  const [mode, setMode] = useState<"2d" | "3d">("3d");
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [selected, setSelected] = useState<InfrastructureAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    apiRequest<{ total: number; data: any[] }>("/api/v1/major-infrastructure?limit=50")
      .then((response) => {
        const transformedAssets = response.data.map((asset) => ({
          id: asset.id,
          name: asset.name || "Unnamed Asset",
          type: asset.asset_type as any,
          location: asset.district || asset.location || "Unknown",
          district: asset.district || "Unknown",
          lat: asset.latitude || 0,
          lng: asset.longitude || 0,
          health: getHealthStatus(asset.health_score),
          healthScore: asset.health_score || 0,
          risk: getRiskLevel(asset.risk_level),
          riskScore: asset.risk_score || 0,
          lastInspection: "Recent",
          status: "Operational" as any,
          builtYear: asset.built_year || 2000,
          rulYears: asset.remaining_useful_life || 10,
        }));
        setAssets(transformedAssets);
        if (transformedAssets.length > 0) {
          setSelected(transformedAssets[0]!);
        }
      })
      .catch((err) => console.error("Failed to load assets:", err))
      .finally(() => setLoading(false));
  }, []);

  function getHealthStatus(score: number | null): "healthy" | "warning" | "critical" {
    if (!score) return "healthy";
    if (score >= 80) return "healthy";
    if (score >= 50) return "warning";
    return "critical";
  }

  function getRiskLevel(level: string | null): "low" | "medium" | "high" {
    if (!level) return "low";
    const l = level.toLowerCase();
    if (l.includes("high") || l.includes("critical")) return "high";
    if (l.includes("medium")) return "medium";
    return "low";
  }

  useEffect(() => {
    if (selected?.id) {
      apiRequest<any>(`/api/v1/predictions/weather/${selected.id}`)
        .then((data) => setWeather(data))
        .catch((err) => console.error("Failed to load weather:", err));
    }
  }, [selected?.id]);

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
                    <div className="col-span-2 border-t pt-3">
                      <dt className="eyebrow text-muted-foreground">Location</dt>
                      <dd className="mt-1">{selected.district}, {selected.location}</dd>
                    </div>
                    {weather && (
                      <div className="col-span-2">
                        <dt className="eyebrow text-muted-foreground">Live Weather</dt>
                        <dd className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Temperature:</span> {weather.weather.temperature_c}°C</div>
                          <div><span className="text-muted-foreground">Humidity:</span> {weather.weather.humidity_percent}%</div>
                          <div><span className="text-muted-foreground">Wind:</span> {weather.weather.wind_speed_kmh} km/h</div>
                          <div><span className="text-muted-foreground">Precipitation:</span> {weather.weather.precipitation_mm} mm</div>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              ) : (
                <div className="mt-3 text-sm text-muted-foreground">
                  {loading ? "Loading assets..." : "No asset selected"}
                </div>
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
