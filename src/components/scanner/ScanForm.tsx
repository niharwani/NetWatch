"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isValidIP } from "@/lib/utils";
import { ScanType } from "@/types/scan";
import { Scan, Loader2 } from "lucide-react";

interface ScanFormProps {
  onScan: (params: {
    ip: string;
    scanType: ScanType;
    startPort?: number;
    endPort?: number;
  }) => void;
  isScanning: boolean;
}

export function ScanForm({ onScan, isScanning }: ScanFormProps) {
  const [ip, setIp] = useState("");
  const [scanType, setScanType] = useState<ScanType>("quick");
  const [startPort, setStartPort] = useState("");
  const [endPort, setEndPort] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!ip.trim()) {
      setError("IP address or hostname is required");
      return;
    }

    if (!isValidIP(ip.trim())) {
      setError("Invalid IP address or hostname");
      return;
    }

    if (scanType === "custom") {
      const start = parseInt(startPort);
      const end = parseInt(endPort);

      if (isNaN(start) || isNaN(end)) {
        setError("Start and end ports are required for custom scan");
        return;
      }

      if (start < 1 || start > 65535 || end < 1 || end > 65535) {
        setError("Ports must be between 1 and 65535");
        return;
      }

      if (start > end) {
        setError("Start port must be less than or equal to end port");
        return;
      }

      if (end - start > 1000) {
        setError("Port range cannot exceed 1000 ports");
        return;
      }

      onScan({ ip: ip.trim(), scanType, startPort: start, endPort: end });
    } else {
      onScan({ ip: ip.trim(), scanType });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Port Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ip">Target IP or Hostname</Label>
            <Input
              id="ip"
              placeholder="e.g., 192.168.1.1 or example.com"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              disabled={isScanning}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scanType">Scan Type</Label>
            <Select
              value={scanType}
              onValueChange={(v) => setScanType(v as ScanType)}
              disabled={isScanning}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select scan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quick">Quick Scan (Top 20 ports)</SelectItem>
                <SelectItem value="common">Common Ports (Top 100)</SelectItem>
                <SelectItem value="full">Full Scan (Ports 1-1024)</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scanType === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startPort">Start Port</Label>
                <Input
                  id="startPort"
                  type="number"
                  placeholder="1"
                  min={1}
                  max={65535}
                  value={startPort}
                  onChange={(e) => setStartPort(e.target.value)}
                  disabled={isScanning}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endPort">End Port</Label>
                <Input
                  id="endPort"
                  type="number"
                  placeholder="1024"
                  min={1}
                  max={65535}
                  value={endPort}
                  onChange={(e) => setEndPort(e.target.value)}
                  disabled={isScanning}
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isScanning}>
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Scan className="mr-2 h-4 w-4" />
                Start Scan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
