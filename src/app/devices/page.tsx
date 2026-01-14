"use client";

import { useState, useEffect, useCallback } from "react";
import { DeviceCard } from "@/components/devices/DeviceCard";
import { AddDeviceDialog } from "@/components/devices/AddDeviceDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useDevices } from "@/hooks/useDevices";
import { useAlerts } from "@/hooks/useAlerts";
import { useSettings } from "@/contexts/SettingsContext";
import { LatencyDataPoint } from "@/types/device";
import { Plus, RefreshCw, Monitor } from "lucide-react";

export default function DevicesPage() {
  const { devices, addDevice, removeDevice, updateDeviceStatus, refreshAllDevices } =
    useDevices();
  const { addAlert } = useAlerts();
  const { settings } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  // Auto-refresh devices based on settings
  useEffect(() => {
    if (!settings.autoRefresh || devices.length === 0) return;

    const interval = setInterval(async () => {
      for (const device of devices) {
        try {
          const response = await fetch("/api/ping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: device.ip, count: 1, timeout: 2000 }),
          });

          const result = await response.json();

          if (result.success && result.data) {
            const wasOnline = device.status === "online";
            const isNowOnline = result.data.alive;

            const point: LatencyDataPoint = {
              timestamp: Date.now(),
              latency: result.data.time,
              status: isNowOnline ? "success" : "timeout",
            };

            updateDeviceStatus(device.id, point);

            // Create alerts for status changes
            if (wasOnline && !isNowOnline) {
              addAlert({
                severity: "critical",
                type: "offline",
                message: `Device ${device.name} is now offline`,
                deviceId: device.id,
                deviceName: device.name,
              });
            } else if (!wasOnline && isNowOnline) {
              addAlert({
                severity: "info",
                type: "connectivity",
                message: `Device ${device.name} is back online`,
                deviceId: device.id,
                deviceName: device.name,
              });
            }

            // Create latency alerts
            if (
              isNowOnline &&
              result.data.time > settings.latencyThreshold
            ) {
              addAlert({
                severity: "warning",
                type: "latency",
                message: `High latency on ${device.name}: ${result.data.time.toFixed(1)}ms`,
                deviceId: device.id,
                deviceName: device.name,
                metadata: { latency: result.data.time },
              });
            }
          }
        } catch (error) {
          console.error(`Failed to ping ${device.ip}:`, error);
        }
      }
    }, settings.pingInterval);

    return () => clearInterval(interval);
  }, [devices, settings, updateDeviceStatus, addAlert]);

  const handleRefresh = useCallback(
    async (id: string) => {
      setRefreshingId(id);
      const device = devices.find((d) => d.id === id);
      if (!device) return;

      try {
        const response = await fetch("/api/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip: device.ip, count: 1, timeout: 2000 }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          const point: LatencyDataPoint = {
            timestamp: Date.now(),
            latency: result.data.time,
            status: result.data.alive ? "success" : "timeout",
          };
          updateDeviceStatus(id, point);
        }
      } catch (error) {
        console.error(`Failed to refresh ${device.ip}:`, error);
      } finally {
        setRefreshingId(null);
      }
    },
    [devices, updateDeviceStatus]
  );

  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    await Promise.all(devices.map((d) => handleRefresh(d.id)));
    setIsRefreshingAll(false);
  };

  const handleAddDevice = (name: string, ip: string) => {
    addDevice({ name, ip });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Device Monitoring"
        description="Monitor network devices in real-time"
        actions={
          <div className="flex gap-2">
            {devices.length > 0 && (
              <Button
                variant="outline"
                onClick={handleRefreshAll}
                disabled={isRefreshingAll}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isRefreshingAll ? "animate-spin" : ""}`}
                />
                Refresh All
              </Button>
            )}
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </div>
        }
      />

      {devices.length === 0 ? (
        <EmptyState
          icon={Monitor}
          title="No devices configured"
          description="Add your first device to start monitoring. You can add servers, routers, printers, or any device with an IP address."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Device
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onRemove={removeDevice}
              onRefresh={handleRefresh}
              isRefreshing={refreshingId === device.id}
            />
          ))}
        </div>
      )}

      <AddDeviceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddDevice}
      />
    </div>
  );
}
