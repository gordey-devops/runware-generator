"""Queue service for managing generation tasks."""

import json
import logging
from typing import Any, Dict, Optional, Tuple

from backend.core.config import settings
from backend.core.redis_client import redis_client

logger = logging.getLogger(__name__)


class QueueService:
    """Service for managing generation task queue."""

    QUEUE_PREFIX = "queue:generation"
    PRIORITY_HIGH = "high"
    PRIORITY_NORMAL = "normal"
    PRIORITY_LOW = "low"

    def __init__(self):
        self._initialized = False

    async def initialize(self):
        """Initialize queue service."""
        if not self._initialized:
            await redis_client.initialize()
            self._initialized = True

    def _get_queue_name(self, priority: str = "normal") -> str:
        """Get queue name based on priority."""
        return f"{self.QUEUE_PREFIX}:{priority}"

    async def enqueue(
        self,
        task_id: int,
        generation_type: str,
        params: Dict[str, Any],
        priority: str = "normal",
    ) -> bool:
        """
        Enqueue a generation task.

        Args:
            task_id: Database task ID
            generation_type: Type of generation (text-to-image, etc.)
            params: Generation parameters
            priority: Task priority (high, normal, low)

        Returns:
            True if enqueued successfully
        """
        try:
            client = redis_client.client
            queue_name = self._get_queue_name(priority)

            task_data = {
                "task_id": task_id,
                "generation_type": generation_type,
                "params": params,
                "priority": priority,
            }

            await client.rpush(queue_name, json.dumps(task_data))
            logger.info(f"Enqueued task {task_id} to {priority} queue")
            return True
        except Exception as e:
            logger.error(f"Enqueue error: {e}")
            return False

    async def dequeue(
        self,
        timeout: int = 5,
        priorities: Optional[list[str]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Dequeue a task with priority support.

        Args:
            timeout: Wait timeout in seconds
            priorities: Priority order (default: high, normal, low)

        Returns:
            Task data or None if no task available
        """
        try:
            client = redis_client.client
            if priorities is None:
                priorities = [self.PRIORITY_HIGH, self.PRIORITY_NORMAL, self.PRIORITY_LOW]

            queue_names = [self._get_queue_name(p) for p in priorities]

            result = await client.blpop(queue_names, timeout=timeout)

            if result:
                _, task_json = result
                task_data = json.loads(task_json)
                logger.info(f"Dequeued task {task_data['task_id']}")
                return task_data

            return None
        except Exception as e:
            logger.error(f"Dequeue error: {e}")
            return None

    async def get_length(self, priority: Optional[str] = None) -> int:
        """
        Get queue length.

        Args:
            priority: Specific priority queue (None for all)

        Returns:
            Number of tasks in queue
        """
        try:
            client = redis_client.client
            if priority:
                queue_name = self._get_queue_name(priority)
                return await client.llen(queue_name)
            else:
                total = 0
                for p in [self.PRIORITY_HIGH, self.PRIORITY_NORMAL, self.PRIORITY_LOW]:
                    total += await client.llen(self._get_queue_name(p))
                return total
        except Exception as e:
            logger.error(f"Get length error: {e}")
            return 0

    async def clear(self, priority: Optional[str] = None) -> int:
        """
        Clear queue(s).

        Args:
            priority: Specific priority queue to clear (None for all)

        Returns:
            Number of tasks removed
        """
        try:
            client = redis_client.client
            priorities = [priority] if priority else [self.PRIORITY_HIGH, self.PRIORITY_NORMAL, self.PRIORITY_LOW]
            total = 0
            for p in priorities:
                queue_name = self._get_queue_name(p)
                count = await client.llen(queue_name)
                if count > 0:
                    await client.delete(queue_name)
                    total += count
            logger.info(f"Cleared {total} tasks from queue")
            return total
        except Exception as e:
            logger.error(f"Clear queue error: {e}")
            return 0

    async def remove_task(self, task_id: int, priority: Optional[str] = None) -> bool:
        """
        Remove specific task from queue.

        Args:
            task_id: Task ID to remove
            priority: Priority queue to search (None for all)

        Returns:
            True if task was found and removed
        """
        try:
            client = redis_client.client
            priorities = [priority] if priority else [self.PRIORITY_HIGH, self.PRIORITY_NORMAL, self.PRIORITY_LOW]

            for p in priorities:
                queue_name = self._get_queue_name(p)
                length = await client.llen(queue_name)
                for idx in range(length):
                    task_json = await client.lindex(queue_name, idx)
                    if task_json:
                        task_data = json.loads(task_json)
                        if task_data.get("task_id") == task_id:
                            await client.lrem(queue_name, 1, task_json)
                            logger.info(f"Removed task {task_id} from {p} queue")
                            return True
            return False
        except Exception as e:
            logger.error(f"Remove task error: {e}")
            return False

    async def get_queue_info(self) -> Dict[str, int]:
        """
        Get information about all queues.

        Returns:
            Dictionary with queue lengths
        """
        try:
            client = redis_client.client
            info = {}
            for p in [self.PRIORITY_HIGH, self.PRIORITY_NORMAL, self.PRIORITY_LOW]:
                queue_name = self._get_queue_name(p)
                info[p] = await client.llen(queue_name)
            info["total"] = sum(info.values())
            return info
        except Exception as e:
            logger.error(f"Get queue info error: {e}")
            return {}


# Global queue service instance
queue_service = QueueService()
