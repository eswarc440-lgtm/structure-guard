from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, JSON
from datetime import datetime

from app.database.database import Base


class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(String, primary_key=True)
    asset_id = Column(String, ForeignKey("infrastructure_assets.id"), nullable=False, index=True)
    
    # Maintenance record metadata
    maintenance_type = Column(String, nullable=False, index=True)  # e.g., "preventive", "corrective", "emergency"
    description = Column(Text, nullable=False)
    priority = Column(String, nullable=False)  # "low", "medium", "high", "urgent"
    status = Column(String, nullable=False, index=True)  # "planned", "in_progress", "completed", "overdue"
    
    # Scheduling
    planned_start_date = Column(DateTime, nullable=True)
    planned_end_date = Column(DateTime, nullable=True)
    actual_start_date = Column(DateTime, nullable=True)
    actual_completion_date = Column(DateTime, nullable=True)
    
    # Cost tracking
    estimated_cost = Column(Float, nullable=True)
    actual_cost = Column(Float, nullable=True)
    currency = Column(String, default="INR")
    
    # Personnel
    assigned_contractor = Column(String, nullable=True)
    assigned_team = Column(String, nullable=True)
    supervisor = Column(String, nullable=True)
    
    # Details
    work_order_id = Column(String, nullable=True)
    completion_remarks = Column(Text, nullable=True)
    
    # Audit
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)
    updated_by = Column(String, nullable=True)
    
    # Optional structured data
    additional_data = Column(JSON, nullable=True)


class MaintenanceActivity(Base):
    __tablename__ = "maintenance_activities"

    id = Column(String, primary_key=True)
    maintenance_id = Column(String, ForeignKey("maintenance.id"), nullable=False, index=True)
    asset_id = Column(String, ForeignKey("infrastructure_assets.id"), nullable=False)
    
    # Activity log
    activity_date = Column(DateTime, nullable=False)
    activity_type = Column(String, nullable=False)  # e.g., "inspection", "repair", "replacement"
    description = Column(Text, nullable=True)
    
    # Resources
    personnel_involved = Column(Integer, nullable=True)
    equipment_used = Column(String, nullable=True)
    materials_used = Column(Text, nullable=True)
    
    # Results
    quantity_completed = Column(Float, nullable=True)
    unit = Column(String, nullable=True)  # e.g., "meter", "square meter"
    
    # Photos
    photos_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, nullable=True)
