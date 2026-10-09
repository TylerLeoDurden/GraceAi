"use client";

import { useState, useEffect } from "react";
import { getRealTimeStatus, RealTimeStatus } from "./date-utils";

/**
 * React hook that returns live real-world time and date information.
 * Uses a mounted flag to safely avoid SSR hydration mismatches.
 */
export function useRealTime(updateIntervalMs = 1000): {
  status: RealTimeStatus | null;
  mounted: boolean;
} {
  const [status, setStatus] = useState<RealTimeStatus | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStatus(getRealTimeStatus(new Date()));

    const timer = setInterval(() => {
      setStatus(getRealTimeStatus(new Date()));
    }, updateIntervalMs);

    return () => clearInterval(timer);
  }, [updateIntervalMs]);

  return { status, mounted };
}
