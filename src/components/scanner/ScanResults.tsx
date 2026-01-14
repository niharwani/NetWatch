"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScanResult, PortResult } from "@/types/scan";
import { formatDuration, downloadJSON, downloadCSV } from "@/lib/utils";
import { Download, CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface ScanResultsProps {
  result: ScanResult | null;
}

export function ScanResults({ result }: ScanResultsProps) {
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scan Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No scan results yet.</p>
            <p className="text-sm">Start a scan to see results here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: PortResult["status"]) => {
    switch (status) {
      case "open":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "closed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "filtered":
        return <HelpCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: PortResult["status"]) => {
    switch (status) {
      case "open":
        return <Badge variant="success">Open</Badge>;
      case "closed":
        return <Badge variant="destructive">Closed</Badge>;
      case "filtered":
        return <Badge variant="warning">Filtered</Badge>;
    }
  };

  const handleExportJSON = () => {
    downloadJSON(result, `scan-${result.ip}-${Date.now()}.json`);
  };

  const handleExportCSV = () => {
    const csvData = result.ports.map((port) => ({
      port: port.port,
      status: port.status,
      service: port.service || "",
      responseTime: port.responseTime || "",
    }));
    downloadCSV(csvData, `scan-${result.ip}-${Date.now()}.csv`);
  };

  const openPorts = result.ports.filter((p) => p.status === "open");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Scan Results</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download className="h-4 w-4 mr-1" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold">{result.totalPorts}</p>
            <p className="text-xs text-muted-foreground">Total Ports</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/10">
            <p className="text-2xl font-bold text-green-600">{result.openPorts}</p>
            <p className="text-xs text-muted-foreground">Open</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/10">
            <p className="text-2xl font-bold text-red-600">{result.closedPorts}</p>
            <p className="text-xs text-muted-foreground">Closed</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-500/10">
            <p className="text-2xl font-bold text-yellow-600">
              {result.filteredPorts}
            </p>
            <p className="text-xs text-muted-foreground">Filtered</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Target: <span className="font-medium">{result.ip}</span> | Duration:{" "}
            <span className="font-medium">{formatDuration(result.duration)}</span> |
            Scanned at:{" "}
            <span className="font-medium">
              {new Date(result.timestamp).toLocaleString()}
            </span>
          </p>
        </div>

        {/* Open ports table */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Open Ports ({openPorts.length})</h4>
          {openPorts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open ports found.</p>
          ) : (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Port</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead className="w-24">Response</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openPorts.map((port) => (
                    <TableRow key={port.port}>
                      <TableCell className="font-medium">{port.port}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(port.status)}
                          {getStatusBadge(port.status)}
                        </div>
                      </TableCell>
                      <TableCell>{port.service || "Unknown"}</TableCell>
                      <TableCell>
                        {port.responseTime ? `${port.responseTime}ms` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
