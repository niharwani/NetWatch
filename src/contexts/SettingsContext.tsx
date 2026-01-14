"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/lib/constants";

interface Settings {
  pingInterval: number;
  latencyThreshold: number;
  packetLossThreshold: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  autoRefresh: boolean;
}

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        // Use defaults if parsing fails
      }
    }

    // Apply dark mode on mount
    const storedSettings = stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    if (storedSettings.darkMode) {
      document.documentElement.classList.add("dark");
    }

    setMounted(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  }, [settings, mounted]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    document.documentElement.classList.remove("dark");
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
