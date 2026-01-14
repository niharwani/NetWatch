"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConnectivityTest, TestType } from "@/types/connectivity";
import { formatDuration, getRelativeTime, isValidIP } from "@/lib/utils";
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  Globe,
  Server,
  Search,
  Loader2,
} from "lucide-react";

export default function TestsPage() {
  const [activeTab, setActiveTab] = useState<TestType>("ping");
  const [isRunning, setIsRunning] = useState(false);
  const [testHistory, setTestHistory] = useState<ConnectivityTest[]>([]);

  // Form states
  const [pingHost, setPingHost] = useState("");
  const [tcpHost, setTcpHost] = useState("");
  const [tcpPort, setTcpPort] = useState("");
  const [httpUrl, setHttpUrl] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [dnsHostname, setDnsHostname] = useState("");
  const [dnsRecordType, setDnsRecordType] = useState("A");

  const [error, setError] = useState("");

  const runTest = async () => {
    setError("");
    setIsRunning(true);

    let target = "";
    let port: number | undefined;
    const options: Record<string, unknown> = {};

    switch (activeTab) {
      case "ping":
        if (!pingHost.trim() || !isValidIP(pingHost.trim())) {
          setError("Please enter a valid IP address or hostname");
          setIsRunning(false);
          return;
        }
        target = pingHost.trim();
        options.count = 4;
        break;

      case "tcp":
        if (!tcpHost.trim() || !isValidIP(tcpHost.trim())) {
          setError("Please enter a valid IP address or hostname");
          setIsRunning(false);
          return;
        }
        if (!tcpPort.trim() || isNaN(parseInt(tcpPort))) {
          setError("Please enter a valid port number");
          setIsRunning(false);
          return;
        }
        target = tcpHost.trim();
        port = parseInt(tcpPort);
        break;

      case "http":
        if (!httpUrl.trim()) {
          setError("Please enter a URL");
          setIsRunning(false);
          return;
        }
        try {
          new URL(httpUrl.trim());
        } catch {
          setError("Please enter a valid URL");
          setIsRunning(false);
          return;
        }
        target = httpUrl.trim();
        options.method = httpMethod;
        break;

      case "dns":
        if (!dnsHostname.trim()) {
          setError("Please enter a hostname");
          setIsRunning(false);
          return;
        }
        target = dnsHostname.trim();
        options.recordType = dnsRecordType;
        break;
    }

    try {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          target,
          port,
          options,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const test: ConnectivityTest = {
          id: result.data.id,
          type: result.data.type,
          target: result.data.target,
          port: result.data.port,
          timestamp: new Date(result.data.timestamp),
          status: result.data.status,
          responseTime: result.data.responseTime,
          error: result.data.error,
          details: result.data.details,
        };

        setTestHistory((prev) => [test, ...prev.slice(0, 49)]);
      }
    } catch (err) {
      setError("Test failed. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  const getTestIcon = (type: TestType) => {
    switch (type) {
      case "ping":
        return <Wifi className="h-4 w-4" />;
      case "tcp":
        return <Server className="h-4 w-4" />;
      case "http":
        return <Globe className="h-4 w-4" />;
      case "dns":
        return <Search className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: ConnectivityTest["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failure":
      case "timeout":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Connectivity Tests"
        description="Test network connectivity with various protocols"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Run Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TestType)}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="ping">Ping</TabsTrigger>
                <TabsTrigger value="tcp">TCP</TabsTrigger>
                <TabsTrigger value="http">HTTP</TabsTrigger>
                <TabsTrigger value="dns">DNS</TabsTrigger>
              </TabsList>

              <TabsContent value="ping" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pingHost">Host</Label>
                  <Input
                    id="pingHost"
                    placeholder="e.g., 8.8.8.8 or google.com"
                    value={pingHost}
                    onChange={(e) => setPingHost(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="tcp" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tcpHost">Host</Label>
                  <Input
                    id="tcpHost"
                    placeholder="e.g., 192.168.1.1"
                    value={tcpHost}
                    onChange={(e) => setTcpHost(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tcpPort">Port</Label>
                  <Input
                    id="tcpPort"
                    type="number"
                    placeholder="e.g., 80, 443, 22"
                    value={tcpPort}
                    onChange={(e) => setTcpPort(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="http" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="httpUrl">URL</Label>
                  <Input
                    id="httpUrl"
                    placeholder="https://example.com"
                    value={httpUrl}
                    onChange={(e) => setHttpUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="httpMethod">Method</Label>
                  <Select value={httpMethod} onValueChange={setHttpMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="dns" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dnsHostname">Hostname</Label>
                  <Input
                    id="dnsHostname"
                    placeholder="e.g., google.com"
                    value={dnsHostname}
                    onChange={(e) => setDnsHostname(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dnsRecordType">Record Type</Label>
                  <Select value={dnsRecordType} onValueChange={setDnsRecordType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A (IPv4)</SelectItem>
                      <SelectItem value="AAAA">AAAA (IPv6)</SelectItem>
                      <SelectItem value="CNAME">CNAME</SelectItem>
                      <SelectItem value="MX">MX</SelectItem>
                      <SelectItem value="TXT">TXT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            {error && <p className="text-sm text-destructive mt-4">{error}</p>}

            <Button className="w-full mt-4" onClick={runTest} disabled={isRunning}>
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Test...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test History</CardTitle>
          </CardHeader>
          <CardContent>
            {testHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No tests run yet</p>
                <p className="text-sm">Run a test to see results here</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {testHistory.map((test) => (
                    <div
                      key={test.id}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTestIcon(test.type)}
                          <span className="font-medium uppercase text-xs">
                            {test.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(test.status)}
                          <Badge
                            variant={
                              test.status === "success"
                                ? "success"
                                : "destructive"
                            }
                          >
                            {test.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">
                          {test.target}
                          {test.port && `:${test.port}`}
                        </p>
                        {test.responseTime !== undefined && (
                          <p className="text-muted-foreground">
                            Response time: {formatDuration(test.responseTime)}
                          </p>
                        )}
                        {test.error && (
                          <p className="text-destructive text-xs mt-1">
                            {test.error}
                          </p>
                        )}
                        {test.details?.statusCode && (
                          <p className="text-muted-foreground text-xs">
                            HTTP Status: {test.details.statusCode}
                          </p>
                        )}
                        {test.details?.resolvedAddresses && (
                          <p className="text-muted-foreground text-xs">
                            Resolved: {test.details.resolvedAddresses.join(", ")}
                          </p>
                        )}
                        {test.details?.avgLatency !== undefined && (
                          <p className="text-muted-foreground text-xs">
                            Avg: {test.details.avgLatency.toFixed(1)}ms |
                            Min: {test.details.minLatency?.toFixed(1)}ms |
                            Max: {test.details.maxLatency?.toFixed(1)}ms |
                            Loss: {test.details.packetLoss?.toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {getRelativeTime(new Date(test.timestamp))}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
