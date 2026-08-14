export const API_BASE_URL = "http://127.0.0.1:8000";

export interface ApiError {
  status: number;
  message: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();

    throw {
      status: response.status,
      message: message || `API request failed: ${response.status}`,
    } satisfies ApiError;
  }

  return response.json();
}

export async function mockRequest<T>(data: T): Promise<T> {
  return Promise.resolve(data);
}
