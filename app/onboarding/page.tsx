"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Heart,
  Scale,
  Utensils,
  Shield,
  Clock,
} from "lucide-react";
import { calculateNutritionPlan, UserStats, ActivityLevel, HealthGoal } from "@/lib/nutrition";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [stats, setStats] = useState<UserStats>({
    age: 28,
    sex: "female",
    heightCm: 165,
    weightKg: 62,
    activityLevel: "moderate",
    goal: "lose",
  });

  const [dietType, setDietType] = useState("veg");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>(["South Indian", "Mediterranean"]);

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const toggleCondition = (item: string) => {
    setConditions((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const toggleCuisine = (item: string) => {
    setCuisines((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const plan = calculateNutritionPlan(stats);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-xs text-[var(--text-muted)] font-medium mb-2">
          <span>Step {step} of 5</span>
          <span>
            {step === 1 && "Your Wellness Goal"}
            {step === 2 && "Body & Activity Metrics"}
            {step === 3 && "Dietary Pattern"}
            {step === 4 && "Allergies & Health Conditions"}
            {step === 5 && "Your Tailored Nutrition Plan"}
          </span>
        </div>
        <div className="h-2 w-full bg-[var(--surface-elevated)] rounded-full overflow-hidden border border-[var(--border)]">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
        {/* STEP 1: Goal */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                Personalized Start
              </span>
              <h2 className="font-serif text-3xl font-semibold text-[var(--text)]">
                What is your primary wellness focus?
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                graceAI shapes your meal portions and macronutrient balance to nurture your personal goal gently.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { id: "lose", label: "Sustainable Weight Loss", desc: "Gentle 400 kcal deficit with high protein & fiber" },
                { id: "maintain", label: "Vitality & Maintenance", desc: "Keep weight steady, optimize daily energy & gut health" },
                { id: "gain", label: "Lean Muscle & Tone", desc: "Surplus calories paired with progressive nourishment" },
                { id: "manage_condition", label: "Manage Blood Sugar / PCOS", desc: "Focus on low glycemic index, steady insulin, and whole foods" },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setStats({ ...stats, goal: g.id as HealthGoal })}
                  className={`p-5 rounded-2xl text-left border transition-all duration-200 ${
                    stats.goal === g.id
                      ? "border-[var(--primary)] bg-[var(--primary-light)] shadow-sm"
                      : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)]"
                  }`}
                >
                  <div className="font-serif font-semibold text-base text-[var(--text)] mb-1">
                    {g.label}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Body Stats */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                Mifflin-St Jeor Metrics
              </span>
              <h2 className="font-serif text-3xl font-semibold text-[var(--text)]">
                Tell us about your body measurements
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Used strictly on device to estimate your metabolic burn. Never shared with third parties.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Biological Sex
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStats({ ...stats, sex: "female" })}
                    className={`py-3 rounded-xl text-sm font-semibold border ${
                      stats.sex === "female"
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text)]"
                    }`}
                  >
                    Female
                  </button>
                  <button
                    onClick={() => setStats({ ...stats, sex: "male" })}
                    className={`py-3 rounded-xl text-sm font-semibold border ${
                      stats.sex === "male"
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text)]"
                    }`}
                  >
                    Male
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Age</label>
                  <div className="text-xl font-bold text-[var(--text)]">{stats.age} yrs</div>
                  <input
                    type="range"
                    min={18}
                    max={85}
                    value={stats.age}
                    onChange={(e) => setStats({ ...stats, age: Number(e.target.value) })}
                    className="w-full mt-2 accent-[var(--primary)]"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Height</label>
                  <div className="text-xl font-bold text-[var(--text)]">{stats.heightCm} cm</div>
                  <input
                    type="range"
                    min={130}
                    max={210}
                    value={stats.heightCm}
                    onChange={(e) => setStats({ ...stats, heightCm: Number(e.target.value) })}
                    className="w-full mt-2 accent-[var(--primary)]"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Weight</label>
                  <div className="text-xl font-bold text-[var(--text)]">{stats.weightKg} kg</div>
                  <input
                    type="range"
                    min={40}
                    max={140}
                    value={stats.weightKg}
                    onChange={(e) => setStats({ ...stats, weightKg: Number(e.target.value) })}
                    className="w-full mt-2 accent-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Daily Physical Activity
                </label>
                <select
                  value={stats.activityLevel}
                  onChange={(e) => setStats({ ...stats, activityLevel: e.target.value as ActivityLevel })}
                  className="w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-3 text-sm text-[var(--text)]"
                >
                  <option value="sedentary">Sedentary (Desk job, little walking)</option>
                  <option value="light">Lightly Active (1-3 days casual workout or walking)</option>
                  <option value="moderate">Moderately Active (3-5 days regular exercise)</option>
                  <option value="active">Active (6-7 days intense workouts)</option>
                  <option value="very_active">Very Active (Heavy manual work / athletes)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Diet Type */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                Culinary Identity
              </span>
              <h2 className="font-serif text-3xl font-semibold text-[var(--text)]">
                What dietary philosophy do you follow?
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Our database adapts to regional traditions and conscious lifestyles.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: "veg", label: "Vegetarian", desc: "Dairy & plant foods" },
                { id: "jain", label: "Jain Vegetarian", desc: "No onion, garlic, or root veggies" },
                { id: "vegan", label: "100% Plant-Based", desc: "Zero animal products" },
                { id: "eggetarian", label: "Eggetarian", desc: "Vegetarian plus eggs" },
                { id: "nonveg", label: "Non-Vegetarian", desc: "Includes poultry, fish, meat" },
                { id: "keto", label: "Low Carb / Keto", desc: "Under 50g net carbs/day" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDietType(d.id)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    dietType === d.id
                      ? "border-[var(--primary)] bg-[var(--primary-light)] font-semibold shadow-sm"
                      : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)]"
                  }`}
                >
                  <div className="text-sm font-semibold text-[var(--text)]">{d.label}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1">{d.desc}</div>
                </button>
              ))}
            </div>

            {/* Favorite cuisines */}
            <div className="pt-4 border-t border-[var(--border)]">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Favorite Cuisines (Select all you enjoy):
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "South Indian (Tamil/Kerala)",
                  "North Indian (Punjabi/Kashmiri)",
                  "Bengali & Eastern",
                  "Gujarati & Rajasthani",
                  "Mediterranean & Greek",
                  "Italian & Rustic",
                  "Japanese & Pan-Asian",
                  "Mexican & Latin",
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCuisine(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      cuisines.includes(c)
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text)]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Allergies & Conditions */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                Safety & Health Conditions
              </span>
              <h2 className="font-serif text-3xl font-semibold text-[var(--text)]">
                Any allergies or health considerations?
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                graceAI strictly excludes listed allergens from any recipe or meal plan generated.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Known Allergens to Exclude:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Peanuts",
                  "Tree nuts",
                  "Gluten / Wheat",
                  "Dairy / Lactose",
                  "Soy",
                  "Eggs",
                  "Shellfish",
                  "Mustard",
                  "Sesame",
                ].map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleAllergy(a)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      allergies.includes(a)
                        ? "bg-[var(--danger)] text-white border-[var(--danger)]"
                        : "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text)]"
                    }`}
                  >
                    {allergies.includes(a) ? `✕ ${a}` : `+ ${a}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Health Conditions (Shows medical disclaimer banner):
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Type 2 Diabetes / Pre-diabetes",
                  "Hypertension (High BP)",
                  "PCOS / PCOD",
                  "Hypothyroidism",
                  "High Cholesterol",
                  "Pregnancy / Lactating",
                ].map((cond) => (
                  <button
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      conditions.includes(cond)
                        ? "bg-[var(--warning)] text-black border-[var(--warning)]"
                        : "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text)]"
                    }`}
                  >
                    {conditions.includes(cond) ? `✓ ${cond}` : `+ ${cond}`}
                  </button>
                ))}
              </div>

              {conditions.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--warning)]/40 text-xs text-[var(--text-muted)] flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-[var(--text)]">Medical Notice:</strong> You have selected health conditions. graceAI will prioritize conservative glycemic and nutrient splits, but please verify all meal plans with your doctor or clinical dietitian.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Final Calculated Blueprint */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--success)]/15 text-[var(--success)] flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-3xl font-semibold text-[var(--text)]">
                Your Personal graceAI Blueprint
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Calculated strictly adhering to biological safety floors and cultural preferences.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[var(--primary-light)] border border-[var(--primary-border)] text-center space-y-1">
                <div className="text-xs uppercase tracking-wider text-[var(--primary)] font-bold">
                  Daily Energy Target
                </div>
                <div className="font-serif text-4xl font-bold text-[var(--text)]">
                  {plan.targetKcal}{" "}
                  <span className="text-base font-sans font-normal text-[var(--text-muted)]">kcal</span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  BMR: {plan.bmr} • TDEE: {plan.tdee}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-center space-y-1">
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
                  BMI Status
                </div>
                <div className="font-serif text-3xl font-bold text-[var(--text)]">
                  {plan.bmi}
                </div>
                <div className="text-xs text-[var(--primary)] font-semibold">
                  {plan.bmiCategory}
                </div>
              </div>
            </div>

            {plan.safetyNote && (
              <div className="p-3.5 rounded-2xl bg-[var(--warning)]/15 border border-[var(--warning)]/30 text-xs text-[var(--text)]">
                ⚠️ {plan.safetyNote}
              </div>
            )}

            <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
              <h4 className="font-serif text-base font-semibold text-[var(--text)]">
                Daily Macronutrient Targets
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="text-xs text-[var(--text-muted)]">Protein</div>
                  <div className="text-lg font-bold text-[var(--primary)]">{plan.macros.proteinG}g</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="text-xs text-[var(--text-muted)]">Complex Carbs</div>
                  <div className="text-lg font-bold text-[var(--accent)]">{plan.macros.carbsG}g</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="text-xs text-[var(--text-muted)]">Healthy Fats</div>
                  <div className="text-lg font-bold text-[var(--warning)]">{plan.macros.fatG}g</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/planner"
                className="flex-1 py-4 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-center shadow-md active:scale-95 transition-all"
              >
                Go to Weekly Meal Planner
              </Link>
              <Link
                href="/tracker"
                className="flex-1 py-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text)] font-medium text-center hover:bg-[var(--border)] transition-colors"
              >
                Open Health Tracker
              </Link>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-2 rounded-xl"
            >
              <span>Cancel</span>
            </Link>
          )}

          {step < 5 && (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold transition-all shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
