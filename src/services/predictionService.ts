import { mockRequest } from "./api";
import { insights, modelEvaluation, models, predictions } from "@/data/analyticsData";

export const predictionService = {
  list: () => mockRequest(predictions),
  insights: () => mockRequest(insights),
  models: () => mockRequest(models),
  evaluation: () => mockRequest(modelEvaluation),
};
