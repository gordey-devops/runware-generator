"""API endpoints for image and video generation."""

import logging
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.api.schemas import (
    TextToImageRequest,
    ImageToImageRequest,
    TextToVideoRequest,
    UpscaleRequest,
    GenerationResponse,
    GenerationListResponse,
    HistoryFilters,
    ErrorResponse,
)
from backend.models.database import get_db, Generation
from backend.services.runware_service import runware_service
from backend.services.queue_service import queue_service
from backend.services.cache_service import cache_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["generation"])


@router.post(
    "/generate/text-to-image",
    response_model=GenerationResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def generate_text_to_image(
    request: TextToImageRequest,
    db: Session = Depends(get_db),
) -> GenerationResponse:
    """
    Generate image(s) from text prompt.

    Returns immediately with generation ID.
    Result is sent via WebSocket when complete.

    Args:
        request: Text-to-image generation request
        db: Database session

    Returns:
        GenerationResponse with generation ID (status: processing)
    """
    from backend.main import manager as ws_manager

    # Create database record
    generation = Generation(
        generation_type="text-to-image",
        prompt=request.prompt,
        negative_prompt=request.negative_prompt,
        parameters={
            "width": request.width,
            "height": request.height,
            "steps": request.steps,
            "guidance_scale": request.guidance_scale,
            "seed": request.seed,
            "model": request.model,
            "num_images": request.num_images,
        },
        width=request.width,
        height=request.height,
        steps=request.steps,
        guidance_scale=request.guidance_scale,
        seed=request.seed,
        model_name=request.model,
        status="processing",
        output_path="",
    )
    db.add(generation)
    db.commit()
    db.refresh(generation)

    # Start generation in background
    generation_id = generation.id

    async def send_progress_updates(progress: float, message: str):
        """Send progress via both WebSocket and Pub/Sub."""
        await ws_manager.send_progress(generation_id, progress, message)
        await cache_service.publish_progress(generation_id, progress, message)

    async def run_generation():
        try:
            logger.info(f"Starting text-to-image generation (ID: {generation_id})")

            # Send initial progress via both channels
            await send_progress_updates(10.0, "Initializing...")

            # Generate image using Runware service
            results = await runware_service.text_to_image(
                prompt=request.prompt,
                negative_prompt=request.negative_prompt,
                width=request.width,
                height=request.height,
                steps=request.steps,
                guidance_scale=request.guidance_scale,
                seed=request.seed,
                model=request.model,
                num_images=request.num_images,
                progress_callback=lambda p, m: asyncio.create_task(send_progress_updates(p, m)),
            )

            # Send completion via both channels
            first_result = results[0]

            # Update database
            generation.status = "completed"
            generation.output_path = first_result["output_path"]
            generation.output_url = first_result["image_url"]
            generation.completed_at = datetime.utcnow()
            generation.processing_time = first_result.get("processing_time", 0)
            generation.seed = first_result["seed"]
            db.commit()

            completion_data = GenerationResponse.from_orm(generation).dict()
            await ws_manager.send_complete(generation_id, completion_data)
            await cache_service.publish_complete(generation_id, completion_data)

            logger.info(f"Text-to-image generation completed (ID: {generation_id})")

        except Exception as e:
            logger.error(f"Text-to-image generation failed (ID: {generation_id}): {str(e)}")

            # Update database with error
            generation.status = "failed"
            generation.error_message = str(e)
            generation.completed_at = datetime.utcnow()
            db.commit()

            await ws_manager.send_error(generation_id, str(e))
            await cache_service.publish_error(generation_id, str(e))

    # Start background task
    import asyncio
    asyncio.create_task(run_generation())

    logger.info(f"Text-to-image generation queued (ID: {generation_id})")

    return GenerationResponse.from_orm(generation)


@router.post(
    "/generate/image-to-image",
    response_model=GenerationResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def generate_image_to_image(
    request: ImageToImageRequest,
    db: Session = Depends(get_db),
) -> GenerationResponse:
    """
    Generate image from source image and text prompt.

    Args:
        request: Image-to-image generation request
        db: Database session

    Returns:
        GenerationResponse with generation details
    """
    from backend.main import manager as ws_manager

    generation = Generation(
        generation_type="image-to-image",
        prompt=request.prompt,
        negative_prompt=request.negative_prompt,
        parameters={
            "image_url": request.image_url,
            "strength": request.strength,
            "steps": request.steps,
            "guidance_scale": request.guidance_scale,
            "seed": request.seed,
            "model": request.model,
        },
        steps=request.steps,
        guidance_scale=request.guidance_scale,
        seed=request.seed,
        model_name=request.model,
        status="processing",
        output_path="",
    )
    db.add(generation)
    db.commit()
    db.refresh(generation)

    generation_id = generation.id

    async def send_progress_updates(progress: float, message: str):
        """Send progress via both WebSocket and Pub/Sub."""
        await ws_manager.send_progress(generation_id, progress, message)
        await cache_service.publish_progress(generation_id, progress, message)

    async def run_generation():
        try:
            logger.info(f"Starting image-to-image generation (ID: {generation_id})")

            await send_progress_updates(10.0, "Initializing...")

            result = await runware_service.image_to_image(
                prompt=request.prompt,
                image_url=request.image_url,
                negative_prompt=request.negative_prompt,
                strength=request.strength,
                steps=request.steps,
                guidance_scale=request.guidance_scale,
                seed=request.seed,
                model=request.model,
                progress_callback=lambda p, m: asyncio.create_task(send_progress_updates(p, m)),
            )

            generation.status = "completed"
            generation.output_path = result["output_path"]
            generation.output_url = result["image_url"]
            generation.completed_at = datetime.utcnow()
            generation.processing_time = result.get("processing_time", 0)
            generation.seed = result["seed"]
            db.commit()

            completion_data = GenerationResponse.from_orm(generation).dict()
            await ws_manager.send_complete(generation_id, completion_data)
            await cache_service.publish_complete(generation_id, completion_data)

            logger.info(f"Image-to-image generation completed (ID: {generation_id})")

        except Exception as e:
            logger.error(f"Image-to-image generation failed (ID: {generation_id}): {str(e)}")
            generation.status = "failed"
            generation.error_message = str(e)
            generation.completed_at = datetime.utcnow()
            db.commit()

            await ws_manager.send_error(generation_id, str(e))

    import asyncio
    asyncio.create_task(run_generation())

    logger.info(f"Image-to-image generation queued (ID: {generation_id})")

    return GenerationResponse.from_orm(generation)


@router.post("/upscale", response_model=GenerationResponse, status_code=status.HTTP_201_CREATED)
async def upscale_image(
    request: UpscaleRequest,
    db: Session = Depends(get_db),
) -> GenerationResponse:
    """
    Upscale an image.

    Args:
        request: Upscale request
        db: Database session

    Returns:
        GenerationResponse with upscaled image details
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Upscale feature will be implemented when Runware SDK supports it",
    )


@router.get("/history", response_model=GenerationListResponse)
async def get_history(
    filters: HistoryFilters = Depends(),
    db: Session = Depends(get_db),
) -> GenerationListResponse:
    """
    Get generation history with optional filters.

    Args:
        filters: Query filters
        db: Database session

    Returns:
        List of generations with metadata
    """
    query = db.query(Generation)

    # Apply filters
    if filters.generation_type:
        query = query.filter(Generation.generation_type == filters.generation_type)

    if filters.status:
        query = query.filter(Generation.status == filters.status)

    if filters.favorite is not None:
        query = query.filter(Generation.favorite == filters.favorite)

    if filters.search:
        search_term = f"%{filters.search}%"
        query = query.filter(
            (Generation.prompt.ilike(search_term)) | (Generation.negative_prompt.ilike(search_term))
        )

    # Get total count
    total = query.count()

    # Apply pagination and ordering
    query = query.order_by(Generation.created_at.desc())
    query = query.offset(filters.offset).limit(filters.limit)

    generations = query.all()

    return GenerationListResponse(
        total=total,
        items=[GenerationResponse.from_orm(gen) for gen in generations],
    )


@router.get("/history/{generation_id}", response_model=GenerationResponse)
async def get_generation(
    generation_id: int,
    db: Session = Depends(get_db),
) -> GenerationResponse:
    """
    Get a specific generation by ID.

    Args:
        generation_id: Generation ID
        db: Database session

    Returns:
        GenerationResponse
    """
    generation = db.query(Generation).filter(Generation.id == generation_id).first()

    if not generation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Generation {generation_id} not found",
        )

    return GenerationResponse.from_orm(generation)


@router.delete("/history/{generation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_generation(
    generation_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a generation from history.

    Args:
        generation_id: Generation ID
        db: Database session
    """
    generation = db.query(Generation).filter(Generation.id == generation_id).first()

    if not generation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Generation {generation_id} not found",
        )

    # Delete from database
    db.delete(generation)
    db.commit()

    logger.info(f"Deleted generation {generation_id}")


@router.get("/queue/status")
async def get_queue_status():
    """
    Get current queue status.

    Returns:
        Dictionary with queue information
    """
    from backend.services.queue_service import queue_service

    queue_info = await queue_service.get_queue_info()
    return queue_info


@router.delete("/queue/clear")
async def clear_queue(
    priority: Optional[str] = None,
):
    """
    Clear queue(s).

    Args:
        priority: Specific priority queue to clear (None for all)

    Returns:
        Number of tasks removed
    """
    from backend.services.queue_service import queue_service

    removed_count = await queue_service.clear(priority)
    return {"removed": removed_count}


@router.get("/cache/stats")
async def get_cache_stats():
    """
    Get cache statistics.

    Returns:
        Dictionary with cache information
    """
    from backend.services.cache_service import cache_service
    from backend.core.redis_client import redis_client

    try:
        client = redis_client.client
        pattern = "cache:generation:*"
        keys = []
        async for key in client.scan_iter(match=pattern):
            keys.append(key)

        return {
            "total_entries": len(keys),
            "status": "active",
        }
    except Exception as e:
        return {
            "total_entries": 0,
            "status": "error",
            "error": str(e),
        }


@router.delete("/cache/clear")
async def clear_cache(
    generation_type: Optional[str] = None,
):
    """
    Clear cache entries.

    Args:
        generation_type: Specific generation type to clear (None for all)

    Returns:
        Number of entries removed
    """
    from backend.services.cache_service import cache_service

    if generation_type:
        removed_count = await cache_service.delete_by_type(generation_type)
    else:
        removed_count = await cache_service.clear_all()

    return {"removed": removed_count}
