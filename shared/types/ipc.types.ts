/**
 * IPC channel names and types for Electron main <-> renderer communication
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
} from './api.types';

/**
 * IPC Channel names
 * All channels are typed and validated
 */
export const IPC_CHANNELS = {
  // Generation channels
  GENERATE_TEXT_TO_IMAGE: 'generate:text-to-image',
  GENERATE_IMAGE_TO_IMAGE: 'generate:image-to-image',
  GENERATE_TEXT_TO_VIDEO: 'generate:text-to-video',
  UPSCALE_IMAGE: 'generate:upscale',

  // History channels
  HISTORY_GET_ALL: 'history:get-all',
  HISTORY_GET_BY_ID: 'history:get-by-id',
  HISTORY_DELETE: 'history:delete',
  HISTORY_UPDATE: 'history:update',

  // Settings channels
  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_GET_API_KEY: 'settings:get-api-key',
  SETTINGS_SET_API_KEY: 'settings:set-api-key',

  // System channels
  APP_GET_PATH: 'app:get-path',
  APP_OPEN_FOLDER: 'app:open-folder',
  APP_GET_VERSION: 'app:get-version',
  BACKEND_STATUS: 'backend:status',

  // WebSocket events (one-way from main to renderer)
  WS_PROGRESS: 'ws:progress',
  WS_COMPLETE: 'ws:complete',
  WS_ERROR: 'ws:error',
} as const;

/**
 * Type-safe IPC invoke handlers
 */
export interface IpcInvokeHandlers {
  // Generation
  [IPC_CHANNELS.GENERATE_TEXT_TO_IMAGE]: {
    request: TextToImageRequest;
    response: GenerationResponse;
  };
  [IPC_CHANNELS.GENERATE_IMAGE_TO_IMAGE]: {
    request: ImageToImageRequest;
    response: GenerationResponse;
  };
  [IPC_CHANNELS.GENERATE_TEXT_TO_VIDEO]: {
    request: TextToVideoRequest;
    response: GenerationResponse;
  };
  [IPC_CHANNELS.UPSCALE_IMAGE]: {
    request: UpscaleRequest;
    response: GenerationResponse;
  };

  // History
  [IPC_CHANNELS.HISTORY_GET_ALL]: {
    request: HistoryFilters;
    response: GenerationListResponse;
  };
  [IPC_CHANNELS.HISTORY_GET_BY_ID]: {
    request: { id: number };
    response: GenerationResponse;
  };
  [IPC_CHANNELS.HISTORY_DELETE]: {
    request: { id: number };
    response: { success: boolean };
  };
  [IPC_CHANNELS.HISTORY_UPDATE]: {
    request: {
      id: number;
      updates: Partial<{
        favorite: boolean;
        tags: string[];
        notes: string;
      }>;
    };
    response: GenerationResponse;
  };

  // Settings
  [IPC_CHANNELS.SETTINGS_GET]: {
    request: void;
    response: AppSettings;
  };
  [IPC_CHANNELS.SETTINGS_UPDATE]: {
    request: Partial<AppSettings>;
    response: AppSettings;
  };
  [IPC_CHANNELS.SETTINGS_GET_API_KEY]: {
    request: void;
    response: { hasApiKey: boolean; apiKey?: string };
  };
  [IPC_CHANNELS.SETTINGS_SET_API_KEY]: {
    request: { apiKey: string };
    response: { success: boolean };
  };

  // System
  [IPC_CHANNELS.APP_GET_PATH]: {
    request: { name: 'userData' | 'temp' | 'downloads' };
    response: { path: string };
  };
  [IPC_CHANNELS.APP_OPEN_FOLDER]: {
    request: { path: string };
    response: { success: boolean };
  };
  [IPC_CHANNELS.APP_GET_VERSION]: {
    request: void;
    response: { version: string };
  };
  [IPC_CHANNELS.BACKEND_STATUS]: {
    request: void;
    response: BackendStatus;
  };
}

/**
 * Type-safe IPC event handlers (one-way communication)
 */
export interface IpcEventHandlers {
  [IPC_CHANNELS.WS_PROGRESS]: WebSocketMessage;
  [IPC_CHANNELS.WS_COMPLETE]: WebSocketMessage;
  [IPC_CHANNELS.WS_ERROR]: WebSocketMessage;
}

/**
 * Application settings stored locally
 */
export interface AppSettings {
  // API Configuration
  runwareApiKey?: string;

  // Storage
  outputDirectory: string;
  autoSaveImages: boolean;

  // Defaults
  defaultWidth: number;
  defaultHeight: number;
  defaultSteps: number;
  defaultGuidanceScale: number;
  defaultModel?: string;

  // UI Preferences
  theme: 'light' | 'dark' | 'system';
  language: string;

  // Advanced
  maxConcurrentGenerations: number;
  saveMetadata: boolean;
}

/**
 * Backend status information
 */
export interface BackendStatus {
  running: boolean;
  healthy: boolean;
  url: string;
  port: number;
  runwareConnected: boolean;
  error?: string;
}

/**
 * Helper type for IPC invoke calls
 */
export type IpcInvokeCall<T extends keyof IpcInvokeHandlers> = {
  channel: T;
  request: IpcInvokeHandlers[T]['request'];
  response: IpcInvokeHandlers[T]['response'];
};

/**
 * Helper type for IPC event listeners
 */
export type IpcEventListener<T extends keyof IpcEventHandlers> = {
  channel: T;
  payload: IpcEventHandlers[T];
};
