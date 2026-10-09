import Link from "next/link";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Overview</span>
      </Link>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[var(--text)]">
              Privacy Policy & DPDP Act 2023 Compliance
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Your health data belongs solely to you. Zero tracking or commercial monetization.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-[var(--text)] leading-relaxed">
          <h3 className="font-serif text-xl font-semibold text-[var(--text)]">
            1. Core Privacy Philosophy
          </h3>
          <p className="text-[var(--text-muted)]">
            Health and wellness metrics are intimate personal data. Under India&apos;s Digital Personal Data Protection Act (DPDP Act 2023), graceAI operates on strict principles of purpose limitation, explicit consent, and data minimization.
          </p>

          <h3 className="font-serif text-xl font-semibold text-[var(--text)]">
            2. What We Collect and Why
          </h3>
          <p className="text-[var(--text-muted)]">
            We only process the metrics you actively enter (e.g. age, height, weight, dietary style, and log entries) to compute your TDEE and display your wellness trends. We never sell, broker, or transmit your identifiable logs to health insurance companies or advertising brokers.
          </p>

          <h3 className="font-serif text-xl font-semibold text-[var(--text)]">
            3. Right to Export & Complete Deletion
          </h3>
          <p className="text-[var(--text-muted)]">
            You maintain full ownership of your data at all times. In your profile settings, you can download a complete JSON/CSV export of your meal plans and health logs, or trigger an instant, permanent deletion of your account and all associated records.
          </p>
        </div>
      </div>
    </div>
  );
}
