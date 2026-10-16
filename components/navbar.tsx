"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "./theme-provider";
import { LiveClockWidget } from "./live-clock-widget";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/firebase";
import {
  Sun,
  Moon,
  Menu,
  X,
  HeartPulse,
  CalendarDays,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Stethoscope,
  LogOut,
  ShoppingBag,
} from "lucide-react";

const NAV_LINKS = [
  { name: "Overview", href: "/" },
  { name: "Meal Planner", href: "/planner", icon: CalendarDays },
  { name: "Groceries", href: "/grocery", icon: ShoppingBag },
  { name: "Health Care", href: "/care", icon: Stethoscope },
  { name: "Daily Rhythm", href: "/tracker", icon: HeartPulse },
  { name: "Chef Grace", href: "/grace", icon: Sparkles },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  const handleSignOut = async () => {
    setProfileMenuOpen(false);
    await signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b transition-colors duration-200">
        <div className="max-w-[1760px] w-full mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/grace-icon.png"
              alt="graceAI icon"
              className="w-10 h-10 rounded-xl object-cover shadow-sm transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/grace-logo-light.png"
                alt="graceAI"
                className="h-7 w-auto object-contain dark:hidden"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/grace-logo-dark.png"
                alt="graceAI"
                className="h-7 w-auto object-contain hidden dark:block"
              />
              <span className="text-[10px] tracking-widest uppercase text-[var(--text-muted)] font-medium hidden sm:inline-block">
                Culinary Wellness &amp; Nourishment
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock & Rhythm Widget */}
            <LiveClockWidget />

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

            {/* ─── AUTH AREA ─────────────────────────────────────────── */}
            {user ? (
              /* Signed-in: avatar + dropdown */
              <div ref={profileRef} className="relative hidden lg:block">
                <button
                  id="user-avatar-btn"
                  onClick={() => setProfileMenuOpen((p) => !p)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-2xl border border-[var(--border)] hover:bg-[var(--surface-elevated)] transition-colors"
                >
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "You"}
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center">
                      {(user.displayName || user.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-[var(--text)] max-w-[100px] truncate hidden xl:block">
                    {user.displayName?.split(" ")[0] || "My Account"}
                  </span>
                </button>

                {/* Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="text-xs font-semibold text-[var(--text)] truncate">
                        {user.displayName || "Signed In"}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        href="/planner"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <CalendarDays className="w-3.5 h-3.5 text-[var(--primary)]" />
                        My Meal Planner
                      </Link>
                      <Link
                        href="/tracker"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <HeartPulse className="w-3.5 h-3.5 text-[var(--accent)]" />
                        Daily Tracker
                      </Link>
                    </div>
                    <div className="p-1.5 border-t border-[var(--border)]">
                      <button
                        id="sign-out-btn"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Signed-out: Sign In link + Get Started CTA */
              <>
                <Link
                  href="/login"
                  className="hidden lg:inline-flex items-center text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-2 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/onboarding"
                  className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-all shadow-sm active:scale-95"
                >
                  <span>Build My Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
            {/* ─────────────────────────────────────────────────────────── */}

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
              {user ? (
                <div className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "You"}
                        className="w-10 h-10 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white text-sm font-bold flex items-center justify-center">
                        {(user.displayName || user.email || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--text)] truncate">
                        {user.displayName || "Account"}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--danger)]/30 text-[var(--danger)] hover:bg-[var(--danger)]/10 text-xs font-semibold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-sm font-semibold text-[var(--text)] border border-[var(--border)] rounded-xl hover:bg-[var(--surface-elevated)] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/onboarding"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent)] text-white font-medium text-center"
                  >
                    <span>Build My Menu</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
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
