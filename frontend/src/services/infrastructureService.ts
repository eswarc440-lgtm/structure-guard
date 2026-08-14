import { apiRequest } from "./api";
import type { InfrastructureAsset, InspectionRecord } from "@/types";

export const infrastructureService = {
  list: () =>
    apiRequest<InfrastructureAsset[]>("/infrastructure"),

  get: (id: string) =>
    apiRequest<InfrastructureAsset>(`/infrastructure/${id}`),

  categories: () =>
    apiRequest("/infrastructure/summary"),

  totals: () =>
    apiRequest("/infrastructure/summary"),

  inspections: (_id: string) =>
    Promise.resolve([] as InspectionRecord[]),
};
