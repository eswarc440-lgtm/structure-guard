import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from geoalchemy2 import Geography
from geoalchemy2.functions import ST_AsGeoJSON

from app.database.database import get_db
from app.models.infrastructure import InfrastructureAsset


router = APIRouter(tags=["Infrastructure"])


# --------------------------------------------------
# Convert database asset object to JSON dictionary
# --------------------------------------------------

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
        "owner": asset.owner,
        "material": asset.material,
        "status": asset.status,
        "source": asset.source,
        "source_id": asset.source_id
    }


# --------------------------------------------------
# GET ALL INFRASTRUCTURE ASSETS
# --------------------------------------------------

@router.get("")
def list_infrastructure(
    db: Session = Depends(get_db)
):
    assets = (
        db.query(InfrastructureAsset)
        .limit(5000)
        .all()
    )

    return [
        asset_to_dict(asset)
        for asset in assets
    ]


# --------------------------------------------------
# GET HIGH RISK ASSETS
# --------------------------------------------------

@router.get("/high-risk")
def get_high_risk_assets(
    db: Session = Depends(get_db)
):
    assets = (
        db.query(InfrastructureAsset)
        .filter(
            InfrastructureAsset.risk_level == "High"
        )
        .order_by(
            InfrastructureAsset.risk_score.desc()
        )
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
    total = (
        db.query(InfrastructureAsset)
        .count()
    )

    high_risk = (
        db.query(InfrastructureAsset)
        .filter(
            InfrastructureAsset.risk_level == "High"
        )
        .count()
    )

    medium_risk = (
        db.query(InfrastructureAsset)
        .filter(
            InfrastructureAsset.risk_level == "Medium"
        )
        .count()
    )

    low_risk = (
        db.query(InfrastructureAsset)
        .filter(
            InfrastructureAsset.risk_level == "Low"
        )
        .count()
    )

    return {
        "total_assets": total,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk
    }


# --------------------------------------------------
# GET ALL ASSETS AS GEOJSON
# --------------------------------------------------

@router.get("/geojson")
def get_infrastructure_geojson(
    db: Session = Depends(get_db)
):
    rows = (
        db.query(
            InfrastructureAsset,
            ST_AsGeoJSON(
                InfrastructureAsset.geometry
            ).label("geojson")
        )
        .filter(
            InfrastructureAsset.geometry.isnot(None)
        )
        .all()
    )

    features = []

    for asset, geojson in rows:

        features.append({
            "type": "Feature",

            "geometry": json.loads(geojson),

            "properties": asset_to_dict(asset)
        })

    return {
        "type": "FeatureCollection",
        "features": features
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
        "min_longitude": float(result[0]),
        "min_latitude": float(result[1]),
        "max_longitude": float(result[2]),
        "max_latitude": float(result[3])
    }


# --------------------------------------------------
# GET SINGLE ASSET
# KEEP THIS ROUTE LAST
# --------------------------------------------------

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

