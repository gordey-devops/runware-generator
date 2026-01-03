"use strict";
/**
 * IPC Handlers - Handles communication between renderer and main process
 * Proxies requests to the Python backend API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpcHandlers = registerIpcHandlers;
exports.unregisterIpcHandlers = unregisterIpcHandlers;
const electron_1 = require("electron");
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const pythonBridge_1 = require("./pythonBridge");
const types_1 = require("../../shared/types");
/**
 * Settings file path
 */
const SETTINGS_FILE = path_1.default.join(electron_1.app.getPath('userData'), 'settings.json');
/**
 * Default settings
 */
const DEFAULT_SETTINGS = {
    outputDirectory: path_1.default.join(electron_1.app.getPath('userData'), 'generated'),
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
const apiClient = axios_1.default.create({
    timeout: 60000, // 60 seconds for generation requests
});
/**
 * Get API base URL
 */
function getApiUrl() {
    return pythonBridge_1.pythonBridge.getUrl();
}
/**
 * Handle API errors
 */
function handleApiError(error) {
    if (axios_1.default.isAxiosError(error)) {
        const axiosError = error;
        if (axiosError.response) {
            const responseData = axiosError.response.data;
            throw new Error(responseData?.message ||
                responseData?.error ||
                `API Error: ${axiosError.response.status}`);
        }
        else if (axiosError.request) {
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
        const data = await promises_1.default.readFile(SETTINGS_FILE, 'utf-8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
    catch (error) {
        return DEFAULT_SETTINGS;
    }
}
/**
 * Save settings to disk
 */
async function saveSettings(settings) {
    const dir = path_1.default.dirname(SETTINGS_FILE);
    await promises_1.default.mkdir(dir, { recursive: true });
    await promises_1.default.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return settings;
}
/**
 * Register all IPC handlers
 */
function registerIpcHandlers() {
    // ===== Generation Handlers =====
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.GENERATE_TEXT_TO_IMAGE, async (_, request) => {
        try {
            const response = await apiClient.post(`${getApiUrl()}/api/generate/text-to-image`, request);
            return response.data;
        }
        catch (error) {
            handleApiError(error);
        }
    });
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.GENERATE_IMAGE_TO_IMAGE, async (_, request) => {
        try {
            const response = await apiClient.post(`${getApiUrl()}/api/generate/image-to-image`, request);
            return response.data;
        }
        catch (error) {
            handleApiError(error);
        }
    });
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.GENERATE_TEXT_TO_VIDEO, async (_, request) => {
        try {
            const response = await apiClient.post(`${getApiUrl()}/api/generate/text-to-video`, request);
            return response.data;
        }
        catch (error) {
            handleApiError(error);
        }
    });
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.UPSCALE_IMAGE, async (_, request) => {
        try {
            const response = await apiClient.post(`${getApiUrl()}/api/upscale`, request);
            return response.data;
        }
        catch (error) {
            handleApiError(error);
        }
    });
    // ===== History Handlers =====
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.HISTORY_GET_ALL, async (_, filters) => {
        try {
            const response = await apiClient.get(`${getApiUrl()}/api/history`, { params: filters });
            return response.data;
        }
        catch (error) {
            handleApiError(error);
        }
    });
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.HISTORY_GET_BY_ID, async (_, { id }) => {
        try {
            const response = await apiClient.get(`${getApiUrl()}/api/history/${id}`);
            return response.data;
        }
        catch (error) {
            handleApiError(error);
        }
    });
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.HISTORY_DELETE, async (_, { id }) => {
        try {
            await apiClient.delete(`${getApiUrl()}/api/history/${id}`);
            return { success: true };
        }
        catch (error) {
            handleApiError(error);
        }
    });
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.HISTORY_UPDATE, async (_, { id, updates }) => {
        try {
            const response = await apiClient.patch(`${getApiUrl()}/api/history/${id}`, updates);
            return response.data;
        }
        catch (error) {
            handleApiError(error);
        }
    });
    // ===== Settings Handlers =====
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.SETTINGS_GET, async () => {
        return loadSettings();
    });
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.SETTINGS_UPDATE, async (_, updates) => {
        const current = await loadSettings();
        const updated = { ...current, ...updates };
        return saveSettings(updated);
    });
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.SETTINGS_GET_API_KEY, async () => {
        // API key is stored in .env file, not in settings
        // For security, we only check if it exists, not return the actual value
        return { hasApiKey: !!process.env.RUNWARE_API_KEY };
    });
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.SETTINGS_SET_API_KEY, async (_, { apiKey }) => {
        // TODO: Implement secure API key storage
        // For now, this requires manually updating .env file
        console.warn('[IPC] API key setting not implemented. Please update .env file manually.');
        return { success: false };
    });
    // ===== System Handlers =====
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.APP_GET_PATH, async (_, { name }) => {
        return { path: electron_1.app.getPath(name) };
    });
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.APP_OPEN_FOLDER, async (_, { path: folderPath }) => {
        try {
            await electron_1.shell.openPath(folderPath);
            return { success: true };
        }
        catch (error) {
            console.error('[IPC] Failed to open folder:', error);
            return { success: false };
        }
    });
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.APP_GET_VERSION, async () => {
        return { version: electron_1.app.getVersion() };
    });
    electron_1.ipcMain.handle(types_1.IPC_CHANNELS.BACKEND_STATUS, async () => {
        const running = pythonBridge_1.pythonBridge.isRunning();
        let healthy = false;
        let runwareConnected = false;
        if (running) {
            try {
                const response = await apiClient.get(`${getApiUrl()}/health`);
                healthy = response.data.status === 'healthy';
                runwareConnected = response.data.runware_connected === true;
            }
            catch (error) {
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
function unregisterIpcHandlers() {
    Object.values(types_1.IPC_CHANNELS).forEach((channel) => {
        electron_1.ipcMain.removeHandler(channel);
    });
    console.log('[IPC] All handlers unregistered');
}
//# sourceMappingURL=ipcHandlers.js.map