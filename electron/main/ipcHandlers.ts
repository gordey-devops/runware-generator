/**
 * IPC Handlers - Handles communication between renderer and main process
 * Proxies requests to the Python backend API
 */

import { ipcMain, app, shell } from 'electron';
import axios, { AxiosError } from 'axios';
import path from 'path';
import fs from 'fs/promises';
import { pythonBridge } from './pythonBridge';
import { IPC_CHANNELS } from '../../shared/types';
import type {
  TextToImageRequest,
  ImageToImageRequest,
  TextToVideoRequest,
  UpscaleRequest,
  GenerationResponse,
  GenerationListResponse,
  HistoryFilters,
} from '../../shared/types';

/**
 * Settings file path
 */
const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');

/**
 * Default settings
 */
const DEFAULT_SETTINGS = {
  outputDirectory: path.join(app.getPath('userData'), 'generated'),
  autoSaveImages: true,
  defaultWidth: 512,
  defaultHeight: 512,
  defaultSteps: 25,
  defaultGuidanceScale: 7.5,
  theme: 'system',
  language: 'en',
  maxConcurrentGenerations: 3,
  saveMetadata: true,
};

/**
 * API client instance
 */
const apiClient = axios.create({
  timeout: 60000, // 60 seconds for generation requests
});

/**
 * Get API base URL
 */
function getApiUrl(): string {
  return pythonBridge.getUrl();
}

/**
 * Handle API errors
 */
function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const responseData = axiosError.response.data as any;
      throw new Error(
        responseData?.message || responseData?.error || `API Error: ${axiosError.response.status}`
      );
    } else if (axiosError.request) {
      throw new Error('Backend is not responding. Please check if it is running.');
    }
  }
  throw error;
}

/**
 * Load settings from disk
 */
async function loadSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to disk
 */
async function saveSettings(settings: unknown) {
  const dir = path.dirname(SETTINGS_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  return settings;
}

/**
 * Register all IPC handlers
 */
export function registerIpcHandlers(): void {
  // ===== Generation Handlers =====

  ipcMain.handle(
    IPC_CHANNELS.GENERATE_TEXT_TO_IMAGE,
    async (_, request: TextToImageRequest): Promise<GenerationResponse> => {
      try {
        const response = await apiClient.post<GenerationResponse>(
          `${getApiUrl()}/api/generate/text-to-image`,
          request
        );
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.GENERATE_IMAGE_TO_IMAGE,
    async (_, request: ImageToImageRequest): Promise<GenerationResponse> => {
      try {
        const response = await apiClient.post<GenerationResponse>(
          `${getApiUrl()}/api/generate/image-to-image`,
          request
        );
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.GENERATE_TEXT_TO_VIDEO,
    async (_, request: TextToVideoRequest): Promise<GenerationResponse> => {
      try {
        const response = await apiClient.post<GenerationResponse>(
          `${getApiUrl()}/api/generate/text-to-video`,
          request
        );
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.UPSCALE_IMAGE,
    async (_, request: UpscaleRequest): Promise<GenerationResponse> => {
      try {
        const response = await apiClient.post<GenerationResponse>(
          `${getApiUrl()}/api/upscale`,
          request
        );
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    }
  );

  // ===== History Handlers =====

  ipcMain.handle(
    IPC_CHANNELS.HISTORY_GET_ALL,
    async (_, filters: HistoryFilters): Promise<GenerationListResponse> => {
      try {
        const response = await apiClient.get<GenerationListResponse>(`${getApiUrl()}/api/history`, {
          params: filters,
        });
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.HISTORY_GET_BY_ID,
    async (_, { id }: { id: number }): Promise<GenerationResponse> => {
      try {
        const response = await apiClient.get<GenerationResponse>(
          `${getApiUrl()}/api/history/${id}`
        );
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.HISTORY_DELETE,
    async (_, { id }: { id: number }): Promise<{ success: boolean }> => {
      try {
        await apiClient.delete(`${getApiUrl()}/api/history/${id}`);
        return { success: true };
      } catch (error) {
        handleApiError(error);
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.HISTORY_UPDATE,
    async (
      _,
      { id, updates }: { id: number; updates: Record<string, unknown> }
    ): Promise<GenerationResponse> => {
      try {
        const response = await apiClient.patch<GenerationResponse>(
          `${getApiUrl()}/api/history/${id}`,
          updates
        );
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    }
  );

  // ===== Settings Handlers =====

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    return loadSettings();
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, async (_, updates) => {
    const current = await loadSettings();
    const updated = { ...current, ...updates };
    return saveSettings(updated);
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET_API_KEY, async () => {
    // API key is stored in .env file, not in settings
    // For security, we only check if it exists, not return the actual value
    return { hasApiKey: !!process.env.RUNWARE_API_KEY };
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET_API_KEY, async (_, { apiKey }: { apiKey: string }) => {
    try {
      // Path to .env file in project root
      // In development: app.getAppPath() returns project root
      // In production: we should use a different approach (userData)
      const isDev = !app.isPackaged;
      const envPath = isDev
        ? path.join(app.getAppPath(), '.env')
        : path.join(app.getPath('userData'), '.env');

      // Ensure directory exists
      const envDir = path.dirname(envPath);
      await fs.mkdir(envDir, { recursive: true });

      // Read current .env content
      let envContent = '';
      try {
        envContent = await fs.readFile(envPath, 'utf-8');
      } catch (error) {
        // File doesn't exist, we'll create it
      }

      // Update or add RUNWARE_API_KEY
      const lines = envContent.split('\n').filter((line) => line.trim() !== '');
      const keyIndex = lines.findIndex((line) => line.startsWith('RUNWARE_API_KEY='));

      if (keyIndex >= 0) {
        lines[keyIndex] = `RUNWARE_API_KEY="${apiKey}"`;
      } else {
        lines.push(`RUNWARE_API_KEY="${apiKey}"`);
      }

      await fs.writeFile(envPath, lines.join('\n') + '\n', 'utf-8');

      console.log('[IPC] API key saved to .env file at:', envPath);

      // Note: Backend needs to be restarted to use new API key
      return { success: true };
    } catch (error) {
      console.error('[IPC] Failed to save API key:', error);
      console.error('[IPC] Error details:', error instanceof Error ? error.message : String(error));
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // ===== System Handlers =====

  ipcMain.handle(
    IPC_CHANNELS.APP_GET_PATH,
    async (_, { name }: { name: 'userData' | 'temp' | 'downloads' }) => {
      return { path: app.getPath(name) };
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.APP_OPEN_FOLDER,
    async (_, { path: folderPath }: { path: string }) => {
      try {
        await shell.openPath(folderPath);
        return { success: true };
      } catch (error) {
        console.error('[IPC] Failed to open folder:', error);
        return { success: false };
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, async () => {
    return { version: app.getVersion() };
  });

  ipcMain.handle(IPC_CHANNELS.BACKEND_STATUS, async () => {
    const running = pythonBridge.isRunning();
    let healthy = false;
    let runwareConnected = false;

    if (running) {
      try {
        const response = await apiClient.get(`${getApiUrl()}/health`);
        healthy = response.data.status === 'healthy';
        runwareConnected = response.data.runware_connected === true;
      } catch (error) {
        healthy = false;
      }
    }

    return {
      running,
      healthy,
      url: getApiUrl(),
      port: 8000,
      runwareConnected,
    };
  });

  console.log('[IPC] All handlers registered successfully');
}

/**
 * Unregister all IPC handlers
 */
export function unregisterIpcHandlers(): void {
  Object.values(IPC_CHANNELS).forEach((channel) => {
    ipcMain.removeHandler(channel);
  });
  console.log('[IPC] All handlers unregistered');
}
