"use client";

import { Device, DeviceCreateInput, DeviceUpdateInput, LatencyDataPoint } from "@/types/device";
import { generateId } from "@/lib/utils";
import { STORAGE_KEYS, DEVICE_HISTORY_LIMIT } from "@/lib/constants";

/**
 * Get all devices from localStorage
 */
export function getDevices(): Device[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (!stored) return [];

    const devices = JSON.parse(stored);
    // Convert date strings back to Date objects
    return devices.map((d: Device) => ({
      ...d,
      lastSeen: new Date(d.lastSeen),
      createdAt: new Date(d.createdAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Save devices to localStorage
 */
export function saveDevices(devices: Device[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  } catch (error) {
    console.error("Failed to save devices:", error);
  }
}

/**
 * Get a single device by ID
 */
export function getDevice(id: string): Device | undefined {
  const devices = getDevices();
  return devices.find((d) => d.id === id);
}

/**
 * Create a new device
 */
export function createDevice(input: DeviceCreateInput): Device {
  const devices = getDevices();

  const newDevice: Device = {
    id: generateId(),
    name: input.name,
    ip: input.ip,
    status: "offline",
    latency: null,
    avgLatency: 0,
    minLatency: 0,
    maxLatency: 0,
    packetLoss: 0,
    uptime: 100,
    lastSeen: new Date(),
    history: [],
    createdAt: new Date(),
  };

  devices.push(newDevice);
  saveDevices(devices);

  return newDevice;
}

/**
 * Update an existing device
 */
export function updateDevice(id: string, updates: DeviceUpdateInput): Device | null {
  const devices = getDevices();
  const index = devices.findIndex((d) => d.id === id);

  if (index === -1) return null;

  devices[index] = {
    ...devices[index],
    ...updates,
    lastSeen: updates.lastSeen || devices[index].lastSeen,
  };

  saveDevices(devices);
  return devices[index];
}

/**
 * Delete a device
 */
export function deleteDevice(id: string): boolean {
  const devices = getDevices();
  const filteredDevices = devices.filter((d) => d.id !== id);

  if (filteredDevices.length === devices.length) return false;

  saveDevices(filteredDevices);
  return true;
}

/**
 * Add a latency data point to device history
 */
export function addDeviceHistoryPoint(
  id: string,
  point: LatencyDataPoint
): Device | null {
  const devices = getDevices();
  const index = devices.findIndex((d) => d.id === id);

  if (index === -1) return null;

  const device = devices[index];

  // Add new point and trim to limit
  device.history = [...device.history.slice(-(DEVICE_HISTORY_LIMIT - 1)), point];

  // Update statistics
  const successfulPings = device.history.filter(
    (p) => p.status === "success" && p.latency !== null
  );

  if (successfulPings.length > 0) {
    const latencies = successfulPings.map((p) => p.latency!);
    device.avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    device.minLatency = Math.min(...latencies);
    device.maxLatency = Math.max(...latencies);
  }

  // Calculate packet loss
  const totalPings = device.history.length;
  const failedPings = device.history.filter((p) => p.status === "timeout").length;
  device.packetLoss = (failedPings / totalPings) * 100;

  // Update status
  device.status = point.status === "success" ? "online" : "offline";
  device.latency = point.latency;
  device.lastSeen = new Date();

  // Calculate uptime
  const uptimeSuccessful = device.history.filter((p) => p.status === "success").length;
  device.uptime = (uptimeSuccessful / totalPings) * 100;

  devices[index] = device;
  saveDevices(devices);

  return device;
}

/**
 * Clear all devices
 */
export function clearDevices(): void {
  saveDevices([]);
}

/**
 * Export devices to JSON
 */
export function exportDevices(): string {
  const devices = getDevices();
  return JSON.stringify(devices, null, 2);
}

/**
 * Import devices from JSON
 */
export function importDevices(json: string): Device[] {
  try {
    const imported = JSON.parse(json);
    if (!Array.isArray(imported)) throw new Error("Invalid format");

    const devices = imported.map((d: Partial<Device>) => ({
      id: d.id || generateId(),
      name: d.name || "Unknown",
      ip: d.ip || "",
      status: d.status || "offline",
      latency: d.latency ?? null,
      avgLatency: d.avgLatency || 0,
      minLatency: d.minLatency || 0,
      maxLatency: d.maxLatency || 0,
      packetLoss: d.packetLoss || 0,
      uptime: d.uptime || 100,
      lastSeen: d.lastSeen ? new Date(d.lastSeen) : new Date(),
      history: d.history || [],
      createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
    }));

    saveDevices(devices);
    return devices;
  } catch (error) {
    console.error("Failed to import devices:", error);
    return [];
  }
}
