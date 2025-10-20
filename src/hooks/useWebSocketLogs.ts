import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketLogEntry } from '@/types/api';
import { WEBSOCKET_URL } from '@/services/api';

interface UseWebSocketLogsOptions {
  runId?: string;
  autoConnect?: boolean;
}

export function useWebSocketLogs(options: UseWebSocketLogsOptions = {}) {
  const { runId, autoConnect = true } = options;
  const [logs, setLogs] = useState<WebSocketLogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [completedRunIds, setCompletedRunIds] = useState<Set<string>>(new Set());
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const isManualCloseRef = useRef(false);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        isManualCloseRef.current = false;
      };

      ws.onmessage = (event) => {
        try {
          const logEntry: WebSocketLogEntry = JSON.parse(event.data);
          
          // Filter by run_id if provided
          if (runId && logEntry.run_id !== runId) {
            return;
          }

          setLogs((prev) => [...prev, logEntry]);

          // Check if run completed
          if (logEntry.message.includes('Run Completed!')) {
            setCompletedRunIds((prev) => new Set(prev).add(logEntry.run_id));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Auto-reconnect after 5 seconds if not manually closed
        if (!isManualCloseRef.current && autoConnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 5000);
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }, [runId, autoConnect]);

  const disconnect = useCallback(() => {
    isManualCloseRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      isManualCloseRef.current = false;
      connect();
    }, 100);
  }, [connect, disconnect]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    logs,
    isConnected,
    completedRunIds,
    clearLogs,
    reconnect,
    connect,
    disconnect
  };
}
