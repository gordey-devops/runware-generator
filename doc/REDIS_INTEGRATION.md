# Redis Integration Guide

This guide covers the Redis caching, queue management, and Pub/Sub features added to the Runware Generator backend.

## Features

### 1. Caching Service

Generations are automatically cached to improve response times for identical requests.

- **Cache Key Format:** `cache:generation:{type}:{md5_hash}`
- **Default TTL:** 3600 seconds (1 hour)
- **Cache Hit:** Returns stored result immediately
- **Cache Miss:** Generates new result and stores it

### 2. Queue Service

Manages generation tasks with priority support.

- **Priorities:** high, normal, low
- **Queue Names:** `queue:generation:{priority}`
- **Operations:** enqueue, dequeue, clear, get status

### 3. Rate Limiting

Protects the API from abuse using Redis-based rate limiting.

- **Per-minute limit:** 60 requests
- **Per-hour limit:** 1000 requests
- **Key Format:** `rate_limit:{minute|hour}:{client_id}:{endpoint}`

### 4. Pub/Sub

Real-time progress updates via Redis Pub/Sub (in addition to WebSocket).

- **Channel Format:** `generation:progress:{generation_id}`
- **Message Types:** progress, complete, error
- **Benefits:** Can be consumed by multiple services

## Configuration

Add to your `.env` file:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379/0
REDIS_MAX_CONNECTIONS=20
CACHE_TTL=3600

# PostgreSQL (optional, for production)
POSTGRES_URL=postgresql+asyncpg://user:password@localhost/dbname

# Database (choose one)
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
# OR
DATABASE_URL=sqlite:///./runware_generator.db
```

## API Endpoints

### Cache Management

```bash
# Get cache statistics
GET /api/cache/stats

# Clear all cache
DELETE /api/cache/clear

# Clear cache for specific type
DELETE /api/cache/clear?generation_type=text-to-image
```

### Queue Management

```bash
# Get queue status
GET /api/queue/status

# Clear all queues
DELETE /api/queue/clear

# Clear specific priority queue
DELETE /api/queue/clear?priority=high
```

## Usage Examples

### Using Cache Service

```python
from backend.services.cache_service import cache_service

# Get cached generation
result = await cache_service.get_generation(
    generation_type="text-to-image",
    prompt="A beautiful sunset",
    params={"width": 512, "height": 512, "steps": 25}
)

# Cache a result
await cache_service.set_generation(
    generation_type="text-to-image",
    prompt="A beautiful sunset",
    params={"width": 512, "height": 512, "steps": 25},
    value={"output_url": "https://...", "output_path": "/path/to/file"}
)

# Clear cache by type
await cache_service.delete_by_type("text-to-image")

# Clear all cache
await cache_service.clear_all()
```

### Using Queue Service

```python
from backend.services.queue_service import queue_service

# Enqueue a task
await queue_service.enqueue(
    task_id=123,
    generation_type="text-to-image",
    params={"prompt": "...", "width": 512},
    priority="high"
)

# Dequeue (blocking with timeout)
task = await queue_service.dequeue(timeout=5)

# Get queue info
info = await queue_service.get_queue_info()
# Returns: {"high": 5, "normal": 10, "low": 2, "total": 17}
```

### Using Pub/Sub Service

```python
from backend.services.pubsub_service import pubsub_service

# Subscribe to generation updates
queue = await pubsub_service.subscribe(generation_id=123)

# Listen for messages
message = await queue.get()
# {"type": "progress", "generation_id": 123, "progress": 50, "message": "Processing..."}

# Listen once with timeout
message = await pubsub_service.listen_once(generation_id=123, timeout=60)

# Unsubscribe
await pubsub_service.unsubscribe(generation_id=123)
```

### Publishing Progress Updates

```python
from backend.services.cache_service import cache_service

# Publish progress
await cache_service.publish_progress(generation_id=123, progress=50, message="Processing...")

# Publish completion
await cache_service.publish_complete(generation_id=123, data={"result": "..."})

# Publish error
await cache_service.publish_error(generation_id=123, error="Failed to generate")
```

## Running Migrations

For PostgreSQL with Alembic:

```bash
# Upgrade database
alembic upgrade head

# Downgrade database
alembic downgrade -1

# Generate new migration
alembic revision --autogenerate -m "description"
```

## Production Deployment

### Redis Setup

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Using Docker Compose
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

### PostgreSQL Setup (Optional)

```bash
# Using Docker
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=runware \
  postgres:15-alpine

# Using Docker Compose
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: yourpassword
      POSTGRES_DB: runware
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Environment Variables

Production `.env`:

```env
# Redis
REDIS_URL=redis://redis:6379/0
REDIS_MAX_CONNECTIONS=50
CACHE_TTL=7200

# PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:password@postgres:5432/runware

# Rate Limiting (adjust as needed)
# Configure in main.py RateLimiterMiddleware
```

## Performance Tips

1. **Cache TTL:** Adjust `CACHE_TTL` based on how often generation parameters change
2. **Queue Priorities:** Use priority for urgent generations
3. **Redis Connections:** Scale `REDIS_MAX_CONNECTIONS` based on load
4. **Indexing:** PostgreSQL migrations include GIN indexes for JSON fields

## Monitoring

Check Redis performance:

```bash
# Redis CLI
redis-cli INFO stats
redis-cli INFO memory

# Monitor commands
redis-cli MONITOR
```

Check queue status:

```bash
curl http://localhost:8000/api/queue/status
```

Check cache stats:

```bash
curl http://localhost:8000/api/cache/stats
```
