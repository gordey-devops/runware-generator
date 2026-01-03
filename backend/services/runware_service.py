"""Runware SDK service wrapper for image and video generation."""

import asyncio
import logging
from pathlib import Path
from typing import Optional, Dict, Any, Callable
from datetime import datetime

from runware import Runware, IImageInference

from backend.core.config import settings
from backend.services.cache_service import cache_service

logger = logging.getLogger(__name__)


class RunwareService:
    """Service wrapper for Runware SDK operations."""

    def __init__(self, api_key: str = settings.runware_api_key):
        """
        Initialize Runware service.

        Args:
            api_key: Runware API key
        """
        self.api_key = api_key
        self.runware: Optional[Runware] = None
        self._initialized = False

    async def initialize(self):
        """Initialize Runware client connection."""
        if not self._initialized:
            # Only initialize if we have a valid API key
            if self.api_key and self.api_key.strip():
                try:
                    logger.info(f"Attempting to connect to Runware with API key: {self.api_key[:10]}...")
                    self.runware = Runware(api_key=self.api_key)
                    await self.runware.connect()
                    self._initialized = True
                    logger.info("Runware service initialized successfully")
                except Exception as e:
                    logger.error(f"Failed to connect to Runware: {e}")
                    logger.error(f"Exception type: {type(e).__name__}")
                    import traceback
                    logger.error(f"Traceback: {traceback.format_exc()}")
                    logger.warning("Runware service initialized in inactive state")
                    self._initialized = False
            else:
                logger.warning("No API key configured. Runware service initialized in inactive state")
                self._initialized = False

    async def close(self):
        """Close Runware client connection."""
        if self._initialized and self.runware:
            # Runware SDK doesn't have a close method in current version
            # Just mark as not initialized
            self._initialized = False
            logger.info("Runware service closed")

    async def update_api_key(self, api_key: str):
        """Update API key and reinitialize if needed."""
        self.api_key = api_key
        
        # If already initialized and connected, close and reinitialize
        if self._initialized:
            logger.info("Updating API key and reconnecting...")
            await self.close()
            await self.initialize()
        else:
            logger.info("API key saved, will be used when needed")
            # Don't initialize connection yet - will be done lazily

    async def ensure_initialized(self):
        """Ensure that service is initialized before use."""
        if not self._initialized:
            if self.api_key and self.api_key.strip():
                await self.initialize()
            else:
                raise Exception("API key not configured. Please set API key in settings.")

    async def text_to_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 512,
        height: int = 512,
        steps: int = 25,
        guidance_scale: float = 7.5,
        seed: Optional[int] = None,
        model: Optional[str] = None,
        num_images: int = 1,
        progress_callback: Optional[Callable[[float, str], None]] = None,
        use_cache: bool = True,
    ) -> list[Dict[str, Any]]:
        """
        Generate images from text prompt.

        Args:
            prompt: Text prompt for image generation
            negative_prompt: Negative prompt
            width: Image width
            height: Image height
            steps: Number of inference steps
            guidance_scale: Guidance scale
            seed: Random seed
            model: Model name to use
            num_images: Number of images to generate
            progress_callback: Optional callback for progress updates
            use_cache: Whether to use cache (default True)

        Returns:
            List of dictionaries containing image data and metadata
        """
        await self.ensure_initialized()

        params = {
            "width": width,
            "height": height,
            "steps": steps,
            "guidance_scale": guidance_scale,
            "seed": seed,
            "model": model,
            "num_images": num_images,
            "negative_prompt": negative_prompt,
        }

        if use_cache:
            cached_result = await cache_service.get_generation("text-to-image", prompt, params)
            if cached_result:
                if progress_callback:
                    progress_callback(100.0, "Retrieved from cache")
                logger.info("Returning cached result for text-to-image generation")
                return cached_result

        try:
            if progress_callback:
                progress_callback(10.0, "Preparing generation request...")

            # Prepare request parameters
            params = {
                "positivePrompt": prompt,
                "model": model or "runware:100@1",
                "width": width,
                "height": height,
                "numberResults": num_images,
                "steps": steps,
                "CFGScale": guidance_scale,
            }

            # Add optional parameters only if provided
            if negative_prompt:
                params["negativePrompt"] = negative_prompt
            if seed is not None:
                params["seed"] = seed

            request_params = IImageInference(**params)

            if progress_callback:
                progress_callback(20.0, "Sending request to Runware...")

            # Generate images
            images = await self.runware.imageInference(requestImage=request_params)

            if progress_callback:
                progress_callback(80.0, "Processing results...")

            # Process results
            results = []
            for idx, image in enumerate(images):
                # Save image locally
                output_path = await self._save_image(
                    image_url=image.imageURL,
                    prefix=f"txt2img_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{idx}",
                )

                result = {
                    "image_url": image.imageURL,
                    "output_path": str(output_path),
                    "seed": image.seed if hasattr(image, "seed") else seed,
                    "width": width,
                    "height": height,
                    "steps": steps,
                    "guidance_scale": guidance_scale,
                }
                results.append(result)

            if progress_callback:
                progress_callback(100.0, "Generation complete!")

            logger.info(f"Generated {len(results)} images successfully")

            if use_cache:
                await cache_service.set_generation("text-to-image", prompt, params, results)

            return results

        except Exception as e:
            logger.error(f"Text-to-image generation failed: {str(e)}")
            if progress_callback:
                progress_callback(0.0, f"Error: {str(e)}")
            raise

    async def image_to_image(
        self,
        prompt: str,
        image_url: str,
        negative_prompt: Optional[str] = None,
        strength: float = 0.75,
        steps: int = 25,
        guidance_scale: float = 7.5,
        seed: Optional[int] = None,
        model: Optional[str] = None,
        progress_callback: Optional[Callable[[float, str], None]] = None,
    ) -> Dict[str, Any]:
        """
        Generate image from image and text prompt.

        Args:
            prompt: Text prompt
            image_url: Source image URL or path
            negative_prompt: Negative prompt
            strength: Transformation strength (0.0-1.0)
            steps: Number of inference steps
            guidance_scale: Guidance scale
            seed: Random seed
            model: Model name
            progress_callback: Optional callback for progress updates

        Returns:
            Dictionary containing generated image data and metadata
        """
        await self.ensure_initialized()

        try:
            if progress_callback:
                progress_callback(10.0, "Preparing image-to-image generation...")

            # Prepare request with image URL
            params = {
                "positivePrompt": prompt,
                "model": model or "runware:100@1",
                "numberResults": 1,
                "steps": steps,
                "CFGScale": guidance_scale,
                "imageInitiator": image_url,
                "strength": strength,
            }

            # Add optional parameters only if provided
            if negative_prompt:
                params["negativePrompt"] = negative_prompt
            if seed is not None:
                params["seed"] = seed

            request_params = IImageInference(**params)

            if progress_callback:
                progress_callback(30.0, "Sending request to Runware...")

            images = await self.runware.imageInference(requestImage=request_params)

            if progress_callback:
                progress_callback(80.0, "Processing result...")

            image = images[0]
            output_path = await self._save_image(
                image_url=image.imageURL,
                prefix=f"img2img_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            )

            result = {
                "image_url": image.imageURL,
                "output_path": str(output_path),
                "seed": image.seed if hasattr(image, "seed") else seed,
                "strength": strength,
                "steps": steps,
                "guidance_scale": guidance_scale,
            }

            if progress_callback:
                progress_callback(100.0, "Generation complete!")

            logger.info("Image-to-image generation completed successfully")
            return result

        except Exception as e:
            logger.error(f"Image-to-image generation failed: {str(e)}")
            if progress_callback:
                progress_callback(0.0, f"Error: {str(e)}")
            raise

    async def upscale_image(
        self,
        image_url: str,
        scale_factor: int = 2,
        progress_callback: Optional[Callable[[float, str], None]] = None,
    ) -> Dict[str, Any]:
        """
        Upscale an image.

        Args:
            image_url: Source image URL or path
            scale_factor: Upscale factor (2x or 4x)
            progress_callback: Optional callback for progress updates

        Returns:
            Dictionary containing upscaled image data
        """
        await self.ensure_initialized()

        try:
            if progress_callback:
                progress_callback(10.0, "Preparing upscale request...")

            # Note: Runware SDK upscale method needs to be checked in actual SDK
            # This is a placeholder implementation
            if progress_callback:
                progress_callback(50.0, "Upscaling image...")

            # Placeholder for actual upscale implementation
            logger.warning("Upscale feature requires Runware SDK upscale method")
            raise NotImplementedError("Upscale feature will be implemented when SDK method is available")

        except Exception as e:
            logger.error(f"Image upscale failed: {str(e)}")
            if progress_callback:
                progress_callback(0.0, f"Error: {str(e)}")
            raise

    async def _save_image(self, image_url: str, prefix: str = "image") -> Path:
        """
        Download and save image locally.

        Args:
            image_url: URL of the image to download
            prefix: Filename prefix

        Returns:
            Path to saved image file
        """
        import aiohttp

        # Ensure storage directory exists
        settings.storage_path.mkdir(parents=True, exist_ok=True)

        # Generate filename
        filename = f"{prefix}.png"
        output_path = settings.storage_path / filename

        # Download image
        async with aiohttp.ClientSession() as session:
            async with session.get(image_url) as response:
                if response.status == 200:
                    with open(output_path, "wb") as f:
                        f.write(await response.read())
                    logger.info(f"Image saved to {output_path}")
                else:
                    raise Exception(f"Failed to download image: HTTP {response.status}")

        return output_path


# Global service instance
runware_service = RunwareService()
