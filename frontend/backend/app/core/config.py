import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    database_url: str = "postgresql://structure_guard:structure_guard_dev@localhost:5433/structure_guard"
    postgres_user: str = "structure_guard"
    postgres_password: str = "structure_guard_dev"
    postgres_db: str = "structure_guard"
    postgres_host: str = "localhost"
    postgres_port: int = 5433
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_environment: str = "development"
    
    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173,http://localhost:8080,http://localhost:8081,http://localhost:8082,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:8081,http://127.0.0.1:8082"
    
    # ML Model
    ml_model_path: str = "app/ml/models/risk_model.joblib"
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    # Load from .env.development if in development environment
    env_file = ".env"
    if os.getenv("API_ENVIRONMENT") == "development" and os.path.exists(".env.development"):
        env_file = ".env.development"
    elif os.path.exists(".env"):
        env_file = ".env"
    
    settings = Settings(_env_file=env_file)
    return settings
