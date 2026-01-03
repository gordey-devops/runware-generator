import { useCallback } from 'react';
import { useGenerationStore } from '../store/generationStore';
import { useHistoryStore } from '../store/historyStore';
import { useUiStore } from '../store/uiStore';
import { useWebSocket } from './useWebSocket';
import { api } from '../api';
import type {
  TextToImageRequest,
  ImageToImageRequest,
  TextToVideoRequest,
} from '@shared/types/api.types';

export const useGeneration = () => {
  const {
    params,
    setProgress,
    resetProgress,
    setCurrentResult,
    addGeneration,
    sourceImage,
    strength,
    setCurrentGenerationId,
  } = useGenerationStore();
  const { addItem } = useHistoryStore();
  const { addNotification } = useUiStore();
  const { connect, disconnect } = useWebSocket();

  const generateTextToImage = useCallback(async () => {
    try {
      console.log('[useGeneration] Starting text-to-image generation...');

      // Reset progress
      resetProgress();
      setProgress({ status: 'generating', progress: 0, message: 'Initializing...' });

      const request: TextToImageRequest = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || undefined,
        width: params.width,
        height: params.height,
        steps: params.steps,
        guidance_scale: params.guidanceScale,
        seed: params.seed,
        model: params.model,
      };

      console.log('[useGeneration] Request:', request);

      // Start generation via API
      const result = await api.generation.textToImage(request);
      console.log('[useGeneration] Generation result:', result);

      // Check if generation is already completed
      if (result.status === 'completed') {
        console.log('[useGeneration] Generation already completed, showing result');
        setCurrentResult(result);
        addGeneration(result);
        addItem(result);
        setProgress({ status: 'completed', progress: 100 });
        addNotification('success', 'Image generated successfully!');
        return result;
      }

      // Set current generation ID for WebSocket
      setCurrentGenerationId(result.id);
      console.log('[useGeneration] Generation in progress, ID:', result.id);

      // Connect WebSocket for progress updates
      connect(result.id, {
        onProgress: (id, progress, message) => {
          console.log('[useGeneration] Progress:', id, progress, message);
          setProgress({ status: 'generating', progress, message });
        },
        onComplete: async (id, data) => {
          console.log('[useGeneration] Complete via WebSocket:', id, data);

          // Fetch full generation data from API
          const fullResult = await api.history.getById(id);
          setCurrentResult(fullResult);
          addGeneration(fullResult);
          addItem(fullResult);
          setProgress({ status: 'completed', progress: 100 });
          setCurrentGenerationId(null);
          disconnect();

          addNotification('success', 'Image generated successfully!');
        },
        onError: (id, error) => {
          console.error('[useGeneration] Error:', id, error);
          setProgress({
            status: 'error',
            progress: 0,
            error,
          });
          setCurrentGenerationId(null);
          disconnect();
          addNotification('error', 'Failed to generate image');
        },
      });

      return result;
    } catch (error) {
      console.error('[useGeneration] Exception:', error);
      setProgress({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Generation failed',
      });
      setCurrentGenerationId(null);
      disconnect();
      addNotification('error', 'Failed to generate image');
      throw error;
    }
  }, [
    params,
    resetProgress,
    setProgress,
    setCurrentResult,
    addGeneration,
    addItem,
    addNotification,
    setCurrentGenerationId,
    connect,
    disconnect,
  ]);

  const generateImageToImage = useCallback(async () => {
    if (!sourceImage) {
      addNotification('error', 'Please upload a source image');
      return;
    }

    try {
      resetProgress();
      setProgress({ status: 'generating', progress: 0, message: 'Initializing...' });

      const request: ImageToImageRequest = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || undefined,
        image_url: sourceImage,
        strength: strength,
        steps: params.steps,
        guidance_scale: params.guidanceScale,
        seed: params.seed,
        model: params.model,
      };

      console.log('[useGeneration] Image-to-image request:', request);

      const result = await api.generation.imageToImage(request);
      console.log('[useGeneration] Generation result:', result);

      // Check if already completed
      if (result.status === 'completed') {
        console.log('[useGeneration] Image-to-image already completed');
        setCurrentResult(result);
        addGeneration(result);
        addItem(result);
        setProgress({ status: 'completed', progress: 100 });
        addNotification('success', 'Image transformation completed!');
        return result;
      }

      setCurrentGenerationId(result.id);
      console.log('[useGeneration] Image-to-image in progress, ID:', result.id);

      connect(result.id, {
        onProgress: (id, progress, message) => {
          setProgress({ status: 'generating', progress, message });
        },
        onComplete: async (id, data) => {
          const fullResult = await api.history.getById(id);
          setCurrentResult(fullResult);
          addGeneration(fullResult);
          addItem(fullResult);
          setProgress({ status: 'completed', progress: 100 });
          setCurrentGenerationId(null);
          disconnect();

          addNotification('success', 'Image transformation completed!');
        },
        onError: (id, error) => {
          setProgress({
            status: 'error',
            progress: 0,
            error,
          });
          setCurrentGenerationId(null);
          disconnect();
          addNotification('error', 'Failed to transform image');
        },
      });

      return result;
    } catch (error) {
      setProgress({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Generation failed',
      });
      setCurrentGenerationId(null);
      disconnect();
      addNotification('error', 'Failed to transform image');
      throw error;
    }
  }, [
    params,
    sourceImage,
    strength,
    resetProgress,
    setProgress,
    setCurrentResult,
    addGeneration,
    addItem,
    addNotification,
    setCurrentGenerationId,
    connect,
    disconnect,
  ]);

  const generateTextToVideo = useCallback(async () => {
    try {
      resetProgress();
      setProgress({ status: 'generating', progress: 0, message: 'Initializing...' });

      const request: TextToVideoRequest = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || undefined,
        duration: 5,
        fps: 24,
        width: params.width,
        height: params.height,
        seed: params.seed,
        model: params.model,
      };

      console.log('[useGeneration] Text-to-video request:', request);

      const result = await api.generation.textToVideo(request);
      console.log('[useGeneration] Generation result:', result);

      // Check if already completed
      if (result.status === 'completed') {
        console.log('[useGeneration] Text-to-video already completed');
        setCurrentResult(result);
        addGeneration(result);
        addItem(result);
        setProgress({ status: 'completed', progress: 100 });
        addNotification('success', 'Video generated successfully!');
        return result;
      }

      setCurrentGenerationId(result.id);
      console.log('[useGeneration] Text-to-video in progress, ID:', result.id);

      connect(result.id, {
        onProgress: (id, progress, message) => {
          setProgress({ status: 'generating', progress, message });
        },
        onComplete: async (id, data) => {
          const fullResult = await api.history.getById(id);
          setCurrentResult(fullResult);
          addGeneration(fullResult);
          addItem(fullResult);
          setProgress({ status: 'completed', progress: 100 });
          setCurrentGenerationId(null);
          disconnect();

          addNotification('success', 'Video generated successfully!');
        },
        onError: (id, error) => {
          setProgress({
            status: 'error',
            progress: 0,
            error,
          });
          setCurrentGenerationId(null);
          disconnect();
          addNotification('error', 'Failed to generate video');
        },
      });

      return result;
    } catch (error) {
      setProgress({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Generation failed',
      });
      setCurrentGenerationId(null);
      disconnect();
      addNotification('error', 'Failed to generate video');
      throw error;
    }
  }, [
    params,
    resetProgress,
    setProgress,
    setCurrentResult,
    addGeneration,
    addItem,
    addNotification,
    setCurrentGenerationId,
    connect,
    disconnect,
  ]);

  return {
    generateTextToImage,
    generateImageToImage,
    generateTextToVideo,
  };
};
