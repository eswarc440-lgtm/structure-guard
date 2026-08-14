import { apiRequest } from "./api";

export interface AnalyticsSummary {
  total_assets: number;
  predicted_assets: number;
  high_risk_assets: number;
  medium_risk_assets: number;
  low_risk_assets: number;
  average_health_score: number;
  average_risk_score: number;
  average_remaining_life: number;
}

export const analyticsService = {
  summary: () =>
    apiRequest<AnalyticsSummary>("/analytics/summary"),

  highRisk: () =>
    apiRequest<any[]>("/analytics/high-risk"),
};
