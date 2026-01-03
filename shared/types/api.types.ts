/**
 * API types synchronized with backend/api/schemas.py
 * These types must match the Pydantic schemas exactly
 */

/**
 * Text-to-image generation request parameters
 */
export interface TextToImageRequest {
  prompt: string;
  negative_prompt?: string | null;
  width?: number;
  height?: number;
  steps?: number;
  guidance_scale?: number;
  seed?: number | null;
  model?: string | null;
  num_images?: number;
}

/**
 * Image-to-image generation request parameters
 */
export interface ImageToImageRequest {
  prompt: string;
  image_url: string;
  negative_prompt?: string | null;
  strength?: number;
  steps?: number;
  guidance_scale?: number;
  seed?: number | null;
  model?: string | null;
}

/**
 * Text-to-video generation request parameters
 */
export interface TextToVideoRequest {
  prompt: string;
  negative_prompt?: string | null;
  width?: number;
  height?: number;
  duration?: number;
  fps?: number;
  seed?: number | null;
  model?: string | null;
}

/**
 * Image upscaling request parameters
 */
export interface UpscaleRequest {
  image_url: string;
  scale_factor?: number;
  model?: string | null;
}

/**
 * Generation response from API
 */
export interface GenerationResponse {
  id: number;
  generation_type: string;
  status: string;
  output_path: string | null;
  output_url: string | null;
  prompt: string;
  parameters: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
  processing_time: number | null;
  error_message: string | null;
}

/**
 * List of generations with pagination
 */
export interface GenerationListResponse {
  total: number;
  items: GenerationResponse[];
}

/**
 * Filters for querying generation history
 */
export interface HistoryFilters {
  generation_type?: string | null;
  status?: string | null;
  favorite?: boolean | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}

/**
 * WebSocket message for progress updates
 */
export interface WebSocketMessage {
  type: 'progress' | 'complete' | 'error' | 'heartbeat';
  generation_id: number;
  progress?: number | null;
  status?: string | null;
  message?: string | null;
  data?: Record<string, unknown> | null;
}

/**
 * Error response from API
 */
export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown> | null;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: string;
  runware_connected: boolean;
}

/**
 * Generation status enum
 */
export enum GenerationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Generation type enum
 */
export enum GenerationType {
  TEXT_TO_IMAGE = 'text-to-image',
  IMAGE_TO_IMAGE = 'image-to-image',
  TEXT_TO_VIDEO = 'text-to-video',
  UPSCALE = 'upscale',
}
