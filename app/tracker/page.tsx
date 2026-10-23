"use client";

import { useState, useEffect } from "react";
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
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Check,
  Edit3,
  RotateCcw,
  SkipForward,
  Loader2,
  Info,
  FileText,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import {
  getWeekDays,
  getRealTimeStatus,
  toLocalDateString,
  WeekInfo,
  DayInfo,
  DEFAULT_WEEK_INFO,
} from "@/lib/date-utils";
import { useRealTime } from "@/lib/use-real-time";
import { ManualMealModal } from "@/components/manual-meal-modal";
import { WeatherCuisineBanner } from "@/components/weather-cuisine-banner";
import { WeatherDishRecommendation } from "@/lib/weather-service";
import {
  ScheduledMeal,
  MealStatus,
  getStoredMeals,
  saveStoredMeals,
  getStoredReport,
  saveStoredReport,
  computeDeterministicReport,
  evaluateMealTiming,
  LOG_DEADLINE_HOURS,
  DEFAULT_TARGET_KCAL,
} from "@/lib/meal-schedule";
import { HealthReportOutput } from "@/app/api/report/generate/route";

interface DayLog {
  waterMl: number;
  sleepHours: number;
  steps: number;
  mood: string;
  systolic: number;
  diastolic: number;
  bloodSugar: number;
  lastUpdated?: string;
}

const DEFAULT_LOG: DayLog = {
  waterMl: 1750,
  sleepHours: 7.5,
  steps: 8420,
  mood: "Energized",
  systolic: 118,
  diastolic: 76,
  bloodSugar: 94,
};

// Seed baseline logs for past days in current week so user has a rich experience immediately
const PAST_DEFAULTS: Record<number, DayLog> = {
  0: { waterMl: 2250, sleepHours: 8.0, steps: 10400, mood: "Calm", systolic: 116, diastolic: 74, bloodSugar: 92 },
  1: { waterMl: 2500, sleepHours: 7.5, steps: 9800, mood: "Energized", systolic: 118, diastolic: 75, bloodSugar: 90 },
  2: { waterMl: 2000, sleepHours: 7.0, steps: 8900, mood: "Calm", systolic: 120, diastolic: 78, bloodSugar: 95 },
  3: { waterMl: 2400, sleepHours: 8.0, steps: 11200, mood: "Energized", systolic: 115, diastolic: 74, bloodSugar: 88 },
  4: { waterMl: 1750, sleepHours: 7.5, steps: 8420, mood: "Energized", systolic: 118, diastolic: 76, bloodSugar: 94 },
  5: { waterMl: 0, sleepHours: 0, steps: 0, mood: "Calm", systolic: 120, diastolic: 80, bloodSugar: 90 },
  6: { waterMl: 0, sleepHours: 0, steps: 0, mood: "Calm", systolic: 120, diastolic: 80, bloodSugar: 90 },
};

function calculateHealthScore(log: DayLog, mealAdherence = 85): {
  score: number;
  mealPts: number;
  sleepPts: number;
  activityPts: number;
  hydrationPts: number;
} {
  const mealPts = Math.min(30, Math.round((mealAdherence / 100) * 30));
  const sleepPts =
    log.sleepHours >= 7 && log.sleepHours <= 9
      ? 25
      : Math.min(25, Math.round((log.sleepHours / 8) * 20));
  const activityPts = Math.min(25, Math.round((log.steps / 10000) * 25));
  const hydrationPts = Math.min(20, Math.round((log.waterMl / 2500) * 20));
  const score = mealPts + sleepPts + activityPts + hydrationPts;
  return { score, mealPts, sleepPts, activityPts, hydrationPts };
}

export default function TrackerPage() {
  const { status, mounted } = useRealTime(1000);
  const [weekInfo, setWeekInfo] = useState<WeekInfo>(DEFAULT_WEEK_INFO);
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-10-09");
  const [currentLog, setCurrentLog] = useState<DayLog>(DEFAULT_LOG);
  const [logNotification, setLogNotification] = useState("");
  const [weekLogs, setWeekLogs] = useState<Record<string, DayLog>>({});

  // Scheduled meals & Health Report state
  const [meals, setMeals] = useState<ScheduledMeal[]>([]);
  const [report, setReport] = useState<HealthReportOutput | null>(null);
  const [isReportGenerating, setIsReportGenerating] = useState(false);

  // Manual Meal Entry Modal state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [activeSlotForModal, setActiveSlotForModal] = useState<ScheduledMeal | null>(null);

  // Initialize and update week info
  useEffect(() => {
    const info = getWeekDays(new Date(), 0);
    setWeekInfo(info);
    const today = info.days.find((d) => d.isToday);
    if (today) {
      setSelectedDateStr(today.dateString);
    }
  }, []);

  // Load all week logs & meals from localStorage
  useEffect(() => {
    if (!mounted) return;
    const loaded: Record<string, DayLog> = {};

    weekInfo.days.forEach((day, idx) => {
      const storageKey = `graceai_tracker_${day.dateString}`;
      try {
        const item = localStorage.getItem(storageKey);
        if (item) {
          loaded[day.dateString] = JSON.parse(item);
        } else if (day.isPast) {
          loaded[day.dateString] = PAST_DEFAULTS[idx] || DEFAULT_LOG;
        } else if (day.isToday) {
          loaded[day.dateString] = DEFAULT_LOG;
        }
      } catch {
        loaded[day.dateString] = DEFAULT_LOG;
      }
    });

    setWeekLogs(loaded);

    if (loaded[selectedDateStr]) {
      setCurrentLog(loaded[selectedDateStr]);
    }
  }, [mounted, weekInfo, selectedDateStr]);

  // Load Scheduled Meals & Report whenever selectedDateStr changes
  useEffect(() => {
    if (!mounted) return;

    const dayInfo = weekInfo.days.find((d) => d.dateString === selectedDateStr);
    const dayName = dayInfo?.dayName || "Friday";
    const isPast = dayInfo?.isPast ?? false;

    // Load meals
    const storedMeals = getStoredMeals(selectedDateStr, dayName, isPast);
    setMeals(storedMeals);

    // Load or calculate report
    let storedReport = getStoredReport(selectedDateStr);
    if (!storedReport) {
      storedReport = computeDeterministicReport(
        selectedDateStr,
        dayName,
        storedMeals,
        DEFAULT_TARGET_KCAL,
        {
          sleepHours: currentLog.sleepHours,
          steps: currentLog.steps,
          mood: currentLog.mood,
        }
      );
      saveStoredReport(selectedDateStr, storedReport);
    }
    setReport(storedReport);
  }, [mounted, selectedDateStr, weekInfo.days]);

  const notifyLog = (msg: string) => {
    setLogNotification(msg);
    setTimeout(() => setLogNotification(""), 3500);
  };

  const updateLog = (updater: (prev: DayLog) => DayLog, notificationMsg?: string) => {
    setCurrentLog((prev) => {
      const next = updater(prev);
      next.lastUpdated = new Date().toISOString();

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`graceai_tracker_${selectedDateStr}`, JSON.stringify(next));
        } catch {
          // storage quota
        }
      }

      setWeekLogs((wPrev) => ({
        ...wPrev,
        [selectedDateStr]: next,
      }));

      return next;
    });

    if (notificationMsg) {
      notifyLog(notificationMsg);
    }
  };

  // Helper to persist updated meals and recalculate health report
  const updateMealsAndReport = async (
    newMeals: ScheduledMeal[],
    toastMessage?: string,
    triggerAiSynthesis = false
  ) => {
    setMeals(newMeals);
    saveStoredMeals(selectedDateStr, newMeals);

    const dayInfo = weekInfo.days.find((d) => d.dateString === selectedDateStr);
    const dayName = dayInfo?.dayName || "Friday";

    // Immediate 0ms deterministic recalculation
    const deterministic = computeDeterministicReport(
      selectedDateStr,
      dayName,
      newMeals,
      DEFAULT_TARGET_KCAL,
      {
        sleepHours: currentLog.sleepHours,
        steps: currentLog.steps,
        mood: currentLog.mood,
      }
    );
    setReport(deterministic);
    saveStoredReport(selectedDateStr, deterministic);

    if (toastMessage) {
      notifyLog(toastMessage);
    }

    // Call Groq AI synthesis for mindful recommendations & clinical narrative
    if (triggerAiSynthesis) {
      setIsReportGenerating(true);
      try {
        const res = await fetch("/api/report/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dateString: selectedDateStr,
            dayName,
            targetKcal: DEFAULT_TARGET_KCAL,
            meals: newMeals.map((m) => ({
              slot: m.slot,
              scheduledTime: m.scheduledTime,
              recipeTitle: m.recipeTitle,
              kcal: m.kcal,
              protein: m.protein,
              status: m.status,
              minutesLate: m.minutesLate,
            })),
            sleepHours: currentLog.sleepHours,
            steps: currentLog.steps,
            mood: currentLog.mood,
          }),
        });

        if (res.ok) {
          const aiReport: HealthReportOutput = await res.json();
          setReport(aiReport);
          saveStoredReport(selectedDateStr, aiReport);
        }
      } catch (err) {
        console.warn("AI report generation background error:", err);
      } finally {
        setIsReportGenerating(false);
      }
    }
  };

  // Action: User ate planned meal
  const handleAtePlanned = (mealId: string) => {
    const now = new Date();
    const targetMeal = meals.find((m) => m.id === mealId);
    if (!targetMeal) return;

    const { status, minutesLate } = evaluateMealTiming(targetMeal, now);
    const updatedMeals = meals.map((m) =>
      m.id === mealId
        ? {
            ...m,
            status,
            minutesLate: minutesLate > 0 ? minutesLate : undefined,
            loggedAt: now.toISOString(),
          }
        : m
    );

    const msg =
      status === "eaten_on_time"
        ? `✓ ${targetMeal.slot} logged on schedule! Full adherence points awarded.`
        : `⏱ ${targetMeal.slot} logged ${minutesLate}m after window. Adherence updated.`;

    updateMealsAndReport(updatedMeals, msg, true);
  };

  // Action: User skips a meal
  const handleSkipMeal = (mealId: string) => {
    const targetMeal = meals.find((m) => m.id === mealId);
    const updatedMeals = meals.map((m) =>
      m.id === mealId
        ? { ...m, status: "skipped" as MealStatus, loggedAt: new Date().toISOString() }
        : m
    );
    updateMealsAndReport(
      updatedMeals,
      `⏭ ${targetMeal?.slot || "Meal"} marked as skipped. Calories & adherence updated.`,
      true
    );
  };

  // Action: Reset meal to planned
  const handleResetMeal = (mealId: string) => {
    const updatedMeals = meals.map((m) =>
      m.id === mealId
        ? {
            ...m,
            status: "planned" as MealStatus,
            loggedAt: undefined,
            minutesLate: undefined,
            isAiAnalyzed: false,
          }
        : m
    );
    updateMealsAndReport(updatedMeals, "Meal status reset to planned.", false);
  };

  // Action: Open Manual Entry Modal
  const handleOpenManualEntry = (meal: ScheduledMeal) => {
    setActiveSlotForModal(meal);
    setManualModalOpen(true);
  };

  // Action: Save custom entered meal recognized by AI
  const handleSaveCustomMeal = (analyzed: {
    recipeTitle: string;
    kcal: number;
    protein: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
    origin: string;
    healthImpact?: string;
  }) => {
    if (!activeSlotForModal) return;
    const now = new Date();

    const updatedMeals = meals.map((m) =>
      m.id === activeSlotForModal.id
        ? {
            ...m,
            recipeTitle: analyzed.recipeTitle,
            kcal: analyzed.kcal,
            protein: analyzed.protein,
            carbs: analyzed.carbs,
            fat: analyzed.fat,
            fiber: analyzed.fiber,
            origin: analyzed.origin || "Custom Entry",
            healthImpact: analyzed.healthImpact,
            status: "substituted" as MealStatus,
            loggedAt: now.toISOString(),
            isAiAnalyzed: true,
          }
        : m
    );

    updateMealsAndReport(
      updatedMeals,
      `✨ AI recognized "${analyzed.recipeTitle}" (${analyzed.kcal} kcal)! Health report updated.`,
      true
    );
  };

  // Action: Apply dish recommended based on weather & location
  const handleApplyWeatherDish = (dish: WeatherDishRecommendation) => {
    let target = meals.find((m) => m.slot.toLowerCase() === dish.mealSlot.toLowerCase());
    if (!target) target = meals[0];
    if (!target) return;

    const now = new Date();
    const updatedMeals = meals.map((m) =>
      m.id === target.id
        ? {
            ...m,
            recipeTitle: dish.recipeTitle,
            kcal: dish.kcal,
            protein: dish.protein,
            carbs: dish.carbs,
            fat: dish.fat,
            fiber: dish.fiber,
            origin: dish.origin,
            healthImpact: dish.weatherRationale,
            status: "substituted" as MealStatus,
            loggedAt: now.toISOString(),
            isAiAnalyzed: true,
          }
        : m
    );

    updateMealsAndReport(
      updatedMeals,
      `🌦️ Swapped ${target.slot} to "${dish.recipeTitle}" (${dish.kcal} kcal) for local weather!`,
      true
    );
  };

  // Action: Manually refresh report using AI
  const handleRefreshAiReport = async () => {
    if (isReportGenerating) return;
    setIsReportGenerating(true);

    try {
      const dayInfo = weekInfo.days.find((d) => d.dateString === selectedDateStr);
      const dayName = dayInfo?.dayName || "Friday";

      const res = await fetch("/api/report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateString: selectedDateStr,
          dayName,
          targetKcal: DEFAULT_TARGET_KCAL,
          meals: meals.map((m) => ({
            slot: m.slot,
            scheduledTime: m.scheduledTime,
            recipeTitle: m.recipeTitle,
            kcal: m.kcal,
            protein: m.protein,
            status: m.status,
            minutesLate: m.minutesLate,
          })),
          sleepHours: currentLog.sleepHours,
          steps: currentLog.steps,
          mood: currentLog.mood,
        }),
      });

      if (res.ok) {
        const aiReport: HealthReportOutput = await res.json();
        setReport(aiReport);
        saveStoredReport(selectedDateStr, aiReport);
        notifyLog("✨ Daily Health Report refreshed with Groq AI synthesis!");
      }
    } catch (err) {
      console.warn("Manual report refresh error:", err);
      notifyLog("Network issue. Preserved deterministic health report.");
    } finally {
      setIsReportGenerating(false);
    }
  };

  const selectedDayInfo = weekInfo.days.find((d) => d.dateString === selectedDateStr);
  const isSelectedToday = selectedDayInfo?.isToday ?? false;

  const currentAdherenceScore = report?.adherenceScore ?? 85;
  const { score: vitalityScore, mealPts, sleepPts, activityPts, hydrationPts } =
    calculateHealthScore(currentLog, currentAdherenceScore);

  // Compute dynamic weekly aggregates
  const loggedDays = weekInfo.days.filter((d) => {
    const l = weekLogs[d.dateString];
    return l && (l.waterMl > 0 || l.steps > 0 || l.sleepHours > 0);
  });

  const totalLoggedWater = loggedDays.reduce(
    (acc, d) => acc + (weekLogs[d.dateString]?.waterMl || 0),
    0
  );
  const avgWater = loggedDays.length > 0 ? Math.round(totalLoggedWater / loggedDays.length) : 0;

  const totalLoggedSleep = loggedDays.reduce(
    (acc, d) => acc + (weekLogs[d.dateString]?.sleepHours || 0),
    0
  );
  const avgSleep =
    loggedDays.length > 0 ? (totalLoggedSleep / loggedDays.length).toFixed(1) : "0";

  const totalLoggedSteps = loggedDays.reduce(
    (acc, d) => acc + (weekLogs[d.dateString]?.steps || 0),
    0
  );

  return (
    <div className="max-w-[1760px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-14 py-10 space-y-10">
      {/* Toast Notification */}
      {logNotification && (
        <div className="fixed top-24 right-5 z-50 bg-[var(--surface)] border border-[var(--primary)] text-[var(--text)] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <span>{logNotification}</span>
        </div>
      )}

      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <span className="text-xs font-serif italic text-[var(--accent)] tracking-wide">
            Daily Health & Rhythms
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[var(--text)] tracking-tight">
            Daily Meals & Vitality
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] font-light leading-relaxed">
            Record what you eat throughout the day, customize dishes with AI recognition, and review your daily nourishment and recovery.
          </p>
        </div>

        {/* Real-time sync badge & Streak Counter */}
        <div className="flex items-center gap-3">
          {mounted && status && (
            <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm text-right hidden sm:block">
              <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                <span>{status.greeting}!</span>
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)]">
                {status.timeString} • {status.formattedShortDate}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 fill-[var(--accent)]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text)]">
                {loggedDays.length}-Day Mindful Streak
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">Current week continuity</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Real-World Week Progress Ribbon */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] px-1">
          <span className="flex items-center gap-1.5 text-[var(--primary)] uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>{weekInfo.weekLabel}</span>
          </span>
          <span>Click any day to view or record that day&apos;s scheduled meals & vitals</span>
        </div>

        <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-1">
          {weekInfo.days.map((day) => {
            const isSelected = day.dateString === selectedDateStr;
            const dayLog = weekLogs[day.dateString];
            const hasData = dayLog && (dayLog.waterMl > 0 || dayLog.steps > 0 || dayLog.sleepHours > 0);
            const dayScore = dayLog ? calculateHealthScore(dayLog, 85).score : 0;

            return (
              <button
                key={day.dateString}
                onClick={() => {
                  setSelectedDateStr(day.dateString);
                  if (dayLog) setCurrentLog(dayLog);
                }}
                className={`p-3 rounded-2xl text-center border transition-all flex flex-col items-center justify-between min-w-[75px] sm:min-w-0 ${
                  isSelected
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md scale-[1.03]"
                    : day.isToday
                    ? "bg-[var(--primary-light)]/40 border-[var(--primary)] text-[var(--text)]"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  {day.dayShort}
                </div>

                <div className="font-serif font-bold text-lg my-0.5">
                  {day.dayOfMonth}
                </div>

                {/* Score badge / status */}
                {day.isToday ? (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                      isSelected
                        ? "bg-white text-[var(--primary)]"
                        : "bg-[var(--accent)] text-white"
                    }`}
                  >
                    Today
                  </span>
                ) : hasData ? (
                  <span
                    className={`text-[10px] font-mono font-semibold ${
                      isSelected ? "text-white/90" : "text-[var(--primary)]"
                    }`}
                  >
                    {dayScore} pts
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--text-muted)] opacity-60">
                    --
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Banner */}
      <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--primary)]" />
          <span className="font-medium text-[var(--text)]">
            Viewing schedule & report for:{" "}
            <strong>
              {selectedDayInfo?.dayName}, {selectedDayInfo?.monthShort}{" "}
              {selectedDayInfo?.dayOfMonth}
            </strong>
          </span>
          {isSelectedToday && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold">
              Today
            </span>
          )}
        </div>
        {!isSelectedToday && (
          <button
            onClick={() => {
              const today = weekInfo.days.find((d) => d.isToday);
              if (today) {
                setSelectedDateStr(today.dateString);
                if (weekLogs[today.dateString]) setCurrentLog(weekLogs[today.dateString]);
              }
            }}
            className="text-[var(--primary)] hover:underline font-semibold"
          >
            Jump to Today
          </button>
        )}
      </div>

      {/* SECTION 1: Scheduled Meals Timeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div className="space-y-1">
            <span className="text-xs font-serif italic text-[var(--accent)]">
              Daily Nourishment Schedule
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--text)]">
              Today&apos;s Meals
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Log breakfast, lunch, snack, and dinner as you enjoy them throughout the day.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/planner"
              className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--primary)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Create Dietary Plan</span>
            </Link>

            <Link
              href="/planner"
              className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              <span>Weekly Meal Planner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Weather & Place Circadian Recommendations */}
        <WeatherCuisineBanner onSelectDishForPlanner={handleApplyWeatherDish} />

        {/* 4 Scheduled Meal Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {meals.map((meal) => {
            const isEatenOnTime = meal.status === "eaten_on_time";
            const isEatenLate = meal.status === "eaten_late";
            const isSubstituted = meal.status === "substituted";
            const isSkipped = meal.status === "skipped";
            const isPlanned = meal.status === "planned";
            const isLogged = isEatenOnTime || isEatenLate || isSubstituted || isSkipped;

            return (
              <div
                key={meal.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                  isSubstituted
                    ? "bg-[var(--surface-elevated)] border-[var(--accent)]/40 ring-1 ring-[var(--accent)]/30"
                    : isEatenOnTime
                    ? "bg-[var(--surface-elevated)] border-[var(--success)]/40"
                    : isEatenLate
                    ? "bg-[var(--surface-elevated)] border-[var(--warning)]/40"
                    : isSkipped
                    ? "bg-[var(--surface)] border-[var(--border)] opacity-70"
                    : "bg-[var(--surface)] border-[var(--border)]"
                }`}
              >
                {/* Slot Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                        {meal.slot}
                      </span>
                      <div className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[var(--primary)]" />
                        <span>{meal.scheduledTime}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {isEatenOnTime && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        On Time
                      </span>
                    )}
                    {isEatenLate && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Late (+{meal.minutesLate}m)
                      </span>
                    )}
                    {isSubstituted && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                        Custom Meal
                      </span>
                    )}
                    {isSkipped && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border)]">
                        Skipped
                      </span>
                    )}
                    {isPlanned && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-muted)]">
                        Planned
                      </span>
                    )}
                  </div>

                  {/* Window label */}
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Window: <strong className="text-[var(--text)]">{meal.windowLabel}</strong>
                  </div>
                </div>

                {/* Dish Information */}
                <div className="space-y-2 flex-1">
                  <div className="font-serif text-base font-normal text-[var(--text)] line-clamp-2 leading-snug">
                    {meal.recipeTitle}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="px-2 py-0.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-medium text-[var(--primary)]">
                      {meal.kcal} kcal
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-medium text-[var(--accent)]">
                      {meal.protein} protein
                    </span>
                    {meal.carbs && (
                      <span className="px-1.5 py-0.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--text-muted)]">
                        {meal.carbs} carbs
                      </span>
                    )}
                  </div>

                  {/* Origin tag */}
                  {meal.origin && (
                    <span className="text-[11px] text-[var(--text-muted)] font-serif italic block">
                      {meal.origin}
                    </span>
                  )}

                  {/* AI Metabolic Health Insight Note */}
                  {meal.healthImpact && (
                    <div className="p-2.5 rounded-xl bg-[var(--primary-light)]/50 border border-[var(--primary-border)] text-xs text-[var(--text)] leading-relaxed">
                      🌿 <strong>Grace:</strong> {meal.healthImpact}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                  {!isLogged ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleAtePlanned(meal.id)}
                          className="w-full py-2 px-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Ate This</span>
                        </button>

                        <button
                          onClick={() => handleSkipMeal(meal.id)}
                          className="w-full py-2 px-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text)] text-xs font-medium flex items-center justify-center gap-1 transition-all"
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                          <span>Skip</span>
                        </button>
                      </div>

                      {/* Manual Entry AI Button */}
                      <button
                        onClick={() => handleOpenManualEntry(meal)}
                        className="w-full py-2 px-3 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--accent)] text-[var(--text)] hover:text-white border border-[var(--border)] text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>I Ate Something Else</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenManualEntry(meal)}
                        className="flex-1 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-medium text-[var(--text)] flex items-center justify-center gap-1 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Edit Meal</span>
                      </button>
                      <button
                        onClick={() => handleResetMeal(meal.id)}
                        title="Reset to planned"
                        className="p-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="text-[11px] text-[var(--text-muted)] text-center">
                    {isLogged ? "Logged for today" : "Ready to log"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Daily Health & Nourishment Summary */}
      {report && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          {/* Report Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--border)]">
            <div className="space-y-1">
              <span className="text-xs font-serif italic text-[var(--accent)]">
                Daily Reflection & Progress
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--text)]">
                Today&apos;s Nourishment Summary
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-light">
                A calm summary of your calories, schedule consistency, and gentle reminders for tomorrow.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshAiReport}
                disabled={isReportGenerating}
                className="px-5 py-2.5 rounded-2xl bg-[var(--surface-elevated)] hover:bg-[var(--primary)] text-[var(--text)] hover:text-white border border-[var(--border)] text-xs font-medium flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isReportGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating summary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                    <span>Refresh Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4 Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Adherence Score */}
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Adherence Score
                </span>
                <Award className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-[var(--primary)]">
                  {report.adherenceScore}
                </span>
                <span className="text-xs text-[var(--text-muted)]">/ 100</span>
              </div>
              <div className="w-full bg-[var(--surface)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--primary)] h-full transition-all duration-300"
                  style={{ width: `${report.adherenceScore}%` }}
                />
              </div>
            </div>

            {/* Total Kcal Consumed */}
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Calories Consumed
                </span>
                <Flame className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-[var(--text)]">
                  {report.totalKcalConsumed}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  / {report.targetKcal} kcal
                </span>
              </div>
              <div className="text-[11px] font-semibold text-[var(--accent)]">
                Delta: {report.kcalDelta >= 0 ? `+${report.kcalDelta}` : report.kcalDelta} kcal
              </div>
            </div>

            {/* Protein Intake */}
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Protein Delivery
                </span>
                <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-[var(--success)]">
                  {report.totalProteinGrams}g
                </span>
                <span className="text-xs text-[var(--text-muted)]">/ 75g target</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                Essential cellular repair
              </div>
            </div>

            {/* Data Completeness */}
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Completeness
                </span>
                <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-[var(--text)]">
                  {Math.round(report.completeness * 100)}%
                </span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] truncate">
                {report.completenessLabel}
              </div>
            </div>
          </div>

          {/* Two-Column Deep-Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Left: AI Narrative & Gentle Suggestions */}
            <div className="lg:col-span-7 space-y-4">
              {/* Grace's Mindful Synthesis */}
              <div className="p-6 rounded-2xl bg-[var(--primary-light)]/40 border border-[var(--primary-border)] space-y-2">
                <span className="text-xs font-serif italic text-[var(--accent)] block">
                  Notes from Grace
                </span>
                <p className="text-sm text-[var(--text)] leading-relaxed italic font-light">
                  &ldquo;{report.summaryText}&rdquo;
                </p>
              </div>

              {/* Gentle Actionable Suggestions */}
              <div className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
                <h4 className="font-serif text-lg font-normal text-[var(--text)] flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-[var(--primary)]" />
                  <span>Gentle Suggestions for Tomorrow</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-[var(--text)]">
                  {report.gentleSuggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--primary)] font-bold shrink-0">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: What Changed Today & Key Findings */}
            <div className="lg:col-span-5 space-y-4">
              {/* What Changed Today */}
              <div className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-lg font-normal text-[var(--text)] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                    <span>What Changed Today</span>
                  </h4>
                  <span className="text-xs text-[var(--text-muted)] font-serif italic">Timeline</span>
                </div>

                <div className="space-y-2">
                  {report.whatChangedAndWhy.map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text)] flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-1.5" />
                      <p className="leading-relaxed">{ch}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Nutritional Findings */}
              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  Key Observations
                </span>
                <ul className="space-y-1.5 text-xs text-[var(--text-muted)]">
                  {report.keyFindings.map((kf, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 mt-0.5" />
                      <span>{kf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Holistic Vitals & Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transparent Health Score Card (0-100) */}
        <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                Holistic Vitality
              </span>
              <h3 className="font-serif text-xl font-semibold text-[var(--text)]">
                Daily Vitality Index
              </h3>
            </div>
            <span className="font-serif text-3xl font-bold text-[var(--primary)]">
              {vitalityScore}/100
            </span>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Transparent composite: Meal Schedule ({mealPts}/30), Sleep ({sleepPts}/25), Movement ({activityPts}/25), Hydration ({hydrationPts}/20).
          </p>

          <div className="space-y-2.5 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text)] font-medium">Meal Schedule Adherence</span>
                <span className="text-[var(--text-muted)]">{currentAdherenceScore}% ({mealPts}/30)</span>
              </div>
              <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--accent)] h-full transition-all duration-300"
                  style={{ width: `${currentAdherenceScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text)] font-medium">Rest & Recovery</span>
                <span className="text-[var(--text-muted)]">{currentLog.sleepHours} hrs ({sleepPts}/25)</span>
              </div>
              <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--primary)] h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (currentLog.sleepHours / 8) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text)] font-medium">Daily Movement</span>
                <span className="text-[var(--text-muted)]">{currentLog.steps.toLocaleString()} steps ({activityPts}/25)</span>
              </div>
              <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--warning)] h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (currentLog.steps / 10000) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Rule-based Insights & Grace Tip */}
        <div className="lg:col-span-7 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-serif text-lg font-semibold text-[var(--text)]">
                  Dynamic Weekly Rhythm Insights
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {loggedDays.length}/7 Days Active This Week
              </span>
            </div>

            <div className="space-y-2 text-xs text-[var(--text)]">
              <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-start gap-2.5">
                <TrendingUp className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <p>
                  <strong>Hydration Baseline:</strong> You have averaged{" "}
                  <strong>{avgWater.toLocaleString()} ml/day</strong> across this week&apos;s logged days.
                  {avgWater >= 2200
                    ? " Excellent sustained fluid intake protects kidney function and prevents brain fog."
                    : " Consider keeping a 750ml glass water bottle on your desk."}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-start gap-2.5">
                <Award className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <p>
                  <strong>Sleep Rhythm:</strong> Weekly sleep average is <strong>{avgSleep} hours/night</strong>.
                  {Number(avgSleep) >= 7.5
                    ? " Your recovery window is in the optimal hormonal restoration bracket."
                    : " Aim for consistent bedtime within a 30-minute window for deeper REM cycles."}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-start gap-2.5">
                <Footprints className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
                <p>
                  <strong>Weekly Movement Accumulation:</strong> You have logged{" "}
                  <strong>{totalLoggedSteps.toLocaleString()} total steps</strong> this week.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--primary-light)] border border-[var(--primary-border)] text-xs text-[var(--text)]">
            🌿 <strong>Grace Tip:</strong> Today is {selectedDayInfo?.dayName}. Take 5 deep diaphragmatic breaths before meals to activate the parasympathetic nervous system for smoother digestion.
          </div>
        </div>
      </div>

      {/* SECTION 4: Quick-Log Interactive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sleep Log */}
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--accent)] font-mono">{currentLog.sleepHours} hrs</span>
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
            value={currentLog.sleepHours}
            onChange={(e) =>
              updateLog(
                (p) => ({ ...p, sleepHours: Number(e.target.value) }),
                `Updated sleep to ${e.target.value} hours`
              )
            }
            className="w-full accent-[var(--accent)]"
          />
        </div>

        {/* Steps Log */}
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[var(--warning)]/15 text-[var(--warning)] flex items-center justify-center">
              <Footprints className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--warning)] font-mono">
              {currentLog.steps.toLocaleString()}
            </span>
          </div>
          <div>
            <h4 className="font-serif text-lg font-semibold text-[var(--text)]">Steps & Movement</h4>
            <p className="text-xs text-[var(--text-muted)]">Goal: 10,000 steps</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateLog((p) => ({ ...p, steps: p.steps + 1000 }), "Logged +1,000 steps")
              }
              className="flex-1 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--border)]"
            >
              +1,000
            </button>
            <button
              onClick={() =>
                updateLog((p) => ({ ...p, steps: p.steps + 2500 }), "Logged +2,500 steps")
              }
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
            <span className="text-xs font-bold text-[var(--primary)]">{currentLog.mood}</span>
          </div>
          <div>
            <h4 className="font-serif text-lg font-semibold text-[var(--text)]">Mindful State</h4>
            <p className="text-xs text-[var(--text-muted)]">How does your body feel?</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Calm", "Energized", "Fatigued", "Stressed"].map((m) => (
              <button
                key={m}
                onClick={() =>
                  updateLog((p) => ({ ...p, mood: m }), `Mood recorded as ${m}`)
                }
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors ${
                  currentLog.mood === m
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text)]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Water Log */}
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-[var(--primary)]/20" />
            </div>
            <span className="text-xs font-bold text-[var(--primary)] font-mono">{currentLog.waterMl} ml</span>
          </div>
          <div>
            <h4 className="font-serif text-lg font-semibold text-[var(--text)]">Hydration</h4>
            <p className="text-xs text-[var(--text-muted)]">Target: 2,500 ml/day</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateLog((p) => ({ ...p, waterMl: p.waterMl + 250 }), "Logged +250ml water")
              }
              className="flex-1 py-2 rounded-xl bg-[var(--primary-light)] border border-[var(--primary-border)] text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
            >
              +250 ml
            </button>
            <button
              onClick={() =>
                updateLog((p) => ({ ...p, waterMl: p.waterMl + 500 }), "Logged +500ml water")
              }
              className="flex-1 py-2 rounded-xl bg-[var(--primary-light)] border border-[var(--primary-border)] text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
            >
              +500 ml
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: Clinical Metrics: Blood Pressure & Blood Sugar */}
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
              <span className="font-bold text-[var(--primary)] font-mono">
                {currentLog.systolic} / {currentLog.diastolic}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[var(--text-muted)] block">Systolic</label>
                <input
                  type="number"
                  value={currentLog.systolic}
                  onChange={(e) =>
                    updateLog((p) => ({ ...p, systolic: Number(e.target.value) }))
                  }
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 text-xs text-[var(--text)]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[var(--text-muted)] block">Diastolic</label>
                <input
                  type="number"
                  value={currentLog.diastolic}
                  onChange={(e) =>
                    updateLog((p) => ({ ...p, diastolic: Number(e.target.value) }))
                  }
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 text-xs text-[var(--text)]"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[var(--text)]">Fasting Blood Sugar (mg/dL)</span>
              <span className="font-bold text-[var(--primary)] font-mono">
                {currentLog.bloodSugar} mg/dL
              </span>
            </div>
            <div>
              <label className="text-[11px] text-[var(--text-muted)] block">Glucose reading</label>
              <input
                type="number"
                value={currentLog.bloodSugar}
                onChange={(e) =>
                  updateLog((p) => ({ ...p, bloodSugar: Number(e.target.value) }))
                }
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 text-xs text-[var(--text)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Manual Meal AI Analysis Modal */}
      {activeSlotForModal && (
        <ManualMealModal
          isOpen={manualModalOpen}
          onClose={() => {
            setManualModalOpen(false);
            setActiveSlotForModal(null);
          }}
          dayName={selectedDayInfo?.dayName || "Today"}
          slotName={activeSlotForModal.slot}
          initialMealTitle={activeSlotForModal.recipeTitle}
          onSaveMeal={handleSaveCustomMeal}
        />
      )}
    </div>
  );
}
