"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Loader2,
  Check,
  Utensils,
  Flame,
  Info,
  RotateCcw,
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
  const [mealText, setMealText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<AnalyzedMeal | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

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
      setAnalyzedResult(data);
    } catch (err) {
      console.error("Meal analysis error:", err);
      setErrorMsg("Failed to analyze meal. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (!analyzedResult) return;

    onSaveMeal({
      recipeTitle: analyzedResult.recipeTitle,
      kcal: analyzedResult.kcal,
      protein: analyzedResult.protein,
      carbs: analyzedResult.carbs,
      fat: analyzedResult.fat,
      fiber: analyzedResult.fiber,
      origin: analyzedResult.origin,
      healthImpact: analyzedResult.healthImpact,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="max-w-xl w-full max-h-[90vh] bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
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
                Enter Custom Meal
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
            <label className="text-xs font-semibold text-[var(--text)] block">
              Describe what you ate (or want to cook):
            </label>
            <textarea
              rows={3}
              value={mealText}
              onChange={(e) => setMealText(e.target.value)}
              placeholder="e.g. 2 butter rotis with 1 katori dal tadka, roasted papad and sliced onions"
              className="w-full p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-all resize-none"
            />
            {errorMsg && (
              <p className="text-xs text-[var(--danger)] font-medium">{errorMsg}</p>
            )}
          </div>

          {/* Quick Example Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-[var(--text-muted)] block">
              Or tap an example to test:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_MEALS.slice(0, 4).map((ex) => (
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
            className="w-full py-3 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Grace AI is estimating portions & calories...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Calculate Calories & Macros with AI</span>
              </>
            )}
          </button>

          {/* AI Analysis Result Card */}
          {analyzedResult && (
            <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--primary)]">
                    Calculated by Grace AI • {analyzedResult.origin}
                  </span>
                  <h4 className="font-serif text-lg font-semibold text-[var(--text)] mt-0.5">
                    {analyzedResult.recipeTitle}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-serif text-2xl font-bold text-[var(--primary)]">
                    {analyzedResult.kcal}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] block">kcal</span>
                </div>
              </div>

              {/* Macro Pills */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">Protein</span>
                  <span className="font-bold text-xs text-[var(--primary)]">{analyzedResult.protein}</span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">Carbs</span>
                  <span className="font-bold text-xs text-[var(--accent)]">{analyzedResult.carbs}</span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">Fat</span>
                  <span className="font-bold text-xs text-[var(--warning)]">{analyzedResult.fat}</span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">Fiber</span>
                  <span className="font-bold text-xs text-[var(--text)]">{analyzedResult.fiber}</span>
                </div>
              </div>

              {/* Itemized Breakdown */}
              {analyzedResult.breakdown && analyzedResult.breakdown.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                    Portion Breakdown
                  </span>
                  <div className="space-y-1">
                    {analyzedResult.breakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
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
              <span>Apply & Update Daily Health Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
