from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api import infrastructure
from app.api import analytics
from app.api import prediction
from app.api import major_infrastructure
from app.api import digital_twin
from app.core.config import get_settings
from app.database.database import engine, Base

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create tables
Base.metadata.create_all(bind=engine)

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
        db.execute("SELECT 1")
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
    prefix="/analytics",
    tags=["Analytics"],
)

app.include_router(
    digital_twin.router,
    prefix="/api",
    tags=["Digital Twin"],
)
