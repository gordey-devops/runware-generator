import { useCallback } from 'react';
import { useGenerationStore } from '../store/generationStore';
import { useHistoryStore } from '../store/historyStore';
import { useUiStore } from '../store/uiStore';
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
  } = useGenerationStore();
  const { addItem } = useHistoryStore();
  const { addNotification } = useUiStore();

  const generateTextToImage = useCallback(async () => {
    try {
      console.log('[useGeneration] Starting generation...');
      console.log('[useGeneration] window.electronAPI:', window.electronAPI);

      if (!window.electronAPI || !window.electronAPI.generation) {
        const errorMsg =
          'Electron API is not available. Make sure the app is running in Electron environment.';
        console.error('[useGeneration]', errorMsg);
        setProgress({
          status: 'error',
          progress: 0,
          error: errorMsg,
        });
        addNotification('error', errorMsg);
        throw new Error(errorMsg);
      }

      // Reset progress
      resetProgress();
      setProgress({ status: 'generating', progress: 0 });

      const request: TextToImageRequest = {
        prompt: params.prompt,
        negativePrompt: params.negativePrompt || undefined,
        width: params.width,
        height: params.height,
        steps: params.steps,
        guidanceScale: params.guidanceScale,
        seed: params.seed,
        model: params.model,
      };

      console.log('[useGeneration] Request:', request);

      // Call Electron API
      console.log('[useGeneration] Calling window.electronAPI.generation.textToImage...');
      const result = await window.electronAPI.generation.textToImage(request);
      console.log('[useGeneration] Result:', result);

      // Update progress
      setProgress({ status: 'completed', progress: 100 });
      setCurrentResult(result);
      addGeneration(result);
      addItem(result);

      // Show notification
      addNotification('success', 'Image generated successfully!');

      return result;
    } catch (error) {
      setProgress({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Generation failed',
      });
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
  ]);

  const generateImageToImage = useCallback(async () => {
    if (!sourceImage) {
      addNotification('error', 'Please upload a source image');
      return;
    }

    try {
      resetProgress();
      setProgress({ status: 'generating', progress: 0 });

      const request: ImageToImageRequest = {
        prompt: params.prompt,
        negativePrompt: params.negativePrompt || undefined,
        inputImage: sourceImage,
        strength: strength,
        steps: params.steps,
        guidanceScale: params.guidanceScale,
        seed: params.seed,
        model: params.model,
      };

      const result = await window.electronAPI.generation.imageToImage(request);

      setProgress({ status: 'completed', progress: 100 });
      setCurrentResult(result);
      addGeneration(result);
      addItem(result);

      addNotification('success', 'Image transformation completed!');

      return result;
    } catch (error) {
      setProgress({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Generation failed',
      });
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
  ]);

  const generateTextToVideo = useCallback(async () => {
    try {
      resetProgress();
      setProgress({ status: 'generating', progress: 0 });

      const request: TextToVideoRequest = {
        prompt: params.prompt,
        negativePrompt: params.negativePrompt || undefined,
        duration: 5,
        fps: 24,
        width: params.width,
        height: params.height,
        seed: params.seed,
        model: params.model,
      };

      const result = await window.electronAPI.generation.textToVideo(request);

      setProgress({ status: 'completed', progress: 100 });
      setCurrentResult(result);
      addGeneration(result);
      addItem(result);

      addNotification('success', 'Video generated successfully!');

      return result;
    } catch (error) {
      setProgress({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Generation failed',
      });
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
  ]);

  return {
    generateTextToImage,
    generateImageToImage,
    generateTextToVideo,
  };
};
