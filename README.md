# NetWatch

A professional network monitoring dashboard for real-time device monitoring, port scanning, and connectivity testing.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Dashboard
- Real-time network health overview with visual gauges
- Active device count and status monitoring
- Average latency and packet loss metrics
- Network speed monitoring (upload/download)
- Performance charts and data transfer statistics
- Active connections display

### Device Monitoring
- Add devices by IP address or hostname
- Real-time ping monitoring with configurable intervals
- Latency tracking (current, average, min, max)
- Packet loss detection and uptime calculation
- Historical latency charts
- Auto-refresh and manual refresh options

### Port Scanner
- Multiple scan types: Quick, Common, Full, Custom
- Custom port specification and ranges
- Service identification for common ports
- Scan history (last 20 scans)
- Concurrent scanning support

### Connectivity Tests
- **Ping Tests** - ICMP connectivity checks
- **TCP Tests** - TCP connection verification
- **HTTP/HTTPS Tests** - Web endpoint testing (GET, HEAD, POST)
- **DNS Tests** - DNS resolution (A, AAAA, CNAME, MX, TXT records)
- Response time measurement and test history

### Alert Management
- Severity levels: Critical, Warning, Info
- Alert types: Latency, Packet Loss, Offline, Port Change, Connectivity, Threshold
- Real-time alert generation based on configurable thresholds
- Alert acknowledgment and filtering
- Export alerts to JSON

### Settings & Configuration
- Configurable ping intervals (1-60 seconds)
- Customizable latency and packet loss thresholds
- Browser notifications and sound alerts
- Dark mode support
- Data export/import and backup functionality

## Tech Stack

- **Framework:** Next.js 14.2
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Radix UI
- **Charts:** Recharts
- **Icons:** Lucide React

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/netwatch.git
cd netwatch
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Configuration

Configure the application via environment variables in `.env`:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME=NetWatch
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Monitoring Configuration (milliseconds)
NEXT_PUBLIC_PING_INTERVAL=5000
NEXT_PUBLIC_MAX_HISTORY_POINTS=60
NEXT_PUBLIC_DEFAULT_TIMEOUT=2000

# Alert Thresholds
NEXT_PUBLIC_LATENCY_THRESHOLD=100
NEXT_PUBLIC_PACKET_LOSS_THRESHOLD=5
```

All settings can also be adjusted through the Settings page in the application.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes (ping, scan, tests, metrics)
│   ├── devices/           # Device monitoring page
│   ├── scanner/           # Port scanner page
│   ├── tests/             # Connectivity tests page
│   ├── alerts/            # Alerts management page
│   └── settings/          # Settings page
├── components/            # React components
│   ├── charts/            # Chart components
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Navigation components
│   └── ui/                # Base UI components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   ├── network/           # Network operations
│   └── storage/           # LocalStorage management
└── types/                 # TypeScript type definitions
```

## Data Storage

NetWatch uses browser LocalStorage for data persistence:
- No backend database required
- Data persists across sessions
- Export/import functionality for backup and migration

**Storage Keys:**
- `netwatch_devices` - Monitored devices
- `netwatch_alerts` - Alert history
- `netwatch_settings` - User preferences

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
