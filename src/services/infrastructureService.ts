import { mockRequest } from "./api";
import { assets, assetTypeSummary, inspectionHistory, portfolioTotals } from "@/data/infrastructureData";
import type { InfrastructureAsset, InspectionRecord } from "@/types";

export const infrastructureService = {
  list: () => mockRequest<InfrastructureAsset[]>(assets),
  get: (id: string) => mockRequest<InfrastructureAsset | undefined>(assets.find((a) => a.id === id)),
  categories: () => mockRequest(assetTypeSummary),
  totals: () => mockRequest(portfolioTotals),
  inspections: (_id: string) => mockRequest<InspectionRecord[]>(inspectionHistory["default"] ?? []),
};
