/**
 * Electron Main Process
 * Entry point for the Electron application
 */

import { app, BrowserWindow, dialog } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { pythonBridge } from './pythonBridge';
import { registerIpcHandlers, unregisterIpcHandlers } from './ipcHandlers';

/**
 * Main window instance
 */
let mainWindow: BrowserWindow | null = null;

/**
 * Preload script path
 */
const PRELOAD_PATH = isDev
  ? path.join(__dirname, '../preload/preload.js')
  : path.join(__dirname, '../preload/preload.js');

console.log('[Main] __dirname:', __dirname);
console.log('[Main] PRELOAD_PATH:', PRELOAD_PATH);
console.log('[Main] Preload exists:', require('fs').existsSync(PRELOAD_PATH));

/**
 * Renderer URL
 * In dev mode, use Vite dev server
 * In production, use file:// URL
 */
const RENDERER_URL = isDev
  ? 'http://localhost:5173'
  : `file:///${path.resolve(__dirname, '../renderer/index.html').replace(/\\/g, '/')}`;

console.log('[Main] isDev:', isDev);
console.log('[Main] RENDERER_URL:', RENDERER_URL);

/**
 * Create main application window
 */
async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
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
  if (isDev) {
    console.log('[Main] Loading renderer from:', RENDERER_URL);
    await mainWindow.loadURL(RENDERER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    console.log('[Main] Loading renderer from:', RENDERER_URL);
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
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
    if (isDev && url.startsWith('http://localhost:5173')) {
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
async function initialize(): Promise<void> {
  console.log('[Main] Initializing Runware Generator...');

  try {
    // Register IPC handlers
    console.log('[Main] Registering IPC handlers...');
    registerIpcHandlers();

    // Start Python backend
    console.log('[Main] Starting Python backend...');
    await pythonBridge.start();

    // Create main window
    console.log('[Main] Creating main window...');
    await createWindow();

    console.log('[Main] Initialization complete!');
  } catch (error) {
    console.error('[Main] Initialization failed:', error);

    // Show error dialog
    await dialog.showErrorBox(
      'Startup Error',
      `Failed to start Runware Generator:\n\n${
        error instanceof Error ? error.message : String(error)
      }\n\nPlease check that Python and all dependencies are installed correctly.`
    );

    // Quit application
    app.quit();
  }
}

/**
 * Cleanup before quit
 */
async function cleanup(): Promise<void> {
  console.log('[Main] Cleaning up...');

  try {
    // Unregister IPC handlers
    unregisterIpcHandlers();

    // Stop Python backend
    await pythonBridge.stop();

    console.log('[Main] Cleanup complete');
  } catch (error) {
    console.error('[Main] Cleanup error:', error);
  }
}

// ===== Application Lifecycle Events =====

/**
 * App ready event
 */
app.on('ready', async () => {
  console.log('[Main] App ready');
  await initialize();
});

/**
 * All windows closed event
 */
app.on('window-all-closed', () => {
  // On macOS, apps typically stay active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Activate event (macOS)
 */
app.on('activate', async () => {
  // On macOS, re-create window when dock icon is clicked and no windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

/**
 * Before quit event
 */
app.on('before-quit', async (event) => {
  // Prevent quit to allow cleanup
  if (pythonBridge.isRunning()) {
    event.preventDefault();
    await cleanup();
    app.quit();
  }
});

/**
 * Will quit event
 */
app.on('will-quit', async () => {
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
console.log('[Main] Development mode:', isDev);
