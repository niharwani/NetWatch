import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NetWatch - Network Monitoring Dashboard",
  description:
    "Professional network monitoring tool for real-time device monitoring, port scanning, and connectivity testing.",
  keywords: [
    "network monitoring",
    "port scanner",
    "ping",
    "latency",
    "uptime",
    "network tools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SettingsProvider>
          <TooltipProvider>
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar - hidden on mobile */}
              <div className="hidden md:flex">
                <Sidebar />
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                  {children}
                </main>
              </div>
            </div>
          </TooltipProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
