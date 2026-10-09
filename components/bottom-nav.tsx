"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  Stethoscope,
  HeartPulse,
  Sparkles,
} from "lucide-react";

const TABS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Plan", href: "/planner", icon: CalendarDays },
  { name: "Care", href: "/care", icon: Stethoscope },
  { name: "Track", href: "/tracker", icon: HeartPulse },
  { name: "Grace", href: "/grace", icon: Sparkles, isAi: true },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-lg border-t border-[var(--border)] px-2 py-1.5 pb-safe shadow-lg">
      <div className="flex items-center justify-around">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative ${
                isActive
                  ? "text-[var(--primary)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {tab.isAi ? (
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-transform ${
                    isActive
                      ? "bg-[var(--accent)] text-white scale-110 shadow-md shadow-[var(--accent)]/30"
                      : "bg-[var(--primary)]/15 text-[var(--primary)]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  )}
                </div>
              )}
              <span className="text-[10px] mt-1 font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
