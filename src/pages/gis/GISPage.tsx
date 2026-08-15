import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Crosshair, Layers, ListFilter, Search } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RiskBadge, StatusBadge } from "@/components/common/StatusBadge";
import { apiRequest } from "@/services/api";
import type { AssetType, InfrastructureAsset } from "@/types";

const GISMap = lazy(() => import("@/components/gis/GISMap"));

const layerTypes: AssetType[] = ["Bridge", "Road", "Building", "Water", "Utility", "Other"];

function getHealthStatus(score: number | null): InfrastructureAsset["health"] {
  if (score === null || score === undefined) return "healthy";
  if (score >= 80) return "healthy";
  if (score >= 50) return "warning";
  return "critical";
}

function getRiskLevel(level: string | null): InfrastructureAsset["risk"] {
  if (!level) return "low";
  const risk = level.toLowerCase();
  if (risk.includes("high") || risk.includes("critical")) return "high";
  if (risk.includes("medium")) return "medium";
  return "low";
}

export function GISPage() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<AssetType[]>(layerTypes);
  const [allAssets, setAllAssets] = useState<InfrastructureAsset[]>([]);
  const [selected, setSelected] = useState<InfrastructureAsset | undefined>();

  useEffect(() => {
    setMounted(true);

    let isMounted = true;
    apiRequest<{ total: number; items: Array<any> }>('/api/v1/infrastructure?limit=500')
      .then((payload) => {
        const transformedAssets = (payload.items ?? [])
          .map((asset) => ({
            id: asset.id,
            name: asset.name || 'Unnamed Asset',
            type: (asset.asset_type || 'Other') as AssetType,
            location: asset.location || asset.district || 'Unknown',
            district: asset.district || 'Unknown',
            lat: Number(asset.latitude ?? 0),
            lng: Number(asset.longitude ?? 0),
            health: getHealthStatus(Number(asset.health_score ?? 0)),
            healthScore: Number(asset.health_score ?? 0),
            risk: getRiskLevel(asset.risk_level),
            riskScore: Number(asset.risk_score ?? 0),
            lastInspection: 'Live',
            status: 'Operational',
            builtYear: Number(asset.built_year ?? 2000),
            rulYears: Number(asset.remaining_useful_life ?? asset.remaining_life ?? 10),
          }))
          .filter((asset) => Number.isFinite(asset.lat) && Number.isFinite(asset.lng) && asset.lat !== 0 && asset.lng !== 0);

        if (!isMounted) return;
        setAllAssets(transformedAssets);
        if (transformedAssets.length > 0) setSelected(transformedAssets[0]);
      })
      .catch((error) => {
        console.warn('GIS assets fetch failed.', error);
        if (!isMounted) return;
        setAllAssets([]);
        setSelected(undefined);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      allAssets.filter(
        (a) =>
          active.includes(a.type) &&
          (a.name.toLowerCase().includes(query.toLowerCase()) || a.id.toLowerCase().includes(query.toLowerCase())),
      ),
    [active, query, allAssets],
  );

  const toggle = (t: AssetType) =>
    setActive((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search infrastructure…"
              aria-label="Search infrastructure"
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="shrink-0">
            <ListFilter className="size-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="h-[52vh] min-h-[380px] lg:h-[calc(100vh-16rem)]">
              {mounted ? (
                <Suspense fallback={<div className="grid size-full place-items-center text-sm text-muted-foreground">Loading map…</div>}>
                  <GISMap assets={filtered} selectedId={selected?.id} onSelect={setSelected} />
                </Suspense>
              ) : (
                <div className="grid size-full place-items-center text-sm text-muted-foreground">Preparing GIS workspace…</div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 border-t px-4 py-3 text-xs text-muted-foreground">
              <span className="eyebrow">Legend</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" /> Healthy</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" /> Warning</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-danger" /> Critical</span>
              <span className="ml-auto flex items-center gap-1.5">
                <Crosshair className="size-3.5" aria-hidden="true" /> {filtered.length} assets shown
              </span>
            </div>
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border bg-card p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Layers className="size-4" aria-hidden="true" /> Map Layers
              </h2>
              <ul className="mt-3 space-y-2.5">
                {layerTypes.map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <Checkbox id={`layer-${t}`} checked={active.includes(t)} onCheckedChange={() => toggle(t)} />
                    <Label htmlFor={`layer-${t}`} className="text-sm font-normal">
                      {t}
                    </Label>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border bg-card p-4">
              <h2 className="text-sm font-semibold">Asset Details</h2>
              {selected ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="font-mono text-[11px] text-muted-foreground">{selected.id}</p>
                    <p className="text-base font-semibold">{selected.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {selected.type} · {selected.location}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={selected.health} />
                    <RiskBadge risk={selected.risk} />
                  </div>
                  <dl className="grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                    <div>
                      <dt className="eyebrow text-muted-foreground">Health score</dt>
                      <dd className="mt-1 font-display text-lg font-bold tabular-nums">{selected.healthScore}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-muted-foreground">Risk score</dt>
                      <dd className="mt-1 font-display text-lg font-bold tabular-nums">{selected.riskScore}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-muted-foreground">Last inspection</dt>
                      <dd className="mt-1">{selected.lastInspection}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-muted-foreground">Status</dt>
                      <dd className="mt-1">{selected.status}</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Select a marker on the map to inspect an asset.</p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
