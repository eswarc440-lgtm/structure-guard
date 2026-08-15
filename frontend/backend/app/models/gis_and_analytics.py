from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, JSON, LargeBinary
from geoalchemy2 import Geometry
from datetime import datetime

from app.database.database import Base


class District(Base):
    __tablename__ = "districts"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, unique=True, index=True)
    state = Column(String, default="Andhra Pradesh")
    region_code = Column(String, nullable=True)
    
    # Geometry
    geometry = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)
    
    # Administrative info
    headquarters = Column(String, nullable=True)
    population = Column(Integer, nullable=True)
    area_sq_km = Column(Float, nullable=True)
    
    # Infrastructure statistics
    total_assets = Column(Integer, default=0)
    high_risk_count = Column(Integer, default=0)
    medium_risk_count = Column(Integer, default=0)
    low_risk_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Mandal(Base):
    __tablename__ = "mandals"

    id = Column(String, primary_key=True)
    district_id = Column(String, ForeignKey("districts.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    
    # Geometry
    geometry = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)
    
    # Administrative info
    headquarters = Column(String, nullable=True)
    population = Column(Integer, nullable=True)
    area_sq_km = Column(Float, nullable=True)
    
    # Infrastructure statistics
    total_assets = Column(Integer, default=0)
    high_risk_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class Village(Base):
    __tablename__ = "villages"

    id = Column(String, primary_key=True)
    mandal_id = Column(String, ForeignKey("mandals.id"), nullable=False, index=True)
    district_id = Column(String, ForeignKey("districts.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    
    # Geometry
    geometry = Column(Geometry(geometry_type="POINT", srid=4326), nullable=True)
    
    # Administrative info
    population = Column(Integer, nullable=True)
    
    # Infrastructure statistics
    total_assets = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class GISLayer(Base):
    __tablename__ = "gis_layers"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    
    # Layer metadata
    layer_type = Column(String, nullable=False)  # "polygon", "linestring", "point", "multipolygon"
    geometry_type = Column(String, nullable=False)
    data_source = Column(String, nullable=True)  # e.g., "QGIS", "OSM", "Government"
    
    # Display settings
    style_json = Column(JSON, nullable=True)  # Styling for map display
    is_visible_by_default = Column(String, default="Yes")  # "Yes" or "No"
    opacity = Column(Float, default=0.8)
    
    # Data
    feature_count = Column(Integer, default=0)
    bbox = Column(String, nullable=True)  # "minlon,minlat,maxlon,maxlat"
    
    # Audit
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String, primary_key=True)
    asset_id = Column(String, ForeignKey("infrastructure_assets.id"), nullable=False, index=True)
    
    # Risk calculation
    risk_score = Column(Float, nullable=False)  # 0-100
    risk_level = Column(String, nullable=False, index=True)  # "low", "medium", "high", "critical"
    
    # Risk factors
    condition_factor = Column(Float, nullable=True)  # Weighted score
    age_factor = Column(Float, nullable=True)
    maintenance_factor = Column(Float, nullable=True)
    environmental_factor = Column(Float, nullable=True)
    usage_factor = Column(Float, nullable=True)
    
    # Risk breakdown
    risk_factors_json = Column(JSON, nullable=True)  # Detailed factors breakdown
    risk_explanation = Column(Text, nullable=True)  # Human-readable explanation
    
    # Confidence
    confidence_score = Column(Float, nullable=True)  # 0-1
    confidence_notes = Column(Text, nullable=True)
    
    # Recommendations
    recommended_actions = Column(JSON, nullable=True)  # List of recommendations
    priority_action = Column(String, nullable=True)  # Most urgent action
    
    # Audit
    calculated_at = Column(DateTime, default=datetime.utcnow, index=True)
    calculated_by = Column(String, nullable=True)
    model_version = Column(String, nullable=True)
    
    # Validity
    valid_until = Column(DateTime, nullable=True)  # Risk assessment expiration


class MLModel(Base):
    __tablename__ = "ml_models"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, index=True)
    model_type = Column(String, nullable=False)  # "condition_prediction", "risk_prediction", "defect_detection"
    version = Column(String, nullable=False)
    
    # Model details
    description = Column(Text, nullable=True)
    framework = Column(String, nullable=True)  # "sklearn", "tensorflow", "pytorch"
    algorithm = Column(String, nullable=True)  # "random_forest", "xgboost", "cnn"
    
    # Training metadata
    training_date = Column(DateTime, nullable=False)
    dataset_version = Column(String, nullable=True)
    training_rows = Column(Integer, nullable=True)
    
    # Performance metrics
    metrics_json = Column(JSON, nullable=True)  # {"r2": 0.85, "mae": 5.2, "rmse": 6.1}
    validation_accuracy = Column(Float, nullable=True)  # 0-1
    test_accuracy = Column(Float, nullable=True)
    
    # Artifact
    artifact_path = Column(String, nullable=True)  # Path to model file
    artifact_size_mb = Column(Float, nullable=True)
    
    # Status
    status = Column(String, default="active")  # "active", "deprecated", "training", "failed"
    is_production = Column(String, default="No")  # "Yes" or "No"
    
    # Features
    features_json = Column(JSON, nullable=True)  # List of input features
    target_variable = Column(String, nullable=True)  # Output target
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)


class ModelPrediction(Base):
    __tablename__ = "model_predictions"

    id = Column(String, primary_key=True)
    asset_id = Column(String, ForeignKey("infrastructure_assets.id"), nullable=False, index=True)
    model_id = Column(String, ForeignKey("ml_models.id"), nullable=False, index=True)
    
    # Prediction
    prediction_value = Column(Float, nullable=False)
    prediction_label = Column(String, nullable=True)  # e.g., "Good", "Fair", "Poor"
    confidence = Column(Float, nullable=True)  # 0-1
    
    # Input features
    features_json = Column(JSON, nullable=True)
    
    # Target period
    target_date = Column(DateTime, nullable=True)  # For future predictions
    forecast_horizon_months = Column(Integer, nullable=True)
    
    # Status
    is_valid = Column(String, default="Yes")
    validity_notes = Column(Text, nullable=True)
    
    # Audit
    predicted_at = Column(DateTime, default=datetime.utcnow, index=True)
    predicted_by = Column(String, nullable=True)
