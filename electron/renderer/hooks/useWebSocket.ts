import { useEffect, useRef, useCallback } from 'react';
import type { WebSocketMessage } from '@shared/types/api.types';

interface WebSocketCallbacks {
  onProgress?: (generationId: number, progress: number, message: string) => void;
  onComplete?: (generationId: number, data: Record<string, unknown>) => void;
  onError?: (generationId: number, error: string) => void;
}

const BACKEND_URL = 'ws://127.0.0.1:8000';

export const useWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const callbacksRef = useRef<WebSocketCallbacks>({});
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback((generationId: number, callbacks: WebSocketCallbacks) => {
    callbacksRef.current = callbacks;
    reconnectAttemptsRef.current = 0;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(`${BACKEND_URL}/ws/generation/${generationId}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log(`[WebSocket] Connected for generation ${generationId}`);
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);

            console.log('[WebSocket] Received:', message);

            switch (message.type) {
              case 'progress':
                if (
                  message.progress !== null &&
                  message.progress !== undefined &&
                  message.message !== null &&
                  message.message !== undefined
                ) {
                  callbacksRef.current.onProgress?.(
                    message.generation_id,
                    message.progress,
                    message.message
                  );
                }
                break;

              case 'complete':
                if (message.data !== null && message.data !== undefined) {
                  callbacksRef.current.onComplete?.(message.generation_id, message.data);
                }
                break;

              case 'error':
                if (message.message !== null && message.message !== undefined) {
                  callbacksRef.current.onError?.(message.generation_id, message.message);
                }
                break;

              case 'complete':
                if (message.data) {
                  callbacksRef.current.onComplete?.(message.generation_id, message.data);
                }
                break;

              case 'error':
                if (message.message) {
                  callbacksRef.current.onError?.(message.generation_id, message.message);
                }
                break;

              case 'heartbeat':
                break;

              default:
                console.warn('[WebSocket] Unknown message type:', message.type);
            }
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
        };

        ws.onclose = () => {
          console.log('[WebSocket] Connection closed');
          wsRef.current = null;

          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000);
            console.log(
              `[WebSocket] Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current})`
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket();
            }, delay);
          } else {
            console.error('[WebSocket] Max reconnection attempts reached');
            callbacksRef.current.onError?.(
              generationId,
              'Connection failed after multiple attempts'
            );
          }
        };
      } catch (error) {
        console.error('[WebSocket] Failed to connect:', error);
        callbacksRef.current.onError?.(generationId, 'Failed to establish WebSocket connection');
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const send = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send: connection not open');
    }
  }, []);

  const isConnected = useCallback(() => {
    return wsRef.current !== null && wsRef.current.readyState === WebSocket.OPEN;
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    send,
    isConnected,
  };
};
