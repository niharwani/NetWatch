"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert } from "@/types/alert";
import { getRelativeTime } from "@/lib/utils";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import Link from "next/link";

interface RecentAlertsProps {
  alerts: Alert[];
  maxItems?: number;
}

export function RecentAlerts({ alerts, maxItems = 5 }: RecentAlertsProps) {
  const displayAlerts = alerts.slice(0, maxItems);

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "warning":
        return <Badge variant="warning">Warning</Badge>;
      case "info":
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Alerts</CardTitle>
        <Link
          href="/alerts"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {displayAlerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent alerts</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-3">
              {displayAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(new Date(alert.timestamp))}
                      </span>
                    </div>
                    <p className="text-sm truncate">{alert.message}</p>
                    {alert.deviceName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Device: {alert.deviceName}
                      </p>
                    )}
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
