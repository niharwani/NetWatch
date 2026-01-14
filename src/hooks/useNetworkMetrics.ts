"use client";

import { useState, useEffect, useCallback } from "react";
import { NetworkMetric, MetricsSummary } from "@/types/metric";

export function useNetworkMetrics() {
  const [metrics, setMetrics] = useState<NetworkMetric[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<NetworkMetric | null>(null);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics");
      const result = await response.json();

      if (result.success && result.data) {
        setCurrentMetrics(result.data.current);
        setMetrics(result.data.history);
        setSummary(result.data.summary);
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
