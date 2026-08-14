from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional, List

from app.database.database import get_db
from app.models.infrastructure import InfrastructureAsset

router = APIRouter(prefix="/major-infrastructure", tags=["Major Infrastructure"])


MAJOR_TYPES = [
    "dam",
    "barrage",
    "bridge",
    "port",
    "road",
    "building",
    "airport",
    "power plant",
    "powerplant",
]


@router.get("")
def get_major_infrastructure(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    asset_type: Optional[str] = Query(None, description="Filter by asset type"),
    district: Optional[str] = Query(None, description="Filter by district"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level (Low, Medium, High, Critical)"),
    db: Session = Depends(get_db)
):
    query = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.asset_type).in_(MAJOR_TYPES)
    )

    if asset_type:
        query = query.filter(func.lower(InfrastructureAsset.asset_type) == func.lower(asset_type))
    
    if district:
        query = query.filter(func.lower(InfrastructureAsset.district) == func.lower(district))
    
    if risk_level:
        query = query.filter(InfrastructureAsset.risk_level == risk_level)

    total = query.count()
    assets = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "data": [
            {
                "id": asset.id,
                "name": asset.name,
                "asset_type": asset.asset_type,
                "district": asset.district,
                "mandal": asset.mandal,
                "latitude": asset.latitude,
                "longitude": asset.longitude,
                "built_year": asset.built_year,
                "condition": asset.condition,
                "health_score": asset.health_score,
                "risk_score": asset.risk_score,
                "risk_level": asset.risk_level,
                "remaining_useful_life": asset.remaining_useful_life,
                "source": asset.source,
                "source_id": asset.source_id,
            }
            for asset in assets
        ]
    }


@router.get("/summary")
def major_summary(db: Session = Depends(get_db)):

    rows = db.query(
        InfrastructureAsset.asset_type,
        func.count(InfrastructureAsset.id)
    ).filter(
        func.lower(InfrastructureAsset.asset_type).in_(MAJOR_TYPES)
    ).group_by(
        InfrastructureAsset.asset_type
    ).all()

    return [
        {
            "asset_type": asset_type,
            "count": count
        }
        for asset_type, count in rows
    ]


@router.get("/districts")
def get_major_districts(db: Session = Depends(get_db)):
    districts = db.query(
        InfrastructureAsset.district,
        func.count(InfrastructureAsset.id).label('count')
    ).filter(
        func.lower(InfrastructureAsset.asset_type).in_(MAJOR_TYPES)
    ).group_by(
        InfrastructureAsset.district
    ).order_by(
        func.count(InfrastructureAsset.id).desc()
    ).all()

    return [
        {
            "district": district,
            "count": count
        }
        for district, count in districts
    ]
