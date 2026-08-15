import { apiRequest } from "./api";
import type { InfrastructureAsset, InspectionRecord } from "@/types";

export const infrastructureService = {
  list: (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
    });
    return apiRequest<InfrastructureAsset[]>(`/api/v1/infrastructure${query.toString() ? `?${query}` : ""}`);
  },
  get: (id: string) => apiRequest<InfrastructureAsset | null>(`/api/v1/infrastructure/${encodeURIComponent(id)}`),
  categories: () => apiRequest<unknown>("/api/v1/infrastructure/summary"),
  totals: () => apiRequest<unknown>("/api/v1/dashboard/overview"),
  inspections: (_id: string) => apiRequest<InspectionRecord[]>("/api/v1/assessments?limit=10"),
};
