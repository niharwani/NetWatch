"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlerts } from "@/hooks/useAlerts";
import { Alert, AlertSeverity, AlertType } from "@/types/alert";
import { getRelativeTime, downloadJSON } from "@/lib/utils";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Download,
  AlertTriangle,
  AlertCircle,
  Info,
  Filter,
} from "lucide-react";

export default function AlertsPage() {
  const {
    alerts,
    summary,
    acknowledge,
    acknowledgeAll,
    removeAlert,
    clearAll,
  } = useAlerts();

  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "acknowledged" | "unacknowledged"
  >("all");

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== "all" && alert.severity !== severityFilter) {
      return false;
    }
    if (typeFilter !== "all" && alert.type !== typeFilter) {
      return false;
    }
    if (statusFilter === "acknowledged" && !alert.acknowledged) {
      return false;
    }
    if (statusFilter === "unacknowledged" && alert.acknowledged) {
      return false;
    }
    return true;
  });

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "warning":
        return <Badge variant="warning">Warning</Badge>;
      case "info":
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const handleExport = () => {
    downloadJSON(alerts, `alerts-${Date.now()}.json`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="View and manage network alerts"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {summary.unacknowledged > 0 && (
              <Button variant="outline" onClick={acknowledgeAll}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Acknowledge All
              </Button>
            )}
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{summary.critical}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{summary.warning}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unacknowledged</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.unacknowledged}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-40">
              <Select
                value={severityFilter}
                onValueChange={(v) =>
                  setSeverityFilter(v as AlertSeverity | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as AlertType | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="latency">Latency</SelectItem>
                  <SelectItem value="packet_loss">Packet Loss</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="connectivity">Connectivity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-44">
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as "all" | "acknowledged" | "unacknowledged")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(severityFilter !== "all" ||
              typeFilter !== "all" ||
              statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSeverityFilter("all");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Alerts ({filteredAlerts.length})
          </CardTitle>
          {alerts.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No alerts"
              description={
                alerts.length === 0
                  ? "No alerts have been triggered. Alerts will appear here when thresholds are exceeded."
                  : "No alerts match the current filters."
              }
            />
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredAlerts
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        alert.acknowledged
                          ? "bg-muted/50 opacity-75"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(alert.severity)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {getSeverityBadge(alert.severity)}
                              <Badge variant="outline" className="text-xs">
                                {alert.type.replace("_", " ")}
                              </Badge>
                              {alert.acknowledged && (
                                <Badge variant="secondary" className="text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  Acknowledged
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium">{alert.message}</p>
                            {alert.deviceName && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Device: {alert.deviceName}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {getRelativeTime(new Date(alert.timestamp))} -{" "}
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!alert.acknowledged && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => acknowledge(alert.id)}
                              title="Acknowledge"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAlert(alert.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
