"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HeartPulse,
  Droplet,
  Moon,
  Footprints,
  Smile,
  Activity,
  Flame,
  Award,
  Plus,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function TrackerPage() {
  // Quick-log state
  const [waterMl, setWaterMl] = useState(1750);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [steps, setSteps] = useState(8420);
  const [mood, setMood] = useState("Energized");
  const [systolic, setSystolic] = useState(118);
  const [diastolic, setDiastolic] = useState(76);
  const [bloodSugar, setBloodSugar] = useState(94);
  const [logNotification, setLogNotification] = useState("");

  const notifyLog = (msg: string) => {
    setLogNotification(msg);
    setTimeout(() => setLogNotification(""), 3000);
  };

  // Health Score Calculation (0-100)
  // Hydration (25 pts max) + Sleep (25 pts max) + Activity (25 pts max) + Consistency (25 pts)
  const hydrationPts = Math.min(25, Math.round((waterMl / 2500) * 25));
  const sleepPts = sleepHours >= 7 && sleepHours <= 9 ? 25 : Math.round((sleepHours / 8) * 20);
  const activityPts = Math.min(25, Math.round((steps / 10000) * 25));
  const consistencyPts = 20; // 5-day streak
  const healthScore = hydrationPts + sleepPts + activityPts + consistencyPts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {logNotification && (
        <div className="fixed top-24 right-5 z-50 bg-[var(--surface)] border border-[var(--primary)] text-[var(--text)] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
          <span>{logNotification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-1">
            <HeartPulse className="w-4 h-4" />
            <span>Gentle Daily Tracking</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text)]">
            Holistic Health Tracker
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Log your daily rhythms without obsessive tracking. Transparent health scoring and supportive habit trends.
          </p>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold">
            <Flame className="w-5 h-5 fill-[var(--accent)]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text)]">5-Day Mindful Streak</div>
            <div className="text-[11px] text-[var(--text-muted)]">Keep logging your water & sleep</div>
          </div>
        </div>
      </div>

      {/* Top Strip: Health Score & Rule-based Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transparent Health Score Card (0-100) */}
        <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                Daily Score
              </span>
              <h3 className="font-serif text-xl font-semibold text-[var(--text)]">
                Holistic Vitality Index
              </h3>
            </div>
            <span className="font-serif text-3xl font-bold text-[var(--primary)]">
              {healthScore}/100
            </span>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Calculated transparently: Hydration ({hydrationPts}/25), Sleep ({sleepPts}/25), Steps ({activityPts}/25), and Logging Streak ({consistencyPts}/25).
          </p>

          <div className="space-y-2.5 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text)] font-medium">Hydration Fulfillment</span>
                <span className="text-[var(--text-muted)]">{waterMl} / 2,500 ml</span>
              </div>
              <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--primary)] h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (waterMl / 2500) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text)] font-medium">Rest & Recovery</span>
                <span className="text-[var(--text-muted)]">{sleepHours} hrs</span>
              </div>
              <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--accent)] h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (sleepHours / 8) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text)] font-medium">Daily Movement</span>
                <span className="text-[var(--text-muted)]">{steps} / 10,000 steps</span>
              </div>
              <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--warning)] h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (steps / 10000) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rule-based Insights & Grace Tip */}
        <div className="lg:col-span-7 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--accent)]" />
              <h3 className="font-serif text-lg font-semibold text-[var(--text)]">
                Rule-Based Weekly Insights
              </h3>
            </div>
            <div className="space-y-2 text-xs text-[var(--text)]">
              <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-start gap-2.5">
                <TrendingUp className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <p>
                  <strong>Hydration Milestone:</strong> You have hit your 2,000ml water baseline on 4 of the last 5 days. Steady hydration lowers afternoon fatigue.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-start gap-2.5">
                <Award className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <p>
                  <strong>Sleep Rhythm:</strong> Consistent bedtime within a 30-minute window has improved your sleep recovery score by 14% this week.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--primary-light)] border border-[var(--primary-border)] text-xs text-[var(--text)]">
            🌿 <strong>Grace Tip:</strong> Take 5 deep diaphragmatic breaths before lunch to activate the parasympathetic nervous system for smoother digestion.
          </div>
        </div>
      </div>

      {/* Quick-Log Interactive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Water Log */}
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-[var(--primary)]/20" />
            </div>
            <span className="text-xs font-bold text-[var(--primary)]">{waterMl} ml</span>
          </div>
          <div>
            <h4 className="font-serif text-lg font-semibold text-[var(--text)]">Hydration</h4>
            <p className="text-xs text-[var(--text-muted)]">Target: 2,500 ml/day</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setWaterMl((p) => p + 250);
                notifyLog("Logged +250ml water");
              }}
              className="flex-1 py-2 rounded-xl bg-[var(--primary-light)] border border-[var(--primary-border)] text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
            >
              +250 ml
            </button>
            <button
              onClick={() => {
                setWaterMl((p) => p + 500);
                notifyLog("Logged +500ml water");
              }}
              className="flex-1 py-2 rounded-xl bg-[var(--primary-light)] border border-[var(--primary-border)] text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
            >
              +500 ml
            </button>
          </div>
        </div>

        {/* Sleep Log */}
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--accent)]">{sleepHours} hrs</span>
          </div>
          <div>
            <h4 className="font-serif text-lg font-semibold text-[var(--text)]">Sleep Duration</h4>
            <p className="text-xs text-[var(--text-muted)]">Goal: 7 - 8.5 hours</p>
          </div>
          <input
            type="range"
            min={4}
            max={12}
            step={0.5}
            value={sleepHours}
            onChange={(e) => {
              setSleepHours(Number(e.target.value));
              notifyLog(`Updated sleep to ${e.target.value} hours`);
            }}
            className="w-full accent-[var(--accent)]"
          />
        </div>

        {/* Steps Log */}
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[var(--warning)]/15 text-[var(--warning)] flex items-center justify-center">
              <Footprints className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--warning)]">{steps.toLocaleString()}</span>
          </div>
          <div>
            <h4 className="font-serif text-lg font-semibold text-[var(--text)]">Steps & Movement</h4>
            <p className="text-xs text-[var(--text-muted)]">Goal: 10,000 steps</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSteps((p) => p + 1000);
                notifyLog("Logged +1,000 steps");
              }}
              className="flex-1 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--border)]"
            >
              +1,000
            </button>
            <button
              onClick={() => {
                setSteps((p) => p + 2500);
                notifyLog("Logged +2,500 steps");
              }}
              className="flex-1 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--border)]"
            >
              +2,500
            </button>
          </div>
        </div>

        {/* Mood Log */}
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
              <Smile className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--primary)]">{mood}</span>
          </div>
          <div>
            <h4 className="font-serif text-lg font-semibold text-[var(--text)]">Mindful State</h4>
            <p className="text-xs text-[var(--text-muted)]">How does your body feel today?</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Calm", "Energized", "Fatigued", "Stressed"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMood(m);
                  notifyLog(`Mood logged as ${m}`);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors ${
                  mood === m
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text)]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clinical Metrics: Blood Pressure & Blood Sugar */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Clinical Vitals
            </span>
            <h4 className="font-serif text-lg font-semibold text-[var(--text)]">
              Blood Pressure & Blood Sugar Log
            </h4>
          </div>
          <span className="text-xs text-[var(--text-muted)]">General wellness tracking only</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[var(--text)]">Blood Pressure (mmHg)</span>
              <span className="font-bold text-[var(--primary)]">{systolic} / {diastolic}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[var(--text-muted)] block">Systolic</label>
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 text-xs text-[var(--text)]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[var(--text-muted)] block">Diastolic</label>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(Number(e.target.value))}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 text-xs text-[var(--text)]"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[var(--text)]">Fasting Blood Sugar (mg/dL)</span>
              <span className="font-bold text-[var(--primary)]">{bloodSugar} mg/dL</span>
            </div>
            <div>
              <label className="text-[11px] text-[var(--text-muted)] block">Glucose reading</label>
              <input
                type="number"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(Number(e.target.value))}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 text-xs text-[var(--text)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
