import type { InfrastructureAsset, AssetType } from "@/types";
import type { RiskAsset } from "@/services/analyticsService";

const typeMap: Record<string, AssetType> = {
  bridge: "Bridge",
  road: "Road",
  building: "Building",
  tank: "Water",
  dam: "Water",
  barrage: "Water",
  canal: "Water",
  utility: "Utility",
};

export function convertApiAsset(asset: RiskAsset): InfrastructureAsset {
  const rawType = (asset.asset_type || asset.type || "other").toLowerCase();
  const healthScore = Number(asset.health_score ?? 0);
  const riskScore = Number(asset.risk_score ?? 0);

  return {
    id: asset.id,
    name: asset.name && asset.name !== "Unknown" ? asset.name : `${rawType.toUpperCase()} ${asset.id}`,
    type: typeMap[rawType] ?? "Other",
    location: asset.district || "Andhra Pradesh",
    lat: Number(asset.latitude ?? 16.5),
    lng: Number(asset.longitude ?? 80.6),
    healthScore,
    riskScore,
    health: healthScore >= 80 ? "healthy" : healthScore >= 60 ? "warning" : "critical",
    risk: (asset.risk_level || "").toLowerCase() === "high" ? "high" : (asset.risk_level || "").toLowerCase() === "medium" ? "medium" : "low",
    status: "Monitored",
    lastInspection: "Live AI Data",
  };
}
