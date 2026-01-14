"use client";

import { useState, useEffect, useCallback } from "react";
import { Alert, AlertCreateInput } from "@/types/alert";
import {
  getAlerts,
  createAlert,
  deleteAlert,
  acknowledgeAlert,
  acknowledgeAllAlerts,
  clearAlerts,
  getAlertSummary,
  getRecentAlerts,
} from "@/lib/storage/alerts";

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Load alerts from localStorage on mount
  useEffect(() => {
    const loadAlerts = () => {
      const storedAlerts = getAlerts();
      setAlerts(storedAlerts);
      setLoading(false);
    };

    loadAlerts();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "netwatch_alerts") {
        loadAlerts();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addAlert = useCallback((input: AlertCreateInput) => {
    const newAlert = createAlert(input);
    setAlerts((prev) => [...prev, newAlert]);
    return newAlert;
  }, []);

  const removeAlert = useCallback((id: string) => {
    const success = deleteAlert(id);
    if (success) {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }
    return success;
  }, []);

  const acknowledge = useCallback((id: string) => {
    const updated = acknowledgeAlert(id);
    if (updated) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
    }
    return updated;
  }, []);

  const acknowledgeAll = useCallback(() => {
    acknowledgeAllAlerts();
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
  }, []);

  const clearAll = useCallback(() => {
    clearAlerts();
    setAlerts([]);
  }, []);

  const summary = getAlertSummary();
  const recentAlerts = getRecentAlerts(5);

  return {
    alerts,
    loading,
    summary,
    recentAlerts,
    addAlert,
    removeAlert,
    acknowledge,
    acknowledgeAll,
    clearAll,
  };
}
