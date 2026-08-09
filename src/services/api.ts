/**
 * Mock API layer.
 * Replace `mockRequest` with an axios/fetch client pointed at the FastAPI
 * backend. Service signatures stay identical, so no UI changes are required.
 */

export const API_BASE_URL = "/api/v1";

const DEFAULT_LATENCY = 220;

export function mockRequest<T>(data: T, latency = DEFAULT_LATENCY): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), latency);
  });
}

export interface ApiError {
  status: number;
  message: string;
}
