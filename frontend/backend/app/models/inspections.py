from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, JSON
from datetime import datetime

from app.database.database import Base


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(String, primary_key=True)
    asset_id = Column(String, ForeignKey("infrastructure_assets.id"), nullable=False, index=True)
    
    # Inspection metadata
    inspection_date = Column(DateTime, nullable=False, index=True)
    inspection_type = Column(String, nullable=False)  # e.g., "routine", "special", "emergency"
    inspector_name = Column(String, nullable=True)
    remarks = Column(Text, nullable=True)
    
    # Condition scores (0-100)
    condition_score = Column(Float, nullable=True)  # Overall condition
    crack_score = Column(Float, nullable=True)  # Crack severity
    corrosion_score = Column(Float, nullable=True)  # Corrosion severity
    spalling_score = Column(Float, nullable=True)  # Spalling severity
    deformation_score = Column(Float, nullable=True)  # Deformation severity
    water_damage_score = Column(Float, nullable=True)  # Water damage
    joint_condition_score = Column(Float, nullable=True)  # Joint condition
    bearing_condition_score = Column(Float, nullable=True)  # Bearing condition
    
    # Additional metadata
    photos_count = Column(Integer, default=0)
    video_recorded = Column(String, default="No")  # "Yes" or "No"
    gps_coordinates = Column(String, nullable=True)  # "lat,lon" format
    
    # Audit
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)
    
    # Optional structured data
    additional_data = Column(JSON, nullable=True)


class InspectionFinding(Base):
    __tablename__ = "inspection_findings"

    id = Column(String, primary_key=True)
    inspection_id = Column(String, ForeignKey("inspections.id"), nullable=False, index=True)
    asset_id = Column(String, ForeignKey("infrastructure_assets.id"), nullable=False)
    
    # Finding details
    finding_type = Column(String, nullable=False)  # e.g., "crack", "corrosion", "spalling"
    severity = Column(String, nullable=False)  # "low", "medium", "high", "critical"
    location = Column(String, nullable=True)  # Where on asset
    description = Column(Text, nullable=True)
    
    # Recommended action
    recommended_action = Column(Text, nullable=True)
    action_priority = Column(String, nullable=True)  # "low", "medium", "high", "urgent"
    
    # Photo reference
    photo_id = Column(String, ForeignKey("inspection_images.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
