"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, PhoneCall, AlertTriangle, Globe } from "lucide-react";
import { EmergencyModal, useEmergencyLocation } from "@/components/emergency-modal";

export default function MedicalDisclaimerPage() {
  const { emergencyInfo } = useEmergencyLocation();
  const [modalOpen, setModalOpen] = useState(false);

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
          <div className="w-12 h-12 rounded-2xl bg-[var(--danger)]/15 text-[var(--danger)] flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[var(--text)]">
              Medical & Safety Disclaimer
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Last updated: October 2026 • Wellness Information Standard
            </p>
          </div>
        </div>

        <div className="prose prose-sm text-[var(--text)] space-y-4 leading-relaxed">
          <div className="p-4 rounded-2xl bg-[var(--danger)]/10 border border-[var(--danger)]/25 text-sm space-y-2">
            <h3 className="font-bold text-[var(--danger)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Not Medical Advice
            </h3>
            <p>
              graceAI provides educational culinary suggestions, general nutritional estimations, and lifestyle habit tracking. <strong>It is not a medical device, and the information provided does not constitute medical advice, diagnosis, or clinical prescription.</strong>
            </p>
          </div>

          <h3 className="font-serif text-xl font-semibold text-[var(--text)] pt-2">
            1. Consultation with Healthcare Professionals
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            Always seek the advice of your physician, registered clinical dietitian, or other qualified healthcare provider with any questions you may have regarding a medical condition, severe allergy, chronic illness, metabolic condition (such as diabetes, hypertension, renal conditions, or thyroid disorders), or pregnancy/lactation.
          </p>

          <div className="flex items-center justify-between pt-2">
            <h3 className="font-serif text-xl font-semibold text-[var(--text)]">
              2. Emergency Medical Situations
            </h3>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs px-3 py-1.5 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] text-[var(--primary)] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Change Country</span>
            </button>
          </div>

          <p className="text-sm text-[var(--text-muted)]">
            If you experience symptoms of an emergency—such as chest pain, crushing pressure, sudden shortness of breath, speech impairment, severe allergic reactions (anaphylaxis), or thoughts of self-harm—do not use this application. Contact emergency responders immediately:
          </p>

          {/* Location-Synchronized Emergency Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--danger)] flex items-center gap-1.5">
                  <span>{emergencyInfo.flagEmoji}</span>
                  <span>{emergencyInfo.countryName} Primary Emergency</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--danger)]/15 text-[var(--danger)] font-bold">
                  Immediate
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[var(--danger)] font-mono">
                {emergencyInfo.primaryEmergency}
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {emergencyInfo.notes || "National emergency dispatch line"}
              </p>
              <div className="pt-2">
                <a
                  href={`tel:${emergencyInfo.primaryEmergency}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--danger)] text-white text-xs font-bold hover:opacity-90 shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {emergencyInfo.primaryEmergency}</span>
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
              <span className="text-xs font-semibold text-[var(--primary)]">
                {emergencyInfo.mentalHealth.name}
              </span>
              <div className="text-2xl font-bold text-[var(--primary)] font-mono">
                {emergencyInfo.mentalHealth.number}
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {emergencyInfo.mentalHealth.description}
              </p>
              <div className="pt-2">
                <a
                  href={`tel:${emergencyInfo.mentalHealth.number.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-hover)] shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {emergencyInfo.mentalHealth.number}</span>
                </a>
              </div>
            </div>
          </div>

          <h3 className="font-serif text-xl font-semibold text-[var(--text)] pt-2">
            3. Algorithmic Calorie Floors
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            graceAI strictly enforces biological safety floors (1,200 kcal/day for women, 1,500 kcal/day for men) to prevent metabolic damage and disordered eating. We explicitly refuse prompts advocating extreme fasting, crash restriction, or purging behaviors.
          </p>
        </div>
      </div>

      <EmergencyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
