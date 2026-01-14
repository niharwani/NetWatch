"use client";

import { useState, useEffect, useCallback } from "react";
import { Device, DeviceCreateInput, LatencyDataPoint } from "@/types/device";
import {
  getDevices,
  createDevice,
  deleteDevice,
  addDeviceHistoryPoint,
} from "@/lib/storage/devices";

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // Load devices from localStorage on mount
  useEffect(() => {
    const loadDevices = () => {
      const storedDevices = getDevices();
      setDevices(storedDevices);
      setLoading(false);
    };

    loadDevices();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "netwatch_devices") {
        loadDevices();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addDevice = useCallback((input: DeviceCreateInput) => {
    const newDevice = createDevice(input);
    setDevices((prev) => [...prev, newDevice]);
    return newDevice;
  }, []);

  const removeDevice = useCallback((id: string) => {
    const success = deleteDevice(id);
    if (success) {
      setDevices((prev) => prev.filter((d) => d.id !== id));
    }
    return success;
  }, []);

  const updateDeviceStatus = useCallback(
    (id: string, point: LatencyDataPoint) => {
      const updatedDevice = addDeviceHistoryPoint(id, point);
      if (updatedDevice) {
        setDevices((prev) =>
          prev.map((d) => (d.id === id ? updatedDevice : d))
        );
      }
      return updatedDevice;
    },
    []
  );

  const refreshDevice = useCallback(
    async (id: string): Promise<Device | null> => {
      const device = devices.find((d) => d.id === id);
      if (!device) return null;

      try {
        const response = await fetch("/api/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip: device.ip, count: 1 }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          const point: LatencyDataPoint = {
            timestamp: Date.now(),
            latency: result.data.time,
            status: result.data.alive ? "success" : "timeout",
          };

          return updateDeviceStatus(id, point);
        }
      } catch (error) {
        console.error(`Failed to refresh device ${id}:`, error);
      }

      return null;
    },
    [devices, updateDeviceStatus]
  );

  const refreshAllDevices = useCallback(async () => {
    await Promise.all(devices.map((d) => refreshDevice(d.id)));
  }, [devices, refreshDevice]);

  // Calculate summary statistics
  const summary = {
    totalDevices: devices.length,
    onlineDevices: devices.filter((d) => d.status === "online").length,
    offlineDevices: devices.filter((d) => d.status === "offline").length,
    warningDevices: devices.filter((d) => d.status === "warning").length,
    averageLatency:
      devices.reduce((sum, d) => sum + d.avgLatency, 0) / devices.length || 0,
    averagePacketLoss:
      devices.reduce((sum, d) => sum + d.packetLoss, 0) / devices.length || 0,
  };

  return {
    devices,
    loading,
    summary,
    addDevice,
    removeDevice,
    updateDeviceStatus,
    refreshDevice,
    refreshAllDevices,
  };
}
