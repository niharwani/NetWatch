"use client";

import { useEffect, useState, useCallback } from "react";

interface RealtimeData<T> {
  type: string;
  data: T;
  timestamp: string;
}

export function useRealtime<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    setError(null);

    const eventSource = new EventSource(endpoint);

    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed: RealtimeData<T> = JSON.parse(event.data);
        setData(parsed.data);
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      setError("Connection lost");
      eventSource.close();

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        connect();
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, [endpoint]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return { data, connected, error };
}
