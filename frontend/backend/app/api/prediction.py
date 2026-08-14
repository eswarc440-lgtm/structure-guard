from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import httpx

from app.database.database import get_db
from app.models.infrastructure import InfrastructureAsset
from app.ml.prediction.predict import predict_risk

router = APIRouter(prefix="/predictions", tags=["Predictions"])


class PredictionRequest(BaseModel):
    built_year: Optional[int] = None
    elevation_m: Optional[float] = None
    slope_deg: Optional[float] = None
    flood_risk_value: Optional[float] = None
    rainfall_mm: Optional[float] = None
    temperature_c: Optional[float] = None
    wind_speed_ms: Optional[float] = None
    design_life: Optional[int] = None


class BatchPredictionRequest(BaseModel):
    asset_ids: List[str]


@router.post("/predict")
def predict(data: PredictionRequest):
    return predict_risk(data.dict())


@router.get("/{asset_id}")
def get_asset_prediction(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    prediction_data = {
        "built_year": asset.built_year,
        "elevation_m": asset.elevation_m,
        "slope_deg": asset.slope_deg,
        "flood_risk_value": asset.flood_risk_value,
        "rainfall_mm": asset.rainfall_mm,
        "temperature_c": asset.temperature_c,
        "wind_speed_ms": asset.wind_speed_ms,
        "design_life": asset.design_life,
    }
    
    result = predict_risk(prediction_data)
    
    return {
        "asset_id": asset_id,
        "asset_name": asset.name,
        "asset_type": asset.asset_type,
        "health_score": asset.health_score,
        "risk_score": asset.risk_score,
        "risk_level": asset.risk_level,
        "predicted_risk_score": result["risk_score"],
        "risk_category": result["risk_level"],
        "remaining_life": asset.remaining_useful_life,
        "prediction_timestamp": None,
    }


@router.post("/predict/{asset_id}")
def predict_asset_risk(asset_id: str, db: Session = Depends(get_db)):
    """Deprecated: Use GET /{asset_id} instead"""
    asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    prediction_data = {
        "built_year": asset.built_year,
        "elevation_m": asset.elevation_m,
        "slope_deg": asset.slope_deg,
        "flood_risk_value": asset.flood_risk_value,
        "rainfall_mm": asset.rainfall_mm,
        "temperature_c": asset.temperature_c,
        "wind_speed_ms": asset.wind_speed_ms,
        "design_life": asset.design_life,
    }
    
    result = predict_risk(prediction_data)
    
    return {
        "asset_id": asset_id,
        "asset_name": asset.name,
        "asset_type": asset.asset_type,
        "prediction": result,
        "current_risk_score": asset.risk_score,
        "current_risk_level": asset.risk_level,
    }


@router.post("/batch")
def batch_predict(request: BatchPredictionRequest, db: Session = Depends(get_db)):
    """Get predictions for multiple assets"""
    results = []
    
    for asset_id in request.asset_ids:
        asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
        
        if not asset:
            results.append({
                "asset_id": asset_id,
                "error": "Asset not found"
            })
            continue
        
        prediction_data = {
            "built_year": asset.built_year,
            "elevation_m": asset.elevation_m,
            "slope_deg": asset.slope_deg,
            "flood_risk_value": asset.flood_risk_value,
            "rainfall_mm": asset.rainfall_mm,
            "temperature_c": asset.temperature_c,
            "wind_speed_ms": asset.wind_speed_ms,
            "design_life": asset.design_life,
        }
        
        result = predict_risk(prediction_data)
        
        results.append({
            "asset_id": asset_id,
            "asset_name": asset.name,
            "asset_type": asset.asset_type,
            "health_score": asset.health_score,
            "risk_score": asset.risk_score,
            "risk_level": asset.risk_level,
            "predicted_risk_score": result["risk_score"],
            "risk_category": result["risk_level"],
            "remaining_life": asset.remaining_useful_life,
        })
    
    return {"predictions": results}


@router.get("/weather/{asset_id}")
async def get_asset_weather(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if not asset.latitude or not asset.longitude:
        raise HTTPException(status_code=400, detail="Asset coordinates not available")
    
    # Using Open-Meteo API (free, no API key required)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": asset.latitude,
                    "longitude": asset.longitude,
                    "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation",
                    "timezone": "auto"
                }
            )
            
            if response.status_code != 200:
                # If external API fails, return cached/fallback data
                return {
                    "asset_id": asset_id,
                    "asset_name": asset.name,
                    "location": {
                        "latitude": asset.latitude,
                        "longitude": asset.longitude,
                        "district": asset.district,
                    },
                    "weather": {
                        "temperature_c": 28.0,  # Fallback data
                        "humidity_percent": 65,
                        "wind_speed_kmh": 12.0,
                        "precipitation_mm": 0.0,
                    },
                    "timestamp": None,
                    "note": "Using fallback weather data - external service unavailable"
                }
            
            weather_data = response.json()
            current = weather_data.get("current", {})
            
            return {
                "asset_id": asset_id,
                "asset_name": asset.name,
                "location": {
                    "latitude": asset.latitude,
                    "longitude": asset.longitude,
                    "district": asset.district,
                },
                "weather": {
                    "temperature_c": current.get("temperature_2m"),
                    "humidity_percent": current.get("relative_humidity_2m"),
                    "wind_speed_kmh": current.get("wind_speed_10m"),
                    "precipitation_mm": current.get("precipitation"),
                },
                "timestamp": current.get("time"),
            }
    except Exception as e:
        # Return fallback data if any error occurs
        import logging
        logging.error(f"Weather service error for asset {asset_id}: {str(e)}")
        return {
            "asset_id": asset_id,
            "asset_name": asset.name,
            "location": {
                "latitude": asset.latitude,
                "longitude": asset.longitude,
                "district": asset.district,
            },
            "weather": {
                "temperature_c": 28.0,
                "humidity_percent": 65,
                "wind_speed_kmh": 12.0,
                "precipitation_mm": 0.0,
            },
            "timestamp": None,
            "note": "Using fallback weather data - service error",
            "error": str(e)
        }
