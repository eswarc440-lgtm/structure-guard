from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import uuid

from app.database.database import get_db
from app.models.inspections import Inspection, InspectionFinding
from app.models.infrastructure import InfrastructureAsset

router = APIRouter(prefix="/inspections", tags=["Inspections"])


# ========================
# INSPECTION CRUD
# ========================

@router.post("")
def create_inspection(
    asset_id: str = Query(...),
    inspection_type: str = Query(...),
    inspector_name: str = Query(None),
    inspection_date: str = Query(None),
    condition_score: float = Query(None),
    crack_score: float = Query(None),
    corrosion_score: float = Query(None),
    spalling_score: float = Query(None),
    deformation_score: float = Query(None),
    water_damage_score: float = Query(None),
    joint_condition_score: float = Query(None),
    bearing_condition_score: float = Query(None),
    remarks: str = Query(None),
    db: Session = Depends(get_db)
):
    """Create new inspection record"""
    
    # Verify asset exists
    asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    
    inspection_id = f"INS-{uuid.uuid4().hex[:12].upper()}"
    
    inspection = Inspection(
        id=inspection_id,
        asset_id=asset_id,
        inspection_type=inspection_type,
        inspection_date=datetime.fromisoformat(inspection_date) if inspection_date else datetime.utcnow(),
        inspector_name=inspector_name,
        condition_score=condition_score,
        crack_score=crack_score,
        corrosion_score=corrosion_score,
        spalling_score=spalling_score,
        deformation_score=deformation_score,
        water_damage_score=water_damage_score,
        joint_condition_score=joint_condition_score,
        bearing_condition_score=bearing_condition_score,
        remarks=remarks,
    )
    
    db.add(inspection)
    db.commit()
    db.refresh(inspection)
    
    return {
        "id": inspection.id,
        "asset_id": inspection.asset_id,
        "inspection_type": inspection.inspection_type,
        "inspection_date": inspection.inspection_date.isoformat(),
        "inspector_name": inspection.inspector_name,
        "condition_score": inspection.condition_score,
        "crack_score": inspection.crack_score,
        "corrosion_score": inspection.corrosion_score,
        "spalling_score": inspection.spalling_score,
        "deformation_score": inspection.deformation_score,
        "water_damage_score": inspection.water_damage_score,
        "joint_condition_score": inspection.joint_condition_score,
        "bearing_condition_score": inspection.bearing_condition_score,
        "remarks": inspection.remarks,
        "created_at": inspection.created_at.isoformat(),
    }


@router.get("/{asset_id}")
def get_asset_inspections(
    asset_id: str = Path(...),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get inspection history for an asset"""
    
    # Verify asset exists
    asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    
    total = db.query(Inspection).filter(Inspection.asset_id == asset_id).count()
    inspections = db.query(Inspection).filter(
        Inspection.asset_id == asset_id
    ).order_by(Inspection.inspection_date.desc()).offset(offset).limit(limit).all()
    
    return {
        "asset_id": asset_id,
        "total": total,
        "limit": limit,
        "offset": offset,
        "inspections": [
            {
                "id": i.id,
                "asset_id": i.asset_id,
                "inspection_type": i.inspection_type,
                "inspection_date": i.inspection_date.isoformat(),
                "inspector_name": i.inspector_name,
                "condition_score": i.condition_score,
                "crack_score": i.crack_score,
                "corrosion_score": i.corrosion_score,
                "spalling_score": i.spalling_score,
                "deformation_score": i.deformation_score,
                "water_damage_score": i.water_damage_score,
                "joint_condition_score": i.joint_condition_score,
                "bearing_condition_score": i.bearing_condition_score,
                "remarks": i.remarks,
                "photos_count": i.photos_count,
                "created_at": i.created_at.isoformat(),
            }
            for i in inspections
        ]
    }


@router.get("/detail/{inspection_id}")
def get_inspection_detail(
    inspection_id: str = Path(...),
    db: Session = Depends(get_db)
):
    """Get detailed inspection record"""
    
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    # Get associated findings
    findings = db.query(InspectionFinding).filter(
        InspectionFinding.inspection_id == inspection_id
    ).all()
    
    return {
        "id": inspection.id,
        "asset_id": inspection.asset_id,
        "inspection_type": inspection.inspection_type,
        "inspection_date": inspection.inspection_date.isoformat(),
        "inspector_name": inspection.inspector_name,
        "condition_score": inspection.condition_score,
        "crack_score": inspection.crack_score,
        "corrosion_score": inspection.corrosion_score,
        "spalling_score": inspection.spalling_score,
        "deformation_score": inspection.deformation_score,
        "water_damage_score": inspection.water_damage_score,
        "joint_condition_score": inspection.joint_condition_score,
        "bearing_condition_score": inspection.bearing_condition_score,
        "remarks": inspection.remarks,
        "photos_count": inspection.photos_count,
        "findings": [
            {
                "id": f.id,
                "finding_type": f.finding_type,
                "severity": f.severity,
                "location": f.location,
                "description": f.description,
                "recommended_action": f.recommended_action,
            }
            for f in findings
        ],
        "created_at": inspection.created_at.isoformat(),
    }


@router.put("/{inspection_id}")
def update_inspection(
    inspection_id: str = Path(...),
    condition_score: float = Query(None),
    crack_score: float = Query(None),
    corrosion_score: float = Query(None),
    spalling_score: float = Query(None),
    deformation_score: float = Query(None),
    water_damage_score: float = Query(None),
    joint_condition_score: float = Query(None),
    bearing_condition_score: float = Query(None),
    remarks: str = Query(None),
    db: Session = Depends(get_db)
):
    """Update inspection record"""
    
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    if condition_score is not None:
        inspection.condition_score = condition_score
    if crack_score is not None:
        inspection.crack_score = crack_score
    if corrosion_score is not None:
        inspection.corrosion_score = corrosion_score
    if spalling_score is not None:
        inspection.spalling_score = spalling_score
    if deformation_score is not None:
        inspection.deformation_score = deformation_score
    if water_damage_score is not None:
        inspection.water_damage_score = water_damage_score
    if joint_condition_score is not None:
        inspection.joint_condition_score = joint_condition_score
    if bearing_condition_score is not None:
        inspection.bearing_condition_score = bearing_condition_score
    if remarks is not None:
        inspection.remarks = remarks
    
    inspection.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(inspection)
    
    return {"message": "Inspection updated", "id": inspection.id}


@router.delete("/{inspection_id}")
def delete_inspection(
    inspection_id: str = Path(...),
    db: Session = Depends(get_db)
):
    """Delete inspection record"""
    
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    # Delete associated findings
    db.query(InspectionFinding).filter(InspectionFinding.inspection_id == inspection_id).delete()
    
    db.delete(inspection)
    db.commit()
    
    return {"message": "Inspection deleted"}


# ========================
# INSPECTION FINDINGS
# ========================

@router.post("/{inspection_id}/findings")
def add_finding(
    inspection_id: str = Path(...),
    finding_type: str = Query(...),
    severity: str = Query(...),
    location: str = Query(None),
    description: str = Query(None),
    recommended_action: str = Query(None),
    db: Session = Depends(get_db)
):
    """Add finding to inspection"""
    
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    finding_id = f"FND-{uuid.uuid4().hex[:12].upper()}"
    
    finding = InspectionFinding(
        id=finding_id,
        inspection_id=inspection_id,
        asset_id=inspection.asset_id,
        finding_type=finding_type,
        severity=severity,
        location=location,
        description=description,
        recommended_action=recommended_action,
    )
    
    db.add(finding)
    db.commit()
    db.refresh(finding)
    
    return {
        "id": finding.id,
        "finding_type": finding.finding_type,
        "severity": finding.severity,
        "location": finding.location,
        "description": finding.description,
        "recommended_action": finding.recommended_action,
    }


# ========================
# INSPECTION SUMMARY
# ========================

@router.get("")
def list_recent_inspections(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    asset_type: str = Query(None),
    district: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get recent inspections"""
    
    query = db.query(Inspection).join(InfrastructureAsset)
    
    if asset_type:
        query = query.filter(func.lower(InfrastructureAsset.asset_type) == func.lower(asset_type))
    if district:
        query = query.filter(func.lower(InfrastructureAsset.district) == func.lower(district))
    
    total = query.count()
    inspections = query.order_by(Inspection.inspection_date.desc()).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "inspections": [
            {
                "id": i.id,
                "asset_id": i.asset_id,
                "inspection_type": i.inspection_type,
                "inspection_date": i.inspection_date.isoformat(),
                "inspector_name": i.inspector_name,
                "condition_score": i.condition_score,
                "created_at": i.created_at.isoformat(),
            }
            for i in inspections
        ]
    }
