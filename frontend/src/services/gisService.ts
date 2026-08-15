import { apiRequest } from "./api";

export interface GISAsset {
  id: string;
  name: string;
  type: string;
  asset_type?: string;
  district: string;
  latitude: number;
  longitude: number;
  risk_score?: number;
  health_score?: number;
  risk_level?: string;
}

export const gisService = {
  getAssets: async (): Promise<GISAsset[]> => {
    try {
      const response = await apiRequest<{ total: number; data: any[] }>("/api/v1/major-infrastructure?limit=200");
      return response.data.map((asset) => ({
        id: asset.id,
        name: asset.name,
        type: asset.asset_type,
        asset_type: asset.asset_type,
        district: asset.district || "Unknown",
        latitude: asset.latitude || 0,
        longitude: asset.longitude || 0,
        risk_score: asset.risk_score,
        health_score: asset.health_score,
        risk_level: asset.risk_level,
      }));
    } catch (error) {
      console.error("Failed to load GIS assets:", error);
      return [];
    }
  },
};

