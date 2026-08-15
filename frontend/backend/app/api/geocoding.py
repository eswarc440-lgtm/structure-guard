from fastapi import APIRouter, Query
import httpx
import logging

router = APIRouter(tags=["Geocoding"])
logger = logging.getLogger(__name__)

# Cache to avoid repeated requests
_geocoding_cache = {}

@router.get("/reverse")
async def reverse_geocode(
    latitude: float = Query(...),
    longitude: float = Query(...),
):
    """
    Reverse geocode coordinates to get real location names from OpenStreetMap Nominatim.
    This endpoint acts as a CORS-friendly proxy to Nominatim.
    """
    try:
        cache_key = f"{latitude:.4f},{longitude:.4f}"
        
        # Check cache first
        if cache_key in _geocoding_cache:
            return {"name": _geocoding_cache[cache_key], "cached": True}
        
        # Call Nominatim API with proper User-Agent
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={
                    "format": "json",
                    "lat": latitude,
                    "lon": longitude,
                    "zoom": 18,
                },
                headers={"User-Agent": "StructureGuard/1.0"},
                timeout=5.0
            )
            
            if response.status_code != 200:
                return {"name": None, "error": "Nominatim service unavailable"}
            
            data = response.json()
            
            # Extract name from various possible fields
            name = (
                data.get("name") or
                data.get("address", {}).get("name") or
                data.get("address", {}).get("amenity") or
                data.get("address", {}).get("building") or
                data.get("address", {}).get("road") or
                data.get("address", {}).get("village") or
                data.get("address", {}).get("town") or
                data.get("address", {}).get("city") or
                None
            )
            
            if name:
                _geocoding_cache[cache_key] = name
            
            return {
                "name": name,
                "cached": False,
                "full_data": data
            }
            
    except Exception as e:
        logger.error(f"Reverse geocoding failed for {latitude},{longitude}: {str(e)}")
        return {"name": None, "error": str(e)}


@router.get("/batch-reverse")
async def batch_reverse_geocode(
    coordinates: str = Query(...)
):
    """
    Batch reverse geocode multiple coordinates.
    Input: comma-separated "lat,lon" pairs separated by semicolons
    Example: "16.5165,80.6150;17.0005,81.7768"
    """
    try:
        results = {}
        coords_list = coordinates.split(";")
        
        async with httpx.AsyncClient() as client:
            for coord in coords_list:
                try:
                    lat_str, lon_str = coord.strip().split(",")
                    lat = float(lat_str)
                    lon = float(lon_str)
                    cache_key = f"{lat:.4f},{lon:.4f}"
                    
                    # Check cache
                    if cache_key in _geocoding_cache:
                        results[cache_key] = _geocoding_cache[cache_key]
                        continue
                    
                    # Call Nominatim
                    response = await client.get(
                        "https://nominatim.openstreetmap.org/reverse",
                        params={
                            "format": "json",
                            "lat": lat,
                            "lon": lon,
                        },
                        headers={"User-Agent": "StructureGuard/1.0"},
                        timeout=5.0
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        name = (
                            data.get("name") or
                            data.get("address", {}).get("name") or
                            data.get("address", {}).get("amenity") or
                            data.get("address", {}).get("building") or
                            data.get("address", {}).get("road") or
                            None
                        )
                        if name:
                            _geocoding_cache[cache_key] = name
                            results[cache_key] = name
                except (ValueError, IndexError):
                    continue
        
        return {"results": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"Batch reverse geocoding failed: {str(e)}")
        return {"error": str(e), "results": {}}


@router.delete("/cache")
async def clear_cache():
    """Clear the geocoding cache."""
    global _geocoding_cache
    _geocoding_cache.clear()
    return {"message": "Cache cleared"}
