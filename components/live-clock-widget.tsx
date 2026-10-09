"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRealTime } from "@/lib/use-real-time";
import {
  Clock,
  Calendar,
  Utensils,
  ChevronDown,
  Sparkles,
  ArrowRight,
  HeartPulse,
} from "lucide-react";

export function LiveClockWidget() {
  const { status, mounted } = useRealTime(1000);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted || !status) {
    return (
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] text-xs font-mono animate-pulse">
        <span className="w-2 h-2 rounded-full bg-[var(--primary)]/40" />
        <span>Syncing time...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={widgetRef}>
      {/* Pill Trigger */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] transition-all text-xs font-medium text-[var(--text)] group shadow-2xs"
        aria-label="Real-world live time and schedule status"
        title="Real-world calendar and live clock"
      >
        {/* Pulsing live indicator */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
        </span>

        {/* Date & Time text */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">
            {status.dayOfWeekShort}, {status.formattedShortDate.split(" ")[1]}
          </span>
          <span className="text-[var(--border)]">|</span>
          <span className="font-semibold text-[var(--text)] tabular-nums">
            {status.timeString}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
                <Clock className="w-3.5 h-3.5" />
                <span>Real-World Rhythm</span>
              </div>
              <h4 className="font-serif text-base font-semibold text-[var(--text)]">
                {status.formattedDate}
              </h4>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-bold text-[var(--primary)] tabular-nums">
                {status.timeStringWithSec}
              </span>
              <div className="text-[10px] text-[var(--text-muted)]">Live Local Time</div>
            </div>
          </div>

          {/* Active Rhythms */}
          <div className="py-3 space-y-2.5">
            {/* Meal Rhythm */}
            <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                  <Utensils className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Current Window: {status.activeMealSlot}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-semibold">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Recommended window: {status.activeMealWindow}
              </p>
            </div>

            {/* Next Up */}
            <div className="px-3 py-2 rounded-xl bg-[var(--primary-light)]/40 border border-[var(--primary-border)]/50 flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)] text-[11px]">
                Next meal: <strong className="text-[var(--text)]">{status.nextMealSlot}</strong>
              </span>
              <span className="text-[11px] font-mono text-[var(--primary)] font-medium">
                {status.nextMealWindow}
              </span>
            </div>
          </div>

          {/* Quick links to real-world pages */}
          <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-1.5">
            <Link
              href="/planner"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--surface-elevated)] text-xs text-[var(--text)] font-medium transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--primary)]" />
                <span>Today&apos;s Weekly Meal Plan</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/tracker"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--surface-elevated)] text-xs text-[var(--text)] font-medium transition-colors group"
            >
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[var(--accent)]" />
                <span>Log Today&apos;s Rhythm & Vitals</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
