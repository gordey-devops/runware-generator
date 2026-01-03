"""Database models for storing generation history."""

from datetime import datetime
from typing import Optional

from sqlalchemy import JSON, create_engine, Column, Integer, String, DateTime, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from backend.core.config import settings

Base = declarative_base()

# Async PostgreSQL pool (optional, for production)
asyncpg_pool: Optional[object] = None


async def init_asyncpg_pool():
    """Initialize asyncpg connection pool if postgres_url is configured."""
    global asyncpg_pool
    if settings.postgres_url:
        try:
            import asyncpg
            asyncpg_pool = await asyncpg.create_pool(
                settings.postgres_url,
                min_size=5,
                max_size=20,
                command_timeout=60,
            )
            return True
        except Exception as e:
            print(f"Failed to initialize asyncpg pool: {e}")
            return False
    return False


async def close_asyncpg_pool():
    """Close asyncpg connection pool."""
    global asyncpg_pool
    if asyncpg_pool:
        await asyncpg_pool.close()
        asyncpg_pool = None


class Generation(Base):
    """Model for storing image/video generation history."""

    __tablename__ = "generations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Generation Type
    generation_type = Column(String, nullable=False)  # 'text-to-image', 'image-to-image', 'text-to-video', etc.

    # Prompt Information
    prompt = Column(String, nullable=False)
    negative_prompt = Column(String, nullable=True)

    # Generation Parameters (stored as JSON for flexibility)
    parameters = Column(JSON, nullable=False)

    # Output Information
    output_path = Column(String, nullable=False)
    output_url = Column(String, nullable=True)

    # Metadata
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    steps = Column(Integer, nullable=True)
    guidance_scale = Column(Float, nullable=True)
    seed = Column(Integer, nullable=True)
    model_name = Column(String, nullable=True)

    # Status and Timing
    status = Column(String, default="pending")  # 'pending', 'processing', 'completed', 'failed'
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    processing_time = Column(Float, nullable=True)  # in seconds

    # User-added metadata
    tags = Column(JSON, nullable=True)  # List of tags
    favorite = Column(Boolean, default=False)
    notes = Column(String, nullable=True)

    def __repr__(self):
        """String representation of Generation."""
        return f"<Generation(id={self.id}, type={self.generation_type}, status={self.status})>"


# Database engine and session
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database by creating all tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """
    Database session dependency for FastAPI.

    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
