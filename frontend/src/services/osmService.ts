/**
 * OpenStreetMap Nominatim Service
 * Fetch real infrastructure names from coordinates using OSM Reverse Geocoding
 */

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

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: { "User-Agent": "StructureGuard/1.0" },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const name =
      data.name ||
      data.address?.name ||
      data.address?.amenity ||
      data.address?.building ||
      null;

    if (name) {
      nameCache.set(cacheKey, name);
    }

    return name;
  } catch (error) {
    console.error("OSM lookup failed:", error);
    return null;
  }
}

export function clearOSMCache(): void {
  nameCache.clear();
}
