"use client";

import Link from "next/link";
import { Heart, Shield, PhoneCall } from "lucide-react";


export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition-colors duration-200 mt-20">
      {/* Medical Disclaimer Banner */}
      <div className="bg-[var(--surface-elevated)] border-b border-[var(--border)] py-4 px-4 sm:px-8 lg:px-12">
        <div className="max-w-[1760px] w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2 text-center md:text-left">
            <Shield className="w-4 h-4 text-[var(--primary)] shrink-0" />
            <p>
              <strong className="text-[var(--text)]">Medical Disclaimer:</strong> graceAI is an educational wellness and culinary companion, not a medical device. Always consult a physician or registered dietitian before changing your medical or diet regimen.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1 text-[var(--danger)] font-medium">
              <PhoneCall className="w-3.5 h-3.5" />
              Emergency: 112
            </span>
            <span>•</span>
            <span className="text-[var(--primary)] font-medium">
              Tele-MANAS: 14416
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1760px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="graceAI"
                className="w-9 h-9 rounded-xl object-cover"
              />
              <span className="font-serif text-2xl font-bold tracking-tight text-[var(--text)]">
                grace<span className="text-[var(--primary)] italic font-light">AI</span>
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Eat well. Live gracefully. A calm, free, and privacy-respecting wellness companion designed for authentic lifestyle nourishment.
            </p>
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 pt-2">
              <span>Engineered with care</span>
              <Heart className="w-3.5 h-3.5 text-[var(--accent)] fill-[var(--accent)]" />
              <span>• Zero Ads • 100% Free Tier</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="font-serif text-base font-semibold text-[var(--text)] mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>
                <Link href="/planner" className="hover:text-[var(--text)] transition-colors">
                  Personalized Meal Planner
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-[var(--text)] transition-colors">
                  Health Care & Home Remedies
                </Link>
              </li>
              <li>
                <Link href="/tracker" className="hover:text-[var(--text)] transition-colors">
                  Holistic Health Tracker
                </Link>
              </li>
              <li>
                <Link href="/grace" className="hover:text-[var(--text)] transition-colors">
                  Grace AI Chat Companion
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-[var(--text)] transition-colors">
                  Calculate Calorie & Macro Targets
                </Link>
              </li>
            </ul>
          </div>

          {/* Regional & Global Cuisines */}
          <div>
            <h4 className="font-serif text-base font-semibold text-[var(--text)] mb-3">
              Cuisines
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>
                <span className="text-[var(--text)] font-medium">India:</span> Tamil, Kerala, Punjab, Bengal, Gujarat
              </li>
              <li>
                <span className="text-[var(--text)] font-medium">Mediterranean:</span> Greek, Italian, Levantine
              </li>
              <li>
                <span className="text-[var(--text)] font-medium">East & SE Asia:</span> Japanese, Thai, Vietnamese
              </li>
              <li>
                <span className="text-[var(--text)] font-medium">Americas:</span> Mexican, Latin, Hearth Bowls
              </li>
              <li>
                <span className="text-[var(--text)] font-medium">Special Diets:</span> Jain, Sattvic, Vegan, Keto, Diabetic
              </li>
            </ul>
          </div>

          {/* Ethics & Legal */}
          <div>
            <h4 className="font-serif text-base font-semibold text-[var(--text)] mb-3">
              Ethics & Privacy
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
              Compliant with India DPDP Act 2023 principles. Your wellness data belongs entirely to you. Export or delete your data at any time.
            </p>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link href="/privacy" className="hover:text-[var(--text)] underline">
                  Privacy Policy & Data Security
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--text)] underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[var(--text)] underline">
                  Medical Information Notice
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
          <p>© 2026 graceAI. Open architecture, built for everyday wellness.</p>
          <div className="flex items-center gap-4">
            <span>Free Tier Guarantee</span>
            <span>•</span>
            <span>No Data Selling</span>
            <span>•</span>
            <span>Open Source Powered</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
