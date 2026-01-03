# 🔌 Backend API Documentation

**Last Updated**: 2026-01-02  
**Base URL**: http://localhost:8000

---

## 📋 Overview

FastAPI backend provides REST API for image generation, history management, and settings.

### Base URL

```
Development: http://localhost:8000
Production: http://127.0.0.1:8000
```

### API Documentation

Interactive API documentation available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔐 Authentication

Currently, no authentication required (local desktop app only).  
Future: API key header for remote access.

---

## 📊 Endpoints

### Health Check

#### GET /health

Check if API is running.

**Response:**

```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

---

### Generation Endpoints

#### POST /api/generate/text-to-image

Generate an image from text prompt.

**Request:**

```json
{
  "prompt": "A beautiful sunset over mountains",
  "negativePrompt": "blurry, low quality",
  "width": 512,
  "height": 512,
  "steps": 25,
  "cfgScale": 7.5,
  "seed": 42
}
```

**Parameters:**

- `prompt` (string, required): Text description of image
- `negativePrompt` (string, optional): What to avoid
- `width` (integer, optional): Image width (default: 512)
- `height` (integer, optional): Image height (default: 512)
- `steps` (integer, optional): Inference steps (default: 25)
- `cfgScale` (number, optional): Guidance scale (default: 7.5)
- `seed` (integer, optional): Random seed for reproducibility

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "prompt": "A beautiful sunset over mountains",
    "filePath": "/generated/image_1.jpg",
    "url": "https://im.runware.ai/image/...",
    "seed": 42,
    "created_at": "2026-01-02T10:00:00Z"
  }
}
```

**Response (400 Bad Request):**

```json
{
  "success": false,
  "error": "Prompt is required"
}
```

**Response (500 Internal Server Error):**

```json
{
  "success": false,
  "error": "Generation failed: API timeout"
}
```

#### POST /api/generate/image-to-image

Transform an image using text prompt.

**Request:**

```json
{
  "seedImage": "path/to/image.jpg",
  "prompt": "A futuristic cyberpunk version",
  "strength": 0.7,
  "steps": 25,
  "cfgScale": 7.5
}
```

**Parameters:**

- `seedImage` (string, required): Path to input image
- `prompt` (string, required): Transformation description
- `strength` (number, optional): 0=no change, 1=full change (default: 0.7)
- `steps` (integer, optional): Inference steps
- `cfgScale` (number, optional): Guidance scale

#### POST /api/generate/upscale

Upscale an image to higher resolution.

**Request:**

```json
{
  "imagePath": "path/to/image.jpg",
  "scale": 2
}
```

**Parameters:**

- `imagePath` (string, required): Path to image
- `scale` (integer, optional): Scale factor (default: 2)

---

### History Endpoints

#### GET /api/history

Get all generation history.

**Query Parameters:**

- `limit` (integer, optional): Max results (default: 50)
- `offset` (integer, optional): Pagination offset
- `type` (string, optional): Filter by type ("image" or "video")

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "image",
      "prompt": "A beautiful sunset",
      "filePath": "/generated/image_1.jpg",
      "created_at": "2026-01-02T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### GET /api/history/{id}

Get specific generation by ID.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "image",
    "prompt": "A beautiful sunset",
    "parameters": {
      "width": 512,
      "height": 512,
      "steps": 25,
      "seed": 42
    },
    "filePath": "/generated/image_1.jpg",
    "url": "https://im.runware.ai/image/...",
    "created_at": "2026-01-02T10:00:00Z"
  }
}
```

**Response (404 Not Found):**

```json
{
  "success": false,
  "error": "Generation not found"
}
```

#### DELETE /api/history/{id}

Delete a generation from history.

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Generation deleted"
}
```

---

### Settings Endpoints

#### GET /api/settings

Get application settings.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "storagePath": "./generated",
    "defaultWidth": 512,
    "defaultHeight": 512,
    "defaultSteps": 25
  }
}
```

#### PUT /api/settings

Update application settings.

**Request:**

```json
{
  "storagePath": "./custom/path",
  "defaultWidth": 768,
  "defaultHeight": 768
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Settings updated",
  "data": {
    "storagePath": "./custom/path",
    "defaultWidth": 768,
    "defaultHeight": 768
  }
}
```

---

## 🔧 WebSocket

### Connect to /ws/generation

WebSocket endpoint for real-time generation progress.

**Message Format:**

```json
{
  "type": "progress",
  "taskId": "task-id",
  "progress": 50,
  "status": "generating"
}
```

**Status Values:**

- `queued`: Task is queued
- `generating`: Task is in progress
- `completed`: Task completed successfully
- `failed`: Task failed

---

## 📝 Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - API or service down

### Error Codes

| Code                 | Description                   |
| -------------------- | ----------------------------- |
| `INVALID_PROMPT`     | Prompt is empty or too long   |
| `INVALID_PARAMETERS` | Invalid generation parameters |
| `API_TIMEOUT`        | Runware API timeout           |
| `API_ERROR`          | Runware API error             |
| `STORAGE_ERROR`      | File storage error            |
| `DATABASE_ERROR`     | Database error                |
| `NOT_FOUND`          | Resource not found            |

---

## 🔒 Rate Limiting

Currently, no rate limiting (local app only).  
Future: 100 requests per minute per user.

---

## 📦 Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## 🧪 Testing with curl

```bash
# Health check
curl http://localhost:8000/health

# Generate image
curl -X POST http://localhost:8000/api/generate/text-to-image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A beautiful sunset","width":512,"height":512}'

# Get history
curl http://localhost:8000/api/history

# Get specific generation
curl http://localhost:8000/api/history/1

# Delete generation
curl -X DELETE http://localhost:8000/api/history/1
```

---

## 📚 Data Models

### Generation

```typescript
interface Generation {
  id: number;
  type: 'image' | 'video';
  prompt: string;
  negativePrompt?: string;
  parameters: {
    width: number;
    height: number;
    steps: number;
    cfgScale: number;
    seed?: number;
  };
  filePath: string;
  url: string;
  createdAt: string;
}
```

### Settings

```typescript
interface Settings {
  storagePath: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultSteps: number;
  defaultCfgScale: number;
}
```

---

**Last Updated**: 2026-01-02  
**Maintained By**: Backend Developer
