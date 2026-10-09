"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "./theme-provider";
import {
  Sun,
  Moon,
  Menu,
  X,
  HeartPulse,
  UtensilsCrossed,
  CalendarDays,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

const NAV_LINKS = [
  { name: "Overview", href: "/" },
  { name: "Meal Planner", href: "/planner", icon: CalendarDays },
  { name: "World Kitchen", href: "/recipes", icon: UtensilsCrossed },
  { name: "Daily Rhythm", href: "/tracker", icon: HeartPulse },
  { name: "Chef Grace", href: "/grace", icon: Sparkles },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm transition-transform duration-200 group-hover:scale-105">
              g
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-semibold tracking-tight text-[var(--text)]">
                grace<span className="text-[var(--primary)] font-normal italic">ai</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[var(--text-muted)] font-medium hidden sm:inline-block">
                Culinary Wellness & Nourishment
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "text-[var(--primary)] bg-[var(--primary-light)] font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] flex items-center justify-center transition-colors"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[var(--accent)]" />}
            </button>

            {/* Helpline indicator */}
            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--danger)] px-3 py-2 rounded-xl border border-[var(--border)] hover:border-[var(--danger)]/40 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[var(--danger)]" />
              <span>Helpline</span>
            </button>

            {/* Get Started CTA */}
            <Link
              href="/onboarding"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              <span>Build My Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text)]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl text-base ${
                    isActive
                      ? "bg-[var(--primary-light)] text-[var(--primary)] font-semibold"
                      : "text-[var(--text)] hover:bg-[var(--surface-elevated)]"
                  }`}
                >
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-2">
              <Link
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent)] text-white font-medium text-center"
              >
                <span>Build My Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setEmergencyModalOpen(true);
                }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--danger)] py-2 text-center flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[var(--danger)]" />
                <span>Crisis & Medical Emergency Helplines</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Emergency Modal */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setEmergencyModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-full hover:bg-[var(--surface-elevated)]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-[var(--danger)]/15 text-[var(--danger)] flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[var(--text)] mb-2">
              Health & Emergency Guidelines
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              graceAI provides culinary and general wellness education. It does not replace medical consultation, diagnoses, or prescriptions.
            </p>
            <div className="space-y-3 bg-[var(--surface-elevated)] p-4 rounded-2xl mb-5 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                <span className="font-medium text-[var(--text)]">India Emergency Services:</span>
                <a href="tel:112" className="font-bold text-[var(--danger)] hover:underline">
                  112
                </a>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                <span className="font-medium text-[var(--text)]">Tele-MANAS Mental Health:</span>
                <a href="tel:14416" className="font-bold text-[var(--primary)] hover:underline">
                  14416 / 1800 891 4416
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-[var(--text)]">US / UK Emergency:</span>
                <span className="font-bold text-[var(--text)]">911 / 999</span>
              </div>
            </div>
            <button
              onClick={() => setEmergencyModalOpen(false)}
              className="w-full py-3 rounded-xl bg-[var(--text)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
