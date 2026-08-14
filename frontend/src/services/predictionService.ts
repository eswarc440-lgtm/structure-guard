import { apiRequest } from "./api";

export interface Prediction {
  id: string;
  name: string;
  type: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  health_score: number | null;
  risk_score: number | null;
  risk_level: string | null;
}

export interface PredictionSummary {
  total_assets: number;
  predicted_assets: number;
  high_risk_assets: number;
  medium_risk_assets: number;
  low_risk_assets: number;
  average_health_score: number;
  average_risk_score: number;
  average_remaining_life?: number;
}

export interface AssetPrediction {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  health_score: number | null;
  risk_score: number | null;
  risk_level: string | null;
  predicted_risk_score: number;
  risk_category: string;
  remaining_life: number | null;
  prediction_timestamp: string | null;
}

export const predictionService = {

  list: () =>
    apiRequest<Prediction[]>(
      "http://127.0.0.1:8000/analytics/analytics/map-assets"
    ),

  insights: () =>
    apiRequest<Prediction[]>(
      "http://127.0.0.1:8000/analytics/analytics/high-risk"
    ),

  /**
   * Get prediction for a single asset
   */
  getAssetPrediction: (assetId: string) =>
    apiRequest<AssetPrediction>(`/api/v1/predictions/${assetId}`),

  /**
   * Get predictions for multiple assets
   */
  getAssetPredictions: (assetIds: string[]) =>
    apiRequest<{ predictions: AssetPrediction[] }>(
      "/api/v1/predictions/batch",
      {
        method: "POST",
        body: JSON.stringify(assetIds),
      }
    ),

  models: () =>
    Promise.resolve([]),

  evaluation: () =>
    apiRequest<PredictionSummary>(
      "http://127.0.0.1:8000/analytics/analytics/summary"
    ),

};
