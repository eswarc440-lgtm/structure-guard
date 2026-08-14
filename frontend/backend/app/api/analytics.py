from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.models.infrastructure import InfrastructureAsset

router = APIRouter(
    prefix="",
    tags=["Analytics"]
)


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):

    total_assets = db.query(InfrastructureAsset).count()

    predicted_assets = db.query(InfrastructureAsset).filter(
        InfrastructureAsset.health_score.isnot(None)
    ).count()

    high_risk_assets = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.risk_level) == "high"
    ).count()

    medium_risk_assets = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.risk_level) == "medium"
    ).count()

    low_risk_assets = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.risk_level) == "low"
    ).count()

    average_health_score = db.query(
        func.avg(InfrastructureAsset.health_score)
    ).scalar()

    average_risk_score = db.query(
        func.avg(InfrastructureAsset.risk_score)
    ).scalar()

    average_remaining_life = db.query(
        func.avg(InfrastructureAsset.remaining_useful_life)
    ).scalar()

    return {
        "total_assets": total_assets,
        "predicted_assets": predicted_assets,
        "high_risk_assets": high_risk_assets,
        "medium_risk_assets": medium_risk_assets,
        "low_risk_assets": low_risk_assets,
        "average_health_score": round(float(average_health_score or 0), 2),
        "average_risk_score": round(float(average_risk_score or 0), 2),
        "average_remaining_life": round(float(average_remaining_life or 0), 2),
    }


@router.get("/high-risk")
def get_high_risk_assets(db: Session = Depends(get_db)):

    assets = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.risk_level) == "high"
    ).all()

    return [
        {
            "id": asset.id,
            "name": asset.name,
            "type": asset.asset_type,
            "district": asset.district,
            "latitude": asset.latitude,
            "longitude": asset.longitude,
            "health_score": asset.health_score,
            "risk_score": asset.risk_score,
            "risk_level": asset.risk_level,
            "remaining_useful_life": asset.remaining_useful_life,
        }
        for asset in assets
    ]


@router.get("/map-assets")
def get_map_assets(db: Session = Depends(get_db)):

    assets = db.query(InfrastructureAsset).all()

    return [
        {
            "id": asset.id,
            "name": asset.name,
            "type": asset.asset_type,
            "district": asset.district,
            "latitude": asset.latitude,
            "longitude": asset.longitude,
            "health_score": asset.health_score,
            "risk_score": asset.risk_score,
            "risk_level": asset.risk_level,
            "remaining_useful_life": asset.remaining_useful_life,
        }
        for asset in assets
    ]
@router.get("/map-assets")
def get_map_assets(db: Session = Depends(get_db)):

    assets = db.query(InfrastructureAsset).limit(10).all()

    return [
        {
            "id": asset.id,
            "name": asset.name,
            "type": asset.asset_type,
            "district": asset.district,
            "latitude": asset.latitude,
            "longitude": asset.longitude,
            "health_score": asset.health_score,
            "risk_score": asset.risk_score,
            "risk_level": asset.risk_level,
            "remaining_useful_life": asset.remaining_useful_life,
        }
        for asset in assets
    ]
