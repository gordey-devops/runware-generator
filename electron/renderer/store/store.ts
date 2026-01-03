import { create } from 'zustand';

interface GenerationItem {
  id: number;
  type: 'text-to-image' | 'image-to-image' | 'text-to-video' | 'upscale';
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  guidanceScale: number;
  model?: string;
  outputUrl?: string;
  thumbnailUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  updatedAt: string;
  favorite?: boolean;
  tags?: string[];
  notes?: string;
}

interface AppSettings {
  runwareApiKey?: string;
  outputDirectory: string;
  autoSaveImages: boolean;
  defaultWidth: number;
  defaultHeight: number;
  defaultSteps: number;
  defaultGuidanceScale: number;
  defaultModel?: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  maxConcurrentGenerations: number;
  saveMetadata: boolean;
}

interface AppState {
  history: GenerationItem[];
  settings: AppSettings;
  currentGeneration: GenerationItem | null;
  isGenerating: boolean;
  progress: number;

  addGeneration: (generation: Omit<GenerationItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGeneration: (id: number, updates: Partial<GenerationItem>) => void;
  deleteGeneration: (id: number) => void;
  setHistory: (history: GenerationItem[]) => void;
  setCurrentGeneration: (generation: GenerationItem | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  outputDirectory: './generated',
  autoSaveImages: true,
  defaultWidth: 1024,
  defaultHeight: 1024,
  defaultSteps: 20,
  defaultGuidanceScale: 7.5,
  theme: 'dark',
  language: 'ru',
  maxConcurrentGenerations: 3,
  saveMetadata: true,
};

export const useStore = create<AppState>((set) => ({
  history: [],
  settings: defaultSettings,
  currentGeneration: null,
  isGenerating: false,
  progress: 0,

  addGeneration: (generation) =>
    set((state) => {
      const newItem: GenerationItem = {
        ...generation,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { history: [newItem, ...state.history] };
    }),

  updateGeneration: (id, updates) =>
    set((state) => ({
      history: state.history.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      ),
      currentGeneration:
        state.currentGeneration?.id === id
          ? { ...state.currentGeneration, ...updates, updatedAt: new Date().toISOString() }
          : state.currentGeneration,
    })),

  deleteGeneration: (id) =>
    set((state) => ({
      history: state.history.filter((item) => item.id !== id),
      currentGeneration: state.currentGeneration?.id === id ? null : state.currentGeneration,
    })),

  setHistory: (history) => set({ history }),

  setCurrentGeneration: (currentGeneration) => set({ currentGeneration }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  setProgress: (progress) => set({ progress }),

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),
}));
