"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { NetworkMetric, MetricsSummary } from "@/types/metric";

const MAX_HISTORY = 30; // Keep last 30 data points for the chart

export function useNetworkMetrics() {
  const [metrics, setMetrics] = useState<NetworkMetric[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<NetworkMetric | null>(null);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track history across renders without causing re-renders
  const metricsHistoryRef = useRef<NetworkMetric[]>([]);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics");
      const result = await response.json();

      if (result.success && result.data) {
        const current = result.data.current;
        setCurrentMetrics(current);

        // Manage history on client-side for serverless compatibility
        metricsHistoryRef.current = [...metricsHistoryRef.current, current];
        if (metricsHistoryRef.current.length > MAX_HISTORY) {
          metricsHistoryRef.current = metricsHistoryRef.current.slice(-MAX_HISTORY);
        }

        // Update metrics state with history
        setMetrics([...metricsHistoryRef.current]);

        // Calculate summary from client-side history
        const history = metricsHistoryRef.current;
        const avgUploadSpeed = history.reduce((sum, m) => sum + m.uploadSpeed, 0) / history.length;
        const avgDownloadSpeed = history.reduce((sum, m) => sum + m.downloadSpeed, 0) / history.length;
        const maxUploadSpeed = Math.max(...history.map((m) => m.uploadSpeed));
        const maxDownloadSpeed = Math.max(...history.map((m) => m.downloadSpeed));
        const avgUtilization = history.reduce((sum, m) => sum + m.utilization, 0) / history.length;

        setSummary({
          currentUploadSpeed: current.uploadSpeed,
          currentDownloadSpeed: current.downloadSpeed,
          avgUploadSpeed,
          avgDownloadSpeed,
          maxUploadSpeed,
          maxDownloadSpeed,
          totalDataTransferred: history.reduce(
            (sum, m) => sum + m.uploadSpeed + m.downloadSpeed,
            0
          ),
          activeConnections: current.activeConnections,
          avgUtilization,
        });

        setError(null);
      }
    } catch (err) {
      setError("Failed to fetch metrics");
      console.error("Failed to fetch metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh every second
  useEffect(() => {
    const interval = setInterval(fetchMetrics, 1000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    currentMetrics,
    summary,
    loading,
    error,
    refresh: fetchMetrics,
  };
}
