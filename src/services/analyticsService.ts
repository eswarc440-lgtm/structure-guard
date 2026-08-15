import { apiRequest } from "./api";

export const analyticsService = {
  healthTrend: () => apiRequest<unknown>("/api/v1/dashboard/overview"),
  riskDistribution: () => apiRequest<unknown>("/api/v1/analytics/risk-analysis"),
  regional: () => apiRequest<unknown>("/api/v1/analytics/summary"),
  categories: () => apiRequest<unknown>("/api/v1/infrastructure/major/summary"),
  totals: () => apiRequest<unknown>("/api/v1/dashboard/overview"),
  activity: () => apiRequest<unknown>("/api/v1/assessments?limit=10"),
};
