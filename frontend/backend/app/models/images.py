from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, JSON
from datetime import datetime

from app.database.database import Base


class InspectionImage(Base):
    __tablename__ = "inspection_images"

    id = Column(String, primary_key=True)
    asset_id = Column(String, ForeignKey("infrastructure_assets.id"), nullable=False, index=True)
    inspection_id = Column(String, ForeignKey("inspections.id"), nullable=True, index=True)
    
    # File information
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=True)
    file_path = Column(String, nullable=False)  # Relative or safe path
    mime_type = Column(String, nullable=False)  # e.g., "image/jpeg"
    file_size = Column(Integer, nullable=False)  # Size in bytes
    
    # Image metadata
    image_width = Column(Integer, nullable=True)
    image_height = Column(Integer, nullable=True)
    orientation = Column(String, nullable=True)  # "landscape", "portrait"
    
    # Contextual information
    location_description = Column(String, nullable=True)  # Where on asset
    defect_type = Column(String, nullable=True)  # "crack", "corrosion", etc.
    severity = Column(String, nullable=True)  # "low", "medium", "high", "critical"
    
    # GPS
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    gps_accuracy = Column(Float, nullable=True)
    
    # Annotations/Analysis
    annotation_data = Column(JSON, nullable=True)  # e.g., detected defects, measurements
    ai_analysis = Column(JSON, nullable=True)  # Computer vision results
    
    # Audit
    uploaded_at = Column(DateTime, default=datetime.utcnow, index=True)
    uploaded_by = Column(String, nullable=True)
    
    # Validation
    is_validated = Column(String, default="No")  # "Yes" or "No"
    validation_notes = Column(Text, nullable=True)
