from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import Engine
import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Get settings with environment variables
settings = get_settings()

# Ensure DATABASE_URL uses psycopg2 driver if not specified
database_url = settings.database_url
if not database_url.startswith("postgresql+psycopg2://"):
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+psycopg2://")

engine = create_engine(
    database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


@event.listens_for(Engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Log database connection events"""
    logger.debug("Database connection established")


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()