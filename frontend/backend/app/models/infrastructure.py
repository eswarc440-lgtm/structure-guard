from sqlalchemy import Column, String, Integer, Float, Text
from geoalchemy2 import Geometry

from app.database.database import Base


class InfrastructureAsset(Base):
    __tablename__ = "infrastructure_assets"

    id = Column(String, primary_key=True)
    name = Column(Text, nullable=False)
    asset_type = Column(String)
    location = Column(Text)

    district = Column(String)
    mandal = Column(String)

    latitude = Column(Float)
    longitude = Column(Float)

    built_year = Column(Integer)
    design_life = Column(Integer)

    condition = Column(String)

    health_score = Column(Float)
    risk_level = Column(String)
    risk_score = Column(Float)
    remaining_useful_life = Column(Float)

    owner = Column(Text)
    material = Column(Text)
    status = Column(String)

    source = Column(String)
    source_id = Column(Text)

    elevation_m = Column(Float, nullable=True)
    slope_deg = Column(Float, nullable=True)
    flood_risk_value = Column(Float, nullable=True)
    rainfall_mm = Column(Float, nullable=True)
    temperature_c = Column(Float, nullable=True)
    wind_speed_ms = Column(Float, nullable=True)
    land_use = Column(String, nullable=True)
    remaining_life = Column(Float, nullable=True)

    geometry = Column(
        Geometry(
            geometry_type="GEOMETRY",
            srid=4326
        )
    )