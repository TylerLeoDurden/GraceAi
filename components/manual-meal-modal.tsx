"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Loader2,
  Check,
  Utensils,
  Info,
  CheckCircle2,
  SlidersHorizontal,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { AnalyzedMeal } from "@/app/api/nutrition/analyze/route";

interface ManualMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayName: string;
  slotName: string;
  initialMealTitle?: string;
  onSaveMeal: (analyzed: {
    recipeTitle: string;
    kcal: number;
    protein: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
    origin: string;
    healthImpact?: string;
  }) => void;
}

const EXAMPLE_MEALS = [
  "2 Paneer Parathas with 1 katori Curd",
  "Kerala Brown Rice with Sambar & Cabbage Thoran",
  "2 Ragi Dosas with Coconut Chutney & Filter Coffee",
  "1 plate Chicken Biryani with Cucumber Raita",
  "Steel Cut Oats with Almonds, Figs & Chia Seeds",
  "Mediterranean Grilled Lemon Chicken with Quinoa Salad",
];

export function ManualMealModal({
  isOpen,
  onClose,
  dayName,
  slotName,
  initialMealTitle,
  onSaveMeal,
}: ManualMealModalProps) {
  const [mealText, setMealText] = useState(initialMealTitle || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<AnalyzedMeal | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isFineTuning, setIsFineTuning] = useState(false);
  const [editableKcal, setEditableKcal] = useState<number>(0);
  const [editableProtein, setEditableProtein] = useState<string>("15g");
  const [editableCarbs, setEditableCarbs] = useState<string>("50g");
  const [editableFat, setEditableFat] = useState<string>("14g");

  if (!isOpen) return null;

  const handleAnalyze = async (overrideText?: string) => {
    const textToAnalyze = overrideText || mealText;
    if (!textToAnalyze.trim()) {
      setErrorMsg("Please describe what you ate or plan to eat.");
      return;
    }

    setErrorMsg("");
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/nutrition/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealText: textToAnalyze.trim(),
          slot: slotName,
        }),
      });

      const data: AnalyzedMeal = await res.json();

      if (!res.ok || data.isFood === false) {
        setErrorMsg(
          data.error ||
          `"${textToAnalyze}" does not appear to be an edible food or drink. People and non-food items do not have calories.`
        );
        setAnalyzedResult(null);
        return;
      }

      setAnalyzedResult(data);
      setEditableKcal(data.kcal);
      setEditableProtein(data.protein);
      setEditableCarbs(data.carbs);
      setEditableFat(data.fat);
      setIsFineTuning(false);
    } catch (err) {
      console.error("Meal analysis error:", err);
      setErrorMsg("Failed to analyze meal. Please check your connection and try again.");
      setAnalyzedResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (!analyzedResult) return;

    onSaveMeal({
      recipeTitle: analyzedResult.recipeTitle,
      kcal: isFineTuning ? Number(editableKcal) || analyzedResult.kcal : analyzedResult.kcal,
      protein: isFineTuning ? editableProtein : analyzedResult.protein,
      carbs: isFineTuning ? editableCarbs : analyzedResult.carbs,
      fat: isFineTuning ? editableFat : analyzedResult.fat,
      fiber: analyzedResult.fiber,
      origin: analyzedResult.origin,
      healthImpact: analyzedResult.healthImpact,
    });

    onClose();
  };

  const adjustKcal = (delta: number) => {
    setEditableKcal((prev) => Math.max(50, prev + delta));
    setIsFineTuning(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="max-w-xl w-full max-h-[92vh] bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
                {dayName} • {slotName}
              </div>
              <h3 className="font-serif text-lg font-semibold text-[var(--text)]">
                Calculate & Log Dish Calories
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          {/* User Input Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
              <span>Describe what you ate (or want to cook):</span>
              <span className="text-[11px] font-normal text-[var(--text-muted)]">
                ICMR & USDA verified formulas
              </span>
            </label>
            <textarea
              rows={3}
              value={mealText}
              onChange={(e) => setMealText(e.target.value)}
              placeholder="e.g. 2 rotis with 1 bowl dal tadka, roasted papad and sliced onions"
              className="w-full p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-all resize-none"
            />
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-xs leading-relaxed">{errorMsg}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    graceAI Groq AI Food Validator: People, personal names, and non-food items do not have culinary calories.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Example Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-[var(--text-muted)] block">
              Or tap an authentic kitchen example:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_MEALS.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setMealText(ex);
                    handleAnalyze(ex);
                  }}
                  className="px-2.5 py-1 rounded-xl text-[11px] bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !mealText.trim()}
            className="w-full py-3.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Computing clinical portions & calories...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Calculate Accurate Calories & Macros</span>
              </>
            )}
          </button>

          {/* Analysis Result Card */}
          {analyzedResult && (
            <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                      {analyzedResult.source === "canonical_database" || analyzedResult.source === "deterministic_cache"
                        ? "Verified Database • Consistent Standards"
                        : "AI Verified Standard • 4-4-9 Caloric Law"}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-[var(--text)]">
                    {analyzedResult.recipeTitle}
                  </h4>
                  <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                    {analyzedResult.origin} Cuisine
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="font-serif text-3xl font-bold text-[var(--primary)]">
                      {isFineTuning ? editableKcal : analyzedResult.kcal}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-medium">kcal</span>
                  </div>
                  {/* Quick Calorie Adjusters */}
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <button
                      type="button"
                      onClick={() => adjustKcal(-25)}
                      className="px-1.5 py-0.5 text-[10px] font-bold rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                      title="Reduce 25 kcal"
                    >
                      -25
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustKcal(+25)}
                      className="px-1.5 py-0.5 text-[10px] font-bold rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                      title="Add 25 kcal"
                    >
                      +25
                    </button>
                  </div>
                </div>
              </div>

              {/* Macro Pills with Fine-Tuning Option */}
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">Protein</span>
                    <span className="font-bold text-xs text-[var(--primary)]">
                      {isFineTuning ? editableProtein : analyzedResult.protein}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">Carbs</span>
                    <span className="font-bold text-xs text-[var(--accent)]">
                      {isFineTuning ? editableCarbs : analyzedResult.carbs}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">Fat</span>
                    <span className="font-bold text-xs text-[var(--warning)]">
                      {isFineTuning ? editableFat : analyzedResult.fat}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">Fiber</span>
                    <span className="font-bold text-xs text-[var(--text)]">{analyzedResult.fiber}</span>
                  </div>
                </div>

                {/* Fine Tune Toggle */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsFineTuning(!isFineTuning)}
                    className="text-[11px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>{isFineTuning ? "Hide Portion Adjustments" : "Fine-Tune Macros / Portion"}</span>
                  </button>
                </div>

                {/* Fine-Tuning Inputs */}
                {isFineTuning && (
                  <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-in fade-in">
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--text-muted)] block mb-1">
                        Calories (kcal)
                      </label>
                      <input
                        type="number"
                        value={editableKcal}
                        onChange={(e) => setEditableKcal(Number(e.target.value) || 0)}
                        className="w-full p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-xs text-[var(--text)] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--text-muted)] block mb-1">
                        Protein
                      </label>
                      <input
                        type="text"
                        value={editableProtein}
                        onChange={(e) => setEditableProtein(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-xs text-[var(--text)] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--text-muted)] block mb-1">
                        Carbs
                      </label>
                      <input
                        type="text"
                        value={editableCarbs}
                        onChange={(e) => setEditableCarbs(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-xs text-[var(--text)] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--text-muted)] block mb-1">
                        Fat
                      </label>
                      <input
                        type="text"
                        value={editableFat}
                        onChange={(e) => setEditableFat(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-xs text-[var(--text)] font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Itemized Portion Breakdown */}
              {analyzedResult.breakdown && analyzedResult.breakdown.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                    Calculated Portion Breakdown
                  </span>
                  <div className="space-y-1">
                    {analyzedResult.breakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                      >
                        <span className="font-medium text-[var(--text)]">
                          {item.item}{" "}
                          <span className="text-[10px] text-[var(--text-muted)]">({item.portion})</span>
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-[var(--primary)]">
                          {item.kcal} kcal • {item.protein} P
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Health Impact Note */}
              <div className="p-3 rounded-xl bg-[var(--primary-light)]/40 border border-[var(--primary-border)] text-xs text-[var(--text)] flex items-start gap-2">
                <Info className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Metabolic Impact:</strong> {analyzedResult.healthImpact}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            Cancel
          </button>

          {analyzedResult && (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Update Health Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
