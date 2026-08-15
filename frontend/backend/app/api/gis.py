from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import datetime
import json

from app.database.database import get_db
from app.models.gis_and_analytics import District, Mandal, Village, GISLayer
from app.models.infrastructure import InfrastructureAsset
from geoalchemy2.functions import ST_AsGeoJSON

router = APIRouter(prefix="/gis", tags=["GIS"])


# ========================
# DISTRICTS
# ========================

@router.get("/districts")
def get_districts(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get all districts"""
    
    total = db.query(District).count()
    districts = db.query(District).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "districts": [
            {
                "id": d.id,
                "name": d.name,
                "state": d.state,
                "region_code": d.region_code,
                "headquarters": d.headquarters,
                "total_assets": d.total_assets,
                "high_risk_count": d.high_risk_count,
                "medium_risk_count": d.medium_risk_count,
                "low_risk_count": d.low_risk_count,
            }
            for d in districts
        ]
    }


@router.get("/districts/{district_id}")
def get_district_detail(
    district_id: str = Path(...),
    db: Session = Depends(get_db)
):
    """Get district details with geometry"""
    
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
    
    # Get mandals in this district
    mandals = db.query(Mandal).filter(Mandal.district_id == district_id).all()
    
    # Get assets in this district
    assets_count = db.query(InfrastructureAsset).filter(
        InfrastructureAsset.district == district.name
    ).count()
    
    return {
        "id": district.id,
        "name": district.name,
        "state": district.state,
        "headquarters": district.headquarters,
        "total_assets": assets_count,
        "high_risk_count": district.high_risk_count,
        "mandals_count": len(mandals),
        "mandals": [
            {
                "id": m.id,
                "name": m.name,
                "total_assets": m.total_assets,
                "high_risk_count": m.high_risk_count,
            }
            for m in mandals
        ]
    }


# ========================
# MANDALS
# ========================

@router.get("/mandals")
def get_mandals(
    district_id: str = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get mandals, optionally filtered by district"""
    
    query = db.query(Mandal)
    
    if district_id:
        query = query.filter(Mandal.district_id == district_id)
    
    total = query.count()
    mandals = query.offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "mandals": [
            {
                "id": m.id,
                "name": m.name,
                "district_id": m.district_id,
                "total_assets": m.total_assets,
                "high_risk_count": m.high_risk_count,
            }
            for m in mandals
        ]
    }


@router.get("/mandals/{mandal_id}")
def get_mandal_detail(
    mandal_id: str = Path(...),
    db: Session = Depends(get_db)
):
    """Get mandal details with villages"""
    
    mandal = db.query(Mandal).filter(Mandal.id == mandal_id).first()
    if not mandal:
        raise HTTPException(status_code=404, detail="Mandal not found")
    
    # Get villages in this mandal
    villages = db.query(Village).filter(Village.mandal_id == mandal_id).all()
    
    return {
        "id": mandal.id,
        "name": mandal.name,
        "district_id": mandal.district_id,
        "total_assets": mandal.total_assets,
        "high_risk_count": mandal.high_risk_count,
        "villages_count": len(villages),
        "villages": [
            {
                "id": v.id,
                "name": v.name,
                "total_assets": v.total_assets,
            }
            for v in villages
        ]
    }


# ========================
# VILLAGES
# ========================

@router.get("/villages")
def get_villages(
    mandal_id: str = Query(None),
    district_id: str = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get villages, optionally filtered by mandal or district"""
    
    query = db.query(Village)
    
    if mandal_id:
        query = query.filter(Village.mandal_id == mandal_id)
    if district_id:
        query = query.filter(Village.district_id == district_id)
    
    total = query.count()
    villages = query.offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "villages": [
            {
                "id": v.id,
                "name": v.name,
                "mandal_id": v.mandal_id,
                "district_id": v.district_id,
                "total_assets": v.total_assets,
            }
            for v in villages
        ]
    }


# ========================
# GIS LAYERS
# ========================

@router.get("/layers")
def get_gis_layers(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get available GIS layers"""
    
    total = db.query(GISLayer).count()
    layers = db.query(GISLayer).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "layers": [
            {
                "id": l.id,
                "name": l.name,
                "description": l.description,
                "layer_type": l.layer_type,
                "geometry_type": l.geometry_type,
                "feature_count": l.feature_count,
                "is_visible_by_default": l.is_visible_by_default,
            }
            for l in layers
        ]
    }


# ========================
# SPATIAL QUERIES
# ========================

@router.get("/assets/within")
def get_assets_within_bbox(
    bbox: str = Query(...),  # "minlon,minlat,maxlon,maxlat"
    asset_type: str = Query(None),
    risk_level: str = Query(None),
    limit: int = Query(1000, ge=1, le=5000),
    db: Session = Depends(get_db)
):
    """Get assets within bounding box"""
    
    try:
        min_lon, min_lat, max_lon, max_lat = [float(x) for x in bbox.split(",")]
    except:
        raise HTTPException(status_code=400, detail="Invalid bbox format. Use: minlon,minlat,maxlon,maxlat")
    
    query = db.query(InfrastructureAsset).filter(
        InfrastructureAsset.latitude.between(min_lat, max_lat),
        InfrastructureAsset.longitude.between(min_lon, max_lon),
    )
    
    if asset_type:
        query = query.filter(func.lower(InfrastructureAsset.asset_type) == func.lower(asset_type))
    if risk_level:
        query = query.filter(func.lower(InfrastructureAsset.risk_level) == func.lower(risk_level))
    
    total = query.count()
    assets = query.limit(limit).all()
    
    return {
        "bbox": bbox,
        "total": total,
        "limit": limit,
        "assets": [
            {
                "id": a.id,
                "name": a.name,
                "asset_type": a.asset_type,
                "latitude": a.latitude,
                "longitude": a.longitude,
                "risk_level": a.risk_level,
                "health_score": a.health_score,
                "district": a.district,
            }
            for a in assets
        ]
    }


# ========================
# SPATIAL STATISTICS
# ========================

@router.get("/statistics/by-district")
def statistics_by_district(db: Session = Depends(get_db)):
    """Get infrastructure statistics by district"""
    
    stats = db.query(
        InfrastructureAsset.district,
        func.count(InfrastructureAsset.id).label("total"),
        func.count(func.case([(InfrastructureAsset.risk_level == "high", 1)])).label("high_risk"),
        func.count(func.case([(InfrastructureAsset.risk_level == "medium", 1)])).label("medium_risk"),
        func.count(func.case([(InfrastructureAsset.risk_level == "low", 1)])).label("low_risk"),
        func.avg(InfrastructureAsset.health_score).label("avg_health"),
        func.avg(InfrastructureAsset.risk_score).label("avg_risk"),
    ).group_by(InfrastructureAsset.district).all()
    
    return {
        "statistics": [
            {
                "district": s.district,
                "total_assets": s.total,
                "high_risk": s.high_risk,
                "medium_risk": s.medium_risk,
                "low_risk": s.low_risk,
                "avg_health_score": float(s.avg_health) if s.avg_health else 0,
                "avg_risk_score": float(s.avg_risk) if s.avg_risk else 0,
            }
            for s in stats if s.district
        ]
    }
