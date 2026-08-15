import { apiRequest } from "./api";

export const predictionService = {
  list: () => apiRequest<unknown>("/api/v1/assessments?limit=20"),
  insights: () => apiRequest<unknown>("/api/v1/analytics/summary"),
  models: () => apiRequest<unknown>("/api/v1/dashboard/overview"),
  evaluation: () => apiRequest<unknown>("/api/v1/analytics/high-risk"),
};
