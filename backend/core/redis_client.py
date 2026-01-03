"""Async Redis client singleton for caching and queue management."""

import asyncio
import logging
from typing import Optional

import redis.asyncio as aioredis

from backend.core.config import settings

logger = logging.getLogger(__name__)


class RedisClient:
    """Singleton async Redis client with connection pool."""

    _instance: Optional["RedisClient"] = None
    _pool: Optional[aioredis.ConnectionPool] = None
    _client: Optional[aioredis.Redis] = None
    _lock = asyncio.Lock()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self):
        """Initialize Redis connection pool."""
        if self._client is not None:
            return

        async with self._lock:
            if self._client is not None:
                return

            try:
                self._pool = aioredis.ConnectionPool.from_url(
                    settings.redis_url,
                    max_connections=settings.redis_max_connections,
                    decode_responses=True,
                )
                self._client = aioredis.Redis(connection_pool=self._pool)

                await self._client.ping()
                logger.info("Redis connection established")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                self._client = None
                raise

    async def close(self):
        """Close Redis connection pool."""
        if self._client:
            await self._client.close()
        if self._pool:
            await self._pool.disconnect()
        self._client = None
        self._pool = None
        logger.info("Redis connection closed")

    @property
    def client(self) -> aioredis.Redis:
        """Get Redis client instance."""
        if self._client is None:
            raise RuntimeError("Redis client not initialized. Call initialize() first.")
        return self._client

    async def health_check(self) -> bool:
        """Check if Redis connection is healthy."""
        try:
            if self._client:
                await self._client.ping()
                return True
            return False
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return False


# Global Redis client instance
redis_client = RedisClient()
