"use strict";
/**
 * IPC channel names and types for Electron main <-> renderer communication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC_CHANNELS = void 0;
/**
 * IPC Channel names
 * All channels are typed and validated
 */
exports.IPC_CHANNELS = {
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
};
//# sourceMappingURL=ipc.types.js.map