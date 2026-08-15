import { apiRequest } from "./api";
import type { InfrastructureAsset, InspectionRecord } from "@/types";

export const infrastructureService = {
  list: () =>
    apiRequest<{ total: number; data: any[] }>("/api/v1/major-infrastructure?limit=100"),

  get: (id: string) =>
    apiRequest<any>(`/api/v1/infrastructure/${id}`),

  categories: () =>
    apiRequest<any>("/api/v1/major-infrastructure/summary"),

  totals: () =>
    apiRequest<any>("/api/v1/analytics/summary"),

  inspections: (_id: string) =>
    Promise.resolve([] as InspectionRecord[]),
};
