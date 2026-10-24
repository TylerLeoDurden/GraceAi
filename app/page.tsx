"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChefHat,
  HeartPulse,
  CalendarDays,
  UtensilsCrossed,
  Droplet,
  Clock,
  Send,
  Loader2,
  ChevronDown,
  Shield,
  Heart,
  Lock,
  Compass,
  Stethoscope,
} from "lucide-react";
import { calculateNutritionPlan, UserStats, ActivityLevel, HealthGoal } from "@/lib/nutrition";
import { FormattedMessage } from "@/components/formatted-message";
import { useRealTime } from "@/lib/use-real-time";
import { DynamicActiveRhythm } from "@/components/dynamic-active-rhythm";

const CUISINE_CATEGORIES = [
  { id: "all", label: "All Traditions" },
  { id: "indian", label: "Indian Regional" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "asian", label: "East & Southeast Asian" },
  { id: "plant", label: "Jain & Sattvic" },
];

const SAMPLE_RECIPES = [
  {
    id: "r1",
    title: "Kerala Moong & Brown Rice Khichdi",
    category: "indian",
    origin: "Kerala, South India",
    time: "25 min",
    kcal: 380,
    protein: "14g",
    tags: ["Gentle Digestion", "Gut Healing", "Gluten Free"],
    image: "/images/dishes/moong_khichdi.jpg",
    desc: "Unpolished brown rice and yellow moong simmered with freshly tempered cumin, curry leaves, and ginger.",
  },
  {
    id: "r2",
    title: "Greek Herb-Crusted Baked Salmon",
    category: "mediterranean",
    origin: "Crete, Greece",
    time: "20 min",
    kcal: 440,
    protein: "34g",
    tags: ["Omega-3 Rich", "Heart Healthy"],
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80",
    desc: "Wild salmon fillet baked over crushed kalamata olives, cherry tomatoes, fresh dill, and cold-pressed olive oil.",
  },
  {
    id: "r3",
    title: "Chettinad Mushroom & Pepper Sukka",
    category: "indian",
    origin: "Tamil Nadu, India",
    time: "25 min",
    kcal: 220,
    protein: "8g",
    tags: ["Immunity", "Plant-Based", "Diabetic Friendly"],
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=700&q=80",
    desc: "Oyster mushrooms tossed on high flame with freshly crushed black tellicherry peppercorns and sweet shallots.",
  },
  {
    id: "r4",
    title: "Kyoto Miso Tofu & Bok Choy Broth",
    category: "asian",
    origin: "Kyoto, Japan",
    time: "15 min",
    kcal: 210,
    protein: "16g",
    tags: ["Fermented", "Light Supper", "Vegan"],
    image: "/images/dishes/miso_soup.jpg",
    desc: "Silken tofu simmered in fermented dashi-miso broth with crisp baby bok choy and toasted sesame seeds.",
  },
  {
    id: "r5",
    title: "Jain Paneer Methi Malai",
    category: "plant",
    origin: "Rajasthan, India",
    time: "30 min",
    kcal: 360,
    protein: "19g",
    tags: ["No Onion / Garlic", "High Protein", "Sattvic"],
    image: "/images/dishes/palak_paneer.jpg",
    desc: "Prepared without root vegetables. Fresh fenugreek greens and soft paneer in spiced cashew-yogurt gravy.",
  },
  {
    id: "r6",
    title: "Levantine Whipped Hummus Bowl",
    category: "mediterranean",
    origin: "Beirut, Lebanon",
    time: "15 min",
    kcal: 390,
    protein: "15g",
    tags: ["High Fiber", "Plant Protein"],
    image: "/images/dishes/hummus.jpg",
    desc: "Stone-ground sesame tahini, boiled chickpeas, za'atar herbs, pomegranate seeds, and fresh cucumbers.",
  },
];

const FAQS = [
  {
    q: "How does graceAI differ from ordinary diet tracking apps?",
    a: "Most fitness apps turn eating into a stressful game of numbers and generic western salads. graceAI was created for real home kitchens: it honors regional food culture (from South Indian sambar to Levantine bowls), respects biological safety floors so you never starve, and gives you an intelligent kitchen companion that invents recipes from whatever ingredients you already have.",
  },
  {
    q: "Can it handle specific Indian diets like Jain, Sattvic, or South Indian Vegetarian?",
    a: "Yes, natively. You can specify Jain (strictly excluding root vegetables, onion, and garlic), Sattvic, South Indian Vegetarian, Eggetarian, or regional kitchens like Chettinad, Kerala, Punjab, or Bengal. Ingredients and measurements use everyday household measures like katori, teaspoons, and grams.",
  },
  {
    q: "Is graceAI really completely free?",
    a: "Yes. The entire platform runs on a zero-cost open-source philosophy. You will never encounter paywalled meal plans, credit card requirements, or locked features.",
  },
  {
    q: "Is graceAI a substitute for my doctor or clinical dietitian?",
    a: "No. graceAI is designed for everyday culinary inspiration and lifestyle wellness education. It does not diagnose medical conditions or prescribe therapeutic regimens. For complex conditions such as Type 1 Diabetes, chronic kidney disease, or pregnancy, please always review plans with your healthcare provider.",
  },
  {
    q: "How is my personal data handled under India's DPDP Act 2023?",
    a: "We adhere strictly to data minimization and privacy rights: your stats are only used to calculate your nutritional targets, we never sell biometric information to advertisers, and you can export or permanently delete your account with one click.",
  },
];

export default function LandingPage() {
  const { status, mounted } = useRealTime(1000);

  // Live Chat state
  const [chatMode, setChatMode] = useState<"chef" | "health">("chef");
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatLog, setChatLog] = useState<Array<{ role: "user" | "grace"; text: string; alert?: boolean; helpline?: string }>>([
    {
      role: "grace",
      text: "Hello! Tell me what ingredients you have in your kitchen, or ask any nutrition question. I will organize my answer in clear points for you.",
    },
  ]);

  // Calculator state
  const [calcStats, setCalcStats] = useState<UserStats>({
    age: 28,
    sex: "female",
    heightCm: 165,
    weightKg: 62,
    activityLevel: "moderate",
    goal: "lose",
  });
  const calcResult = calculateNutritionPlan(calcStats);

  // Recipe filter
  const [activeCategory, setActiveCategory] = useState("all");
  const filteredRecipes =
    activeCategory === "all"
      ? SAMPLE_RECIPES
      : SAMPLE_RECIPES.filter((r) => r.category === activeCategory);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const chatAbortRef = useRef<AbortController | null>(null);

  const handleCancelChat = () => {
    if (chatAbortRef.current) {
      chatAbortRef.current.abort();
      chatAbortRef.current = null;
    }
    setIsChatLoading(false);
  };

  const handleSimulateChat = async (query?: string) => {
    const text = query || chatInput;
    if (!text.trim() || isChatLoading) return;

    const userText = text.trim();
    setChatInput("");

    setChatLog((prev) => [...prev, { role: "user", text: userText }]);
    setIsChatLoading(true);

    const controller = new AbortController();
    chatAbortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          mode: chatMode,
          history: chatLog.slice(-6).map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      setChatLog((prev) => [
        ...prev,
        {
          role: "grace",
          text: data.reply || "I am here to guide your culinary journey.",
          alert: Boolean(data.alert),
          helpline: data.helpline,
        },
      ]);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAborted = err instanceof Error && (err.name === "AbortError" || err.message?.includes("aborted"));
      console.warn("Landing chat error:", err);
      setChatLog((prev) => [
        ...prev,
        {
          role: "grace",
          text: isAborted
            ? "Request took longer than expected due to connection latency. Please try again."
            : "Grace encountered a connection pause. Please try asking again.",
          alert: false,
        },
      ]);
    } finally {
      clearTimeout(timeoutId);
      chatAbortRef.current = null;
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* =========================================================================
          HERO SECTION — Editorial & Warm
          ========================================================================= */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-24 px-4 sm:px-8 lg:px-12 xl:px-14 max-w-[1760px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Editorial Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Real-time date & greeting badge */}
            {mounted && status ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary-light)] border border-[var(--primary-border)] text-xs text-[var(--text)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
                </span>
                <span className="font-semibold text-[var(--primary)]">{status.greeting}!</span>
                <span className="text-[var(--text-muted)] font-mono">
                  {status.formattedDate} • {status.timeString}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                <span>A different kind of food & wellness guide</span>
              </div>
            )}

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[var(--text)] leading-[1.12]">
              Food you actually want to eat, balanced for the{" "}
              <span className="italic text-[var(--primary)] font-normal">
                body you live in.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl leading-relaxed">
              Tailored weekly meal plans that honor your kitchen heritage, gentle daily tracking, authentic world cuisines, and a patient culinary guide. No starvation calories, zero subscriptions.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href="/onboarding"
                className="px-7 py-3.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-sm transition-all shadow-sm text-center flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>Build Your Weekly Menu</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#kitchen-guide"
                className="px-6 py-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-elevated)] font-medium text-sm transition-colors text-center flex items-center justify-center gap-2"
              >
                <span>Ask Chef Grace</span>
              </a>
            </div>

            {/* Subtle editorial trust points */}
            <div className="pt-6 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[var(--text-muted)]">
              <div>
                <span className="font-medium text-[var(--text)] block">Biological Floors</span>
                <span>Never &lt;1,200 kcal</span>
              </div>
              <div>
                <span className="font-medium text-[var(--text)] block">Health Care Guide</span>
                <span>Fever, Allergies & Skin</span>
              </div>
              <div>
                <span className="font-medium text-[var(--text)] block">Zero Cost</span>
                <span>100% Free Forever</span>
              </div>
              <div>
                <span className="font-medium text-[var(--text)] block">DPDP Act 2023</span>
                <span>Your Data is Yours</span>
              </div>
            </div>
          </div>

          {/* Right Visual — Dynamic Active Nourishment Rhythm (Day-by-Day & Meal-by-Meal) */}
          <div className="lg:col-span-5">
            <DynamicActiveRhythm />
          </div>
        </div>
      </section>

      {/* =========================================================================
          REAL-WORLD WEEKLY PROCESS STRIP
          ========================================================================= */}
      <section className="bg-[var(--surface-elevated)] border-y border-[var(--border)] py-4 px-4 sm:px-8 lg:px-12 xl:px-14">
        <div className="max-w-[1760px] w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-bold shadow-xs">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[var(--text)] flex items-center gap-2">
                <span>Real-World Weekly Process</span>
                {mounted && status && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] font-semibold font-mono">
                    {status.dayOfWeek} • {status.timeString}
                  </span>
                )}
              </div>
              <div className="text-[var(--text-muted)]">
                Your meals and mindful vitals automatically roll day-by-day throughout the calendar week.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Link
              href="/planner"
              className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs text-xs"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Today&apos;s Meal Plan</span>
            </Link>
            <Link
              href="/tracker"
              className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-semibold hover:bg-[var(--surface-elevated)] transition-colors flex items-center gap-1.5 text-xs"
            >
              <HeartPulse className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>7-Day Tracker</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOUR PILLARS — Human & Practical
          ========================================================================= */}
      <section className="py-20 bg-[var(--surface-elevated)] border-y border-[var(--border)]">
        <div className="max-w-[1760px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-14 space-y-12">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-serif italic text-[var(--primary)] tracking-wide">
              Core Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--text)]">
              A balanced rhythm for everyday life.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              We replace crash restriction with metabolic consistency, culturally resonant cooking, and realistic habit pacing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="editorial-card rounded-2xl p-6 space-y-3">
              <span className="font-serif text-2xl text-[var(--primary)] font-normal">01</span>
              <h3 className="font-serif text-lg font-semibold text-[var(--text)]">
                Mindful Kitchen Menus
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Menus tuned to your metabolic requirements via Mifflin-St Jeor, strictly honoring biological calorie safety floors, with a market grocery list grouped by market aisle.
              </p>
            </div>

            <div className="editorial-card rounded-2xl p-6 space-y-3">
              <span className="font-serif text-2xl text-[var(--accent)] font-normal">02</span>
              <h3 className="font-serif text-lg font-semibold text-[var(--text)]">
                Honest Daily Rhythm
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Record meals when you actually eat them. No shame or neurotic calorie counting—just a flexible rhythm with honest logging that fits your real schedule.
              </p>
            </div>

            <div className="editorial-card rounded-2xl p-6 space-y-3">
              <span className="font-serif text-2xl text-[var(--primary)] font-normal">03</span>
              <h3 className="font-serif text-lg font-semibold text-[var(--text)]">
                Thoughtful Health Guardrails
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Subtle adjustments to keep you energized. Daily reflections that explain how food, rest, and hydration work together for your body. Full user undo anytime.
              </p>
            </div>

            <div className="editorial-card rounded-2xl p-6 space-y-3">
              <span className="font-serif text-2xl text-[var(--accent)] font-normal">04</span>
              <h3 className="font-serif text-lg font-semibold text-[var(--text)]">
                Your Dedicated Home Companion
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Chef Grace crafts point-by-point recipes from your fridge ingredients, while our Health Care guide offers evidence-based remedies whenever you feel unwell.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE CHEF GRACE DEMO — Point-by-point
          ========================================================================= */}
      <section id="kitchen-guide" className="py-20 px-4 sm:px-8 lg:px-12 xl:px-14 max-w-[1760px] mx-auto w-full">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            Try It Now
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--text)]">
            Ask Chef Grace for a Point-by-Point Recipe
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Grace formats every dish into clear bulleted ingredients and numbered steps. Try asking about your fridge ingredients below.
          </p>
        </div>

        <div className="max-w-3xl mx-auto editorial-card rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[var(--surface-elevated)] border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Grace"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-serif text-base font-semibold text-[var(--text)]">
                  Grace
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {chatMode === "chef" ? "Chef Grace (Point-by-point recipes)" : "Health Guide (Lifestyle & Nutrition)"}
                </p>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex p-1 bg-[var(--surface)] rounded-xl border border-[var(--border)] w-full sm:w-auto text-xs">
              <button
                onClick={() => setChatMode("chef")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-medium transition-all ${
                  chatMode === "chef"
                    ? "bg-[var(--surface-elevated)] text-[var(--text)] font-semibold shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Recipes
              </button>
              <button
                onClick={() => setChatMode("health")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-medium transition-all ${
                  chatMode === "health"
                    ? "bg-[var(--surface-elevated)] text-[var(--text)] font-semibold shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Health Guide
              </button>
            </div>
          </div>

          {/* Messages Log */}
          <div className="p-5 sm:p-6 h-80 overflow-y-auto space-y-4 bg-[var(--background)]/40 text-xs">
            {chatLog.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-4 leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-[var(--text)] text-[var(--background)]"
                      : msg.alert
                      ? "bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--text)]"
                      : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]"
                  }`}
                >
                  <FormattedMessage content={msg.text} isUser={msg.role === "user"} />
                  {msg.helpline && (
                    <div className="mt-3 pt-2.5 border-t border-[var(--danger)]/20 text-xs font-semibold text-[var(--danger)]">
                      {msg.helpline}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex justify-start items-center gap-2">
                <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text)] flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
                  <span>Chef Grace is writing out your points...</span>
                </div>
                <button
                  onClick={handleCancelChat}
                  className="text-xs px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shadow-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Prompt chips */}
          <div className="px-4 py-2.5 bg-[var(--surface-elevated)] border-t border-[var(--border)] flex gap-2 overflow-x-auto no-scrollbar">
            {chatMode === "chef" ? (
              <>
                <button
                  onClick={() => handleSimulateChat("Give me a point-by-point recipe for South Indian Dosa")}
                  className="text-xs px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-muted)] text-[var(--text)] transition-colors whitespace-nowrap"
                >
                  Dosa in points
                </button>
                <button
                  onClick={() => handleSimulateChat("What can I cook with paneer, tomatoes, and spinach in 15 minutes? Give ingredients and steps in points")}
                  className="text-xs px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-muted)] text-[var(--text)] transition-colors whitespace-nowrap"
                >
                  Paneer & Spinach Dinner
                </button>
                <button
                  onClick={() => handleSimulateChat("How do I replace heavy cream in Indian gravies? List 3 alternatives")}
                  className="text-xs px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-muted)] text-[var(--text)] transition-colors whitespace-nowrap"
                >
                  Cream alternatives
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSimulateChat("Why do I feel an energy crash after lunch? List 3 causes and solutions")}
                  className="text-xs px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-muted)] text-[var(--text)] transition-colors whitespace-nowrap"
                >
                  Post-lunch crash
                </button>
                <button
                  onClick={() => handleSimulateChat("What is the formula to calculate daily water intake?")}
                  className="text-xs px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-muted)] text-[var(--text)] transition-colors whitespace-nowrap"
                >
                  Hydration formula
                </button>
                <button
                  onClick={() => handleSimulateChat("Feeling very dizzy or fatigued after skipping dinner")}
                  className="text-xs px-3 py-1 rounded-full bg-[var(--danger)]/15 border border-[var(--danger)]/30 text-[var(--danger)] transition-colors whitespace-nowrap"
                >
                  Feeling faint & fatigued
                </button>
              </>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] flex items-center gap-2">
            <input
              type="text"
              placeholder={chatMode === "chef" ? "Ask for a recipe in points (e.g. 'Quick moong dal khichdi')..." : "Ask about nutrition..."}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSimulateChat()}
              disabled={isChatLoading}
              className="flex-1 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--text-muted)] disabled:opacity-50"
            />
            <button
              onClick={() => handleSimulateChat()}
              disabled={isChatLoading || !chatInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-[var(--text)] text-[var(--background)] text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          NUTRITION TARGET CALCULATOR — Clean & Grounded
          ========================================================================= */}
      <section className="py-20 bg-[var(--surface-elevated)] border-y border-[var(--border)] px-4 sm:px-8 lg:px-12 xl:px-14">
        <div className="max-w-[1760px] w-full mx-auto space-y-12">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              Metabolic Precision
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--text)]">
              Calculate What Your Body Needs to Thrive
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Grounded in the clinical Mifflin-St Jeor equation. We calculate your basal burn and apply biological safety floors so you never under-nourish your metabolism.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input card */}
            <div className="lg:col-span-7 editorial-card rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Biological Sex
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCalcStats({ ...calcStats, sex: "female" })}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      calcStats.sex === "female"
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "bg-[var(--surface-elevated)] text-[var(--text)] border-[var(--border)]"
                    }`}
                  >
                    Female
                  </button>
                  <button
                    onClick={() => setCalcStats({ ...calcStats, sex: "male" })}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      calcStats.sex === "male"
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "bg-[var(--surface-elevated)] text-[var(--text)] border-[var(--border)]"
                    }`}
                  >
                    Male
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Age ({calcStats.age}y)</label>
                  <input
                    type="range"
                    min={18}
                    max={80}
                    value={calcStats.age}
                    onChange={(e) => setCalcStats({ ...calcStats, age: Number(e.target.value) })}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Height ({calcStats.heightCm}cm)</label>
                  <input
                    type="range"
                    min={130}
                    max={210}
                    value={calcStats.heightCm}
                    onChange={(e) => setCalcStats({ ...calcStats, heightCm: Number(e.target.value) })}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Weight ({calcStats.weightKg}kg)</label>
                  <input
                    type="range"
                    min={40}
                    max={140}
                    value={calcStats.weightKg}
                    onChange={(e) => setCalcStats({ ...calcStats, weightKg: Number(e.target.value) })}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Daily Physical Activity
                </label>
                <select
                  value={calcStats.activityLevel}
                  onChange={(e) => setCalcStats({ ...calcStats, activityLevel: e.target.value as ActivityLevel })}
                  className="w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl p-2.5 text-xs text-[var(--text)] focus:outline-none"
                >
                  <option value="sedentary">Sedentary (Desk job, minimal workouts)</option>
                  <option value="light">Lightly Active (1-3 days walking or light exercise)</option>
                  <option value="moderate">Moderately Active (3-5 days regular workouts)</option>
                  <option value="active">Active (6-7 days intense movement)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Wellness Target
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCalcStats({ ...calcStats, goal: "lose" })}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      calcStats.goal === "lose"
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-[var(--surface-elevated)] text-[var(--text)] border-[var(--border)]"
                    }`}
                  >
                    Gentle Deficit
                  </button>
                  <button
                    onClick={() => setCalcStats({ ...calcStats, goal: "maintain" })}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      calcStats.goal === "maintain"
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-[var(--surface-elevated)] text-[var(--text)] border-[var(--border)]"
                    }`}
                  >
                    Maintenance
                  </button>
                  <button
                    onClick={() => setCalcStats({ ...calcStats, goal: "gain" })}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      calcStats.goal === "gain"
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-[var(--surface-elevated)] text-[var(--text)] border-[var(--border)]"
                    }`}
                  >
                    Lean Mass
                  </button>
                </div>
              </div>
            </div>

            {/* Results card */}
            <div className="lg:col-span-5 editorial-card rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
                  Your Calculated Targets
                </span>
                <h4 className="font-serif text-2xl font-normal text-[var(--text)] mt-1">
                  Daily Energy Baseline
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-center space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
                  Recommended Daily Target
                </div>
                <div className="font-serif text-4xl font-normal text-[var(--text)]">
                  {calcResult.targetKcal}{" "}
                  <span className="text-sm font-sans font-normal text-[var(--text-muted)]">kcal</span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  BMR: {calcResult.bmr} • TDEE: {calcResult.tdee}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Protein</div>
                  <div className="font-serif text-base font-bold text-[var(--primary)] mt-1">{calcResult.macros.proteinG}g</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Carbs</div>
                  <div className="font-serif text-base font-bold text-[var(--accent)] mt-1">{calcResult.macros.carbsG}g</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Healthy Fat</div>
                  <div className="font-serif text-base font-bold text-[var(--warning)] mt-1">{calcResult.macros.fatG}g</div>
                </div>
              </div>

              <Link
                href="/onboarding"
                className="w-full py-3.5 rounded-xl bg-[var(--text)] text-[var(--background)] text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span>Save Targets & Open Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HEALTH CARE & HOME REMEDIES FEATURE SECTION
          ========================================================================= */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 xl:px-14 max-w-[1760px] mx-auto w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[var(--surface-elevated)] via-[var(--surface)] to-[var(--surface-elevated)] border border-[var(--border)] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full">
              <Stethoscope className="w-4 h-4" />
              <span>Dedicated Care Guide • Common Illnesses, Allergies & Skin Care</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text)]">
              Health Care & Home Remedies Center
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Explore evidence-based recovery protocols, targeted nutrition, and first-line home treatments for common viral fever, cold & cough, dust/pollen allergies, hair fall solutions, and skin barrier health.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 rounded-xl text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-medium">🌡️ Viral Fever & Sponging</span>
              <span className="px-3 py-1 rounded-xl text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-medium">🍵 Cold & Saline Gargles</span>
              <span className="px-3 py-1 rounded-xl text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-medium">🌿 Dust & Pollen Allergy</span>
              <span className="px-3 py-1 rounded-xl text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-medium">✨ Hair Fall & Scalp Care</span>
              <span className="px-3 py-1 rounded-xl text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] font-medium">🧴 Acne & Barrier Repair</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href="/care"
              className="px-7 py-4 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Explore Health Care Protocols</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          WORLD CUISINES ARCHIVE — Editorial Cookbook
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 xl:px-14 max-w-[1760px] mx-auto w-full space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-serif italic text-[var(--primary)] tracking-wide">
              Curated Recipes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--text)]">
              Heritage Kitchens from Around the World
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Wholesome dishes from Tamil Nadu, Kerala, and Rajasthan to Crete and Kyoto. Scaled for your table.
            </p>
          </div>

          <Link
            href="/recipes"
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            <span>Explore all recipes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CUISINE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-[var(--text)] text-[var(--background)] font-semibold"
                  : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Recipe Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="editorial-card rounded-2xl overflow-hidden flex flex-col group transition-all duration-200"
            >
              <div className="relative h-48 w-full overflow-hidden bg-[var(--surface-elevated)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[var(--surface)]/90 backdrop-blur-md text-[var(--text)] text-[11px] font-medium">
                  {recipe.origin}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
                    {recipe.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--text)]">{recipe.kcal} kcal</span>
                    <span>•</span>
                    <span>{recipe.protein} Protein</span>
                  </div>
                  <Link href="/recipes" className="font-medium text-[var(--primary)] hover:underline">
                    View Steps →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          HUMAN STORIES — Authentic Kitchen Moments
          ========================================================================= */}
      <section className="py-20 bg-[var(--surface-elevated)] border-t border-[var(--border)] px-4 sm:px-8 lg:px-12 xl:px-14">
        <div className="max-w-[1760px] w-full mx-auto space-y-12">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-serif italic text-[var(--primary)] tracking-wide">
              Kitchen Notes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--text)]">
              From Real Home Kitchens
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="editorial-card rounded-2xl p-6 space-y-4">
              <p className="text-sm text-[var(--text)] leading-relaxed italic">
                “Finally an app that understands what rasam and dal tadka are, without trying to replace them with generic kale smoothies. The grocery list groups items by mandi aisle so my market trip takes 10 minutes.”
              </p>
              <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                <span className="font-semibold text-[var(--text)] block">Preethi M.</span>
                <span>Home cook • Chennai</span>
              </div>
            </div>

            <div className="editorial-card rounded-2xl p-6 space-y-4">
              <p className="text-sm text-[var(--text)] leading-relaxed italic">
                “I open the fridge after a 10-hour workday, tell Grace what 3 things I have, and dinner is on the table in 20 minutes without spiking my blood sugar.”
              </p>
              <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                <span className="font-semibold text-[var(--text)] block">Rohan S.</span>
                <span>Design Lead • Mumbai</span>
              </div>
            </div>

            <div className="editorial-card rounded-2xl p-6 space-y-4">
              <p className="text-sm text-[var(--text)] leading-relaxed italic">
                “The strict calorie floor feature gives me immense relief. It focuses on feeling energized and hydrated throughout the afternoon rather than obsessive guilt.”
              </p>
              <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                <span className="font-semibold text-[var(--text)] block">Meera K.</span>
                <span>Yoga Practitioner • New Delhi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 xl:px-14 max-w-[1760px] mx-auto w-full space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-serif italic text-[var(--primary)] tracking-wide">
            Questions & Answers
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--text)]">
            Everything You Need to Know
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="editorial-card rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-base font-medium text-[var(--text)]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
                      isOpen ? "transform rotate-180 text-[var(--primary)]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          FINAL INVITATION
          ========================================================================= */}
      <section className="py-20 bg-[var(--surface-elevated)] border-t border-[var(--border)] px-4 sm:px-8 lg:px-12 xl:px-14 text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--text)]">
            Begin your weekly culinary plan today.
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            Take 2 minutes to calculate your metabolic targets and explore comforting world recipes. 100% free forever.
          </p>
          <div className="pt-2">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium shadow-sm transition-all active:scale-95"
            >
              <span>Build My Free Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
