import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: './electron/renderer',
  css: {
    postcss: {
      plugins: [
        require('tailwindcss')(path.resolve(__dirname, './tailwind.config.js')),
        require('autoprefixer'),
      ],
    },
  },
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './electron/renderer'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
