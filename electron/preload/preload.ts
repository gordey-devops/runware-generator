/**
 * Preload Script - Exposes safe API to renderer process
 * Uses contextBridge for secure communication between main and renderer
 */

import { contextBridge, ipcRenderer } from 'electron';

const IPC_CHANNELS = {
  GENERATE_TEXT_TO_IMAGE: 'generate:text-to-image',
  GENERATE_IMAGE_TO_IMAGE: 'generate:image-to-image',
  GENERATE_TEXT_TO_VIDEO: 'generate:text-to-video',
  UPSCALE_IMAGE: 'generate:upscale',
  HISTORY_GET_ALL: 'history:get-all',
  HISTORY_GET_BY_ID: 'history:get-by-id',
  HISTORY_DELETE: 'history:delete',
  HISTORY_UPDATE: 'history:update',
  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_GET_API_KEY: 'settings:get-api-key',
  SETTINGS_SET_API_KEY: 'settings:set-api-key',
  APP_GET_PATH: 'app:get-path',
  APP_OPEN_FOLDER: 'app:open-folder',
  APP_GET_VERSION: 'app:get-version',
  BACKEND_STATUS: 'backend:status',
  WS_PROGRESS: 'ws:progress',
  WS_COMPLETE: 'ws:complete',
  WS_ERROR: 'ws:error',
} as const;

console.log('[Preload] Script starting...');
console.log('[Preload] contextBridge available:', typeof contextBridge !== 'undefined');
console.log('[Preload] ipcRenderer available:', typeof ipcRenderer !== 'undefined');
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
} from '../../shared/types';

/**
 * Electron API exposed to renderer process
 * Available as window.electronAPI in renderer
 */
const electronAPI = {
  // ===== Generation API =====
  generation: {
    /**
     * Generate image from text prompt
     */
    textToImage: (request: TextToImageRequest): Promise<GenerationResponse> => {
      return ipcRenderer.invoke(IPC_CHANNELS.GENERATE_TEXT_TO_IMAGE, request);
    },

    /**
     * Transform image using prompt
     */
    imageToImage: (request: ImageToImageRequest): Promise<GenerationResponse> => {
      return ipcRenderer.invoke(IPC_CHANNELS.GENERATE_IMAGE_TO_IMAGE, request);
    },

    /**
     * Generate video from text prompt
     */
    textToVideo: (request: TextToVideoRequest): Promise<GenerationResponse> => {
      return ipcRenderer.invoke(IPC_CHANNELS.GENERATE_TEXT_TO_VIDEO, request);
    },

    /**
     * Upscale image
     */
    upscale: (request: UpscaleRequest): Promise<GenerationResponse> => {
      return ipcRenderer.invoke(IPC_CHANNELS.UPSCALE_IMAGE, request);
    },
  },

  // ===== History API =====
  history: {
    /**
     * Get all generations with optional filters
     */
    getAll: (filters?: HistoryFilters): Promise<GenerationListResponse> => {
      return ipcRenderer.invoke(IPC_CHANNELS.HISTORY_GET_ALL, filters || {});
    },

    /**
     * Get generation by ID
     */
    getById: (id: number): Promise<GenerationResponse> => {
      return ipcRenderer.invoke(IPC_CHANNELS.HISTORY_GET_BY_ID, { id });
    },

    /**
     * Delete generation from history
     */
    delete: (id: number): Promise<{ success: boolean }> => {
      return ipcRenderer.invoke(IPC_CHANNELS.HISTORY_DELETE, { id });
    },

    /**
     * Update generation metadata (favorite, tags, notes)
     */
    update: (
      id: number,
      updates: Partial<{ favorite: boolean; tags: string[]; notes: string }>
    ): Promise<GenerationResponse> => {
      return ipcRenderer.invoke(IPC_CHANNELS.HISTORY_UPDATE, { id, updates });
    },
  },

  // ===== Settings API =====
  settings: {
    /**
     * Get application settings
     */
    get: (): Promise<AppSettings> => {
      return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET);
    },

    /**
     * Update application settings
     */
    update: (updates: Partial<AppSettings>): Promise<AppSettings> => {
      return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, updates);
    },

    /**
     * Check if API key is configured
     */
    getApiKey: (): Promise<{ hasApiKey: boolean; apiKey?: string }> => {
      return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET_API_KEY);
    },

    /**
     * Set API key (requires app restart)
     */
    setApiKey: (apiKey: string): Promise<{ success: boolean }> => {
      return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET_API_KEY, { apiKey });
    },
  },

  // ===== System API =====
  system: {
    /**
     * Get application path
     */
    getPath: (name: 'userData' | 'temp' | 'downloads'): Promise<{ path: string }> => {
      return ipcRenderer.invoke(IPC_CHANNELS.APP_GET_PATH, { name });
    },

    /**
     * Open folder in system file manager
     */
    openFolder: (path: string): Promise<{ success: boolean }> => {
      return ipcRenderer.invoke(IPC_CHANNELS.APP_OPEN_FOLDER, { path });
    },

    /**
     * Get application version
     */
    getVersion: (): Promise<{ version: string }> => {
      return ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION);
    },

    /**
     * Get backend status
     */
    getBackendStatus: (): Promise<BackendStatus> => {
      return ipcRenderer.invoke(IPC_CHANNELS.BACKEND_STATUS);
    },
  },

  // ===== WebSocket Events =====
  websocket: {
    /**
     * Subscribe to progress updates
     */
    onProgress: (callback: (message: WebSocketMessage) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, message: WebSocketMessage) => {
        callback(message);
      };
      ipcRenderer.on(IPC_CHANNELS.WS_PROGRESS, listener);

      // Return cleanup function
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.WS_PROGRESS, listener);
      };
    },

    /**
     * Subscribe to completion events
     */
    onComplete: (callback: (message: WebSocketMessage) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, message: WebSocketMessage) => {
        callback(message);
      };
      ipcRenderer.on(IPC_CHANNELS.WS_COMPLETE, listener);

      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.WS_COMPLETE, listener);
      };
    },

    /**
     * Subscribe to error events
     */
    onError: (callback: (message: WebSocketMessage) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, message: WebSocketMessage) => {
        callback(message);
      };
      ipcRenderer.on(IPC_CHANNELS.WS_ERROR, listener);

      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.WS_ERROR, listener);
      };
    },
  },
};

// Expose API to renderer process
console.log('[Preload] Exposing electronAPI to window...');
console.log('[Preload] electronAPI object:', electronAPI);
console.log('[Preload] Calling contextBridge.exposeInMainWorld...');

try {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  console.log('[Preload] electronAPI exposed successfully!');
} catch (error) {
  console.error('[Preload] Failed to expose electronAPI:', error);
}

// Type augmentation for TypeScript support in renderer
export type ElectronAPI = typeof electronAPI;

// Log preload script initialization
console.log('[Preload] Electron API initialized');
