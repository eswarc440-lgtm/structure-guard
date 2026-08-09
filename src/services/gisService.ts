import { mockRequest } from "./api";
import { assets } from "@/data/infrastructureData";
import type { InfrastructureAsset } from "@/types";

export interface AssetFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: InfrastructureAsset;
}

/** GeoJSON shape matches the future PostGIS response contract. */
export const gisService = {
  featureCollection: () =>
    mockRequest({
      type: "FeatureCollection" as const,
      features: assets.map<AssetFeature>((a) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [a.lng, a.lat] },
        properties: a,
      })),
    }),
};
