import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[var(--text)]">
              Terms of Service
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Fair use, free tier commitment, and user responsibilities.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-[var(--text)] leading-relaxed">
          <h3 className="font-serif text-xl font-semibold text-[var(--text)]">
            1. Free-Tier Usage Commitment
          </h3>
          <p className="text-[var(--text-muted)]">
            graceAI is committed to providing free-of-cost wellness tools, recipes, and educational lifestyle support. Users agree not to abuse rate limits or automate unauthorized scrapers against our APIs.
          </p>

          <h3 className="font-serif text-xl font-semibold text-[var(--text)]">
            2. Responsible Use & Health Safeguards
          </h3>
          <p className="text-[var(--text-muted)]">
            Users must verify that they are at least 18 years of age or using the service with parental guidance. graceAI is not designed to replace clinical nutritional therapy or emergency care.
          </p>
        </div>
      </div>
    </div>
  );
}
