"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";
import { Device } from "@/types/device";
import { LatencyChart } from "@/components/charts/LatencyChart";
import { StatusIndicator } from "@/components/dashboard/StatusIndicator";
import { formatLatency, formatPercentage, getRelativeTime } from "@/lib/utils";

interface DeviceCardProps {
  device: Device;
  onRemove: (id: string) => void;
  onRefresh?: (id: string) => void;
  isRefreshing?: boolean;
}

export function DeviceCard({
  device,
  onRemove,
  onRefresh,
  isRefreshing,
}: DeviceCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <StatusIndicator status={device.status} />
            <div>
              <CardTitle className="text-lg">{device.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{device.ip}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRefresh(device.id)}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(device.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Current Latency</p>
            <p className="text-xl font-bold">
              {formatLatency(device.latency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Latency</p>
            <p className="text-xl font-bold">
              {formatLatency(device.avgLatency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Packet Loss</p>
            <p className="text-lg font-semibold">
              {formatPercentage(device.packetLoss)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="text-lg font-semibold">
              {formatPercentage(device.uptime)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min: {formatLatency(device.minLatency)}</span>
            <span>Max: {formatLatency(device.maxLatency)}</span>
          </div>

          {device.history.length > 0 && (
            <LatencyChart data={device.history} height={150} />
          )}

          <p className="text-xs text-muted-foreground text-center">
            Last seen: {getRelativeTime(new Date(device.lastSeen))}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
