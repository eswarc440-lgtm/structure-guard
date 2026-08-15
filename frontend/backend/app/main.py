from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from sqlalchemy import text

from app.api import infrastructure
from app.api import analytics
from app.api import prediction
from app.api import major_infrastructure
from app.api import digital_twin
from app.api import dashboard
from app.api import assessments
from app.api import geocoding
from app.api import inspections
from app.api import maintenance
from app.api import images
from app.api import gis
from app.api import risk
from app.api import reports
from app.core.config import get_settings
from app.database.database import engine, Base

# Import all models to register them with Base
from app.models.infrastructure import InfrastructureAsset
from app.models.inspections import Inspection, InspectionFinding
from app.models.maintenance import Maintenance, MaintenanceActivity
from app.models.images import InspectionImage
from app.models.gis_and_analytics import District, Mandal, Village, GISLayer, RiskAssessment, MLModel, ModelPrediction

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create tables if the database is available; allow app import in local/dev environments
try:
    Base.metadata.create_all(bind=engine)
except Exception as exc:
    logger.warning(f"Database schema creation skipped during startup: {exc}")

app = FastAPI(
    title="Structure Guard API",
    description="AI-Powered Infrastructure Risk Monitoring and Digital Twin Backend",
    version="1.0.0",
)

# Configure CORS from environment
cors_origins = [origin.strip() for origin in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Health check endpoint that verifies basic service status"""
    try:
        from app.database.database import SessionLocal
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("Health check passed - database connection OK")
        return {
            "status": "healthy",
            "service": "Structure Guard API",
            "version": "1.0.0",
            "environment": settings.api_environment,
            "database": "connected",
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "service": "Structure Guard API",
            "version": "1.0.0",
            "environment": settings.api_environment,
            "database": "disconnected",
            "error": str(e),
        }


@app.get("/")
def root():
    return {
        "message": "Structure Guard API is running",
        "docs": "/docs",
        "health": "/health",
        "environment": settings.api_environment,
    }


app.include_router(
    infrastructure.router,
    prefix="/api/v1/infrastructure",
    tags=["Infrastructure"],
)

app.include_router(
    dashboard.router,
    prefix="/api/v1",
    tags=["Dashboard"],
)

app.include_router(
    major_infrastructure.router,
    prefix="/api/v1",
    tags=["Major Infrastructure"],
)

app.include_router(
    prediction.router,
    prefix="/api/v1",
    tags=["Predictions"],
)

app.include_router(
    analytics.router,
    prefix="/api/v1/analytics",
    tags=["Analytics"],
)

app.include_router(
    assessments.router,
    tags=["Assessments"],
)

app.include_router(
    digital_twin.router,
    prefix="/api/v1",
    tags=["Digital Twin"],
)

app.include_router(
    geocoding.router,
    prefix="/api/v1/geocoding",
    tags=["Geocoding"],
)

app.include_router(
    inspections.router,
    prefix="/api/v1",
    tags=["Inspections"],
)

app.include_router(
    maintenance.router,
    prefix="/api/v1",
    tags=["Maintenance"],
)

app.include_router(
    images.router,
    prefix="/api/v1",
    tags=["Images"],
)

app.include_router(
    gis.router,
    prefix="/api/v1",
    tags=["GIS"],
)

app.include_router(
    risk.router,
    prefix="/api/v1",
    tags=["Risk"],
)

app.include_router(
    reports.router,
    tags=["Reports"],
)
