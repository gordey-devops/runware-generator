/**
 * Shared types for Runware Generator
 * Re-export all types from api and ipc modules
 */

// API types
export type {
  TextToImageRequest,
  ImageToImageRequest,
  TextToVideoRequest,
  UpscaleRequest,
  GenerationResponse,
  GenerationListResponse,
  HistoryFilters,
  WebSocketMessage,
  ErrorResponse,
  HealthResponse,
} from './api.types';

export { GenerationStatus, GenerationType } from './api.types';

// IPC types
export type {
  IpcInvokeHandlers,
  IpcEventHandlers,
  AppSettings,
  BackendStatus,
  IpcInvokeCall,
  IpcEventListener,
} from './ipc.types';

export { IPC_CHANNELS } from './ipc.types';
