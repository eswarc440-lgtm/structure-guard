import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from geoalchemy2 import Geography
from geoalchemy2.functions import ST_AsGeoJSON

from app.database.database import get_db
from app.models.infrastructure import InfrastructureAsset


router = APIRouter(tags=["Infrastructure"])

CANONICAL_ASSET_TYPES = {
    "bridge": "bridge",
    "dam": "dam",
    "barrage": "barrage",
    "port": "port",
    "road": "road",
    "building": "building",
    "airport": "airport",
    "power_plant": "power_plant",
    "powerplant": "power_plant",
    "school": "school",
    "tank": "tank",
    "railway": "railway",
}


def normalize_asset_type(value):
    if value is None:
        return None
    normalized = str(value).strip().lower().replace("_", " ")
    return CANONICAL_ASSET_TYPES.get(normalized, normalized)


def asset_to_dict(asset):
    return {
        "id": asset.id,
        "name": asset.name,
        "asset_type": asset.asset_type,
        "location": asset.location,
        "district": asset.district,
        "mandal": asset.mandal,
        "latitude": asset.latitude,
        "longitude": asset.longitude,
        "built_year": asset.built_year,
        "design_life": asset.design_life,
        "condition": asset.condition,
        "health_score": asset.health_score,
        "risk_level": asset.risk_level,
        "risk_score": asset.risk_score,
        "remaining_useful_life": asset.remaining_useful_life,
        "remaining_life": asset.remaining_life,
        "owner": asset.owner,
        "material": asset.material,
        "status": asset.status,
        "source": asset.source,
        "source_id": asset.source_id,
    }


@router.get("")
def list_infrastructure(
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    search: str | None = Query(None),
    district: str | None = Query(None),
    asset_type: str | None = Query(None),
    risk_level: str | None = Query(None),
    min_health_score: float | None = Query(None),
    max_risk_score: float | None = Query(None),
    bbox: str | None = Query(None),
):
    query = db.query(InfrastructureAsset)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (InfrastructureAsset.id.ilike(search_term))
            | (InfrastructureAsset.name.ilike(search_term))
            | (InfrastructureAsset.asset_type.ilike(search_term))
            | (InfrastructureAsset.district.ilike(search_term))
            | (InfrastructureAsset.mandal.ilike(search_term))
            | (InfrastructureAsset.location.ilike(search_term))
        )

    if district:
        query = query.filter(func.lower(InfrastructureAsset.district) == func.lower(district))

    if asset_type:
        normalized = normalize_asset_type(asset_type)
        query = query.filter(func.lower(InfrastructureAsset.asset_type) == normalized)

    if risk_level:
        query = query.filter(func.lower(InfrastructureAsset.risk_level) == func.lower(risk_level))

    if min_health_score is not None:
        query = query.filter(InfrastructureAsset.health_score >= min_health_score)

    if max_risk_score is not None:
        query = query.filter(InfrastructureAsset.risk_score <= max_risk_score)

    if bbox:
        try:
            min_lon, min_lat, max_lon, max_lat = [float(part) for part in bbox.split(",")]
        except ValueError:
            raise HTTPException(status_code=400, detail="bbox must be in format min_lon,min_lat,max_lon,max_lat")
        query = query.filter(
            InfrastructureAsset.longitude >= min_lon,
            InfrastructureAsset.longitude <= max_lon,
            InfrastructureAsset.latitude >= min_lat,
            InfrastructureAsset.latitude <= max_lat,
        )

    total = query.count()
    assets = query.order_by(InfrastructureAsset.id).offset(offset).limit(limit).all()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": [asset_to_dict(asset) for asset in assets],
    }


# --------------------------------------------------
# GET HIGH RISK ASSETS
# --------------------------------------------------

@router.get("/high-risk")
def get_high_risk_assets(
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=5000),
):
    assets = (
        db.query(InfrastructureAsset)
        .filter(
            func.lower(InfrastructureAsset.risk_level) == "high"
        )
        .order_by(
            InfrastructureAsset.risk_score.desc()
        )
        .limit(limit)
        .all()
    )

    return {
        "count": len(assets),
        "assets": [
            asset_to_dict(asset)
            for asset in assets
        ]
    }


# --------------------------------------------------
# GET ASSETS BY DISTRICT
# --------------------------------------------------

@router.get("/district/{district}")
def get_assets_by_district(
    district: str,
    db: Session = Depends(get_db)
):
    assets = (
        db.query(InfrastructureAsset)
        .filter(
            InfrastructureAsset.district.ilike(district)
        )
        .all()
    )

    return {
        "district": district,
        "count": len(assets),
        "assets": [
            asset_to_dict(asset)
            for asset in assets
        ]
    }


# --------------------------------------------------
# INFRASTRUCTURE SUMMARY
# --------------------------------------------------

@router.get("/summary")
def infrastructure_summary(
    db: Session = Depends(get_db)
):
    total = db.query(InfrastructureAsset).count()
    high_risk = db.query(InfrastructureAsset).filter(func.lower(InfrastructureAsset.risk_level) == "high").count()
    medium_risk = db.query(InfrastructureAsset).filter(func.lower(InfrastructureAsset.risk_level) == "medium").count()
    low_risk = db.query(InfrastructureAsset).filter(func.lower(InfrastructureAsset.risk_level) == "low").count()

    return {
        "total_assets": total,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "average_health_score": round(float(db.query(func.avg(InfrastructureAsset.health_score)).scalar() or 0), 2),
        "average_risk_score": round(float(db.query(func.avg(InfrastructureAsset.risk_score)).scalar() or 0), 2),
    }


# --------------------------------------------------
# GET ALL ASSETS AS GEOJSON
# --------------------------------------------------

@router.get("/geojson")
def get_infrastructure_geojson(
    db: Session = Depends(get_db),
    limit: int = Query(5000, ge=1, le=10000),
    asset_type: str | None = Query(None),
    district: str | None = Query(None),
    risk_level: str | None = Query(None),
    bbox: str | None = Query(None),
):
    query = db.query(InfrastructureAsset, ST_AsGeoJSON(InfrastructureAsset.geometry).label("geojson")).filter(
        InfrastructureAsset.geometry.isnot(None)
    )

    if asset_type:
        query = query.filter(func.lower(InfrastructureAsset.asset_type) == func.lower(asset_type))
    if district:
        query = query.filter(func.lower(InfrastructureAsset.district) == func.lower(district))
    if risk_level:
        query = query.filter(func.lower(InfrastructureAsset.risk_level) == func.lower(risk_level))
    if bbox:
        try:
            min_lon, min_lat, max_lon, max_lat = [float(part) for part in bbox.split(",")]
        except ValueError:
            raise HTTPException(status_code=400, detail="bbox must be in format min_lon,min_lat,max_lon,max_lat")
        query = query.filter(
            InfrastructureAsset.longitude >= min_lon,
            InfrastructureAsset.longitude <= max_lon,
            InfrastructureAsset.latitude >= min_lat,
            InfrastructureAsset.latitude <= max_lat,
        )

    rows = query.order_by(InfrastructureAsset.id).limit(limit).all()
    features = []

    for asset, geojson in rows:
        features.append({
            "type": "Feature",
            "geometry": json.loads(geojson),
            "properties": asset_to_dict(asset),
        })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


# --------------------------------------------------
# FIND NEARBY INFRASTRUCTURE
# --------------------------------------------------

@router.get("/nearby")
def get_nearby_infrastructure(
    latitude: float,
    longitude: float,
    radius_km: float = 50,
    db: Session = Depends(get_db)
):

    point = func.ST_SetSRID(
        func.ST_MakePoint(
            longitude,
            latitude
        ),
        4326
    )

    assets = (
        db.query(InfrastructureAsset)
        .filter(
            InfrastructureAsset.geometry.isnot(None)
        )
        .filter(
            func.ST_DWithin(
                InfrastructureAsset.geometry.cast(
                    Geography
                ),
                point.cast(
                    Geography
                ),
                radius_km * 1000
            )
        )
        .all()
    )

    return {
        "latitude": latitude,
        "longitude": longitude,
        "radius_km": radius_km,
        "count": len(assets),

        "assets": [
            asset_to_dict(asset)
            for asset in assets
        ]
    }


# --------------------------------------------------
# GET GEOGRAPHIC BOUNDS
# --------------------------------------------------

@router.get("/bounds")
def get_infrastructure_bounds(
    db: Session = Depends(get_db)
):

    result = (
        db.query(
            func.ST_XMin(
                func.ST_Extent(
                    InfrastructureAsset.geometry
                )
            ),

            func.ST_YMin(
                func.ST_Extent(
                    InfrastructureAsset.geometry
                )
            ),

            func.ST_XMax(
                func.ST_Extent(
                    InfrastructureAsset.geometry
                )
            ),

            func.ST_YMax(
                func.ST_Extent(
                    InfrastructureAsset.geometry
                )
            )
        )
        .filter(
            InfrastructureAsset.geometry.isnot(None)
        )
        .first()
    )

    if not result or result[0] is None:
        return {
            "message": "No spatial infrastructure data found"
        }

    return {
        "bounds": {
            "min_lon": float(result[0]),
            "min_lat": float(result[1]),
            "max_lon": float(result[2]),
            "max_lat": float(result[3])
        }
    }


# --------------------------------------------------
# CREATE NEW ASSET (POST)
# --------------------------------------------------

from pydantic import BaseModel, Field
from typing import Optional

class CreateAssetRequest(BaseModel):
    id: str
    name: str
    asset_type: str
    location: str
    district: str
    mandal: Optional[str] = None
    latitude: float
    longitude: float
    built_year: Optional[int] = None
    design_life: Optional[int] = None
    condition: Optional[str] = "Good"
    health_score: Optional[float] = 80.0
    risk_level: Optional[str] = "Low"
    risk_score: Optional[float] = 30.0
    remaining_useful_life: Optional[int] = 50
    remaining_life: Optional[int] = 50
    owner: Optional[str] = None
    material: Optional[str] = None
    status: Optional[str] = "Operational"
    source: Optional[str] = "User Created"
    source_id: Optional[str] = None

@router.post("")
def create_infrastructure(
    asset_data: CreateAssetRequest,
    db: Session = Depends(get_db)
):
    """Create a new infrastructure asset"""
    
    # Check if ID already exists
    existing = db.query(InfrastructureAsset).filter(
        InfrastructureAsset.id == asset_data.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Asset with ID {asset_data.id} already exists"
        )
    
    # Create new asset
    new_asset = InfrastructureAsset(
        id=asset_data.id,
        name=asset_data.name,
        asset_type=asset_data.asset_type,
        location=asset_data.location,
        district=asset_data.district,
        mandal=asset_data.mandal or asset_data.location,
        latitude=asset_data.latitude,
        longitude=asset_data.longitude,
        built_year=asset_data.built_year,
        design_life=asset_data.design_life,
        condition=asset_data.condition,
        health_score=asset_data.health_score,
        risk_level=asset_data.risk_level,
        risk_score=asset_data.risk_score,
        remaining_useful_life=asset_data.remaining_useful_life,
        remaining_life=asset_data.remaining_life,
        owner=asset_data.owner,
        material=asset_data.material,
        status=asset_data.status,
        source=asset_data.source,
        source_id=asset_data.source_id,
    )
    
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    
    return {
        "message": "Asset created successfully",
        "asset": asset_to_dict(new_asset)
    }

    return {
        "min_longitude": float(result[0]),
        "min_latitude": float(result[1]),
        "max_longitude": float(result[2]),
        "max_latitude": float(result[3])
    }


# --------------------------------------------------
# GET SINGLE ASSET
# KEEP THIS ROUTE LAST
# --------------------------------------------------

@router.get("/major")
def get_major_infrastructure_alias(
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    asset_type: str | None = Query(None),
    district: str | None = Query(None),
    risk_level: str | None = Query(None),
):
    query = db.query(InfrastructureAsset).filter(
        InfrastructureAsset.asset_type.isnot(None)
    )
    if asset_type:
        query = query.filter(func.lower(InfrastructureAsset.asset_type) == func.lower(asset_type))
    if district:
        query = query.filter(func.lower(InfrastructureAsset.district) == func.lower(district))
    if risk_level:
        query = query.filter(func.lower(InfrastructureAsset.risk_level) == func.lower(risk_level))

    rows = query.order_by(InfrastructureAsset.id).offset(offset).limit(limit).all()
    return {
        "total": query.count(),
        "items": [asset_to_dict(asset) for asset in rows],
    }


@router.get("/major/summary")
def get_major_infrastructure_summary_alias(db: Session = Depends(get_db)):
    rows = db.query(InfrastructureAsset.asset_type, func.count(InfrastructureAsset.id)).group_by(InfrastructureAsset.asset_type).all()
    return [{"asset_type": asset_type, "count": count} for asset_type, count in rows]


@router.get("/{asset_id}")
def get_infrastructure(
    asset_id: str,
    db: Session = Depends(get_db)
):

    asset = (
        db.query(InfrastructureAsset)
        .filter(
            InfrastructureAsset.id == asset_id
        )
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Infrastructure asset not found"
        )

    return asset_to_dict(asset)

