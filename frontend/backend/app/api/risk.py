from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import uuid

from app.database.database import get_db
from app.models.gis_and_analytics import RiskAssessment
from app.models.infrastructure import InfrastructureAsset
from app.models.inspections import Inspection

router = APIRouter(prefix="/risk", tags=["Risk"])


def calculate_risk_score(asset, inspections):
    """Calculate risk score for asset based on various factors"""
    
    # Default weights
    weights = {
        "condition": 0.30,
        "age": 0.20,
        "inspection": 0.15,
        "environment": 0.15,
        "usage": 0.10,
        "maintenance": 0.10,
    }
    
    risk_score = 0.0
    risk_factors = {}
    
    # 1. Condition factor (0-100)
    if asset.health_score is not None:
        condition_factor = 100 - asset.health_score  # Inverse: low health = high risk
        risk_score += condition_factor * weights["condition"]
        risk_factors["condition"] = {
            "value": condition_factor,
            "weight": weights["condition"],
            "description": f"Based on health score ({asset.health_score})"
        }
    
    # 2. Age factor (0-100)
    if asset.built_year:
        age = 2026 - asset.built_year
        design_life = asset.design_life or 50
        age_factor = min(100, (age / design_life) * 100)
        risk_score += age_factor * weights["age"]
        risk_factors["age"] = {
            "value": age_factor,
            "weight": weights["age"],
            "description": f"Asset age: {age} years (design life: {design_life} years)"
        }
    
    # 3. Recent inspection findings (0-100)
    inspection_factor = 0
    if inspections:
        recent_inspection = inspections[0]
        # Aggregate defect scores
        defect_scores = [
            recent_inspection.crack_score,
            recent_inspection.corrosion_score,
            recent_inspection.spalling_score,
            recent_inspection.deformation_score,
            recent_inspection.water_damage_score,
        ]
        valid_scores = [s for s in defect_scores if s is not None]
        if valid_scores:
            inspection_factor = sum(valid_scores) / len(valid_scores)
            risk_score += inspection_factor * weights["inspection"]
            risk_factors["inspection"] = {
                "value": inspection_factor,
                "weight": weights["inspection"],
                "description": f"Based on recent inspection defects"
            }
    
    # 4. Environmental exposure factor (0-100)
    environment_factor = 0
    if asset.flood_risk_value is not None:
        environment_factor += asset.flood_risk_value * 0.4
    if asset.rainfall_mm is not None:
        environment_factor += min(100, asset.rainfall_mm / 100 * 40)
    
    if environment_factor > 0:
        risk_score += environment_factor * weights["environment"]
        risk_factors["environment"] = {
            "value": environment_factor,
            "weight": weights["environment"],
            "description": "Based on environmental exposure (flood risk, rainfall)"
        }
    
    # Normalize to 0-100
    risk_score = min(100, max(0, risk_score))
    
    return risk_score, risk_factors


def get_risk_level(score):
    """Classify risk level based on score"""
    if score >= 80:
        return "critical"
    elif score >= 60:
        return "high"
    elif score >= 30:
        return "medium"
    else:
        return "low"


def generate_risk_explanation(asset, risk_score, risk_factors):
    """Generate human-readable risk explanation"""
    
    risk_level = get_risk_level(risk_score)
    risk_level_display = risk_level.upper()
    
    explanation = f"{risk_level_display} RISK — {risk_score:.0f}/100\n\n"
    explanation += "Risk Factors:\n"
    
    # Sort factors by contribution (value * weight)
    factor_contributions = []
    for name, factor in risk_factors.items():
        contribution = factor["value"] * factor["weight"]
        factor_contributions.append((name, factor, contribution))
    
    factor_contributions.sort(key=lambda x: x[2], reverse=True)
    
    for name, factor, contribution in factor_contributions:
        if contribution > 2:  # Only show significant factors
            explanation += f"- {factor['description']}\n"
    
    # Recommendations
    explanation += "\nRecommended Actions:\n"
    if risk_level == "critical":
        explanation += "- URGENT: Schedule emergency inspection\n"
        explanation += "- Consider immediate restrictions on use\n"
        explanation += "- Expedite repair/strengthening\n"
    elif risk_level == "high":
        explanation += "- Schedule detailed structural inspection\n"
        explanation += "- Prioritize maintenance work\n"
        explanation += "- Monitor condition closely\n"
    elif risk_level == "medium":
        explanation += "- Schedule routine inspection\n"
        explanation += "- Plan maintenance work\n"
        explanation += "- Monitor for changes\n"
    else:
        explanation += "- Continue routine monitoring\n"
        explanation += "- Schedule inspection per schedule\n"
    
    return explanation


@router.get("/asset/{asset_id}")
def calculate_asset_risk(
    asset_id: str = Path(...),
    db: Session = Depends(get_db)
):
    """Calculate and return risk for an asset"""
    
    asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    
    # Get recent inspections
    inspections = db.query(Inspection).filter(
        Inspection.asset_id == asset_id
    ).order_by(Inspection.inspection_date.desc()).limit(5).all()
    
    # Calculate risk
    risk_score, risk_factors = calculate_risk_score(asset, inspections)
    risk_level = get_risk_level(risk_score)
    
    # Generate explanation
    explanation = generate_risk_explanation(asset, risk_score, risk_factors)
    
    return {
        "asset_id": asset_id,
        "asset_name": asset.name,
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "confidence": 0.85,  # Placeholder
        "risk_factors": risk_factors,
        "explanation": explanation,
        "last_inspection_date": inspections[0].inspection_date.isoformat() if inspections else None,
        "calculated_at": datetime.utcnow().isoformat(),
    }


@router.post("/asset/{asset_id}/assess")
def save_risk_assessment(
    asset_id: str = Path(...),
    db: Session = Depends(get_db)
):
    """Calculate and save risk assessment for an asset"""
    
    asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    
    # Get recent inspections
    inspections = db.query(Inspection).filter(
        Inspection.asset_id == asset_id
    ).order_by(Inspection.inspection_date.desc()).limit(5).all()
    
    # Calculate risk
    risk_score, risk_factors = calculate_risk_score(asset, inspections)
    risk_level = get_risk_level(risk_score)
    
    # Generate explanation
    explanation = generate_risk_explanation(asset, risk_score, risk_factors)
    
    # Save assessment
    assessment_id = f"RSK-{uuid.uuid4().hex[:12].upper()}"
    
    assessment = RiskAssessment(
        id=assessment_id,
        asset_id=asset_id,
        risk_score=risk_score,
        risk_level=risk_level,
        risk_factors_json=risk_factors,
        risk_explanation=explanation,
        confidence_score=0.85,
        calculated_at=datetime.utcnow(),
        model_version="1.0",
    )
    
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    
    return {
        "assessment_id": assessment.id,
        "asset_id": asset_id,
        "risk_score": round(assessment.risk_score, 2),
        "risk_level": assessment.risk_level,
        "explanation": assessment.risk_explanation,
        "calculated_at": assessment.calculated_at.isoformat(),
    }


@router.get("/summary/high-risk")
def get_high_risk_summary(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get summary of highest risk assets"""
    
    assets = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.risk_level) == "high"
    ).order_by(InfrastructureAsset.risk_score.desc()).limit(limit).all()
    
    results = []
    for asset in assets:
        risk_level = "high"
        explanation = "Asset flagged as high-risk based on risk factors"
        results.append({
            "asset_id": asset.id,
            "asset_name": asset.name,
            "asset_type": asset.asset_type,
            "district": asset.district,
            "risk_score": float(asset.risk_score or 0),
            "risk_level": risk_level,
            "health_score": float(asset.health_score or 0),
            "explanation": explanation,
        })
    
    return {
        "total": len(results),
        "limit": limit,
        "high_risk_assets": results
    }


@router.get("/summary/critical")
def get_critical_risk_summary(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get summary of critical risk assets"""
    
    assets = db.query(InfrastructureAsset).filter(
        func.lower(InfrastructureAsset.risk_level) == "critical"
    ).order_by(InfrastructureAsset.risk_score.desc()).limit(limit).all()
    
    results = []
    for asset in assets:
        results.append({
            "asset_id": asset.id,
            "asset_name": asset.name,
            "asset_type": asset.asset_type,
            "district": asset.district,
            "risk_score": float(asset.risk_score or 0),
            "risk_level": "critical",
            "health_score": float(asset.health_score or 0),
            "urgent_action": "IMMEDIATE INSPECTION REQUIRED",
        })
    
    return {
        "total": len(results),
        "limit": limit,
        "critical_assets": results
    }


@router.get("/distribution")
def get_risk_distribution(db: Session = Depends(get_db)):
    """Get distribution of assets by risk level"""
    
    distribution = db.query(
        InfrastructureAsset.risk_level,
        func.count(InfrastructureAsset.id).label("count")
    ).group_by(InfrastructureAsset.risk_level).all()
    
    totals = {
        "low": 0,
        "medium": 0,
        "high": 0,
        "critical": 0,
    }
    
    for level, count in distribution:
        if level:
            key = level.lower()
            if key in totals:
                totals[key] = count
    
    total_assets = db.query(InfrastructureAsset).count()
    
    return {
        "total_assets": total_assets,
        "distribution": {
            "low": {"count": totals["low"], "percentage": (totals["low"] / total_assets * 100) if total_assets > 0 else 0},
            "medium": {"count": totals["medium"], "percentage": (totals["medium"] / total_assets * 100) if total_assets > 0 else 0},
            "high": {"count": totals["high"], "percentage": (totals["high"] / total_assets * 100) if total_assets > 0 else 0},
            "critical": {"count": totals["critical"], "percentage": (totals["critical"] / total_assets * 100) if total_assets > 0 else 0},
        }
    }
