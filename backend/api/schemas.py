"""Pydantic schemas for API request/response validation."""

from datetime import datetime
from typing import Optional, Dict, Any, List

from pydantic import BaseModel, Field, field_validator


class TextToImageRequest(BaseModel):
    """Request schema for text-to-image generation."""

    prompt: str = Field(..., min_length=1, max_length=2000, description="Text prompt for image generation")
    negative_prompt: Optional[str] = Field(None, max_length=2000, description="Negative prompt")
    width: int = Field(512, ge=64, le=2048, description="Image width")
    height: int = Field(512, ge=64, le=2048, description="Image height")
    steps: int = Field(25, ge=1, le=150, description="Number of inference steps")
    guidance_scale: float = Field(7.5, ge=1.0, le=20.0, description="Guidance scale")
    seed: Optional[int] = Field(None, description="Random seed for reproducibility")
    model: Optional[str] = Field(None, description="Model name to use")
    num_images: int = Field(1, ge=1, le=4, description="Number of images to generate")


class ImageToImageRequest(BaseModel):
    """Request schema for image-to-image generation."""

    prompt: str = Field(..., min_length=1, max_length=2000, description="Text prompt")
    image_url: str = Field(..., description="URL or path to source image")
    negative_prompt: Optional[str] = Field(None, max_length=2000, description="Negative prompt")
    strength: float = Field(0.75, ge=0.0, le=1.0, description="Transformation strength")
    steps: int = Field(25, ge=1, le=150, description="Number of inference steps")
    guidance_scale: float = Field(7.5, ge=1.0, le=20.0, description="Guidance scale")
    seed: Optional[int] = Field(None, description="Random seed")
    model: Optional[str] = Field(None, description="Model name")


class TextToVideoRequest(BaseModel):
    """Request schema for text-to-video generation."""

    prompt: str = Field(..., min_length=1, max_length=2000, description="Text prompt for video")
    negative_prompt: Optional[str] = Field(None, max_length=2000, description="Negative prompt")
    width: int = Field(512, ge=64, le=1024, description="Video width")
    height: int = Field(512, ge=64, le=1024, description="Video height")
    duration: int = Field(3, ge=1, le=10, description="Video duration in seconds")
    fps: int = Field(24, ge=12, le=60, description="Frames per second")
    seed: Optional[int] = Field(None, description="Random seed")
    model: Optional[str] = Field(None, description="Model name")


class UpscaleRequest(BaseModel):
    """Request schema for image upscaling."""

    image_url: str = Field(..., description="URL or path to image to upscale")
    scale_factor: int = Field(2, ge=2, le=4, description="Upscale factor (2x, 4x)")
    model: Optional[str] = Field(None, description="Upscale model name")


class GenerationResponse(BaseModel):
    """Response schema for generation requests."""

    id: int = Field(..., description="Generation ID")
    generation_type: str = Field(..., description="Type of generation")
    status: str = Field(..., description="Generation status")
    output_path: Optional[str] = Field(None, description="Local file path")
    output_url: Optional[str] = Field(None, description="Output URL")
    prompt: str = Field(..., description="Prompt used")
    parameters: Dict[str, Any] = Field(..., description="Generation parameters")
    created_at: datetime = Field(..., description="Creation timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")
    error_message: Optional[str] = Field(None, description="Error message if failed")

    class Config:
        """Pydantic config."""
        from_attributes = True


class GenerationListResponse(BaseModel):
    """Response schema for listing generations."""

    total: int = Field(..., description="Total number of generations")
    items: List[GenerationResponse] = Field(..., description="List of generations")


class HistoryFilters(BaseModel):
    """Filters for querying generation history."""

    generation_type: Optional[str] = Field(None, description="Filter by generation type")
    status: Optional[str] = Field(None, description="Filter by status")
    favorite: Optional[bool] = Field(None, description="Filter favorites only")
    search: Optional[str] = Field(None, description="Search in prompts")
    limit: int = Field(50, ge=1, le=200, description="Maximum results")
    offset: int = Field(0, ge=0, description="Results offset for pagination")


class WebSocketMessage(BaseModel):
    """WebSocket message schema for progress updates."""

    type: str = Field(..., description="Message type: 'progress', 'complete', 'error'")
    generation_id: int = Field(..., description="Generation ID")
    progress: Optional[float] = Field(None, ge=0.0, le=100.0, description="Progress percentage")
    status: Optional[str] = Field(None, description="Current status")
    message: Optional[str] = Field(None, description="Status message")
    data: Optional[Dict[str, Any]] = Field(None, description="Additional data")


class ErrorResponse(BaseModel):
    """Error response schema."""

    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
