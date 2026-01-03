/**
 * API Wrapper - Automatically uses Electron API or Browser API
 * Detects environment and provides unified interface
 */

import { browserAPI } from './browserAPI';

// Detect if running in Electron or browser
const isElectron = !!(window as any).electronAPI;

// Export unified API
export const api = isElectron ? (window as any).electronAPI : browserAPI;

// Log current mode
console.log('[API] Running in:', isElectron ? 'Electron' : 'Browser');
console.log('[API] Using:', isElectron ? 'electronAPI' : 'browserAPI');
