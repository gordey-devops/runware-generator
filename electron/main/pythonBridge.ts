/**
 * Python Bridge - Manages Python backend process lifecycle
 * Handles starting, stopping, and monitoring the FastAPI backend
 */

import { spawn, ChildProcess } from 'child_process';
import { app } from 'electron';
import path from 'path';
import axios from 'axios';

const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = 8000;
const STARTUP_TIMEOUT = 30000; // 30 seconds
const HEALTH_CHECK_INTERVAL = 2000; // 2 seconds
const MAX_HEALTH_CHECK_RETRIES = 15; // 15 retries * 2 seconds = 30 seconds

export interface PythonBridgeConfig {
  host?: string;
  port?: number;
  pythonPath?: string;
  cwd?: string;
}

export class PythonBridge {
  private process: ChildProcess | null = null;
  private host: string;
  private port: number;
  private pythonPath: string;
  private cwd: string;
  private _isRunning: boolean = false;

  constructor(config: PythonBridgeConfig = {}) {
    this.host = config.host || BACKEND_HOST;
    this.port = config.port || BACKEND_PORT;

    // In development: use system Python
    // In production: use bundled Python (TODO: implement for packaging)
    this.pythonPath = config.pythonPath || 'python';

    // Set working directory to project root
    this.cwd = config.cwd || app.getAppPath();
  }

  /**
   * Get the backend API base URL
   */
  getUrl(): string {
    return `http://${this.host}:${this.port}`;
  }

  /**
   * Check if backend is running
   */
  isRunning(): boolean {
    return this._isRunning;
  }

  /**
   * Start the Python backend process
   */
  async start(): Promise<void> {
    if (this.process) {
      console.log('[PythonBridge] Backend already running');
      return;
    }

    // Check if backend is already running externally
    console.log('[PythonBridge] Checking if backend is already running...');
    const isAlreadyRunning = await this.checkHealth();
    if (isAlreadyRunning) {
      console.log('[PythonBridge] Backend is already running externally, skipping process spawn');
      this._isRunning = true;
      return;
    }

    console.log('[PythonBridge] Starting Python backend...');
    console.log('[PythonBridge] Working directory:', this.cwd);
    console.log('[PythonBridge] Python path:', this.pythonPath);
    console.log('[PythonBridge] Backend URL:', this.getUrl());

    try {
      // Spawn Python process
      this.process = spawn(
        this.pythonPath,
        ['-m', 'backend.main'],
        {
          cwd: this.cwd,
          env: {
            ...process.env,
            PYTHONUNBUFFERED: '1', // Disable Python output buffering
            BACKEND_HOST: this.host,
            BACKEND_PORT: this.port.toString(),
          },
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      );

      // Log stdout
      this.process.stdout?.on('data', (data) => {
        console.log(`[Backend] ${data.toString().trim()}`);
      });

      // Log stderr
      this.process.stderr?.on('data', (data) => {
        console.error(`[Backend Error] ${data.toString().trim()}`);
      });

      // Handle process exit
      this.process.on('exit', (code, signal) => {
        console.log(`[PythonBridge] Backend exited with code ${code}, signal ${signal}`);
        this._isRunning = false;
        this.process = null;
      });

      // Handle process errors
      this.process.on('error', (error) => {
        console.error('[PythonBridge] Failed to start backend:', error);
        this._isRunning = false;
        this.process = null;
        throw error;
      });

      // Wait for backend to be ready
      await this.waitForBackend();
      this._isRunning = true;

      console.log('[PythonBridge] Backend started successfully');
    } catch (error) {
      this._isRunning = false;
      if (this.process) {
        this.process.kill();
        this.process = null;
      }
      throw error;
    }
  }

  /**
   * Stop the Python backend process
   */
  async stop(): Promise<void> {
    if (!this.process) {
      console.log('[PythonBridge] No backend process to stop (external backend will continue running)');
      this._isRunning = false;
      return;
    }

    console.log('[PythonBridge] Stopping Python backend...');

    return new Promise((resolve) => {
      if (!this.process) {
        resolve();
        return;
      }

      // Set timeout for forceful kill
      const killTimeout = setTimeout(() => {
        if (this.process && !this.process.killed) {
          console.log('[PythonBridge] Force killing backend process');
          this.process.kill('SIGKILL');
        }
      }, 5000); // 5 seconds

      this.process.once('exit', () => {
        clearTimeout(killTimeout);
        this.process = null;
        this._isRunning = false;
        console.log('[PythonBridge] Backend stopped');
        resolve();
      });

      // Try graceful shutdown first
      this.process.kill('SIGTERM');
    });
  }

  /**
   * Check backend health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.getUrl()}/health`, {
        timeout: 3000,
      });
      return response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for backend to be ready
   */
  private async waitForBackend(): Promise<void> {
    console.log('[PythonBridge] Waiting for backend to be ready...');

    const startTime = Date.now();
    let retries = 0;

    while (retries < MAX_HEALTH_CHECK_RETRIES) {
      const elapsed = Date.now() - startTime;

      if (elapsed > STARTUP_TIMEOUT) {
        throw new Error(
          `Backend failed to start within ${STARTUP_TIMEOUT / 1000} seconds`
        );
      }

      // Check if process is still alive
      if (!this.process || this.process.killed) {
        throw new Error('Backend process died during startup');
      }

      // Check health
      try {
        const healthy = await this.checkHealth();
        if (healthy) {
          console.log(`[PythonBridge] Backend ready after ${elapsed}ms`);
          return;
        }
      } catch (error) {
        // Ignore health check errors during startup
      }

      // Wait before next retry
      retries++;
      console.log(
        `[PythonBridge] Health check ${retries}/${MAX_HEALTH_CHECK_RETRIES}...`
      );
      await this.sleep(HEALTH_CHECK_INTERVAL);
    }

    throw new Error('Backend health check failed - max retries exceeded');
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Restart the backend
   */
  async restart(): Promise<void> {
    console.log('[PythonBridge] Restarting backend...');
    await this.stop();
    await this.start();
  }
}

// Singleton instance
export const pythonBridge = new PythonBridge();
