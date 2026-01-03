// Quick test script to verify Electron IPC is working

const { app, BrowserWindow } = require('electron');
const path = require('path');

async function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'dist/electron/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Open DevTools automatically
  win.webContents.openDevTools();

  // Load the Vite dev server
  await win.loadURL('http://localhost:5174');

  // Test if electronAPI is available
  const result = await win.webContents.executeJavaScript('typeof window.electronAPI');
  console.log('electronAPI type:', result);
  
  if (result !== 'undefined') {
    console.log('✅ electronAPI is available!');
    
    // Test backend status
    try {
      const status = await win.webContents.executeJavaScript(
        'window.electronAPI.system.getBackendStatus()'
      );
      console.log('Backend status:', status);
    } catch (error) {
      console.error('❌ Error calling getBackendStatus:', error);
    }
  } else {
    console.error('❌ electronAPI is NOT available!');
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  process.exit(0);
});
