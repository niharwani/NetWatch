"use client";

import { useState } from "react";
import { ScanForm } from "@/components/scanner/ScanForm";
import { ScanResults } from "@/components/scanner/ScanResults";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScanResult, ScanType } from "@/types/scan";
import { formatDuration, getRelativeTime } from "@/lib/utils";
import { History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const handleScan = async (params: {
    ip: string;
    scanType: ScanType;
    startPort?: number;
    endPort?: number;
  }) => {
    setIsScanning(true);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const scanResult: ScanResult = {
          id: result.data.id,
          ip: result.data.ip,
          timestamp: new Date(result.data.timestamp),
          ports: result.data.ports,
          duration: result.data.duration,
          totalPorts: result.data.totalPorts,
          openPorts: result.data.openPorts,
          closedPorts: result.data.closedPorts,
          filteredPorts: result.data.filteredPorts,
        };

        setCurrentResult(scanResult);
        setScanHistory((prev) => [scanResult, ...prev.slice(0, 19)]); // Keep last 20 scans
      }
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectHistory = (scan: ScanResult) => {
    setCurrentResult(scan);
  };

  const handleClearHistory = () => {
    setScanHistory([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Port Scanner"
        description="Scan network ports to identify open services"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scan Form */}
        <div className="lg:col-span-1 space-y-4">
          <ScanForm onScan={handleScan} isScanning={isScanning} />

          {/* Scan History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <History className="h-4 w-4" />
                Scan History
              </CardTitle>
              {scanHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="h-8 px-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {scanHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No scan history yet
                </p>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {scanHistory.map((scan) => (
                      <button
                        key={scan.id}
                        onClick={() => handleSelectHistory(scan)}
                        className={`w-full text-left p-2 rounded-lg border transition-colors hover:bg-accent ${
                          currentResult?.id === scan.id
                            ? "border-primary bg-accent"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{scan.ip}</span>
                          <span className="text-xs text-green-600">
                            {scan.openPorts} open
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {scan.totalPorts} ports
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getRelativeTime(new Date(scan.timestamp))}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <ScanResults result={currentResult} />
        </div>
      </div>
    </div>
  );
}
