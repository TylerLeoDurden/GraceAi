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
} from "lucide-react";
import { getWeekDays, getRealTimeStatus, WeekInfo, DayInfo, DEFAULT_WEEK_INFO } from "@/lib/date-utils";
import { useRealTime } from "@/lib/use-real-time";
import { ManualMealModal } from "@/components/manual-meal-modal";
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

const SAMPLE_GROCERY_AISLES = [
  {
    aisle: "Fresh Produce & Greens",
    items: [
      { name: "Baby Spinach (Palak)", qty: "500g", checked: false },
      { name: "Fresh Coriander & Mint", qty: "2 bunches", checked: false },
      { name: "Tomatoes (Country / Roma)", qty: "1 kg", checked: true },
      { name: "Curry Leaves & Green Chillies", qty: "100g", checked: true },
      { name: "Ginger & Garlic", qty: "250g", checked: false },
      { name: "Cucumber & Carrots", qty: "1 kg", checked: false },
      { name: "Bell Peppers (Mixed)", qty: "3 pcs", checked: false },
    ],
  },
  {
    aisle: "Grains, Lentils & Pulses",
    items: [
      { name: "Yellow Moong Dal", qty: "1 kg", checked: false },
      { name: "Unpolished Brown Rice", qty: "2 kg", checked: true },
      { name: "Whole Red Kidney Beans (Rajma)", qty: "500g", checked: false },
      { name: "Quinoa or Steel Cut Oats", qty: "500g", checked: false },
      { name: "Multigrain Atta", qty: "2 kg", checked: false },
    ],
  },
  {
    aisle: "Proteins & Dairy",
    items: [
      { name: "Low-Fat Malai Paneer", qty: "400g", checked: false },
      { name: "Organic Firm Tofu", qty: "300g", checked: false },
      { name: "A2 Set Curd / Greek Yogurt", qty: "1 kg", checked: false },
      { name: "Eggs (Free Range)", qty: "12 pack", checked: false },
    ],
  },
  {
    aisle: "Pantry Spices & Healthy Fats",
    items: [
      { name: "Cold-Pressed Mustard / Coconut Oil", qty: "1 bottle", checked: false },
      { name: "Roasted Makhana", qty: "200g", checked: false },
      { name: "Chia Seeds & Pumpkin Seeds", qty: "200g", checked: false },
      { name: "Whole Cumin & Mustard Seeds", qty: "100g", checked: true },
    ],
  },
];

export default function PlannerPage() {
  const { status, mounted } = useRealTime(1000);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekInfo, setWeekInfo] = useState<WeekInfo>(DEFAULT_WEEK_INFO);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [planData, setPlanData] = useState<Record<string, MealSlot[]>>(INITIAL_DAYS);
  const [groceryModalOpen, setGroceryModalOpen] = useState(false);
  const [groceries, setGroceries] = useState(SAMPLE_GROCERY_AISLES);

  // Manual Meal Entry Modal state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [modalSlotIdx, setModalSlotIdx] = useState<number>(0);
  const [modalDay, setModalDay] = useState<string>("Monday");
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

  const resetWeekPlan = () => {
    if (confirm("Reset this week's meal plan to default balanced menu?")) {
      savePlan(INITIAL_DAYS);
    }
  };

  const toggleGroceryItem = (aisleIdx: number, itemIdx: number) => {
    setGroceries((prev) => {
      const copy = [...prev];
      copy[aisleIdx].items[itemIdx].checked = !copy[aisleIdx].items[itemIdx].checked;
      return copy;
    });
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setGroceryModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Generate Grocery List</span>
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
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
          <span>Check off meals as eaten to update your weekly completion</span>
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

      {/* Grocery List Modal */}
      {groceryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-2xl w-full max-h-[85vh] bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-elevated)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[var(--text)]">
                    Aggregated Grocery List
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    For {weekInfo.weekLabel} • Grouped by market aisles.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGroceryModalOpen(false)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aisle Items List */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {groceries.map((aisle, aisleIdx) => (
                <div key={aisleIdx} className="space-y-3">
                  <h4 className="font-serif text-base font-semibold text-[var(--primary)] flex items-center gap-2 border-b border-[var(--border)] pb-1.5">
                    <span>{aisle.aisle}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aisle.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        onClick={() => toggleGroceryItem(aisleIdx, itemIdx)}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          item.checked
                            ? "bg-[var(--surface-elevated)] border-[var(--border)] opacity-60 line-through text-[var(--text-muted)]"
                            : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            readOnly
                            className="rounded accent-[var(--primary)]"
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-[var(--text-muted)]">
                          {item.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-muted)]">
                Check off items as you shop in your local market.
              </span>
              <button
                onClick={() => setGroceryModalOpen(false)}
                className="px-6 py-2.5 rounded-2xl bg-[var(--text)] text-[var(--background)] font-medium text-xs hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Meal AI Analysis Modal */}
      <ManualMealModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        dayName={modalDay}
        slotName={planData[modalDay]?.[modalSlotIdx]?.name || "Meal"}
        initialMealTitle={planData[modalDay]?.[modalSlotIdx]?.recipeTitle}
        onSaveMeal={handleSaveCustomMeal}
      />
    </div>
  );
}
