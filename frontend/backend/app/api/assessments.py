from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.models.infrastructure import InfrastructureAsset

router = APIRouter(tags=["Assessments"])


def _safe_float(value):
    return float(value) if value is not None else None


def _normalize_risk(value):
    if value is None:
        return "Low"
    normalized = str(value).strip().title()
    if normalized not in {"Low", "Medium", "High", "Critical"}:
        return "Low"
    return normalized


def _assessment_name(asset):
    raw_name = (asset.name or "").strip()
    generic_names = {"", "unknown", "unnamed", "null", "n/a", "na"}
    asset_type = (asset.asset_type or "Asset").strip() or "Asset"
    district = (asset.district or "Andhra Pradesh").strip() or "Andhra Pradesh"
    lat = getattr(asset, "latitude", None)
    lon = getattr(asset, "longitude", None)

    if raw_name and raw_name.lower() not in generic_names:
        base = f"{raw_name} – {asset_type} – {district}"
    else:
        base = f"{asset_type} – {district}"

    if lat is not None and lon is not None:
        coord_suffix = f" – {float(lat):.4f}, {float(lon):.4f}"
        if asset.id:
            return f"{base}{coord_suffix} – {asset.id}"
        return f"{base}{coord_suffix}"

    if asset.id:
        return f"{base} – {asset.id}"
    return base


@router.get("/api/v1/assessments")
def list_assessments(
    limit: int = Query(100, ge=1, le=5000),
    offset: int = Query(0, ge=0),
    search: str | None = Query(None),
    asset_type: str | None = Query(None),
    district: str | None = Query(None),
    risk_level: str | None = Query(None),
    db: Session = Depends(get_db),
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

    if asset_type:
        query = query.filter(func.lower(InfrastructureAsset.asset_type) == func.lower(asset_type))
    if district:
        query = query.filter(func.lower(InfrastructureAsset.district) == func.lower(district))
    if risk_level:
        query = query.filter(func.lower(InfrastructureAsset.risk_level) == func.lower(risk_level))

    total = query.count()
    rows = query.order_by(InfrastructureAsset.id).offset(offset).limit(limit).all()

    assessments = []
    for asset in rows:
        assessments.append(
            {
                "assessment_id": asset.id,
                "assessment_name": _assessment_name(asset),
                "asset_id": asset.id,
                "asset_name": asset.name,
                "asset_type": asset.asset_type,
                "district": asset.district,
                "mandal": asset.mandal,
                "latitude": asset.latitude,
                "longitude": asset.longitude,
                "health_score": _safe_float(asset.health_score),
                "risk_score": _safe_float(asset.risk_score),
                "risk_level": _normalize_risk(asset.risk_level),
                "remaining_life": _safe_float(asset.remaining_useful_life if asset.remaining_useful_life is not None else asset.remaining_life),
                "condition": asset.condition,
                "source": asset.source,
                "last_assessed": asset.source or "database",
            }
        )

    return {"total": total, "limit": limit, "offset": offset, "items": assessments}


@router.get("/api/v1/assessments/{assessment_id}")
def get_assessment(assessment_id: str, db: Session = Depends(get_db)):
    asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == assessment_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return {
        "assessment_id": asset.id,
        "assessment_name": _assessment_name(asset),
        "asset_id": asset.id,
        "asset_name": asset.name,
        "asset_type": asset.asset_type,
        "district": asset.district,
        "mandal": asset.mandal,
        "latitude": asset.latitude,
        "longitude": asset.longitude,
        "health_score": _safe_float(asset.health_score),
        "risk_score": _safe_float(asset.risk_score),
        "risk_level": _normalize_risk(asset.risk_level),
        "remaining_life": _safe_float(asset.remaining_useful_life if asset.remaining_useful_life is not None else asset.remaining_life),
        "condition": asset.condition,
        "source": asset.source,
        "last_assessed": asset.source or "database",
    }
