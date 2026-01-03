"""Rate limiting middleware using Redis."""

import logging
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from backend.core.redis_client import redis_client

logger = logging.getLogger(__name__)


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware using Redis."""

    def __init__(
        self,
        app,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
    ):
        """
        Initialize rate limiter.

        Args:
            app: FastAPI application
            requests_per_minute: Max requests per minute
            requests_per_hour: Max requests per hour
        """
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour

    def _get_client_identifier(self, request: Request) -> str:
        """Get client identifier for rate limiting."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _get_endpoint_key(self, request: Request) -> str:
        """Get endpoint key for rate limiting."""
        return f"{request.method}:{request.url.path}"

    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:
        """
        Process request with rate limiting.

        Args:
            request: Incoming request
            call_next: Next middleware/endpoint

        Returns:
            Response
        """
        try:
            if redis_client.client is None:
                return await call_next(request)

            client_id = self._get_client_identifier(request)
            endpoint = self._get_endpoint_key(request)

            minute_key = f"rate_limit:minute:{client_id}:{endpoint}"
            hour_key = f"rate_limit:hour:{client_id}:{endpoint}"

            client = redis_client.client

            minute_count = await client.incr(minute_key)
            if minute_count == 1:
                await client.expire(minute_key, 60)

            hour_count = await client.incr(hour_key)
            if hour_count == 1:
                await client.expire(hour_key, 3600)

            if minute_count > self.requests_per_minute:
                logger.warning(f"Rate limit exceeded (minute) for {client_id}")
                return Response(
                    content='{"error": "Rate limit exceeded: too many requests per minute"}',
                    status_code=429,
                    media_type="application/json",
                )

            if hour_count > self.requests_per_hour:
                logger.warning(f"Rate limit exceeded (hour) for {client_id}")
                return Response(
                    content='{"error": "Rate limit exceeded: too many requests per hour"}',
                    status_code=429,
                    media_type="application/json",
                )

        except Exception as e:
            logger.error(f"Rate limiting error: {e}")

        return await call_next(request)
