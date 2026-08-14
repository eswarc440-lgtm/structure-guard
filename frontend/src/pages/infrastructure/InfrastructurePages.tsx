import { Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { apiRequest } from "@/services/api";
import { getRealAssetName } from "@/services/osmService";

type Asset = { id: string; asset_id?: string; type?: string; name: string; asset_type: string; location?: string | null; district?: string | null; mandal?: string | null; latitude?: number | null; longitude?: number | null; built_year?: number | null; design_life?: number | null; condition?: string | null; health_score?: number | null; risk_level?: string | null; risk_score?: number | null; remaining_useful_life?: number | null; owner?: string | null; material?: string | null; status?: string | null; source?: string | null; source_id?: string | null; };

function getRisk(asset: Asset) {
  if (asset.risk_level) return asset.risk_level;
  const score = Number(asset.risk_score ?? 0);
  if (score >= 70) return "High Risk";
  if (score >= 40) return "Medium Risk";
  return "Low Risk";
}

function getHealth(asset: Asset) {
  const score = Number(asset.health_score ?? 0);
  if (score >= 80) return "Healthy";
  if (score >= 50) return "Warning";
  return "Critical";
}

function getHealthBadgeColor(asset: Asset): string {
  const score = Number(asset.health_score ?? 0);
  if (score >= 80) return "bg-green-100 text-green-800";
  if (score >= 50) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

function getRiskBadgeColor(asset: Asset): string {
  if (asset.risk_level) {
    if (asset.risk_level.toLowerCase().includes("high"))
      return "bg-red-100 text-red-800";
    if (asset.risk_level.toLowerCase().includes("medium"))
      return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  }
  const score = Number(asset.risk_score ?? 0);
  if (score >= 70) return "bg-red-100 text-red-800";
  if (score >= 40) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
}

function getStatusBadgeColor(status?: string): string {
  if (!status) return "bg-gray-100 text-gray-800";
  const lower = status.toLowerCase();
  if (lower.includes("operation") || lower.includes("active"))
    return "bg-blue-100 text-blue-800";
  if (lower.includes("inspect")) return "bg-yellow-100 text-yellow-800";
  if (lower.includes("restrict")) return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}

export function InfrastructurePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedRisk, setSelectedRisk] = useState("All");
  const [total, setTotal] = useState(0);
  const [realAssetNames, setRealAssetNames] = useState<Map<string, string>>(
    new Map()
  );
  const [enrichingNames, setEnrichingNames] = useState(false);

  const loadAssets = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("limit", "100");

    if (selectedType !== "All") params.append("asset_type", selectedType);
    if (selectedDistrict !== "All")
      params.append("district", selectedDistrict);
    if (selectedRisk !== "All")
      params.append("risk_level", selectedRisk.replace(" Risk", ""));

    try {
      const response = await apiRequest<{ total: number; data: Asset[] }>(
        `/api/v1/major-infrastructure?${params.toString()}`
      );
      setAssets(response.data || []);
      setTotal(response.total || 0);
      setError("");

      // Enrich with real names from OSM
      enrichAssetNames(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load infrastructure data from backend.");
    } finally {
      setLoading(false);
    }
  };

  const enrichAssetNames = async (assetsToEnrich: Asset[]) => {
    setEnrichingNames(true);
    const names = new Map<string, string>();

    for (const asset of assetsToEnrich) {
      if (
        asset.latitude &&
        asset.longitude &&
        !asset.name?.includes("Unnamed")
      ) {
        try {
          const realName = await getRealAssetName(asset.latitude, asset.longitude);
          if (realName) {
            const assetId = asset.asset_id ?? asset.id;
            names.set(assetId, realName);
          }
        } catch (err) {
          console.error("Failed to fetch real name for asset:", asset.id, err);
        }
      }
    }

    setRealAssetNames(names);
    setEnrichingNames(false);
  };

  useEffect(() => {
    loadAssets();
  }, [selectedType, selectedDistrict, selectedRisk]);

  const assetTypes = useMemo(
    () =>
      Array.from(
        new Set(
          assets
            .map((asset) => asset.asset_type ?? asset.type)
            .filter(Boolean)
        )
      ).sort(),
    [assets]
  );

  const districts = useMemo(
    () =>
      Array.from(
        new Set(assets.map((asset) => asset.district).filter(Boolean))
      ).sort(),
    [assets]
  );

  const filteredAssets = useMemo(() => {
    const query = search.toLowerCase().trim();

    return assets.filter((asset) => {
      const assetType = asset.asset_type ?? asset.type ?? "";
      const risk = getRisk(asset);
      const realName = realAssetNames.get(asset.asset_id ?? asset.id) || asset.name;

      const matchesSearch =
        !query ||
        [
          asset.id,
          asset.asset_id,
          asset.name,
          realName,
          assetType,
          asset.district,
          asset.location,
          asset.mandal,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesType =
        selectedType === "All" ||
        assetType.toLowerCase() === selectedType.toLowerCase();

      const matchesDistrict =
        selectedDistrict === "All" ||
        (asset.district ?? "").toLowerCase() === selectedDistrict.toLowerCase();

      const matchesRisk =
        selectedRisk === "All" ||
        risk.toLowerCase().includes(selectedRisk.toLowerCase());

      return matchesSearch && matchesType && matchesDistrict && matchesRisk;
    });
  }, [assets, search, selectedType, selectedDistrict, selectedRisk, realAssetNames]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Infrastructure Assets"
          description="Live infrastructure asset register from the Structure Guard backend."
        />

        <div className="rounded-xl border bg-card p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search Asset ID or name..."
                className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none"
              />
            </div>

            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="All">All Types</option>
              {assetTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(event) => setSelectedDistrict(event.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="All">All Districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            <select
              value={selectedRisk}
              onChange={(event) => setSelectedRisk(event.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedType("All");
                setSelectedDistrict("All");
                setSelectedRisk("All");
              }}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-xl border bg-card">
          <div className="border-b p-5">
            <h2 className="font-semibold">Asset Register</h2>
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Loading live assets..."
                : `${filteredAssets.length.toLocaleString()} of ${total.toLocaleString()} assets`}
              {enrichingNames && " (enriching with real names...)"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm">
              <thead className="border-b bg-muted/30">
                <tr className="text-left">
                  <th className="p-4 font-semibold">Asset ID</th>
                  <th className="p-4 font-semibold">Asset Name</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">District</th>
                  <th className="p-4 font-semibold">Health</th>
                  <th className="p-4 font-semibold">Risk</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-muted-foreground">
                      Loading live data...
                    </td>
                  </tr>
                ) : filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-muted-foreground">
                      No infrastructure assets found.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset, index) => {
                    const assetId = asset.asset_id ?? asset.id ?? `asset-${index}`;
                    const displayName =
                      realAssetNames.get(assetId) ||
                      asset.name ||
                      "Unnamed Asset";

                    return (
                      <tr
                        key={assetId}
                        className="border-b transition-colors hover:bg-muted/30"
                      >
                        <td className="p-4 font-semibold">
                          <Link
                            to="/infrastructure/$id"
                            params={{ id: assetId }}
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {assetId}
                          </Link>
                        </td>

                        <td className="p-4 font-medium">{displayName}</td>
                        <td className="p-4">{asset.asset_type ?? asset.type ?? "-"}</td>
                        <td className="p-4">
                          {asset.district ?? asset.location ?? "-"}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 font-medium ${getHealthBadgeColor(asset)}`}
                          >
                            {getHealth(asset)}
                            {asset.health_score !== undefined
                              ? ` (${Number(asset.health_score).toFixed(1)})`
                              : ""}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 font-medium ${getRiskBadgeColor(asset)}`}
                          >
                            {getRisk(asset)}
                            {asset.risk_score !== undefined
                              ? ` (${Number(asset.risk_score).toFixed(1)})`
                              : ""}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
                              asset.status ?? asset.condition
                            )}`}
                          >
                            {asset.status ?? asset.condition ?? "Active"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function InfrastructureDetailPage() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    apiRequest<Asset>(
      `/api/v1/infrastructure/${encodeURIComponent(id)}`
    )
      .then(setAsset)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={asset?.name ?? "Infrastructure Asset"}
          description={
            loading
              ? "Loading live asset details..."
              : asset
                ? `Live data for asset ${id}`
                : `No monitored asset matches the identifier ${id}.`
          }
        />

        {!loading && asset && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(asset).map(([key, value]) => (
              <div key={key} className="rounded-xl border bg-card p-5">
                <p className="text-xs uppercase text-muted-foreground">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="mt-2 font-semibold">
                  {value === null || value === undefined ? "-" : String(value)}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && !asset && (
          <div className="rounded-xl border bg-card p-8 text-muted-foreground">
            Asset not found.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export function AssetDetailsPage() {
  const { id } = useParams({ strict: false }) as { id?: string };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Infrastructure Asset"
          title={id ? `Asset ${id}` : "Asset Details"}
          description="Live infrastructure asset details."
        />
        <div className="rounded-lg border bg-card p-6">
          <p className="text-muted-foreground">
            Detailed asset information is available from the infrastructure database.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function AssetHistoryPage() {
  const { id } = useParams({ strict: false }) as { id?: string };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Inspection History"
          title={id ? `Asset ${id} History` : "Asset History"}
          description="Inspection and monitoring history."
        />
        <div className="rounded-lg border bg-card p-6">
          <p className="text-muted-foreground">
            Historical inspection data for this infrastructure asset.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}



