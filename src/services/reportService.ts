import { mockRequest } from "./api";
import { notifications, reports } from "@/data/analyticsData";

export const reportService = {
  list: () => mockRequest(reports),
  get: (id: string) => mockRequest(reports.find((r) => r.id === id)),
  notifications: () => mockRequest(notifications),
};
