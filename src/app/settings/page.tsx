"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/SettingsContext";
import { useDevices } from "@/hooks/useDevices";
import { useAlerts } from "@/hooks/useAlerts";
import { exportDevices, importDevices, clearDevices } from "@/lib/storage/devices";
import { exportAlerts, clearAlerts } from "@/lib/storage/alerts";
import { downloadJSON } from "@/lib/utils";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import {
  Settings,
  Bell,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useRef } from "react";

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { devices } = useDevices();
  const { alerts } = useAlerts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportDevices = () => {
    const data = exportDevices();
    downloadJSON(JSON.parse(data), `netwatch-devices-${Date.now()}.json`);
  };

  const handleExportAlerts = () => {
    const data = exportAlerts();
    downloadJSON(JSON.parse(data), `netwatch-alerts-${Date.now()}.json`);
  };

  const handleExportAll = () => {
    const data = {
      devices: JSON.parse(exportDevices()),
      alerts: JSON.parse(exportAlerts()),
      settings,
      exportedAt: new Date().toISOString(),
    };
    downloadJSON(data, `netwatch-backup-${Date.now()}.json`);
  };

  const handleImportDevices = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = importDevices(content);
        setImportStatus(`Successfully imported ${imported.length} devices`);
        setTimeout(() => setImportStatus(null), 3000);
      } catch {
        setImportStatus("Failed to import devices");
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearDevices = () => {
    if (confirm("Are you sure you want to delete all devices? This cannot be undone.")) {
      clearDevices();
      window.location.reload();
    }
  };

  const handleClearAlerts = () => {
    if (confirm("Are you sure you want to delete all alerts? This cannot be undone.")) {
      clearAlerts();
      window.location.reload();
    }
  };

  const handleResetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      resetSettings();
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode;
    updateSettings({ darkMode: newDarkMode });
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure application settings and preferences"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monitoring Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Monitoring Settings
            </CardTitle>
            <CardDescription>
              Configure how devices are monitored
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pingInterval">Ping Interval (ms)</Label>
              <Input
                id="pingInterval"
                type="number"
                min={1000}
                max={60000}
                step={1000}
                value={settings.pingInterval}
                onChange={(e) =>
                  updateSettings({ pingInterval: parseInt(e.target.value) || 5000 })
                }
              />
              <p className="text-xs text-muted-foreground">
                How often to ping devices (1000-60000ms)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoRefresh">Auto Refresh</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically refresh device status
                </p>
              </div>
              <Switch
                id="autoRefresh"
                checked={settings.autoRefresh}
                onCheckedChange={(checked) =>
                  updateSettings({ autoRefresh: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Alert Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alert Thresholds
            </CardTitle>
            <CardDescription>
              Configure when alerts are triggered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="latencyThreshold">Latency Threshold (ms)</Label>
              <Input
                id="latencyThreshold"
                type="number"
                min={10}
                max={1000}
                value={settings.latencyThreshold}
                onChange={(e) =>
                  updateSettings({
                    latencyThreshold: parseInt(e.target.value) || 100,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Alert when latency exceeds this value
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="packetLossThreshold">
                Packet Loss Threshold (%)
              </Label>
              <Input
                id="packetLossThreshold"
                type="number"
                min={1}
                max={100}
                value={settings.packetLossThreshold}
                onChange={(e) =>
                  updateSettings({
                    packetLossThreshold: parseInt(e.target.value) || 5,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Alert when packet loss exceeds this value
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Browser Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Show browser notifications for alerts
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({ notificationsEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound">Sound Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Play sound for critical alerts
                </p>
              </div>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({ soundEnabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the application look</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="darkMode">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Use dark color theme
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={toggleDarkMode}
                />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Export, import, and manage your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Export Data</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleExportDevices}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Devices ({devices.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleExportAlerts}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Alerts ({alerts.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleExportAll}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export All
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Import Data</h4>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleImportDevices}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import Devices
                  </Button>
                  {importStatus && (
                    <p className="text-xs text-muted-foreground">
                      {importStatus}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Clear Data</h4>
                <div className="space-y-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={handleClearDevices}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Devices
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={handleClearAlerts}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Alerts
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Reset</h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleResetSettings}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
