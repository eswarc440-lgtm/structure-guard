/**
 * OpenStreetMap Geocoding Service via Backend Proxy
 * Fetch real infrastructure names from coordinates using OSM Reverse Geocoding
 * Backend acts as CORS-friendly proxy to Nominatim API
 */

import { apiRequest } from "./api";

const nameCache = new Map<string, string>();

export async function getRealAssetName(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

    if (nameCache.has(cacheKey)) {
      return nameCache.get(cacheKey)!;
    }

    // Call backend geocoding endpoint (CORS-friendly)
    const response = await apiRequest<{ name: string | null; cached: boolean }>(
      `/api/v1/geocoding/reverse?latitude=${latitude}&longitude=${longitude}`
    );

    if (response.name) {
      nameCache.set(cacheKey, response.name);
      return response.name;
    }

    return null;
  } catch (error) {
    console.error("OSM lookup failed:", error);
    return null;
  }
}

export function clearOSMCache(): void {
  nameCache.clear();
}

