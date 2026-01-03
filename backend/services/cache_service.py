"""Cache service for storing generation results."""

import hashlib
import json
import logging
from typing import Any, Dict, Optional

from backend.core.config import settings
from backend.core.redis_client import redis_client

logger = logging.getLogger(__name__)


class CacheService:
    """Service for caching generation results."""

    def __init__(self):
        self._initialized = False

    async def initialize(self):
        """Initialize cache service."""
        if not self._initialized:
            await redis_client.initialize()
            self._initialized = True

    def _generate_cache_key(
        self,
        generation_type: str,
        prompt: str,
        params: Dict[str, Any],
    ) -> str:
        """Generate cache key from generation parameters."""
        param_str = json.dumps(params, sort_keys=True)
        key_data = f"{generation_type}:{prompt}:{param_str}"
        hash_value = hashlib.md5(key_data.encode()).hexdigest()
        return f"cache:generation:{generation_type}:{hash_value}"

    async def get(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached generation result."""
        try:
            client = redis_client.client
            cached_data = await client.get(cache_key)
            if cached_data:
                result = json.loads(cached_data)
                logger.info(f"Cache hit for key: {cache_key}")
                return result
            logger.debug(f"Cache miss for key: {cache_key}")
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None

    async def get_generation(
        self,
        generation_type: str,
        prompt: str,
        params: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Get cached generation by parameters."""
        cache_key = self._generate_cache_key(generation_type, prompt, params)
        return await self.get(cache_key)

    async def set(
        self,
        cache_key: str,
        value: Dict[str, Any],
        ttl: Optional[int] = None,
    ) -> bool:
        """Cache generation result."""
        try:
            client = redis_client.client
            cached_data = json.dumps(value)
            expiry = ttl or settings.cache_ttl
            await client.setex(cache_key, expiry, cached_data)
            logger.info(f"Cached result with TTL {expiry}s: {cache_key}")
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False

    async def set_generation(
        self,
        generation_type: str,
        prompt: str,
        params: Dict[str, Any],
        value: Dict[str, Any],
        ttl: Optional[int] = None,
    ) -> bool:
        """Cache generation result by parameters."""
        cache_key = self._generate_cache_key(generation_type, prompt, params)
        return await self.set(cache_key, value, ttl)

    async def delete(self, cache_key: str) -> bool:
        """Delete cached result."""
        try:
            client = redis_client.client
            result = await client.delete(cache_key)
            logger.info(f"Deleted cache key: {cache_key}")
            return result > 0
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False

    async def delete_by_type(self, generation_type: str) -> int:
        """Delete all cache entries for a generation type."""
        try:
            client = redis_client.client
            pattern = f"cache:generation:{generation_type}:*"
            keys = []
            async for key in client.scan_iter(match=pattern):
                keys.append(key)
            if keys:
                await client.delete(*keys)
            logger.info(f"Deleted {len(keys)} cache entries for type: {generation_type}")
            return len(keys)
        except Exception as e:
            logger.error(f"Cache delete by type error: {e}")
            return 0

    async def clear_all(self) -> int:
        """Clear all generation cache entries."""
        try:
            client = redis_client.client
            pattern = "cache:generation:*"
            keys = []
            async for key in client.scan_iter(match=pattern):
                keys.append(key)
            if keys:
                await client.delete(*keys)
            logger.info(f"Cleared {len(keys)} cache entries")
            return len(keys)
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return 0

    async def publish_progress(
        self,
        generation_id: int,
        progress: float,
        message: str,
    ) -> bool:
        """
        Publish progress update via Redis Pub/Sub.

        Args:
            generation_id: Generation ID
            progress: Progress percentage (0-100)
            message: Status message

        Returns:
            True if published successfully
        """
        try:
            client = redis_client.client
            channel = f"generation:progress:{generation_id}"
            payload = json.dumps({
                "type": "progress",
                "generation_id": generation_id,
                "progress": progress,
                "message": message,
                "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
            })
            await client.publish(channel, payload)
            return True
        except Exception as e:
            logger.error(f"Pub/Sub publish progress error: {e}")
            return False

    async def publish_complete(
        self,
        generation_id: int,
        data: dict,
    ) -> bool:
        """
        Publish completion notification via Redis Pub/Sub.

        Args:
            generation_id: Generation ID
            data: Result data

        Returns:
            True if published successfully
        """
        try:
            client = redis_client.client
            channel = f"generation:progress:{generation_id}"
            payload = json.dumps({
                "type": "complete",
                "generation_id": generation_id,
                "data": data,
                "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
            })
            await client.publish(channel, payload)
            return True
        except Exception as e:
            logger.error(f"Pub/Sub publish complete error: {e}")
            return False

    async def publish_error(
        self,
        generation_id: int,
        error: str,
    ) -> bool:
        """
        Publish error notification via Redis Pub/Sub.

        Args:
            generation_id: Generation ID
            error: Error message

        Returns:
            True if published successfully
        """
        try:
            client = redis_client.client
            channel = f"generation:progress:{generation_id}"
            payload = json.dumps({
                "type": "error",
                "generation_id": generation_id,
                "message": error,
                "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
            })
            await client.publish(channel, payload)
            return True
        except Exception as e:
            logger.error(f"Pub/Sub publish error: {e}")
            return False


# Global cache service instance
cache_service = CacheService()
