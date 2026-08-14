from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.database import get_db


router = APIRouter(
    prefix="/digital-twin",
    tags=["Digital Twin"]
)


@router.get("/assets")
def get_digital_twin_assets(
    limit: int = Query(1000, ge=1, le=10000),
    offset: int = Query(0, ge=0),
    risk_level: str | None = None,
    db: Session = Depends(get_db)
):

    query = """
        SELECT
            id,
            name,
            asset_type,
            district,
            latitude,
            longitude,
            health_score,
            risk_score,
            remaining_life,
            risk_level
        FROM infrastructure_assets
        WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
    """

    params = {
        "limit": limit,
        "offset": offset
    }

    if risk_level:
        query += """
            AND risk_level = :risk_level
        """
        params["risk_level"] = risk_level

    query += """
        ORDER BY
            CASE risk_level
                WHEN 'High' THEN 1
                WHEN 'Medium' THEN 2
                WHEN 'Low' THEN 3
                ELSE 4
            END,
            risk_score DESC NULLS LAST
        LIMIT :limit
        OFFSET :offset
    """

    result = db.execute(
        text(query),
        params
    ).mappings().all()

    features = []

    for row in result:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    float(row["longitude"]),
                    float(row["latitude"])
                ]
            },
            "properties": {
                "id": row["id"],
                "name": row["name"],
                "asset_type": row["asset_type"],
                "district": row["district"],
                "health_score": row["health_score"],
                "risk_score": row["risk_score"],
                "remaining_life": row["remaining_life"],
                "risk_level": row["risk_level"]
            }
        })

    return {
        "type": "FeatureCollection",
        "count": len(features),
        "offset": offset,
        "limit": limit,
        "features": features
    }


@router.get("/asset/{asset_id}")
def get_digital_twin_asset(
    asset_id: str,
    db: Session = Depends(get_db)
):

    result = db.execute(
        text("""
            SELECT
                id,
                name,
                asset_type,
                district,
                latitude,
                longitude,
                built_year,
                design_life,
                owner,
                material,
                condition,
                status,
                health_score,
                risk_score,
                remaining_life,
                risk_level
            FROM infrastructure_assets
            WHERE id = :asset_id
        """),
        {
            "asset_id": asset_id
        }
    ).mappings().first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    return dict(result)
