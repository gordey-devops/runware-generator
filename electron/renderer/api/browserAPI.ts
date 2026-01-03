/**
 * Browser API - Direct HTTP calls to FastAPI backend
 * Used when running in browser instead of Electron
 */

const BACKEND_URL = 'http://127.0.0.1:8000';

export const browserAPI = {
  // ===== Generation API =====
  generation: {
    textToImage: async (request: any) => {
      const response = await fetch(`${BACKEND_URL}/api/generate/text-to-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },

    imageToImage: async (request: any) => {
      const response = await fetch(`${BACKEND_URL}/api/generate/image-to-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },

    textToVideo: async (request: any) => {
      const response = await fetch(`${BACKEND_URL}/api/generate/text-to-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },

    upscale: async (request: any) => {
      const response = await fetch(`${BACKEND_URL}/api/upscale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
  },

  // ===== History API =====
  history: {
    getAll: async (filters?: any) => {
      const params = new URLSearchParams(filters || {});
      const response = await fetch(`${BACKEND_URL}/api/history?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },

    getById: async (id: number) => {
      const response = await fetch(`${BACKEND_URL}/api/history/${id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },

    delete: async (id: number) => {
      const response = await fetch(`${BACKEND_URL}/api/history/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },

    update: async (id: number, updates: any) => {
      const response = await fetch(`${BACKEND_URL}/api/history/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
  },

  // ===== Settings API =====
  settings: {
    get: async () => {
      // Return default settings for browser mode
      return {
        outputDirectory: './generated',
        autoSaveImages: true,
        defaultWidth: 512,
        defaultHeight: 512,
        defaultSteps: 25,
        defaultGuidanceScale: 7.5,
        theme: 'dark',
        language: 'ru',
        maxConcurrentGenerations: 3,
        saveMetadata: true,
      };
    },

    update: async (updates: any) => {
      // In browser mode, just return the updates
      console.log('Settings update (browser mode):', updates);
      return updates;
    },

    getApiKey: async () => {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { hasApiKey: data.runware_connected };
    },

    setApiKey: async (apiKey: string) => {
      const response = await fetch(`${BACKEND_URL}/settings/api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
  },

  // ===== System API =====
  system: {
    getPath: async (name: string) => {
      return { path: `./${name}` };
    },

    openFolder: async (path: string) => {
      console.log('Open folder (browser mode):', path);
      return { success: false };
    },

    getVersion: async () => {
      return { version: '0.1.0' };
    },

    getBackendStatus: async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/health`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return {
          running: true,
          healthy: data.status === 'healthy',
          url: BACKEND_URL,
          port: 8000,
          runwareConnected: data.runware_connected,
        };
      } catch (error) {
        return {
          running: false,
          healthy: false,
          url: BACKEND_URL,
          port: 8000,
          runwareConnected: false,
        };
      }
    },
  },

  // ===== WebSocket Events =====
  websocket: {
    onProgress: (callback: any) => {
      console.log('WebSocket onProgress (browser mode)');
      return () => {};
    },

    onComplete: (callback: any) => {
      console.log('WebSocket onComplete (browser mode)');
      return () => {};
    },

    onError: (callback: any) => {
      console.log('WebSocket onError (browser mode)');
      return () => {};
    },
  },
};
