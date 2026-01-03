"""Pub/Sub service for real-time progress updates."""

import asyncio
import json
import logging
from typing import Callable, Dict, Optional

from backend.core.redis_client import redis_client

logger = logging.getLogger(__name__)


class PubSubService:
    """Service for Redis Pub/Sub operations."""

    def __init__(self):
        self._listeners: Dict[str, asyncio.Queue] = {}
        self._tasks: Dict[str, asyncio.Task] = {}
        self._lock = asyncio.Lock()

    async def _listen_channel(
        self,
        generation_id: int,
        queue: asyncio.Queue,
    ):
        """Listen to Redis Pub/Sub channel for a generation."""
        channel_name = f"generation:progress:{generation_id}"

        try:
            pubsub = redis_client.client.pubsub()
            await pubsub.subscribe(channel_name)
            logger.info(f"Subscribed to channel: {channel_name}")

            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        await queue.put(data)
                    except Exception as e:
                        logger.error(f"Error parsing message: {e}")
        except Exception as e:
            logger.error(f"Error listening to channel {channel_name}: {e}")
        finally:
            await pubsub.unsubscribe(channel_name)
            logger.info(f"Unsubscribed from channel: {channel_name}")

    async def subscribe(self, generation_id: int) -> asyncio.Queue:
        """
        Subscribe to progress updates for a generation.

        Args:
            generation_id: Generation ID

        Returns:
            Queue for receiving updates
        """
        async with self._lock:
            if generation_id in self._listeners:
                return self._listeners[generation_id]

            queue: asyncio.Queue = asyncio.Queue()
            self._listeners[generation_id] = queue

            task = asyncio.create_task(
                self._listen_channel(generation_id, queue)
            )
            self._tasks[generation_id] = task

            logger.info(f"Created listener for generation {generation_id}")
            return queue

    async def unsubscribe(self, generation_id: int):
        """
        Unsubscribe from progress updates for a generation.

        Args:
            generation_id: Generation ID
        """
        async with self._lock:
            if generation_id in self._tasks:
                self._tasks[generation_id].cancel()
                del self._tasks[generation_id]

            if generation_id in self._listeners:
                del self._listeners[generation_id]

            logger.info(f"Removed listener for generation {generation_id}")

    async def listen_once(
        self,
        generation_id: int,
        timeout: float = 60.0,
    ) -> Optional[dict]:
        """
        Listen for a single message from a generation channel.

        Args:
            generation_id: Generation ID
            timeout: Timeout in seconds

        Returns:
            Message data or None if timeout
        """
        queue = await self.subscribe(generation_id)

        try:
            message = await asyncio.wait_for(queue.get(), timeout=timeout)
            return message
        except asyncio.TimeoutError:
            logger.warning(f"Timeout waiting for generation {generation_id}")
            return None
        finally:
            await self.unsubscribe(generation_id)

    async def cleanup(self):
        """Cleanup all active subscriptions."""
        async with self._lock:
            for task in self._tasks.values():
                task.cancel()
            self._tasks.clear()
            self._listeners.clear()
            logger.info("Pub/Sub service cleaned up")


# Global Pub/Sub service instance
pubsub_service = PubSubService()
