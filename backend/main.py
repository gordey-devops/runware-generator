"""Main entry point for the Runware Generator backend."""

import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.config import settings
from backend.core.redis_client import redis_client
from backend.models.database import init_db
from backend.services.runware_service import runware_service
from backend.services.cache_service import cache_service
from backend.services.queue_service import queue_service
from backend.services.pubsub_service import pubsub_service
from backend.api.endpoints import generate
from backend.middleware.rate_limiter import RateLimiterMiddleware
from pydantic import BaseModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application.

    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting Runware Generator Backend...")

    # Initialize database
    logger.info("Initializing database...")
    init_db()

    # Initialize Redis client
    logger.info("Connecting to Redis...")
    await redis_client.initialize()

    # Initialize cache service
    logger.info("Initializing cache service...")
    await cache_service.initialize()

    # Initialize queue service
    logger.info("Initializing queue service...")
    await queue_service.initialize()

    # Initialize Pub/Sub service
    logger.info("Initializing Pub/Sub service...")

    # Initialize Runware service
    logger.info("Connecting to Runware service...")
    await runware_service.initialize()

    logger.info("Backend startup complete!")

    yield

    # Shutdown
    logger.info("Shutting down Runware Generator Backend...")
    await pubsub_service.cleanup()
    await runware_service.close()
    await redis_client.close()
    logger.info("Backend shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Runware Generator API",
    description="Backend API for Runware image and video generation",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.add_middleware(
    RateLimiterMiddleware,
    requests_per_minute=60,
    requests_per_hour=1000,
)

# Include routers
app.include_router(generate.router)


# WebSocket connection manager
class ConnectionManager:
    """Manages WebSocket connections for real-time updates."""

    def __init__(self):
        """Initialize connection manager."""
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, generation_id: int):
        """
        Accept and store WebSocket connection.

        Args:
            websocket: WebSocket connection
            generation_id: Generation ID to track
        """
        await websocket.accept()
        self.active_connections[generation_id] = websocket
        logger.info(f"WebSocket connected for generation {generation_id}")

    def disconnect(self, generation_id: int):
        """
        Remove WebSocket connection.

        Args:
            generation_id: Generation ID
        """
        if generation_id in self.active_connections:
            del self.active_connections[generation_id]
            logger.info(f"WebSocket disconnected for generation {generation_id}")

    async def send_progress(self, generation_id: int, progress: float, message: str):
        """
        Send progress update to client.

        Args:
            generation_id: Generation ID
            progress: Progress percentage (0-100)
            message: Status message
        """
        if generation_id in self.active_connections:
            websocket = self.active_connections[generation_id]
            try:
                await websocket.send_json({
                    "type": "progress",
                    "generation_id": generation_id,
                    "progress": progress,
                    "message": message,
                })
            except Exception as e:
                logger.error(f"Failed to send progress for generation {generation_id}: {e}")
                self.disconnect(generation_id)

    async def send_complete(self, generation_id: int, data: dict):
        """
        Send completion notification to client.

        Args:
            generation_id: Generation ID
            data: Result data
        """
        if generation_id in self.active_connections:
            websocket = self.active_connections[generation_id]
            try:
                await websocket.send_json({
                    "type": "complete",
                    "generation_id": generation_id,
                    "data": data,
                })
            except Exception as e:
                logger.error(f"Failed to send completion for generation {generation_id}: {e}")
            finally:
                self.disconnect(generation_id)

    async def send_error(self, generation_id: int, error: str):
        """
        Send error notification to client.

        Args:
            generation_id: Generation ID
            error: Error message
        """
        if generation_id in self.active_connections:
            websocket = self.active_connections[generation_id]
            try:
                await websocket.send_json({
                    "type": "error",
                    "generation_id": generation_id,
                    "message": error,
                })
            except Exception as e:
                logger.error(f"Failed to send error for generation {generation_id}: {e}")
            finally:
                self.disconnect(generation_id)


# Global manager instance for access from other modules
manager = ConnectionManager()


@app.websocket("/ws/generation/{generation_id}")
async def websocket_endpoint(websocket: WebSocket, generation_id: int):
    """
    WebSocket endpoint for real-time generation progress updates.

    Args:
        websocket: WebSocket connection
        generation_id: ID of generation to track
    """
    await manager.connect(websocket, generation_id)
    try:
        while True:
            # Keep connection alive, waiting for client messages
            data = await websocket.receive_text()
            # Echo back for heartbeat
            await websocket.send_json({"type": "heartbeat", "message": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(generation_id)
        logger.info(f"Client disconnected from generation {generation_id}")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Runware Generator API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


class UpdateApiKeyRequest(BaseModel):
    """Request model for updating API key."""
    apiKey: str

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "runware_connected": runware_service._initialized,
    }

@app.post("/settings/api-key")
async def update_api_key(request: UpdateApiKeyRequest):
    """Update Runware API key."""
    try:
        # Update environment variable
        import os
        os.environ['RUNWARE_API_KEY'] = request.apiKey

        # Update runware service
        await runware_service.update_api_key(request.apiKey)

        logger.info("API key updated successfully")
        return {"success": True}
    except Exception as e:
        logger.error(f"Failed to update API key: {str(e)}")
        return {"success": False, "error": str(e)}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler.

    Args:
        request: Request object
        exc: Exception

    Returns:
        JSON error response
    """
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred",
            "details": str(exc) if settings.host == "127.0.0.1" else None,
        },
    )


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting server on {settings.host}:{settings.port}")
    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        reload=False,
        log_level="info",
    )
