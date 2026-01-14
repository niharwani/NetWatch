"use client";

import { Alert, AlertCreateInput, AlertSummary } from "@/types/alert";
import { generateId } from "@/lib/utils";
import { STORAGE_KEYS, MAX_ALERT_HISTORY } from "@/lib/constants";

/**
 * Get all alerts from localStorage
 */
export function getAlerts(): Alert[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!stored) return [];

    const alerts = JSON.parse(stored);
    return alerts.map((a: Alert) => ({
      ...a,
      timestamp: new Date(a.timestamp),
    }));
  } catch {
    return [];
  }
}

/**
 * Save alerts to localStorage
 */
export function saveAlerts(alerts: Alert[]): void {
  if (typeof window === "undefined") return;

  try {
    // Trim to max history
    const trimmed = alerts.slice(-MAX_ALERT_HISTORY);
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Failed to save alerts:", error);
  }
}

/**
 * Create a new alert
 */
export function createAlert(input: AlertCreateInput): Alert {
  const alerts = getAlerts();

  const newAlert: Alert = {
    id: generateId(),
    severity: input.severity,
    type: input.type,
    message: input.message,
    deviceId: input.deviceId,
    deviceName: input.deviceName,
    timestamp: new Date(),
    acknowledged: false,
    metadata: input.metadata,
  };

  alerts.push(newAlert);
  saveAlerts(alerts);

  return newAlert;
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(id: string): Alert | null {
  const alerts = getAlerts();
  const index = alerts.findIndex((a) => a.id === id);

  if (index === -1) return null;

  alerts[index].acknowledged = true;
  saveAlerts(alerts);

  return alerts[index];
}

/**
 * Acknowledge all alerts
 */
export function acknowledgeAllAlerts(): void {
  const alerts = getAlerts();
  alerts.forEach((a) => (a.acknowledged = true));
  saveAlerts(alerts);
}

/**
 * Delete an alert
 */
export function deleteAlert(id: string): boolean {
  const alerts = getAlerts();
  const filteredAlerts = alerts.filter((a) => a.id !== id);

  if (filteredAlerts.length === alerts.length) return false;

  saveAlerts(filteredAlerts);
  return true;
}

/**
 * Delete all acknowledged alerts
 */
export function deleteAcknowledgedAlerts(): void {
  const alerts = getAlerts();
  const unacknowledged = alerts.filter((a) => !a.acknowledged);
  saveAlerts(unacknowledged);
}

/**
 * Clear all alerts
 */
export function clearAlerts(): void {
  saveAlerts([]);
}

/**
 * Get alert summary
 */
export function getAlertSummary(): AlertSummary {
  const alerts = getAlerts();

  return {
    total: alerts.length,
    info: alerts.filter((a) => a.severity === "info").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    unacknowledged: alerts.filter((a) => !a.acknowledged).length,
  };
}

/**
 * Get alerts for a specific device
 */
export function getDeviceAlerts(deviceId: string): Alert[] {
  const alerts = getAlerts();
  return alerts.filter((a) => a.deviceId === deviceId);
}

/**
 * Get recent alerts (last N)
 */
export function getRecentAlerts(count: number = 5): Alert[] {
  const alerts = getAlerts();
  return alerts.slice(-count).reverse();
}

/**
 * Filter alerts by criteria
 */
export function filterAlerts(criteria: {
  severity?: Alert["severity"];
  type?: Alert["type"];
  deviceId?: string;
  acknowledged?: boolean;
  startDate?: Date;
  endDate?: Date;
}): Alert[] {
  let alerts = getAlerts();

  if (criteria.severity) {
    alerts = alerts.filter((a) => a.severity === criteria.severity);
  }

  if (criteria.type) {
    alerts = alerts.filter((a) => a.type === criteria.type);
  }

  if (criteria.deviceId) {
    alerts = alerts.filter((a) => a.deviceId === criteria.deviceId);
  }

  if (criteria.acknowledged !== undefined) {
    alerts = alerts.filter((a) => a.acknowledged === criteria.acknowledged);
  }

  if (criteria.startDate) {
    alerts = alerts.filter((a) => a.timestamp >= criteria.startDate!);
  }

  if (criteria.endDate) {
    alerts = alerts.filter((a) => a.timestamp <= criteria.endDate!);
  }

  return alerts;
}

/**
 * Export alerts to JSON
 */
export function exportAlerts(): string {
  const alerts = getAlerts();
  return JSON.stringify(alerts, null, 2);
}
