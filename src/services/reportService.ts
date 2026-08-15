import { apiRequest } from "./api";

export const reportService = {
  list: () => apiRequest<unknown>("/api/v1/assessments?limit=50"),
  get: (id: string) => apiRequest<unknown>(`/api/v1/assessments/${encodeURIComponent(id)}`),
  notifications: () => apiRequest<unknown>("/api/v1/analytics/high-risk"),
};
