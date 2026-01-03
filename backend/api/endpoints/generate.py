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

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["generation"])


@router.post(
    "/generate/text-to-image",
    response_model=GenerationResponse,
    status_code=status.HTTP_201_CREATED,
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

    Args:
        request: Text-to-image generation request
        db: Database session

    Returns:
        GenerationResponse with generation details
    """
    start_time = datetime.utcnow()

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

    try:
        logger.info(f"Starting text-to-image generation (ID: {generation.id})")

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
        )

        # Update database with results (use first image if multiple)
        first_result = results[0]
        generation.status = "completed"
        generation.output_path = first_result["output_path"]
        generation.output_url = first_result["image_url"]
        generation.completed_at = datetime.utcnow()
        generation.processing_time = (datetime.utcnow() - start_time).total_seconds()
        generation.seed = first_result["seed"]

        db.commit()
        db.refresh(generation)

        logger.info(f"Text-to-image generation completed (ID: {generation.id})")

        return GenerationResponse.from_orm(generation)

    except Exception as e:
        logger.error(f"Text-to-image generation failed (ID: {generation.id}): {str(e)}")
        generation.status = "failed"
        generation.error_message = str(e)
        generation.completed_at = datetime.utcnow()
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}",
        )


@router.post(
    "/generate/image-to-image",
    response_model=GenerationResponse,
    status_code=status.HTTP_201_CREATED,
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
    start_time = datetime.utcnow()

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

    try:
        logger.info(f"Starting image-to-image generation (ID: {generation.id})")

        result = await runware_service.image_to_image(
            prompt=request.prompt,
            image_url=request.image_url,
            negative_prompt=request.negative_prompt,
            strength=request.strength,
            steps=request.steps,
            guidance_scale=request.guidance_scale,
            seed=request.seed,
            model=request.model,
        )

        generation.status = "completed"
        generation.output_path = result["output_path"]
        generation.output_url = result["image_url"]
        generation.completed_at = datetime.utcnow()
        generation.processing_time = (datetime.utcnow() - start_time).total_seconds()
        generation.seed = result["seed"]

        db.commit()
        db.refresh(generation)

        logger.info(f"Image-to-image generation completed (ID: {generation.id})")

        return GenerationResponse.from_orm(generation)

    except Exception as e:
        logger.error(f"Image-to-image generation failed (ID: {generation.id}): {str(e)}")
        generation.status = "failed"
        generation.error_message = str(e)
        generation.completed_at = datetime.utcnow()
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}",
        )


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
