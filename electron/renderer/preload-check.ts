// Temporary script to preload Electron API manually
// This is a workaround for development mode

console.log('[Manual Preload] Starting...');

// Wait for the real preload to execute or create a mock
setTimeout(() => {
  if (typeof window.electronAPI === 'undefined') {
    console.error('[Manual Preload] window.electronAPI is still undefined!');
    console.error('[Manual Preload] Preload script may not be loaded in dev mode');
  } else {
    console.log('[Manual Preload] window.electronAPI is available!');
  }
}, 1000);
