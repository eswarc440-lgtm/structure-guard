from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import uuid

from app.database.database import get_db
from app.models.maintenance import Maintenance, MaintenanceActivity
from app.models.infrastructure import InfrastructureAsset

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


# ========================
# MAINTENANCE CRUD
# ========================

@router.post("")
def create_maintenance(
    asset_id: str = Query(...),
    maintenance_type: str = Query(...),
    description: str = Query(...),
    priority: str = Query(...),
    status: str = Query("planned"),
    estimated_cost: float = Query(None),
    planned_start_date: str = Query(None),
    planned_end_date: str = Query(None),
    assigned_contractor: str = Query(None),
    assigned_team: str = Query(None),
    db: Session = Depends(get_db)
):
    """Create new maintenance record"""
    
    # Verify asset exists
    asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    
    maintenance_id = f"MNT-{uuid.uuid4().hex[:12].upper()}"
    
    maintenance = Maintenance(
        id=maintenance_id,
        asset_id=asset_id,
        maintenance_type=maintenance_type,
        description=description,
        priority=priority,
        status=status,
        estimated_cost=estimated_cost,
        planned_start_date=datetime.fromisoformat(planned_start_date) if planned_start_date else None,
        planned_end_date=datetime.fromisoformat(planned_end_date) if planned_end_date else None,
        assigned_contractor=assigned_contractor,
        assigned_team=assigned_team,
    )
    
    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)
    
    return {
        "id": maintenance.id,
        "asset_id": maintenance.asset_id,
        "maintenance_type": maintenance.maintenance_type,
        "description": maintenance.description,
        "priority": maintenance.priority,
        "status": maintenance.status,
        "estimated_cost": maintenance.estimated_cost,
        "planned_start_date": maintenance.planned_start_date.isoformat() if maintenance.planned_start_date else None,
        "planned_end_date": maintenance.planned_end_date.isoformat() if maintenance.planned_end_date else None,
        "assigned_contractor": maintenance.assigned_contractor,
        "assigned_team": maintenance.assigned_team,
        "created_at": maintenance.created_at.isoformat(),
    }


@router.get("/{asset_id}")
def get_asset_maintenance(
    asset_id: str = Path(...),
    status: str = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get maintenance history for an asset"""
    
    # Verify asset exists
    asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    
    query = db.query(Maintenance).filter(Maintenance.asset_id == asset_id)
    
    if status:
        query = query.filter(func.lower(Maintenance.status) == func.lower(status))
    
    total = query.count()
    records = query.order_by(Maintenance.created_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "asset_id": asset_id,
        "total": total,
        "limit": limit,
        "offset": offset,
        "maintenance": [
            {
                "id": m.id,
                "maintenance_type": m.maintenance_type,
                "description": m.description,
                "priority": m.priority,
                "status": m.status,
                "estimated_cost": m.estimated_cost,
                "actual_cost": m.actual_cost,
                "planned_start_date": m.planned_start_date.isoformat() if m.planned_start_date else None,
                "planned_end_date": m.planned_end_date.isoformat() if m.planned_end_date else None,
                "actual_start_date": m.actual_start_date.isoformat() if m.actual_start_date else None,
                "actual_completion_date": m.actual_completion_date.isoformat() if m.actual_completion_date else None,
                "assigned_contractor": m.assigned_contractor,
                "assigned_team": m.assigned_team,
                "created_at": m.created_at.isoformat(),
            }
            for m in records
        ]
    }


@router.get("/detail/{maintenance_id}")
def get_maintenance_detail(
    maintenance_id: str = Path(...),
    db: Session = Depends(get_db)
):
    """Get detailed maintenance record"""
    
    maintenance = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    # Get associated activities
    activities = db.query(MaintenanceActivity).filter(
        MaintenanceActivity.maintenance_id == maintenance_id
    ).order_by(MaintenanceActivity.activity_date.desc()).all()
    
    return {
        "id": maintenance.id,
        "asset_id": maintenance.asset_id,
        "maintenance_type": maintenance.maintenance_type,
        "description": maintenance.description,
        "priority": maintenance.priority,
        "status": maintenance.status,
        "estimated_cost": maintenance.estimated_cost,
        "actual_cost": maintenance.actual_cost,
        "planned_start_date": maintenance.planned_start_date.isoformat() if maintenance.planned_start_date else None,
        "planned_end_date": maintenance.planned_end_date.isoformat() if maintenance.planned_end_date else None,
        "actual_start_date": maintenance.actual_start_date.isoformat() if maintenance.actual_start_date else None,
        "actual_completion_date": maintenance.actual_completion_date.isoformat() if maintenance.actual_completion_date else None,
        "assigned_contractor": maintenance.assigned_contractor,
        "assigned_team": maintenance.assigned_team,
        "supervisor": maintenance.supervisor,
        "completion_remarks": maintenance.completion_remarks,
        "activities": [
            {
                "id": a.id,
                "activity_date": a.activity_date.isoformat(),
                "activity_type": a.activity_type,
                "description": a.description,
                "quantity_completed": a.quantity_completed,
                "unit": a.unit,
                "personnel_involved": a.personnel_involved,
            }
            for a in activities
        ],
        "created_at": maintenance.created_at.isoformat(),
    }


@router.put("/{maintenance_id}")
def update_maintenance(
    maintenance_id: str = Path(...),
    status: str = Query(None),
    actual_start_date: str = Query(None),
    actual_completion_date: str = Query(None),
    actual_cost: float = Query(None),
    completion_remarks: str = Query(None),
    db: Session = Depends(get_db)
):
    """Update maintenance record"""
    
    maintenance = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    if status:
        maintenance.status = status
    if actual_start_date:
        maintenance.actual_start_date = datetime.fromisoformat(actual_start_date)
    if actual_completion_date:
        maintenance.actual_completion_date = datetime.fromisoformat(actual_completion_date)
    if actual_cost is not None:
        maintenance.actual_cost = actual_cost
    if completion_remarks:
        maintenance.completion_remarks = completion_remarks
    
    maintenance.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(maintenance)
    
    return {"message": "Maintenance record updated", "id": maintenance.id}


@router.delete("/{maintenance_id}")
def delete_maintenance(
    maintenance_id: str = Path(...),
    db: Session = Depends(get_db)
):
    """Delete maintenance record"""
    
    maintenance = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    # Delete associated activities
    db.query(MaintenanceActivity).filter(MaintenanceActivity.maintenance_id == maintenance_id).delete()
    
    db.delete(maintenance)
    db.commit()
    
    return {"message": "Maintenance record deleted"}


# ========================
# MAINTENANCE ACTIVITIES
# ========================

@router.post("/{maintenance_id}/activities")
def add_activity(
    maintenance_id: str = Path(...),
    activity_type: str = Query(...),
    description: str = Query(None),
    activity_date: str = Query(None),
    personnel_involved: int = Query(None),
    equipment_used: str = Query(None),
    materials_used: str = Query(None),
    quantity_completed: float = Query(None),
    unit: str = Query(None),
    db: Session = Depends(get_db)
):
    """Add activity to maintenance record"""
    
    maintenance = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    activity_id = f"ACT-{uuid.uuid4().hex[:12].upper()}"
    
    activity = MaintenanceActivity(
        id=activity_id,
        maintenance_id=maintenance_id,
        asset_id=maintenance.asset_id,
        activity_date=datetime.fromisoformat(activity_date) if activity_date else datetime.utcnow(),
        activity_type=activity_type,
        description=description,
        personnel_involved=personnel_involved,
        equipment_used=equipment_used,
        materials_used=materials_used,
        quantity_completed=quantity_completed,
        unit=unit,
    )
    
    db.add(activity)
    db.commit()
    db.refresh(activity)
    
    return {
        "id": activity.id,
        "maintenance_id": activity.maintenance_id,
        "activity_type": activity.activity_type,
        "description": activity.description,
        "activity_date": activity.activity_date.isoformat(),
    }


# ========================
# MAINTENANCE SUMMARY
# ========================

@router.get("")
def list_maintenance(
    status: str = Query(None),
    priority: str = Query(None),
    district: str = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get maintenance records"""
    
    query = db.query(Maintenance).join(InfrastructureAsset)
    
    if status:
        query = query.filter(func.lower(Maintenance.status) == func.lower(status))
    if priority:
        query = query.filter(func.lower(Maintenance.priority) == func.lower(priority))
    if district:
        query = query.filter(func.lower(InfrastructureAsset.district) == func.lower(district))
    
    total = query.count()
    records = query.order_by(Maintenance.created_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "maintenance": [
            {
                "id": m.id,
                "asset_id": m.asset_id,
                "maintenance_type": m.maintenance_type,
                "priority": m.priority,
                "status": m.status,
                "estimated_cost": m.estimated_cost,
                "planned_start_date": m.planned_start_date.isoformat() if m.planned_start_date else None,
                "created_at": m.created_at.isoformat(),
            }
            for m in records
        ]
    }


@router.get("/summary/overview")
def maintenance_overview(db: Session = Depends(get_db)):
    """Get maintenance overview statistics"""
    
    total = db.query(Maintenance).count()
    planned = db.query(Maintenance).filter(Maintenance.status == "planned").count()
    in_progress = db.query(Maintenance).filter(Maintenance.status == "in_progress").count()
    completed = db.query(Maintenance).filter(Maintenance.status == "completed").count()
    overdue = db.query(Maintenance).filter(Maintenance.status == "overdue").count()
    
    high_priority = db.query(Maintenance).filter(Maintenance.priority == "high").count()
    urgent = db.query(Maintenance).filter(Maintenance.priority == "urgent").count()
    
    total_estimated_cost = db.query(func.sum(Maintenance.estimated_cost)).scalar() or 0
    total_actual_cost = db.query(func.sum(Maintenance.actual_cost)).scalar() or 0
    
    return {
        "total": total,
        "status": {
            "planned": planned,
            "in_progress": in_progress,
            "completed": completed,
            "overdue": overdue,
        },
        "priority": {
            "high": high_priority,
            "urgent": urgent,
        },
        "costs": {
            "total_estimated": float(total_estimated_cost),
            "total_actual": float(total_actual_cost),
        }
    }
