"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidIP } from "@/lib/utils";

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, ip: string) => void;
}

export function AddDeviceDialog({
  open,
  onOpenChange,
  onAdd,
}: AddDeviceDialogProps) {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Device name is required");
      return;
    }

    if (!ip.trim()) {
      setError("IP address or hostname is required");
      return;
    }

    if (!isValidIP(ip.trim())) {
      setError("Invalid IP address or hostname");
      return;
    }

    onAdd(name.trim(), ip.trim());
    setName("");
    setIp("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setName("");
    setIp("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
          <DialogDescription>
            Add a device to monitor. Enter a friendly name and the IP address or
            hostname.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Device Name</Label>
              <Input
                id="name"
                placeholder="e.g., Router, Server, Printer"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip">IP Address or Hostname</Label>
              <Input
                id="ip"
                placeholder="e.g., 192.168.1.1 or google.com"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Device</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
