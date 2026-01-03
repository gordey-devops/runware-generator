"use strict";
/**
 * Electron Main Process
 * Entry point for the Electron application
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const pythonBridge_1 = require("./pythonBridge");
const ipcHandlers_1 = require("./ipcHandlers");
/**
 * Main window instance
 */
let mainWindow = null;
/**
 * Preload script path
 */
const PRELOAD_PATH = electron_is_dev_1.default
    ? path_1.default.join(__dirname, '../preload/preload.js')
    : path_1.default.join(__dirname, '../preload/preload.js');
console.log('[Main] __dirname:', __dirname);
console.log('[Main] PRELOAD_PATH:', PRELOAD_PATH);
console.log('[Main] Preload exists:', require('fs').existsSync(PRELOAD_PATH));
/**
 * Renderer URL
 * In dev mode, use file:// URL with built renderer to ensure preload script is loaded
 * In production, also use file:// URL
 */
// __dirname is dist/electron/electron/main
// Get absolute path to project root by going up from __dirname
const projectRoot = path_1.default.resolve(__dirname, '../../../..');
console.log('[Main] projectRoot:', projectRoot);
const rendererHtmlPath = electron_is_dev_1.default
    ? path_1.default.join(projectRoot, 'electron/renderer/dist/index.html')
    : path_1.default.join(__dirname, '../renderer/index.html');
// Use absolute path with proper file:// URL format for Windows
const absolutePath = path_1.default.resolve(rendererHtmlPath);
const RENDERER_URL = `file:///${absolutePath.replace(/\\/g, '/')}`;
console.log('[Main] __dirname:', __dirname);
console.log('[Main] rendererHtmlPath:', rendererHtmlPath);
console.log('[Main] absolutePath:', absolutePath);
console.log('[Main] RENDERER_URL:', RENDERER_URL);
console.log('[Main] Renderer HTML exists:', require('fs').existsSync(rendererHtmlPath));
/**
 * Create main application window
 */
async function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        show: false, // Don't show until ready
        backgroundColor: '#1a1a1a',
        webPreferences: {
            nodeIntegration: false, // Security: disable node integration
            contextIsolation: true, // Security: enable context isolation
            preload: PRELOAD_PATH,
            webSecurity: true,
            allowRunningInsecureContent: false,
        },
    });
    // Load renderer
    if (electron_is_dev_1.default) {
        console.log('[Main] Loading renderer from:', RENDERER_URL);
        await mainWindow.loadURL(RENDERER_URL);
        mainWindow.webContents.openDevTools();
    }
    else {
        console.log('[Main] Loading renderer from:', RENDERER_URL);
        await mainWindow.loadFile(path_1.default.join(__dirname, '../renderer/index.html'));
    }
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        console.log('[Main] Window ready and shown');
    });
    // Monitor preload script loading
    mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
        console.error('[Main] Preload script error:', error);
        console.error('[Main] Preload path:', preloadPath);
    });
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('[Main] Renderer loaded successfully');
        mainWindow?.webContents.executeJavaScript(`
      console.log('[Renderer Check] window.electronAPI:', window.electronAPI);
      console.log('[Renderer Check] typeof window.electronAPI:', typeof window.electronAPI);
    `);
    });
    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // Handle navigation (security)
    mainWindow.webContents.on('will-navigate', (event, url) => {
        // Allow navigation only in dev mode to localhost
        if (electron_is_dev_1.default && url.startsWith('http://localhost:5173')) {
            return;
        }
        // Block all other navigation
        event.preventDefault();
        console.warn('[Main] Blocked navigation to:', url);
    });
    // Handle new window requests (security)
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        console.warn('[Main] Blocked new window request to:', url);
        return { action: 'deny' };
    });
}
/**
 * Initialize application
 */
async function initialize() {
    console.log('[Main] Initializing Runware Generator...');
    try {
        // Register IPC handlers
        console.log('[Main] Registering IPC handlers...');
        (0, ipcHandlers_1.registerIpcHandlers)();
        // Start Python backend
        console.log('[Main] Starting Python backend...');
        await pythonBridge_1.pythonBridge.start();
        // Create main window
        console.log('[Main] Creating main window...');
        await createWindow();
        console.log('[Main] Initialization complete!');
    }
    catch (error) {
        console.error('[Main] Initialization failed:', error);
        // Show error dialog
        await electron_1.dialog.showErrorBox('Startup Error', `Failed to start Runware Generator:\n\n${error instanceof Error ? error.message : String(error)}\n\nPlease check that Python and all dependencies are installed correctly.`);
        // Quit application
        electron_1.app.quit();
    }
}
/**
 * Cleanup before quit
 */
async function cleanup() {
    console.log('[Main] Cleaning up...');
    try {
        // Unregister IPC handlers
        (0, ipcHandlers_1.unregisterIpcHandlers)();
        // Stop Python backend
        await pythonBridge_1.pythonBridge.stop();
        console.log('[Main] Cleanup complete');
    }
    catch (error) {
        console.error('[Main] Cleanup error:', error);
    }
}
// ===== Application Lifecycle Events =====
/**
 * App ready event
 */
electron_1.app.on('ready', async () => {
    console.log('[Main] App ready');
    await initialize();
});
/**
 * All windows closed event
 */
electron_1.app.on('window-all-closed', () => {
    // On macOS, apps typically stay active until explicitly quit
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
/**
 * Activate event (macOS)
 */
electron_1.app.on('activate', async () => {
    // On macOS, re-create window when dock icon is clicked and no windows open
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
    }
});
/**
 * Before quit event
 */
electron_1.app.on('before-quit', async (event) => {
    // Prevent quit to allow cleanup
    if (pythonBridge_1.pythonBridge.isRunning()) {
        event.preventDefault();
        await cleanup();
        electron_1.app.quit();
    }
});
/**
 * Will quit event
 */
electron_1.app.on('will-quit', async () => {
    console.log('[Main] Application quitting...');
    await cleanup();
});
// ===== Error Handling =====
/**
 * Unhandled rejection handler
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Main] Unhandled Rejection at:', promise, 'reason:', reason);
});
/**
 * Uncaught exception handler
 */
process.on('uncaughtException', (error) => {
    console.error('[Main] Uncaught Exception:', error);
    // Don't exit immediately, let cleanup happen
});
// Log startup
console.log('[Main] Runware Generator starting...');
console.log('[Main] Platform:', process.platform);
console.log('[Main] Electron version:', process.versions.electron);
console.log('[Main] Node version:', process.versions.node);
console.log('[Main] Development mode:', electron_is_dev_1.default);
//# sourceMappingURL=main.js.map