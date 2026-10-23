"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Sparkles,
  ShoppingBag,
  Lock,
  Unlock,
  RefreshCw,
  Clock,
  CheckCircle2,
  X,
  Share2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  RotateCcw,
  UtensilsCrossed,
  SlidersHorizontal,
} from "lucide-react";
import { getWeekDays, getRealTimeStatus, WeekInfo, DayInfo, DEFAULT_WEEK_INFO } from "@/lib/date-utils";
import { useRealTime } from "@/lib/use-real-time";
import { ManualMealModal } from "@/components/manual-meal-modal";
import { ManualDietPlanModal, ManualMealSlot } from "@/components/manual-diet-plan-modal";
import { GroceryListModal } from "@/components/grocery-list-modal";
import { WeatherCuisineBanner } from "@/components/weather-cuisine-banner";
import { WeatherDishRecommendation } from "@/lib/weather-service";
import { getStoredMeals, saveStoredMeals, computeDeterministicReport, saveStoredReport } from "@/lib/meal-schedule";

interface MealSlot {
  name: string;
  time: string;
  recipeTitle: string;
  kcal: number;
  protein: string;
  origin: string;
  locked: boolean;
  completed?: boolean;
}

const INITIAL_DAYS: Record<string, MealSlot[]> = {
  Monday: [
    { name: "Breakfast", time: "8:00 AM", recipeTitle: "South Indian Moong Dal Idli & Coconut Chutney", kcal: 320, protein: "12g", origin: "Tamil Nadu", locked: false, completed: false },
    { name: "Lunch", time: "1:00 PM", recipeTitle: "Kerala Spiced Brown Rice & Sambar Bowl", kcal: 480, protein: "18g", origin: "Kerala", locked: false, completed: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Roasted Makhana (Fox Nuts) with Mint Chai", kcal: 150, protein: "4g", origin: "North India", locked: false, completed: false },
    { name: "Dinner", time: "8:00 PM", recipeTitle: "Mediterranean Roasted Vegetable & Lentil Salad", kcal: 410, protein: "20g", origin: "Greece", locked: false, completed: false },
  ],
  Tuesday: [
    { name: "Breakfast", time: "8:00 AM", recipeTitle: "Steel-Cut Oats with Chia, Figs & Almonds", kcal: 350, protein: "11g", origin: "Global Hearth", locked: false, completed: false },
    { name: "Lunch", time: "1:00 PM", recipeTitle: "Palak Paneer with Multigrain Phulka", kcal: 510, protein: "24g", origin: "Punjab", locked: false, completed: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Cucumber & Carrot Sticks with Spiced Curd Dip", kcal: 120, protein: "6g", origin: "Global", locked: false, completed: false },
    { name: "Dinner", time: "8:00 PM", recipeTitle: "Kyoto Miso Tofu & Vegetable Clear Broth", kcal: 360, protein: "22g", origin: "Japan", locked: false, completed: false },
  ],
  Wednesday: [
    { name: "Breakfast", time: "8:00 AM", recipeTitle: "Rava Upma with Mixed Vegetables & Ginger", kcal: 310, protein: "9g", origin: "Karnataka", locked: false, completed: false },
    { name: "Lunch", time: "1:00 PM", recipeTitle: "Chettinad Mushroom Biryani & Beetroot Raita", kcal: 490, protein: "15g", origin: "Tamil Nadu", locked: false, completed: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Sprouted Moong Chaat with Pomegranate & Lime", kcal: 160, protein: "8g", origin: "Maharashtra", locked: false, completed: false },
    { name: "Dinner", time: "8:00 PM", recipeTitle: "Baked Herbed Fish with Steamed Broccoli", kcal: 430, protein: "32g", origin: "Mediterranean", locked: false, completed: false },
  ],
  Thursday: [
    { name: "Breakfast", time: "8:00 AM", recipeTitle: "Besan Chilla with Grated Paneer Stuffing", kcal: 340, protein: "16g", origin: "Rajasthan", locked: false, completed: false },
    { name: "Lunch", time: "1:00 PM", recipeTitle: "Rajma (Red Kidney Beans) with Jeera Brown Rice", kcal: 520, protein: "22g", origin: "Punjab", locked: false, completed: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Handful of Walnuts & Roasted Pumpkin Seeds", kcal: 180, protein: "5g", origin: "Global", locked: false, completed: false },
    { name: "Dinner", time: "8:00 PM", recipeTitle: "Stir-Fried Tofu with Bok Choy & Edamame", kcal: 390, protein: "25g", origin: "East Asian", locked: false, completed: false },
  ],
  Friday: [
    { name: "Breakfast", time: "8:00 AM", recipeTitle: "Avocado & Poached Egg Whole-Wheat Toast", kcal: 360, protein: "17g", origin: "California", locked: false, completed: false },
    { name: "Lunch", time: "1:00 PM", recipeTitle: "Dal Tadka, Steamed Quinoa & Methi Subzi", kcal: 470, protein: "19g", origin: "Gujarat", locked: false, completed: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Chana Jor Garam with Chopped Tomatoes & Coriander", kcal: 140, protein: "7g", origin: "India", locked: false, completed: false },
    { name: "Dinner", time: "8:00 PM", recipeTitle: "Rustic Minestrone Soup with White Beans", kcal: 380, protein: "18g", origin: "Italy", locked: false, completed: false },
  ],
  Saturday: [
    { name: "Breakfast", time: "8:30 AM", recipeTitle: "Red Rice Poha with Peanuts & Fresh Coconut", kcal: 330, protein: "10g", origin: "Maharashtra", locked: false, completed: false },
    { name: "Lunch", time: "1:30 PM", recipeTitle: "Mexican Chipotle Black Bean & Corn Bowl", kcal: 500, protein: "21g", origin: "Mexico", locked: false, completed: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Spiced Buttermilk (Chaas) with Mint & Ginger", kcal: 80, protein: "4g", origin: "India", locked: false, completed: false },
    { name: "Dinner", time: "8:30 PM", recipeTitle: "Grilled Paneer Tikka with Grilled Bell Peppers", kcal: 440, protein: "26g", origin: "North India", locked: false, completed: false },
  ],
  Sunday: [
    { name: "Breakfast", time: "9:00 AM", recipeTitle: "Multigrain Dosa with Tomato-Garlic Chutney", kcal: 340, protein: "11g", origin: "South India", locked: false, completed: false },
    { name: "Lunch", time: "1:30 PM", recipeTitle: "Hyderabadi Spiced Vegetable Tahari with Salan", kcal: 530, protein: "18g", origin: "Telangana", locked: false, completed: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Turmeric Ashwagandha Golden Milk", kcal: 130, protein: "5g", origin: "Ayurvedic", locked: false, completed: false },
    { name: "Dinner", time: "8:00 PM", recipeTitle: "Light Zucchini Noodle Pad Thai with Crushed Peanuts", kcal: 360, protein: "16g", origin: "Thailand", locked: false, completed: false },
  ],
};

export default function PlannerPage() {
  const { status, mounted } = useRealTime(1000);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekInfo, setWeekInfo] = useState<WeekInfo>(DEFAULT_WEEK_INFO);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [planData, setPlanData] = useState<Record<string, MealSlot[]>>(INITIAL_DAYS);
  const [groceryModalOpen, setGroceryModalOpen] = useState(false);

  // Manual Meal Entry Modal state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [modalSlotIdx, setModalSlotIdx] = useState<number>(0);
  const [modalDay, setModalDay] = useState<string>("Monday");
  const [dietPlanModalOpen, setDietPlanModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [toastMsg, setToastMsg] = useState<{ text: string; link?: string } | null>(null);

  // Update weekInfo when weekOffset changes or mounted
  useEffect(() => {
    const info = getWeekDays(new Date(), weekOffset);
    setWeekInfo(info);

    // Auto-select Today when viewing the current week
    if (weekOffset === 0) {
      const todayDay = info.days.find((d) => d.isToday)?.dayName;
      if (todayDay) {
        setSelectedDay(todayDay);
      }
    } else {
      // Default to Monday when navigating to other weeks
      setSelectedDay("Monday");
    }
  }, [weekOffset]);

  // Load plan from localStorage per week
  useEffect(() => {
    if (!mounted || !weekInfo.weekKey) return;
    try {
      const savedKey = `graceai_planner_${weekInfo.weekKey}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        setPlanData(JSON.parse(saved));
      } else {
        setPlanData(INITIAL_DAYS);
      }
    } catch {
      // fallback to INITIAL_DAYS
    }
  }, [weekInfo.weekKey, mounted]);

  // Persist plan data changes
  const savePlan = (newData: Record<string, MealSlot[]>) => {
    setPlanData(newData);
    if (typeof window !== "undefined" && weekInfo.weekKey) {
      try {
        localStorage.setItem(`graceai_planner_${weekInfo.weekKey}`, JSON.stringify(newData));
      } catch {
        // storage quota or private mode
      }
    }
  };

  const toggleLock = (day: string, slotIdx: number) => {
    const copy = { ...planData };
    copy[day] = copy[day].map((item, idx) =>
      idx === slotIdx ? { ...item, locked: !item.locked } : item
    );
    savePlan(copy);
  };

  const toggleCompleted = (day: string, slotIdx: number) => {
    const copy = { ...planData };
    copy[day] = copy[day].map((item, idx) =>
      idx === slotIdx ? { ...item, completed: !item.completed } : item
    );
    savePlan(copy);
  };

  const handleSwap = (day: string, slotIdx: number) => {
    const alternates = [
      { recipeTitle: "Spiced Pumpkin & Chickpea Tagine", kcal: 430, protein: "17g", origin: "Moroccan" },
      { recipeTitle: "Gujarati Methi Thepla & Fresh Curd", kcal: 360, protein: "12g", origin: "Gujarat" },
      { recipeTitle: "Mediterranean Grilled Lemon Chicken Bowl", kcal: 490, protein: "38g", origin: "Greek" },
      { recipeTitle: "South Indian Spiced Sambar Rice with Pappad", kcal: 450, protein: "15g", origin: "Tamil Nadu" },
      { recipeTitle: "Paneer Bhurji with Multigrain Roti", kcal: 420, protein: "22g", origin: "Punjab" },
      { recipeTitle: "Japanese Teriyaki Tofu Stir-Fry", kcal: 370, protein: "20g", origin: "Japan" },
    ];
    const picked = alternates[Math.floor(Math.random() * alternates.length)];

    const copy = { ...planData };
    copy[day] = copy[day].map((item, idx) =>
      idx === slotIdx ? { ...item, ...picked, completed: false } : item
    );
    savePlan(copy);
  };

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
    const copy = { ...planData };
    if (!copy[modalDay]) return;
    copy[modalDay] = copy[modalDay].map((item, idx) =>
      idx === modalSlotIdx
        ? {
            ...item,
            recipeTitle: analyzed.recipeTitle,
            kcal: analyzed.kcal,
            protein: analyzed.protein,
            origin: analyzed.origin || "Custom Entry",
            completed: true,
          }
        : item
    );
    savePlan(copy);

    // Sync directly to the Health Tracker and auto-recalculate Health Report
    const targetDayInfo = weekInfo.days.find((d) => d.dayName === modalDay);
    if (targetDayInfo) {
      try {
        const storedMeals = getStoredMeals(targetDayInfo.dateString, modalDay, targetDayInfo.isPast);
        if (storedMeals[modalSlotIdx]) {
          storedMeals[modalSlotIdx] = {
            ...storedMeals[modalSlotIdx],
            recipeTitle: analyzed.recipeTitle,
            kcal: analyzed.kcal,
            protein: analyzed.protein,
            carbs: analyzed.carbs,
            fat: analyzed.fat,
            fiber: analyzed.fiber,
            origin: analyzed.origin || "Custom Entry",
            healthImpact: analyzed.healthImpact,
            status: "substituted",
            loggedAt: new Date().toISOString(),
            isAiAnalyzed: true,
          };
          saveStoredMeals(targetDayInfo.dateString, storedMeals);
          const updatedReport = computeDeterministicReport(targetDayInfo.dateString, modalDay, storedMeals);
          saveStoredReport(targetDayInfo.dateString, updatedReport);
        }
      } catch (err) {
        console.warn("Failed to sync tracker meals from planner:", err);
      }
    }

    setToastMsg({
      text: `✨ AI recognized "${analyzed.recipeTitle}" (${analyzed.kcal} kcal)! Daily Health Report updated.`,
      link: "/tracker",
    });
    setTimeout(() => setToastMsg(null), 5500);
  };

  const handleApplyWeatherDish = (dish: WeatherDishRecommendation) => {
    const targetDayName = (weekOffset === 0 ? weekInfo.days.find((d) => d.isToday)?.dayName : null) || selectedDay;
    const copy = { ...planData };
    if (!copy[targetDayName]) return;

    let targetIdx = copy[targetDayName].findIndex(
      (m) => m.name.toLowerCase() === dish.mealSlot.toLowerCase()
    );
    if (targetIdx === -1) targetIdx = 0;

    copy[targetDayName] = copy[targetDayName].map((item, idx) =>
      idx === targetIdx
        ? {
            ...item,
            recipeTitle: dish.recipeTitle,
            kcal: dish.kcal,
            protein: dish.protein,
            origin: dish.origin,
            completed: false,
          }
        : item
    );
    savePlan(copy);

    setToastMsg({
      text: `🌦️ Applied "${dish.recipeTitle}" (${dish.kcal} kcal) to ${targetDayName}'s ${dish.mealSlot} based on local weather!`,
      link: "/tracker",
    });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const resetWeekPlan = () => {
    if (confirm("Reset this week's meal plan to default balanced menu?")) {
      savePlan(INITIAL_DAYS);
    }
  };

  const handleApplyManualDietPlan = (
    targetDays: string[],
    customMeals: ManualMealSlot[],
    dietTitle?: string
  ) => {
    const copy = { ...planData };
    targetDays.forEach((dayName) => {
      copy[dayName] = customMeals.map((m) => ({
        name: m.name,
        time: m.time,
        recipeTitle: m.recipeTitle || `${m.name} Dish`,
        kcal: m.kcal || 350,
        protein: m.protein || "15g",
        origin: m.origin || "Custom",
        locked: false,
        completed: false,
      }));
    });

    savePlan(copy);

    // Sync tracker meals for any target days matching the currently viewed week
    targetDays.forEach((dayName) => {
      const targetDayInfo = weekInfo.days.find((d) => d.dayName === dayName);
      if (targetDayInfo) {
        try {
          const storedMeals = getStoredMeals(targetDayInfo.dateString, dayName, targetDayInfo.isPast);
          customMeals.forEach((cm, idx) => {
            if (storedMeals[idx]) {
              storedMeals[idx] = {
                ...storedMeals[idx],
                recipeTitle: cm.recipeTitle || `${cm.name} Dish`,
                kcal: cm.kcal || 350,
                protein: cm.protein || "15g",
                carbs: cm.carbs,
                fat: cm.fat,
                origin: cm.origin || "Custom",
                status: "planned",
                isAiAnalyzed: true,
              };
            }
          });
          saveStoredMeals(targetDayInfo.dateString, storedMeals);
          const updatedReport = computeDeterministicReport(targetDayInfo.dateString, dayName, storedMeals);
          saveStoredReport(targetDayInfo.dateString, updatedReport);
        } catch (err) {
          console.warn("Tracker sync notice from manual diet plan:", err);
        }
      }
    });

    const scopeDesc = targetDays.length === 1 ? targetDays[0] : `${targetDays.length} days`;
    setToastMsg({
      text: `🥗 Applied custom "${dietTitle || "Personalized"}" diet plan to ${scopeDesc}! Tracker synchronized.`,
      link: "/tracker",
    });
    setTimeout(() => setToastMsg(null), 5500);
  };

  const handleCopyWeekPlan = () => {
    let text = `🗓️ graceAI Complete Weekly Meal Plan (${weekInfo.weekLabel})\n\n`;
    weekInfo.days.forEach((d) => {
      const meals = planData[d.dayName] || INITIAL_DAYS[d.dayName] || [];
      const totalKcal = meals.reduce((a, b) => a + b.kcal, 0);
      text += `📅 ${d.dayName} (${d.monthShort} ${d.dayOfMonth}) • Total: ${totalKcal} kcal\n`;
      meals.forEach((m) => {
        text += `  • ${m.name} (${m.time}): ${m.recipeTitle} — ${m.kcal} kcal, ${m.protein} protein [${m.origin}]\n`;
      });
      text += `\n`;
    });

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setToastMsg({ text: "📋 Complete 7-day meal plan copied to clipboard!" });
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handlePrintWeekPlan = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const activeMeals = planData[selectedDay] || INITIAL_DAYS[selectedDay] || [];
  const dayKcal = activeMeals.reduce((acc, m) => acc + m.kcal, 0);

  // Compute weekly completion statistics
  const totalMealsInWeek = Object.values(planData).reduce((acc, slots) => acc + slots.length, 0);
  const completedMealsInWeek = Object.values(planData).reduce(
    (acc, slots) => acc + slots.filter((m) => m.completed).length,
    0
  );
  const weeklyCompletionPct = totalMealsInWeek > 0
    ? Math.round((completedMealsInWeek / totalMealsInWeek) * 100)
    : 0;

  // Selected day info from calendar
  const selectedDayInfo = weekInfo.days.find((d) => d.dayName === selectedDay);
  const isSelectedDayToday = selectedDayInfo?.isToday ?? false;

  return (
    <div className="max-w-[1760px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-14 py-10 space-y-10">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 right-5 z-50 bg-[var(--surface)] border border-[var(--primary)] text-[var(--text)] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <span>{toastMsg.text}</span>
          {toastMsg.link && (
            <Link
              href={toastMsg.link}
              className="px-2.5 py-1 rounded-lg bg-[var(--primary)] text-white text-[11px] font-bold hover:opacity-90 transition-opacity ml-2"
            >
              View Report →
            </Link>
          )}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <span className="text-xs font-serif italic text-[var(--accent)] tracking-wide">
            Weekly Meal Planning & Nutrition
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[var(--text)] tracking-tight">
            Weekly Meal Planner
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] font-light leading-relaxed">
            Curated heritage recipes, easy custom meal recognition with AI, and a synchronized shopping list for your week.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher: Day View vs Week's Plan */}
          <div className="flex items-center gap-1 bg-[var(--surface-elevated)] p-1 rounded-2xl border border-[var(--border)]">
            <button
              id="day-view-mode-btn"
              onClick={() => setViewMode("day")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "day"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Day View</span>
            </button>
            <button
              id="week-view-mode-btn"
              onClick={() => setViewMode("week")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "week"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Week&apos;s Plan</span>
            </button>
          </div>

          {/* Optional functional button for manual creation of dietary meal plan */}
          <button
            id="manual-diet-plan-button"
            onClick={() => setDietPlanModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--primary)] text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-98"
            title="Manually create or customize a dietary meal plan"
          >
            <UtensilsCrossed className="w-4 h-4 text-[var(--primary)]" />
            <span>Create Dietary Plan</span>
          </button>

          <button
            onClick={() => setGroceryModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Grocery List</span>
          </button>

          <button
            onClick={handleCopyWeekPlan}
            className="p-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            title="Copy week's meal plan to clipboard"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrintWeekPlan}
            className="p-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            title="Print week's meal plan"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Navigator & Real-World Live Indicator */}
      <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--border)] text-[var(--text)] transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-center min-w-[200px]">
            <div className="text-xs font-bold text-[var(--text)]">
              {weekInfo.weekLabel}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Week {weekInfo.weekNumber} of {weekInfo.year}
            </div>
          </div>

          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--border)] text-[var(--text)] transition-colors"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-2 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors"
            >
              Back to Today
            </button>
          )}

          <button
            onClick={resetWeekPlan}
            className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors ml-auto sm:ml-0"
            title="Reset this week to default plan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Weekly Progress Bar */}
        <div className="flex-1 max-w-md space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-[var(--text)]">
              Weekly Meal Completion
            </span>
            <span className="text-[var(--text-muted)] font-mono text-[11px]">
              {completedMealsInWeek} / {totalMealsInWeek} meals ({weeklyCompletionPct}%)
            </span>
          </div>
          <div className="w-full bg-[var(--surface-elevated)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
            <div
              className="bg-[var(--primary)] h-full transition-all duration-500 rounded-full"
              style={{ width: `${weeklyCompletionPct}%` }}
            />
          </div>
        </div>

        {/* Real-time sync badge */}
        {mounted && status && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--primary-light)]/40 border border-[var(--primary-border)] text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
            </span>
            <span className="text-[var(--text)] font-medium">
              Today is <strong>{status.formattedShortDate}</strong>
            </span>
            <span className="text-[var(--text-muted)] font-mono tabular-nums">
              {status.timeString}
            </span>
          </div>
        )}
      </div>

      {/* Live Weather & Place Circadian Recommendations */}
      <WeatherCuisineBanner onSelectDishForPlanner={handleApplyWeatherDish} />

      {/* Real-World Day Selector Ribbon */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
        {weekInfo.days.map((day) => {
          const isSelected = selectedDay === day.dayName;
          const meals = planData[day.dayName] || [];
          const totalKcal = meals.reduce((a, b) => a + b.kcal, 0);
          const doneCount = meals.filter((m) => m.completed).length;

          return (
            <button
              key={day.dateString}
              onClick={() => setSelectedDay(day.dayName)}
              className={`p-4 rounded-3xl text-left min-w-[145px] border transition-all relative ${
                isSelected
                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg scale-[1.02]"
                  : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-elevated)] hover:border-[var(--primary)]/50"
              }`}
            >
              {/* Today Badge */}
              {day.isToday && (
                <span
                  className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                    isSelected
                      ? "bg-white text-[var(--primary)] shadow-xs"
                      : "bg-[var(--accent)] text-white shadow-xs"
                  }`}
                >
                  Today
                </span>
              )}

              <div className="text-[11px] uppercase tracking-wider font-semibold opacity-80">
                {day.dayShort} • {day.monthShort} {day.dayOfMonth}
              </div>

              <div className="font-serif font-bold text-lg mt-0.5">{day.dayName}</div>

              <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-current/15">
                <span className="font-mono text-[11px] opacity-90">{totalKcal} kcal</span>
                <span className="text-[10px] opacity-80">
                  {doneCount}/{meals.length} done
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Conditional Rendering: Full Week's Plan View OR Selected Day View */}
      {viewMode === "week" ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Week Overview Banner */}
          <div className="p-5 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>Complete 7-Day Matrix • {weekInfo.weekLabel}</span>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-[var(--text)] mt-1">
                Full Week&apos;s Dietary Meal Plan
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                All 28 breakfast, lunch, snack, and dinner nourishment windows synchronized with your circadian rhythm.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setDietPlanModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-[var(--primary-hover)] transition-all"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Customize Dietary Plan</span>
              </button>

              <button
                onClick={() => setGroceryModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-[var(--accent-hover)] transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Grocery List</span>
              </button>
            </div>
          </div>

          {/* 7 Columns for Monday to Sunday */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
            {weekInfo.days.map((day) => {
              const meals = planData[day.dayName] || INITIAL_DAYS[day.dayName] || [];
              const dayTotalKcal = meals.reduce((a, b) => a + b.kcal, 0);
              const doneCount = meals.filter((m) => m.completed).length;

              return (
                <div
                  key={day.dateString}
                  className={`p-4 rounded-3xl bg-[var(--surface)] border flex flex-col justify-between space-y-3 transition-all ${
                    day.isToday
                      ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 shadow-md"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  {/* Day Header */}
                  <div className="pb-2 border-b border-[var(--border)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
                        {day.dayShort} • {day.monthShort} {day.dayOfMonth}
                      </span>
                      {day.isToday && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-white text-[9px] font-bold uppercase tracking-wider">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="font-serif text-base font-bold text-[var(--text)] mt-0.5">
                      {day.dayName}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono mt-1">
                      <span>{dayTotalKcal} kcal</span>
                      <span>{doneCount}/4 eaten</span>
                    </div>
                  </div>

                  {/* 4 Scheduled Meals */}
                  <div className="space-y-2.5 flex-1">
                    {meals.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className={`p-2.5 rounded-2xl border text-xs transition-colors ${
                          m.completed
                            ? "bg-[var(--surface-elevated)]/40 border-[var(--primary)]/30 opacity-80"
                            : "bg-[var(--surface-elevated)] border-[var(--border)] hover:border-[var(--primary)]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                          <span className="text-[var(--primary)]">{m.name}</span>
                          <span className="font-mono text-[9px] opacity-80">{m.time}</span>
                        </div>
                        <div
                          className={`font-medium line-clamp-2 text-xs leading-snug ${
                            m.completed ? "line-through text-[var(--text-muted)]" : "text-[var(--text)]"
                          }`}
                        >
                          {m.recipeTitle}
                        </div>
                        <div className="mt-1.5 pt-1 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                          <span>{m.kcal} kcal</span>
                          <span>{m.protein} P</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setModalDay(day.dayName);
                                setModalSlotIdx(mIdx);
                                setManualModalOpen(true);
                              }}
                              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--primary)]"
                              title="Edit custom dish"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => toggleCompleted(day.dayName, mIdx)}
                              className={`p-1 rounded-md border text-[9px] transition-colors ${
                                m.completed
                                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                                  : "hover:text-[var(--primary)] border-[var(--border)]"
                              }`}
                              title={m.completed ? "Mark as uncompleted" : "Mark as eaten"}
                            >
                              <Check className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Button to switch to detailed Day View */}
                  <button
                    onClick={() => {
                      setSelectedDay(day.dayName);
                      setViewMode("day");
                    }}
                    className="w-full py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--primary)] text-center text-xs font-semibold text-[var(--text)] hover:text-[var(--primary)] transition-colors mt-2"
                  >
                    Manage {day.dayName} →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Single Day View */
        <div className="space-y-6 animate-in fade-in">
          {/* Selected Day Overview Bar */}
          <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-serif text-xl font-semibold text-[var(--text)]">
                {selectedDay}’s Menu
              </span>
              {selectedDayInfo && (
                <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
                  {selectedDayInfo.formattedDisplay}
                </span>
              )}
              {isSelectedDayToday && (
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent)] text-white text-[11px] font-bold">
                  Current Real-World Day
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-semibold">
                {dayKcal} kcal total
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDietPlanModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--primary)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 transition-colors shadow-2xs"
                title={`Customize or create manual dietary plan for ${selectedDay}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>Manual Day Plan</span>
              </button>
              <div className="text-xs text-[var(--text-muted)] hidden sm:flex items-center gap-2">
                <span>Check off meals as eaten to update your weekly completion</span>
              </div>
            </div>
          </div>

          {/* Meals Grid for Selected Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeMeals.map((slot, idx) => {
              // Check if this meal slot is currently active in the real world
              const isSlotActiveNow =
                isSelectedDayToday &&
                mounted &&
                status?.activeMealSlot.toLowerCase() === slot.name.toLowerCase();

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl bg-[var(--surface)] border flex flex-col justify-between space-y-4 transition-all relative ${
                    isSlotActiveNow
                      ? "border-[var(--accent)] shadow-md ring-2 ring-[var(--accent)]/30"
                      : slot.completed
                      ? "border-[var(--primary)]/40 bg-[var(--surface-elevated)]/60"
                      : "border-[var(--border)] hover:shadow-md"
                  }`}
                >
                  {/* Active Now Ribbon */}
                  {isSlotActiveNow && (
                    <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>Active Window (Now)</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                        {slot.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleLock(selectedDay, idx)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            slot.locked
                              ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                              : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                          }`}
                          title={slot.locked ? "Meal is locked" : "Lock meal"}
                        >
                          {slot.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => toggleCompleted(selectedDay, idx)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            slot.completed
                              ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                              : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]"
                          }`}
                          title={slot.completed ? "Mark as uncompleted" : "Mark as eaten"}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{slot.time}</span>
                      <span>•</span>
                      <span>{slot.origin}</span>
                    </div>

                    <h3
                      className={`font-serif text-base font-semibold leading-snug transition-colors ${
                        slot.completed ? "line-through text-[var(--text-muted)]" : "text-[var(--text)]"
                      }`}
                    >
                      {slot.recipeTitle}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text)]">{slot.kcal} kcal</span>
                      <span className="text-[var(--text-muted)]">•</span>
                      <span className="text-[var(--primary)] font-semibold">{slot.protein} P</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {slot.completed && (
                        <span className="text-[10px] text-[var(--primary)] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Eaten</span>
                        </span>
                      )}

                      {/* Manual Meal AI Entry Button */}
                      <button
                        onClick={() => {
                          setModalDay(selectedDay);
                          setModalSlotIdx(idx);
                          setManualModalOpen(true);
                        }}
                        disabled={slot.locked}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-2xs transition-all active:scale-95"
                        title="Enter custom meal & calculate calories with AI"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Enter Meal</span>
                      </button>

                      <button
                        onClick={() => handleSwap(selectedDay, idx)}
                        disabled={slot.locked}
                        className={`flex items-center p-1.5 rounded-xl border text-xs transition-colors ${
                          slot.locked
                            ? "opacity-40 cursor-not-allowed border-[var(--border)] text-[var(--text-muted)]"
                            : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)]"
                        }`}
                        title="Swap with alternate recipe"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grocery List Modal */}
      <GroceryListModal
        isOpen={groceryModalOpen}
        onClose={() => setGroceryModalOpen(false)}
        weekLabel={weekInfo.weekLabel}
      />

      {/* Manual Meal AI Analysis Modal */}
      <ManualMealModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        dayName={modalDay}
        slotName={planData[modalDay]?.[modalSlotIdx]?.name || "Meal"}
        initialMealTitle={planData[modalDay]?.[modalSlotIdx]?.recipeTitle}
        onSaveMeal={handleSaveCustomMeal}
      />

      {/* Manual Dietary Meal Plan Creator Modal */}
      <ManualDietPlanModal
        isOpen={dietPlanModalOpen}
        onClose={() => setDietPlanModalOpen(false)}
        currentSelectedDay={selectedDay}
        allDays={weekInfo.days.map((d) => d.dayName)}
        onApplyPlan={handleApplyManualDietPlan}
      />
    </div>
  );
}
