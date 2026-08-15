import { apiRequest } from "./api";
import type { InfrastructureAsset } from "@/types";

export interface AssetFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: InfrastructureAsset;
}

export const gisService = {
  featureCollection: (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
    });
    return apiRequest<{ type: string; features: Array<{ properties: Record<string, unknown> }> }>(`/api/v1/infrastructure/geojson${query.toString() ? `?${query}` : ""}`);
  },
};
