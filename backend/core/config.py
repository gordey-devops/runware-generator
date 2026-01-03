"""Configuration management using Pydantic Settings."""

from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Runware API Configuration
    runware_api_key: str

    # Storage Configuration
    storage_path: Path = Path("./generated")

    # Server Configuration
    host: str = "127.0.0.1"
    port: int = 8000

    # Database Configuration
    database_url: str = "sqlite:///./runware_generator.db"

    # Redis Configuration
    redis_url: str = "redis://localhost:6379/0"
    redis_max_connections: int = 20
    cache_ttl: int = 3600

    # PostgreSQL Configuration (optional, for production)
    postgres_url: Optional[str] = None

    # CORS Configuration - Allow all localhost ports for development
    cors_origins: list[str] = ["*"]  # Allow all origins in development

    # Generation Settings
    default_image_width: int = 512
    default_image_height: int = 512
    default_steps: int = 25
    default_guidance_scale: float = 7.5
    max_concurrent_generations: int = 3

    def __init__(self, **kwargs):
        """Initialize settings and create storage directory if needed."""
        super().__init__(**kwargs)
        self.storage_path.mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()
