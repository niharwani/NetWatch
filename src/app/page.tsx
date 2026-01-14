"use client";

import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { DeviceStatusList } from "@/components/dashboard/DeviceStatusList";
import { NetworkChart } from "@/components/charts/NetworkChart";
import { HealthGauge } from "@/components/charts/HealthGauge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDevices } from "@/hooks/useDevices";
import { useAlerts } from "@/hooks/useAlerts";
import { useNetworkMetrics } from "@/hooks/useNetworkMetrics";
import { calculateHealthScore } from "@/lib/network/metrics";
import { formatBytes, formatSpeed } from "@/lib/utils";
import { Activity, AlertTriangle, Clock, Wifi, ArrowUpDown } from "lucide-react";

export default function DashboardPage() {
  const { devices, summary: deviceSummary } = useDevices();
  const { alerts, recentAlerts, summary: alertSummary } = useAlerts();
  const { metrics, currentMetrics, summary: metricsSummary } = useNetworkMetrics();

  const healthScore = calculateHealthScore(devices);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network Monitoring Dashboard"
        description="Real-time monitoring of your network devices and services"
      />

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Active Devices"
          value={`${deviceSummary.onlineDevices}/${deviceSummary.totalDevices}`}
          description={`${deviceSummary.offlineDevices} offline`}
          icon={Wifi}
        />
        <MetricsCard
          title="Avg Latency"
          value={
            deviceSummary.averageLatency > 0
              ? `${deviceSummary.averageLatency.toFixed(1)}ms`
              : "N/A"
          }
          description="Across all devices"
          icon={Activity}
        />
        <MetricsCard
          title="Active Alerts"
          value={alertSummary.unacknowledged}
          description={`${alertSummary.critical} critical`}
          icon={AlertTriangle}
        />
        <MetricsCard
          title="Network Speed"
          value={
            currentMetrics
              ? formatSpeed(currentMetrics.downloadSpeed)
              : "N/A"
          }
          description={
            currentMetrics
              ? `Upload: ${formatSpeed(currentMetrics.uploadSpeed)}`
              : "Connecting..."
          }
          icon={ArrowUpDown}
        />
      </div>

      {/* Health Score and Network Performance */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Network Health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <HealthGauge score={healthScore.overall} size="lg" />
            <div className="grid grid-cols-3 gap-4 mt-6 w-full">
              {healthScore.components.map((component) => (
                <div key={component.name} className="text-center">
                  <p className="text-lg font-bold">{Math.round(component.score)}</p>
                  <p className="text-xs text-muted-foreground">
                    {component.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Network Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length > 0 ? (
              <NetworkChart data={metrics} height={250} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Loading network metrics...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device Status and Recent Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <DeviceStatusList devices={devices} maxItems={5} />
        <RecentAlerts alerts={recentAlerts} maxItems={5} />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Data Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {metricsSummary
                ? formatBytes(metricsSummary.totalDataTransferred)
                : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">This session</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currentMetrics?.activeConnections || 0}
            </p>
            <p className="text-xs text-muted-foreground">Current network connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Network Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currentMetrics
                ? `${currentMetrics.utilization.toFixed(1)}%`
                : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">Average bandwidth usage</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
