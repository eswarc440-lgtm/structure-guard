import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Crosshair, Layers, ListFilter, Search, X } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RiskBadge, StatusBadge } from "@/components/common/StatusBadge";
import { apiRequest } from "@/services/api";
import type { AssetType, InfrastructureAsset } from "@/types";

const GISMap = lazy(() => import("@/components/gis/GISMap"));

const layerTypes: AssetType[] = [
  "Bridge",
  "Road",
  "Building",
  "Water",
  "Utility",
  "Other",
];

function normalizeAssetType(type: string): string {
  if (!type) return "Other";
  const normalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  return normalized;
}

export function GISPage() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<AssetType[]>(layerTypes);
  const [allAssets, setAllAssets] = useState<InfrastructureAsset[]>([]);
  const [selected, setSelected] = useState<InfrastructureAsset | undefined>();
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");

  useEffect(() => {
    setMounted(true);
    
    apiRequest<{ total: number; data: any[] }>("/api/v1/major-infrastructure?limit=200")
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
        setAllAssets(transformedAssets);
        if (transformedAssets.length > 0) {
          setSelected(transformedAssets[0]);
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
      setWeatherLoading(true);
      apiRequest<any>(`/api/v1/predictions/weather/${selected.id}`)
        .then((data) => setWeather(data))
        .catch((err) => console.error("Failed to load weather:", err))
        .finally(() => setWeatherLoading(false));
    }
  }, [selected?.id]);

  const uniqueTypes = useMemo(() => {
    const types = Array.from(new Set(allAssets.map((asset) => asset.type)))
      .sort()
      .filter(Boolean);
    return types as string[];
  }, [allAssets]);

  const uniqueDistricts = useMemo(() => {
    const districts = Array.from(new Set(allAssets.map((asset) => asset.district)))
      .sort()
      .filter(Boolean);
    return districts;
  }, [allAssets]);

  const filtered = useMemo(() => {
    return allAssets.filter((asset) => {
      const matchesType = active.includes(asset.type);
      const search = query.toLowerCase();

      const matchesQuery =
        asset.name.toLowerCase().includes(search) ||
        asset.id.toLowerCase().includes(search);

      const matchesTypeFilter =
        selectedType === "All Types" || asset.type === selectedType;

      const matchesDistrictFilter =
        selectedDistrict === "All Districts" ||
        asset.district === selectedDistrict;

      return (
        matchesType &&
        matchesQuery &&
        matchesTypeFilter &&
        matchesDistrictFilter
      );
    });
  }, [active, query, selectedType, selectedDistrict]);

  const toggle = (type: AssetType) => {
    setActive((previous) =>
      previous.includes(type)
        ? previous.filter((item) => item !== type)
        : [...previous, type]
    );
  };

  const clearFilters = () => {
    setSelectedType("All Types");
    setSelectedDistrict("All Districts");
    setQuery("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Filter Dropdowns */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger aria-label="Filter by asset type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Types">All Types</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedDistrict}
            onValueChange={setSelectedDistrict}
          >
            <SelectTrigger aria-label="Filter by district">
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Districts">All Districts</SelectItem>
              {uniqueDistricts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={clearFilters}
            className="shrink-0"
            aria-label="Clear all filters"
          >
            <X className="size-4" />
            <span className="hidden sm:inline">Clear Filters</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search infrastructure..."
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
                <Suspense
                  fallback={
                    <div className="grid size-full place-items-center text-sm text-muted-foreground">
                      Loading map...
                    </div>
                  }
                >
                  <GISMap
                    assets={filtered}
                    selectedId={selected?.id}
                    onSelect={setSelected}
                  />
                </Suspense>
              ) : (
                <div className="grid size-full place-items-center text-sm text-muted-foreground">
                  Preparing GIS workspace...
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t px-4 py-3 text-xs text-muted-foreground">
              <span className="eyebrow">Legend</span>

              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-success" />
                Healthy
              </span>

              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-warning" />
                Warning
              </span>

              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-danger" />
                Critical
              </span>

              <span className="ml-auto flex items-center gap-1.5">
                <Crosshair className="size-3.5" aria-hidden="true" />
                {filtered.length} assets shown
              </span>
            </div>
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border bg-card p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Layers className="size-4" aria-hidden="true" />
                Map Layers
              </h2>

              <ul className="mt-3 space-y-2.5">
                {layerTypes.map((type) => (
                  <li key={type} className="flex items-center gap-2.5">
                    <Checkbox
                      id={`layer-${type}`}
                      checked={active.includes(type)}
                      onCheckedChange={() => toggle(type)}
                    />

                    <Label
                      htmlFor={`layer-${type}`}
                      className="text-sm font-normal"
                    >
                      {type}
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
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {selected.id}
                    </p>

                    <p className="text-base font-semibold">
                      {selected.name}
                    </p>

                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {selected.type} - {selected.location}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={selected.health} />
                    <RiskBadge risk={selected.risk} />
                  </div>

                  <dl className="grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                    <div>
                      <dt className="eyebrow text-muted-foreground">
                        Health score
                      </dt>
                      <dd className="mt-1 font-display text-lg font-bold tabular-nums">
                        {selected.healthScore}
                      </dd>
                    </div>

                    <div>
                      <dt className="eyebrow text-muted-foreground">
                        Risk score
                      </dt>
                      <dd className="mt-1 font-display text-lg font-bold tabular-nums">
                        {selected.riskScore}
                      </dd>
                    </div>

                    <div>
                      <dt className="eyebrow text-muted-foreground">
                        Last inspection
                      </dt>
                      <dd className="mt-1">
                        {selected.lastInspection}
                      </dd>
                    </div>

                    <div>
                      <dt className="eyebrow text-muted-foreground">
                        Status
                      </dt>
                      <dd className="mt-1">
                        {selected.status}
                      </dd>
                    </div>

                    <div className="col-span-2 border-t pt-3">
                      <dt className="eyebrow text-muted-foreground">
                        Location
                      </dt>
                      <dd className="mt-1">
                        {selected.district}, {selected.location}
                      </dd>
                    </div>

                    <div className="col-span-2">
                      <dt className="eyebrow text-muted-foreground">
                        Coordinates
                      </dt>
                      <dd className="mt-1 font-mono text-xs">
                        {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
                      </dd>
                    </div>

                    {weather && (
                      <div className="col-span-2 border-t pt-3">
                        <dt className="eyebrow text-muted-foreground">
                          Live Weather
                        </dt>
                        <dd className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Temperature:</span> {weather.weather.temperature_c}°C
                          </div>
                          <div>
                            <span className="text-muted-foreground">Humidity:</span> {weather.weather.humidity_percent}%
                          </div>
                          <div>
                            <span className="text-muted-foreground">Wind:</span> {weather.weather.wind_speed_kmh} km/h
                          </div>
                          <div>
                            <span className="text-muted-foreground">Precipitation:</span> {weather.weather.precipitation_mm} mm
                          </div>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Select a marker on the map to inspect an asset.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
