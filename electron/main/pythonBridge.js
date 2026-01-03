"use strict";
/**
 * Python Bridge - Manages Python backend process lifecycle
 * Handles starting, stopping, and monitoring the FastAPI backend
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pythonBridge = exports.PythonBridge = void 0;
const child_process_1 = require("child_process");
const electron_1 = require("electron");
const axios_1 = __importDefault(require("axios"));
const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = 8000;
const STARTUP_TIMEOUT = 30000; // 30 seconds
const HEALTH_CHECK_INTERVAL = 2000; // 2 seconds
const MAX_HEALTH_CHECK_RETRIES = 15; // 15 retries * 2 seconds = 30 seconds
class PythonBridge {
    constructor(config = {}) {
        this.process = null;
        this._isRunning = false;
        this.host = config.host || BACKEND_HOST;
        this.port = config.port || BACKEND_PORT;
        // In development: use system Python
        // In production: use bundled Python (TODO: implement for packaging)
        this.pythonPath = config.pythonPath || 'python';
        // Set working directory to project root
        this.cwd = config.cwd || electron_1.app.getAppPath();
    }
    /**
     * Get the backend API base URL
     */
    getUrl() {
        return `http://${this.host}:${this.port}`;
    }
    /**
     * Check if backend is running
     */
    isRunning() {
        return this._isRunning;
    }
    /**
     * Start the Python backend process
     */
    async start() {
        if (this.process) {
            console.log('[PythonBridge] Backend already running');
            return;
        }
        console.log('[PythonBridge] Starting Python backend...');
        console.log('[PythonBridge] Working directory:', this.cwd);
        console.log('[PythonBridge] Python path:', this.pythonPath);
        console.log('[PythonBridge] Backend URL:', this.getUrl());
        try {
            // Spawn Python process
            this.process = (0, child_process_1.spawn)(this.pythonPath, ['-m', 'backend.main'], {
                cwd: this.cwd,
                env: {
                    ...process.env,
                    PYTHONUNBUFFERED: '1', // Disable Python output buffering
                    BACKEND_HOST: this.host,
                    BACKEND_PORT: this.port.toString(),
                },
                stdio: ['ignore', 'pipe', 'pipe'],
            });
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
        }
        catch (error) {
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
    async stop() {
        if (!this.process) {
            console.log('[PythonBridge] No backend process to stop');
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
    async checkHealth() {
        try {
            const response = await axios_1.default.get(`${this.getUrl()}/health`, {
                timeout: 3000,
            });
            return response.data.status === 'healthy';
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Wait for backend to be ready
     */
    async waitForBackend() {
        console.log('[PythonBridge] Waiting for backend to be ready...');
        const startTime = Date.now();
        let retries = 0;
        while (retries < MAX_HEALTH_CHECK_RETRIES) {
            const elapsed = Date.now() - startTime;
            if (elapsed > STARTUP_TIMEOUT) {
                throw new Error(`Backend failed to start within ${STARTUP_TIMEOUT / 1000} seconds`);
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
            }
            catch (error) {
                // Ignore health check errors during startup
            }
            // Wait before next retry
            retries++;
            console.log(`[PythonBridge] Health check ${retries}/${MAX_HEALTH_CHECK_RETRIES}...`);
            await this.sleep(HEALTH_CHECK_INTERVAL);
        }
        throw new Error('Backend health check failed - max retries exceeded');
    }
    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Restart the backend
     */
    async restart() {
        console.log('[PythonBridge] Restarting backend...');
        await this.stop();
        await this.start();
    }
}
exports.PythonBridge = PythonBridge;
// Singleton instance
exports.pythonBridge = new PythonBridge();
//# sourceMappingURL=pythonBridge.js.map