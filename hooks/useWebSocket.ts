"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface WSMessage {
  type: string;
  payload?: unknown;
}

interface UseWebSocketOptions {
  url: string;
  token?: string | null;
  userId?: string;
  onEvent?: (payload: unknown) => void;
  onSessionStart?: (payload: unknown) => void;
  onSessionEnd?: (payload: unknown) => void;
  onAlert?: (payload: unknown) => void;
  enabled?: boolean;
}

export function useWebSocket({
  url,
  token,
  userId,
  onEvent,
  onSessionStart,
  onSessionEnd,
  onAlert,
  enabled = true,
}: UseWebSocketOptions) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  const callbackRefs = useRef({ onEvent, onSessionStart, onSessionEnd, onAlert });
  callbackRefs.current = { onEvent, onSessionStart, onSessionEnd, onAlert };

  const connect = useCallback(() => {
    if (!url || !enabled) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Subscribe
        if (userId) {
          ws.send(JSON.stringify({ type: "subscribe", payload: { userId } }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WSMessage;
          switch (msg.type) {
            case "event":
              callbackRefs.current.onEvent?.(msg.payload);
              break;
            case "session:start":
              callbackRefs.current.onSessionStart?.(msg.payload);
              break;
            case "session:end":
              callbackRefs.current.onSessionEnd?.(msg.payload);
              break;
            case "alert":
              callbackRefs.current.onAlert?.(msg.payload);
              break;
          }
        } catch {
          // Ignore invalid messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;

        // Reconnect with exponential backoff
        if (enabled && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          reconnectTimeout.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        setError("WebSocket connection failed");
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, [url, enabled, userId]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((msg: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { connected, error, send };
}
