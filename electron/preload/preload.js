"use strict";
/**
 * Preload Script - Exposes safe API to renderer process
 * Uses contextBridge for secure communication between main and renderer
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
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
};
console.log('[Preload] Script starting...');
console.log('[Preload] contextBridge available:', typeof electron_1.contextBridge !== 'undefined');
console.log('[Preload] ipcRenderer available:', typeof electron_1.ipcRenderer !== 'undefined');
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
        textToImage: (request) => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.GENERATE_TEXT_TO_IMAGE, request);
        },
        /**
         * Transform image using prompt
         */
        imageToImage: (request) => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.GENERATE_IMAGE_TO_IMAGE, request);
        },
        /**
         * Generate video from text prompt
         */
        textToVideo: (request) => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.GENERATE_TEXT_TO_VIDEO, request);
        },
        /**
         * Upscale image
         */
        upscale: (request) => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.UPSCALE_IMAGE, request);
        },
    },
    // ===== History API =====
    history: {
        /**
         * Get all generations with optional filters
         */
        getAll: (filters) => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.HISTORY_GET_ALL, filters || {});
        },
        /**
         * Get generation by ID
         */
        getById: (id) => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.HISTORY_GET_BY_ID, { id });
        },
        /**
         * Delete generation from history
         */
        delete: (id) => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.HISTORY_DELETE, { id });
        },
        /**
         * Update generation metadata (favorite, tags, notes)
         */
        update: (id, updates) => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.HISTORY_UPDATE, { id, updates });
        },
    },
    // ===== Settings API =====
    settings: {
        /**
         * Get application settings
         */
        get: () => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET);
        },
        /**
         * Update application settings
         */
        update: (updates) => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, updates);
        },
        /**
         * Check if API key is configured
         */
        getApiKey: () => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET_API_KEY);
        },
        /**
         * Set API key (requires app restart)
         */
        setApiKey: (apiKey) => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET_API_KEY, { apiKey });
        },
    },
    // ===== System API =====
    system: {
        /**
         * Get application path
         */
        getPath: (name) => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.APP_GET_PATH, { name });
        },
        /**
         * Open folder in system file manager
         */
        openFolder: (path) => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.APP_OPEN_FOLDER, { path });
        },
        /**
         * Get application version
         */
        getVersion: () => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION);
        },
        /**
         * Get backend status
         */
        getBackendStatus: () => {
            return electron_1.ipcRenderer.invoke(IPC_CHANNELS.BACKEND_STATUS);
        },
    },
    // ===== WebSocket Events =====
    websocket: {
        /**
         * Subscribe to progress updates
         */
        onProgress: (callback) => {
            const listener = (_event, message) => {
                callback(message);
            };
            electron_1.ipcRenderer.on(IPC_CHANNELS.WS_PROGRESS, listener);
            // Return cleanup function
            return () => {
                electron_1.ipcRenderer.removeListener(IPC_CHANNELS.WS_PROGRESS, listener);
            };
        },
        /**
         * Subscribe to completion events
         */
        onComplete: (callback) => {
            const listener = (_event, message) => {
                callback(message);
            };
            electron_1.ipcRenderer.on(IPC_CHANNELS.WS_COMPLETE, listener);
            return () => {
                electron_1.ipcRenderer.removeListener(IPC_CHANNELS.WS_COMPLETE, listener);
            };
        },
        /**
         * Subscribe to error events
         */
        onError: (callback) => {
            const listener = (_event, message) => {
                callback(message);
            };
            electron_1.ipcRenderer.on(IPC_CHANNELS.WS_ERROR, listener);
            return () => {
                electron_1.ipcRenderer.removeListener(IPC_CHANNELS.WS_ERROR, listener);
            };
        },
    },
};
// Expose API to renderer process
console.log('[Preload] Exposing electronAPI to window...');
console.log('[Preload] electronAPI object:', electronAPI);
console.log('[Preload] Calling contextBridge.exposeInMainWorld...');
try {
    electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
    console.log('[Preload] electronAPI exposed successfully!');
}
catch (error) {
    console.error('[Preload] Failed to expose electronAPI:', error);
}
// Log preload script initialization
console.log('[Preload] Electron API initialized');
//# sourceMappingURL=preload.js.map