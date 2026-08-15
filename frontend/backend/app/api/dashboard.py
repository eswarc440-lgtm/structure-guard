from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.infrastructure import InfrastructureAsset

router = APIRouter(tags=["Dashboard"])


def normalize_asset_type(value: str | None) -> str:
    if not value:
        return "unknown"
    text = value.strip().lower().replace("_", " ")
    mapping = {
        "bridge": "bridge",
        "bridges": "bridge",
        "dam": "dam",
        "dams": "dam",
        "barrage": "barrage",
        "barrages": "barrage",
        "port": "port",
        "ports": "port",
        "road": "road",
        "roads": "road",
        "building": "building",
        "buildings": "building",
        "airport": "airport",
        "airports": "airport",
        "power plant": "power_plant",
        "powerplant": "power_plant",
        "power_plants": "power_plant",
        "school": "school",
        "schools": "school",
        "tank": "tank",
        "tanks": "tank",
        "railway": "railway",
        "railways": "railway",
    }
    return mapping.get(text, text)


@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    total_assets = db.query(InfrastructureAsset).count()

    counts_by_risk = dict(
        db.query(InfrastructureAsset.risk_level, func.count(InfrastructureAsset.id))
        .group_by(InfrastructureAsset.risk_level)
        .all()
    )

    total_bridges = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.asset_type) == "bridge"
    ).count()
    total_dams = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.asset_type) == "dam"
    ).count()
    total_barrages = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.asset_type) == "barrage"
    ).count()
    total_ports = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.asset_type) == "port"
    ).count()
    total_roads = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.asset_type) == "road"
    ).count()
    total_buildings = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.asset_type) == "building"
    ).count()
    total_airports = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.asset_type) == "airport"
    ).count()
    total_power_plants = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.asset_type) == "power_plant"
    ).count()

    high_risk_assets = counts_by_risk.get("High", 0)
    medium_risk_assets = counts_by_risk.get("Medium", 0)
    low_risk_assets = counts_by_risk.get("Low", 0)

    average_health_score = db.query(func.avg(InfrastructureAsset.health_score)).scalar() or 0
    average_risk_score = db.query(func.avg(InfrastructureAsset.risk_score)).scalar() or 0
    average_remaining_life = db.query(func.avg(InfrastructureAsset.remaining_useful_life)).scalar() or 0

    district_distribution = [
        {"district": district, "count": count}
        for district, count in db.query(
            InfrastructureAsset.district,
            func.count(InfrastructureAsset.id),
        )
        .group_by(InfrastructureAsset.district)
        .order_by(func.count(InfrastructureAsset.id).desc())
        .limit(12)
        .all()
    ]

    asset_type_distribution = [
        {"asset_type": normalize_asset_type(asset_type), "count": count}
        for asset_type, count in db.query(
            InfrastructureAsset.asset_type,
            func.count(InfrastructureAsset.id),
        )
        .group_by(InfrastructureAsset.asset_type)
        .order_by(func.count(InfrastructureAsset.id).desc())
        .limit(12)
        .all()
    ]

    risk_distribution = [
        {"key": "low", "name": "Low Risk", "value": low_risk_assets},
        {"key": "medium", "name": "Medium Risk", "value": medium_risk_assets},
        {"key": "high", "name": "High Risk", "value": high_risk_assets},
    ]

    top_high_risk_assets = [
        {
            "id": asset.id,
            "name": asset.name,
            "asset_type": normalize_asset_type(asset.asset_type),
            "district": asset.district,
            "risk_score": float(asset.risk_score or 0),
            "health_score": float(asset.health_score or 0),
            "remaining_life": float(asset.remaining_useful_life or 0),
        }
        for asset in db.query(InfrastructureAsset)
        .filter(func.lower(InfrastructureAsset.risk_level) == "high")
        .order_by(InfrastructureAsset.risk_score.desc())
        .limit(10)
        .all()
    ]

    recent_assessments = [
        {
            "assessment_id": asset.id,
            "assessment_name": asset.name or f"{asset.district or 'AP'} {normalize_asset_type(asset.asset_type)} Assessment",
            "asset_id": asset.id,
            "risk_level": asset.risk_level,
            "health_score": float(asset.health_score or 0),
            "last_assessed": asset.source or "database",
        }
        for asset in db.query(InfrastructureAsset)
        .order_by(InfrastructureAsset.id.desc())
        .limit(10)
        .all()
    ]

    payload = {
        "total_assets": total_assets,
        "total_bridges": total_bridges,
        "total_dams": total_dams,
        "total_barrages": total_barrages,
        "total_ports": total_ports,
        "total_roads": total_roads,
        "total_buildings": total_buildings,
        "total_airports": total_airports,
        "total_power_plants": total_power_plants,
        "high_risk_assets": high_risk_assets,
        "medium_risk_assets": medium_risk_assets,
        "low_risk_assets": low_risk_assets,
        "average_health_score": round(float(average_health_score), 2),
        "average_risk_score": round(float(average_risk_score), 2),
        "average_remaining_life": round(float(average_remaining_life), 2),
        "district_distribution": district_distribution,
        "asset_type_distribution": asset_type_distribution,
        "risk_distribution": risk_distribution,
        "top_high_risk_assets": top_high_risk_assets,
        "recent_assessments": recent_assessments,
    }
    return payload


@router.get("/dashboard/overview")
def get_dashboard_overview_alias(db: Session = Depends(get_db)):
    return get_dashboard_overview(db)
