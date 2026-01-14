"use client";

import { Bell, Menu, RefreshCw, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/hooks/useAlerts";
import { useSettings } from "@/contexts/SettingsContext";
import Link from "next/link";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { alerts } = useAlerts();
  const { settings, updateSettings } = useSettings();

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  const toggleTheme = () => {
    const newDarkMode = !settings.darkMode;
    updateSettings({ darkMode: newDarkMode });
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="flex h-16 items-center gap-4 px-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Auto refresh indicator */}
          {settings.autoRefresh && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Live</span>
            </div>
          )}

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {settings.darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Alerts */}
          <Link href="/alerts">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unacknowledgedCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unacknowledgedCount > 9 ? "9+" : unacknowledgedCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
