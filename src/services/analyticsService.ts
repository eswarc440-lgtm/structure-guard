import { mockRequest } from "./api";
import { healthTrend, recentActivity, regionalAnalysis, riskDistribution } from "@/data/analyticsData";
import { assetTypeSummary, portfolioTotals } from "@/data/infrastructureData";

export const analyticsService = {
  healthTrend: () => mockRequest(healthTrend),
  riskDistribution: () => mockRequest(riskDistribution),
  regional: () => mockRequest(regionalAnalysis),
  categories: () => mockRequest(assetTypeSummary),
  totals: () => mockRequest(portfolioTotals),
  activity: () => mockRequest(recentActivity),
};
