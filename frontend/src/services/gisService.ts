import { apiRequest } from "./api";

export interface GISAsset {
  id: string;
  name: string;
  type: string;
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
      return await apiRequest<GISAsset[]>("/api/v1/infrastructure/infrastructure");
    } catch (error) {
      console.error("Failed to load GIS assets:", error);
      return [];
    }
  },
};

