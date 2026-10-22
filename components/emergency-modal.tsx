"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  PhoneCall,
  X,
  MapPin,
  HeartPulse,
  BrainCircuit,
  Flame,
  Shield,
  Copy,
  Check,
  Search,
  Globe,
  Navigation,
} from "lucide-react";
import {
  EmergencyContactInfo,
  getEmergencyInfo,
  getAllEmergencyCountries,
  dispatchLocationChange,
  DEFAULT_EMERGENCY_INFO,
} from "@/lib/emergency-service";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCountry?: string;
}

export function EmergencyModal({ isOpen, onClose, initialCountry }: EmergencyModalProps) {
  const [currentCountry, setCurrentCountry] = useState<string>(initialCountry || "India");
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCountrySelector, setShowCountrySelector] = useState(false);

  // Sync with localStorage on mount & listen to changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromStorage = () => {
      try {
        const userLocStr = localStorage.getItem("graceai_user_location");
        if (userLocStr) {
          const loc = JSON.parse(userLocStr);
          if (loc.country) setCurrentCountry(loc.country);
          if (loc.city) setDetectedCity(loc.city);
          return;
        }

        const weatherPlaceStr = localStorage.getItem("graceai_live_weather_place");
        if (weatherPlaceStr) {
          const loc = JSON.parse(weatherPlaceStr);
          if (loc.country) setCurrentCountry(loc.country);
          if (loc.city) setDetectedCity(loc.city);
        }
      } catch {
        // Fall back to default
      }
    };

    syncFromStorage();

    const handleLocationChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.country) setCurrentCountry(customEvent.detail.country);
        if (customEvent.detail.city) setDetectedCity(customEvent.detail.city);
      }
    };

    window.addEventListener("graceai_location_changed", handleLocationChange);
    return () => window.removeEventListener("graceai_location_changed", handleLocationChange);
  }, []);

  const emergencyInfo: EmergencyContactInfo = useMemo(() => {
    return getEmergencyInfo(currentCountry) || DEFAULT_EMERGENCY_INFO;
  }, [currentCountry]);

  const allCountries = useMemo(() => getAllEmergencyCountries(), []);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return allCountries;
    const q = searchQuery.toLowerCase();
    return allCountries.filter(
      (c) =>
        c.countryName.toLowerCase().includes(q) ||
        c.countryCode.toLowerCase().includes(q) ||
        c.primaryEmergency.includes(q)
    );
  }, [allCountries, searchQuery]);

  const handleCopy = (num: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedNumber(num);
      setTimeout(() => setCopiedNumber(null), 2500);
    }
  };

  const handleSelectCountry = (info: EmergencyContactInfo) => {
    setCurrentCountry(info.countryName);
    setDetectedCity(null);
    setShowCountrySelector(false);
    setSearchQuery("");
    dispatchLocationChange({
      city: info.countryName,
      country: info.countryName,
    });
  };

  const handleAutoDetectGPS = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`
          );
          if (res.ok) {
            const data = await res.json();
            const country = data.countryName || data.countryCode;
            const city = data.city || data.locality || "Detected Area";
            if (country) {
              setCurrentCountry(country);
              setDetectedCity(city);
              dispatchLocationChange({
                city,
                country,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
            }
          }
        } catch {
          // If reverse geocode fails, fallback gracefully
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setIsDetecting(false);
      },
      { timeout: 6000 }
    );
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="max-w-xl w-full bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-6 border-b border-[var(--border)] relative bg-[var(--surface-elevated)]/60">
          <button
            onClick={onClose}
            aria-label="Close emergency modal"
            className="absolute top-5 right-5 p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-full hover:bg-[var(--surface)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-[var(--danger)]/15 text-[var(--danger)] flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-[var(--text)] tracking-tight">
                Emergency Helplines
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Live location-synchronized critical health & crisis contacts
              </p>
            </div>
          </div>

          {/* Location Badge & Selector Switcher */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[var(--border)]/70">
            <div className="flex items-center gap-2">
              <span className="text-xl">{emergencyInfo.flagEmoji}</span>
              <div className="text-xs">
                <span className="font-semibold text-[var(--text)]">
                  {emergencyInfo.countryName}
                </span>
                {detectedCity && (
                  <span className="text-[var(--text-muted)] ml-1">
                    • ({detectedCity})
                  </span>
                )}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-semibold border border-[var(--accent)]/30">
                Live Matched
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoDetectGPS}
                disabled={isDetecting}
                title="Detect my GPS location"
                className="px-2.5 py-1 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text)] text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 text-[var(--primary)] ${isDetecting ? "animate-spin" : ""}`} />
                <span>{isDetecting ? "Locating..." : "Auto-Detect"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCountrySelector(!showCountrySelector)}
                className="px-2.5 py-1 rounded-xl bg-[var(--primary)] text-white text-xs font-medium flex items-center gap-1 hover:bg-[var(--primary-hover)] transition-colors shadow-xs"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Change Country</span>
              </button>
            </div>
          </div>

          {/* Expandable Country Switcher Dropdown */}
          {showCountrySelector && (
            <div className="mt-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg animate-in slide-in-from-top-2 duration-150">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search country or dial code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                {filteredCountries.map((c) => (
                  <button
                    key={c.countryCode}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors text-left ${
                      c.countryCode === emergencyInfo.countryCode
                        ? "bg-[var(--primary)] text-white font-semibold"
                        : "hover:bg-[var(--surface-elevated)] text-[var(--text)]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{c.flagEmoji}</span>
                      <span>{c.countryName}</span>
                    </span>
                    <span className="font-mono text-[11px] opacity-80">
                      Emergency: {c.primaryEmergency}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* PRIMARY EMERGENCY CARD */}
          <div className="p-4 rounded-2xl bg-[var(--danger)]/10 border-2 border-[var(--danger)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--danger)]">
                <ShieldAlert className="w-4 h-4" />
                <span>Primary Emergency Dispatch ({emergencyInfo.countryName})</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[var(--danger)] font-mono tracking-tight">
                {emergencyInfo.primaryEmergency}
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {emergencyInfo.notes || "Unified national emergency dispatch line for immediate assistance."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`tel:${emergencyInfo.primaryEmergency}`}
                className="px-4 py-2.5 rounded-xl bg-[var(--danger)] hover:bg-[var(--danger)]/90 text-white text-sm font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-md"
              >
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>Call {emergencyInfo.primaryEmergency}</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(emergencyInfo.primaryEmergency)}
                title="Copy number"
                className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--text)] transition-colors"
              >
                {copiedNumber === emergencyInfo.primaryEmergency ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* SECONDARY TIERS: Medical, Mental Health, Police/Fire */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Medical / Ambulance */}
            <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] mb-1">
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Ambulance / Medical</span>
                </div>
                <div className="text-2xl font-bold font-mono text-[var(--text)]">
                  {emergencyInfo.medicalEmergency}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Direct emergency medical response and paramedics
                </p>
              </div>
              <div className="pt-3 flex items-center gap-2">
                <a
                  href={`tel:${emergencyInfo.medicalEmergency}`}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[var(--primary-hover)] transition-colors"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call {emergencyInfo.medicalEmergency}</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(emergencyInfo.medicalEmergency)}
                  className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  {copiedNumber === emergencyInfo.medicalEmergency ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mental Health Crisis */}
            <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] mb-1">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>{emergencyInfo.mentalHealth.name}</span>
                </div>
                <div className="text-xl font-bold font-mono text-[var(--text)]">
                  {emergencyInfo.mentalHealth.number}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-2">
                  {emergencyInfo.mentalHealth.description}
                </p>
              </div>
              <div className="pt-3 flex items-center gap-2">
                <a
                  href={`tel:${emergencyInfo.mentalHealth.number.replace(/\D/g, "")}`}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[var(--accent-hover)] transition-colors"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call {emergencyInfo.mentalHealth.number}</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(emergencyInfo.mentalHealth.number)}
                  className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  {copiedNumber === emergencyInfo.mentalHealth.number ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Police Dispatch */}
            <div className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Police</span>
                </div>
                <div className="text-lg font-bold font-mono text-[var(--text)]">
                  {emergencyInfo.police}
                </div>
              </div>
              <a
                href={`tel:${emergencyInfo.police}`}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)] text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <PhoneCall className="w-3 h-3 text-[var(--primary)]" />
                <span>Call</span>
              </a>
            </div>

            {/* Fire & Rescue */}
            <div className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Fire & Rescue</span>
                </div>
                <div className="text-lg font-bold font-mono text-[var(--text)]">
                  {emergencyInfo.fire}
                </div>
              </div>
              <a
                href={`tel:${emergencyInfo.fire}`}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)] text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <PhoneCall className="w-3 h-3 text-[var(--primary)]" />
                <span>Call</span>
              </a>
            </div>
          </div>

          {/* Poison Control notice if available */}
          {emergencyInfo.poisonControl && (
            <div className="p-3 rounded-xl bg-[var(--surface-elevated)]/80 border border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">
                Poison Control & Toxic Ingestion:
              </span>
              <a
                href={`tel:${emergencyInfo.poisonControl.replace(/\D/g, "")}`}
                className="font-mono font-bold text-[var(--text)] hover:underline flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3 text-[var(--primary)]" />
                <span>{emergencyInfo.poisonControl}</span>
              </a>
            </div>
          )}

          {/* Medical Clinical Disclaimer Note */}
          <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)]/50 border border-[var(--border)] text-xs text-[var(--text-muted)] leading-relaxed">
            <strong className="text-[var(--text)]">Important Clinical Guidance:</strong> If you or someone with you experiences symptoms of severe anaphylaxis (throat swelling, sudden difficulty breathing), severe chest pressure, or stroke signs, do not wait. Call your local emergency number immediately.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-elevated)]/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--text)] text-[var(--background)] font-semibold text-xs hover:opacity-90 transition-opacity"
          >
            Close Emergency Guide
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook that returns the user's active emergency contact info, dynamically synchronized with place updates.
 */
export function useEmergencyLocation() {
  const [country, setCountry] = useState("India");
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const readStorage = () => {
      try {
        const userLoc = localStorage.getItem("graceai_user_location");
        if (userLoc) {
          const parsed = JSON.parse(userLoc);
          if (parsed.country) setCountry(parsed.country);
          if (parsed.city) setCity(parsed.city);
          return;
        }

        const weatherLoc = localStorage.getItem("graceai_live_weather_place");
        if (weatherLoc) {
          const parsed = JSON.parse(weatherLoc);
          if (parsed.country) setCountry(parsed.country);
          if (parsed.city) setCity(parsed.city);
        }
      } catch {
        // Fall back to default
      }
    };

    readStorage();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.country) setCountry(customEvent.detail.country);
        if (customEvent.detail.city) setCity(customEvent.detail.city);
      }
    };

    window.addEventListener("graceai_location_changed", handleUpdate);
    return () => window.removeEventListener("graceai_location_changed", handleUpdate);
  }, []);

  const emergencyInfo = useMemo(() => getEmergencyInfo(country), [country]);

  return {
    country,
    city,
    emergencyInfo,
  };
}
