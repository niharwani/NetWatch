"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusIndicator } from "./StatusIndicator";
import { Device } from "@/types/device";
import { formatLatency } from "@/lib/utils";
import Link from "next/link";
import { Monitor } from "lucide-react";

interface DeviceStatusListProps {
  devices: Device[];
  maxItems?: number;
}

export function DeviceStatusList({
  devices,
  maxItems = 5,
}: DeviceStatusListProps) {
  const displayDevices = devices.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Device Status</CardTitle>
        <Link
          href="/devices"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {displayDevices.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No devices configured</p>
            <Link
              href="/devices"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Add your first device
            </Link>
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-2">
              {displayDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <StatusIndicator status={device.status} pulse={false} />
                    <div>
                      <p className="font-medium text-sm">{device.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {device.ip}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatLatency(device.latency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {device.uptime.toFixed(1)}% uptime
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
