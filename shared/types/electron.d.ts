/**
 * TypeScript declarations for Electron API
 * Provides type-safety for window.electronAPI in renderer process
 */

import type {
  TextToImageRequest,
  ImageToImageRequest,
  TextToVideoRequest,
  UpscaleRequest,
  GenerationResponse,
  GenerationListResponse,
  HistoryFilters,
  WebSocketMessage,
  AppSettings,
  BackendStatus,
} from './index';

/**
 * Electron API interface
 */
export interface ElectronAPI {
  generation: {
    textToImage: (request: TextToImageRequest) => Promise<GenerationResponse>;
    imageToImage: (request: ImageToImageRequest) => Promise<GenerationResponse>;
    textToVideo: (request: TextToVideoRequest) => Promise<GenerationResponse>;
    upscale: (request: UpscaleRequest) => Promise<GenerationResponse>;
  };

  history: {
    getAll: (filters?: HistoryFilters) => Promise<GenerationListResponse>;
    getById: (id: number) => Promise<GenerationResponse>;
    delete: (id: number) => Promise<{ success: boolean }>;
    update: (
      id: number,
      updates: Partial<{ favorite: boolean; tags: string[]; notes: string }>
    ) => Promise<GenerationResponse>;
  };

  settings: {
    get: () => Promise<AppSettings>;
    update: (updates: Partial<AppSettings>) => Promise<AppSettings>;
    getApiKey: () => Promise<{ hasApiKey: boolean; apiKey?: string }>;
    setApiKey: (apiKey: string) => Promise<{ success: boolean }>;
  };

  system: {
    getPath: (name: 'userData' | 'temp' | 'downloads') => Promise<{ path: string }>;
    openFolder: (path: string) => Promise<{ success: boolean }>;
    getVersion: () => Promise<{ version: string }>;
    getBackendStatus: () => Promise<BackendStatus>;
  };

  websocket: {
    onProgress: (callback: (message: WebSocketMessage) => void) => () => void;
    onComplete: (callback: (message: WebSocketMessage) => void) => () => void;
    onError: (callback: (message: WebSocketMessage) => void) => () => void;
  };
}

/**
 * Extend Window interface
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
