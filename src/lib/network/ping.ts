import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface PingResult {
  host: string;
  alive: boolean;
  time: number | null;
  packetLoss: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  times: number[];
  error?: string;
}

export interface PingOptions {
  count?: number;
  timeout?: number;
}

/**
 * Parse Windows ping output
 */
function parseWindowsPingOutput(output: string): {
  times: number[];
  packetLoss: number;
  min: number;
  max: number;
  avg: number;
} {
  const times: number[] = [];
  let packetLoss = 100;
  let min = 0;
  let max = 0;
  let avg = 0;

  // Parse individual ping times (e.g., "time=10ms" or "time<1ms")
  const timeMatches = output.match(/time[<=](\d+)ms/gi);
  if (timeMatches) {
    timeMatches.forEach((match) => {
      const numMatch = match.match(/\d+/);
      if (numMatch) {
        times.push(parseInt(numMatch[0], 10));
      }
    });
  }

  // Parse packet loss (e.g., "(0% loss)" or "(100% loss)")
  const lossMatch = output.match(/\((\d+)%\s*(loss|perdidos?)\)/i);
  if (lossMatch) {
    packetLoss = parseInt(lossMatch[1], 10);
  }

  // Parse statistics (e.g., "Minimum = 10ms, Maximum = 15ms, Average = 12ms")
  const statsMatch = output.match(
    /Minimum\s*=\s*(\d+)ms.*Maximum\s*=\s*(\d+)ms.*Average\s*=\s*(\d+)ms/i
  );
  if (statsMatch) {
    min = parseInt(statsMatch[1], 10);
    max = parseInt(statsMatch[2], 10);
    avg = parseInt(statsMatch[3], 10);
  } else if (times.length > 0) {
    min = Math.min(...times);
    max = Math.max(...times);
    avg = times.reduce((a, b) => a + b, 0) / times.length;
  }

  return { times, packetLoss, min, max, avg };
}

/**
 * Parse Unix/Linux ping output
 */
function parseUnixPingOutput(output: string): {
  times: number[];
  packetLoss: number;
  min: number;
  max: number;
  avg: number;
} {
  const times: number[] = [];
  let packetLoss = 100;
  let min = 0;
  let max = 0;
  let avg = 0;

  // Parse individual ping times (e.g., "time=10.5 ms")
  const timeMatches = output.match(/time=(\d+\.?\d*)\s*ms/gi);
  if (timeMatches) {
    timeMatches.forEach((match) => {
      const numMatch = match.match(/[\d.]+/);
      if (numMatch) {
        times.push(parseFloat(numMatch[0]));
      }
    });
  }

  // Parse packet loss (e.g., "0% packet loss")
  const lossMatch = output.match(/(\d+)%\s*packet\s*loss/i);
  if (lossMatch) {
    packetLoss = parseInt(lossMatch[1], 10);
  }

  // Parse statistics (e.g., "min/avg/max/mdev = 10.5/12.3/15.1/2.0 ms")
  const statsMatch = output.match(
    /=\s*([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+)\s*ms/
  );
  if (statsMatch) {
    min = parseFloat(statsMatch[1]);
    avg = parseFloat(statsMatch[2]);
    max = parseFloat(statsMatch[3]);
  } else if (times.length > 0) {
    min = Math.min(...times);
    max = Math.max(...times);
    avg = times.reduce((a, b) => a + b, 0) / times.length;
  }

  return { times, packetLoss, min, max, avg };
}

/**
 * Execute a ping command using the system's ping utility
 */
export async function pingHost(
  host: string,
  options: PingOptions = {}
): Promise<PingResult> {
  const { count = 4, timeout = 2000 } = options;
  const isWindows = process.platform === "win32";

  try {
    let command: string;
    if (isWindows) {
      // Windows: -n count, -w timeout (in ms)
      command = `ping -n ${count} -w ${timeout} ${host}`;
    } else {
      // Unix/Linux/Mac: -c count, -W timeout (in seconds)
      const timeoutSec = Math.ceil(timeout / 1000);
      command = `ping -c ${count} -W ${timeoutSec} ${host}`;
    }

    const { stdout, stderr } = await execAsync(command, {
      timeout: (timeout + 1000) * count, // Allow enough time for all pings
    });

    const output = stdout || stderr;
    const parsed = isWindows
      ? parseWindowsPingOutput(output)
      : parseUnixPingOutput(output);

    const alive = parsed.packetLoss < 100;

    return {
      host,
      alive,
      time: parsed.times.length > 0 ? parsed.times[parsed.times.length - 1] : null,
      packetLoss: parsed.packetLoss,
      avgTime: parsed.avg,
      minTime: parsed.min,
      maxTime: parsed.max,
      times: parsed.times,
    };
  } catch (error) {
    // Ping command failed (host unreachable, timeout, etc.)
    return {
      host,
      alive: false,
      time: null,
      packetLoss: 100,
      avgTime: 0,
      minTime: 0,
      maxTime: 0,
      times: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Execute a single ping (count=1) for quick status checks
 */
export async function pingOnce(
  host: string,
  timeout: number = 2000
): Promise<{ alive: boolean; time: number | null }> {
  const result = await pingHost(host, { count: 1, timeout });
  return {
    alive: result.alive,
    time: result.time,
  };
}

/**
 * Ping multiple hosts concurrently
 */
export async function pingHosts(
  hosts: string[],
  options: PingOptions = {}
): Promise<Map<string, PingResult>> {
  const results = await Promise.all(
    hosts.map((host) => pingHost(host, options))
  );

  const resultMap = new Map<string, PingResult>();
  results.forEach((result) => {
    resultMap.set(result.host, result);
  });

  return resultMap;
}
