import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';

console.log('[Renderer] Starting...');
console.log('[Renderer] window.electronAPI available:', !!window.electronAPI);
console.log('[Renderer] Running in:', window.electronAPI ? 'Electron' : 'Browser');

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
