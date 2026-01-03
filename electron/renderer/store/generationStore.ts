import { create } from 'zustand';
import type { TextToImageRequest, ImageToImageRequest, GenerationItem } from '@shared/types/api.types';

export interface GenerationProgress {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

interface GenerationParams {
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
  steps: number;
  guidanceScale: number;
  seed?: number;
  model: string;
}

interface GenerationStore {
  // Current generation parameters
  params: GenerationParams;
  setParams: (params: Partial<GenerationParams>) => void;
  resetParams: () => void;

  // Generation progress
  progress: GenerationProgress;
  setProgress: (progress: Partial<GenerationProgress>) => void;
  resetProgress: () => void;

  // Current generation result
  currentResult: GenerationItem | null;
  setCurrentResult: (result: GenerationItem | null) => void;

  // Recent generations (last 10)
  recentGenerations: GenerationItem[];
  addGeneration: (generation: GenerationItem) => void;
  clearRecent: () => void;

  // Image-to-Image specific
  sourceImage: string | null;
  setSourceImage: (image: string | null) => void;
  strength: number;
  setStrength: (strength: number) => void;
}

const defaultParams: GenerationParams = {
  prompt: '',
  negativePrompt: '',
  width: 512,
  height: 512,
  steps: 20,
  guidanceScale: 7.5,
  seed: undefined,
  model: 'runware:100@1',
};

export const useGenerationStore = create<GenerationStore>((set) => ({
  // Parameters
  params: defaultParams,
  setParams: (newParams) =>
    set((state) => ({
      params: { ...state.params, ...newParams },
    })),
  resetParams: () => set({ params: defaultParams }),

  // Progress
  progress: {
    status: 'idle',
    progress: 0,
  },
  setProgress: (newProgress) =>
    set((state) => ({
      progress: { ...state.progress, ...newProgress },
    })),
  resetProgress: () =>
    set({
      progress: {
        status: 'idle',
        progress: 0,
      },
    }),

  // Current result
  currentResult: null,
  setCurrentResult: (result) => set({ currentResult: result }),

  // Recent generations
  recentGenerations: [],
  addGeneration: (generation) =>
    set((state) => ({
      recentGenerations: [generation, ...state.recentGenerations].slice(0, 10),
    })),
  clearRecent: () => set({ recentGenerations: [] }),

  // Image-to-Image
  sourceImage: null,
  setSourceImage: (image) => set({ sourceImage: image }),
  strength: 0.75,
  setStrength: (strength) => set({ strength }),
}));
