import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  getCachedOrCanonicalNutrition,
  calculateFromCanonicalDatabase,
  cacheDishNutrition,
  DishNutritionResult,
} from "@/lib/dish-nutrition";

export interface AnalyzedMeal {
  recipeTitle: string;
  kcal: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  origin: string;
  confidence: "high" | "medium" | "estimated";
  breakdown: Array<{
    item: string;
    portion: string;
    kcal: number;
    protein: string;
  }>;
  healthImpact: string;
  suggestions: string;
  source?: "canonical_database" | "deterministic_cache" | "ai_verified";
}

const NUTRITION_SYSTEM_PROMPT = `You are a clinical-grade metabolic nutritionist and culinary expert inside graceAI.
Your role is to calculate calories and macronutrients for food descriptions entered by users.

CRITICAL ACCURACY & DETERMINISM RULES:
1. Base calculations strictly on standardized clinical food composition tables (ICMR and USDA):
   - 1 medium whole wheat roti / phulka (30g flour) = ~85 kcal (3g P, 18g C, 0.5g F).
   - 1 katori cooked dal (150g) = ~130 kcal (7g P, 18g C, 3.5g F).
   - 1 cup cooked white rice (150g) = ~195 kcal (4g P, 43g C, 0.5g F).
   - 1 cup cooked brown rice (150g) = ~175 kcal (4g P, 36g C, 1.5g F).
   - 1 plain paratha = ~180 kcal; 1 paneer paratha = ~250 kcal; 1 aloo paratha = ~220 kcal.
   - 1 plain dosa = ~140 kcal; 1 idli = ~60 kcal; 1 katori sambar = ~85 kcal.
   - 1 plate chicken biryani (350g) = ~520 kcal (28g P, 62g C, 16g F).
   - 1 large boiled egg = ~72 kcal (6.3g P, 0.4g C, 5g F).
   - 1 cup whole milk (240ml) = ~150 kcal; 1 cup chai with milk & sugar = ~85 kcal.
2. The 4-4-9 CALORIC INTEGRITY LAW:
   The total kcal MUST mathematically match the macros:
   Total kcal ≈ (protein_grams * 4) + (carbs_grams * 4) + (fat_grams * 9).
3. Do NOT invent random numbers or vary numbers based on meal slot or time. A dish contains the exact same calories regardless of when it is consumed.
4. Return ONLY a single, valid JSON object with NO markdown backticks and NO commentary.

JSON FORMAT SCHEMA:
{
  "recipeTitle": "Concise Dish Title (e.g. 2 Rotis with Dal Tadka)",
  "kcal": 335,
  "protein": "15g",
  "carbs": "59g",
  "fat": "5g",
  "fiber": "10g",
  "origin": "North India",
  "confidence": "high",
  "breakdown": [
    { "item": "Roti / Phulka", "portion": "2 medium pcs", "kcal": 170, "protein": "6g" },
    { "item": "Dal Tadka", "portion": "1 katori (150g)", "kcal": 130, "protein": "7g" }
  ],
  "healthImpact": "Balanced whole-food macronutrient distribution supporting stable metabolic energy.",
  "suggestions": "Pair with a fresh green salad for added dietary enzymes and hydration."
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mealText, slot = "Meal" } = body;

    if (!mealText || typeof mealText !== "string" || !mealText.trim()) {
      return NextResponse.json(
        { error: "Please enter what you ate." },
        { status: 400 }
      );
    }

    const userEntry = mealText.trim();

    // 1. Check Canonical Nutritional Database & Query Cache first
    // This guarantees deterministic, 100% reproducible results for the same dish
    const cachedOrCanonical = getCachedOrCanonicalNutrition(userEntry);
    if (cachedOrCanonical) {
      return NextResponse.json(cachedOrCanonical);
    }

    // 2. If not matched in canonical database, consult AI with temperature: 0
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      const fallback = fallbackEstimation(userEntry, slot);
      return NextResponse.json(fallback);
    }

    const groq = new Groq({ apiKey });

    const userPrompt = `Analyze the following dish accurately:
"${userEntry}"

Provide realistic portion breakdown, accurate calories, and balanced macros following the 4-4-9 caloric rule.`;

    let content = "";
    try {
      // Use temperature 0 to ensure strict determinism (no sampling variance)
      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: NUTRITION_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0, // Deterministic zero-temperature
        max_tokens: 800,
        response_format: { type: "json_object" },
      });
      content = completion.choices[0]?.message?.content || "";
    } catch (modelErr) {
      console.warn("Primary model failed in nutrition analysis, trying fallback:", modelErr);
      try {
        const completion = await groq.chat.completions.create({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: NUTRITION_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0,
          max_tokens: 800,
          response_format: { type: "json_object" },
        });
        content = completion.choices[0]?.message?.content || "";
      } catch (fallbackErr) {
        console.warn("Secondary model failed, using deterministic heuristic:", fallbackErr);
        const fallback = fallbackEstimation(userEntry, slot);
        return NextResponse.json(fallback);
      }
    }

    // Clean JSON response
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed: Partial<AnalyzedMeal> = JSON.parse(cleaned);

    // Validate fields and ensure numbers are valid
    let kcal = Number(parsed.kcal) || 400;
    const recipeTitle = parsed.recipeTitle || userEntry;
    
    // Parse numeric macros
    const proteinNum = parseFloat(String(parsed.protein || "15").replace(/[^0-9.]/g, "")) || 15;
    const carbsNum = parseFloat(String(parsed.carbs || "50").replace(/[^0-9.]/g, "")) || 50;
    const fatNum = parseFloat(String(parsed.fat || "14").replace(/[^0-9.]/g, "")) || 14;
    const fiberNum = parseFloat(String(parsed.fiber || "5").replace(/[^0-9.]/g, "")) || 5;

    // Apply 4-4-9 caloric integrity check:
    // If parsed kcal deviates heavily from macros, re-sync to macro sum
    const macroKcal = Math.round(proteinNum * 4 + carbsNum * 4 + fatNum * 9);
    if (Math.abs(kcal - macroKcal) > 30) {
      kcal = macroKcal;
    }

    const analyzedResult: AnalyzedMeal = {
      recipeTitle,
      kcal,
      protein: `${Math.round(proteinNum)}g`,
      carbs: `${Math.round(carbsNum)}g`,
      fat: `${Math.round(fatNum)}g`,
      fiber: `${Math.round(fiberNum)}g`,
      origin: parsed.origin || "Home Kitchen",
      confidence: parsed.confidence || "high",
      breakdown: Array.isArray(parsed.breakdown) && parsed.breakdown.length > 0
        ? parsed.breakdown
        : [
            {
              item: recipeTitle,
              portion: "1 standard serving",
              kcal,
              protein: `${Math.round(proteinNum)}g`,
            },
          ],
      healthImpact: parsed.healthImpact || "Nutritious home-cooked meal supporting metabolic balance.",
      suggestions: parsed.suggestions || "Pair with gentle hydration throughout the afternoon.",
      source: "ai_verified",
    };

    // Store in persistent cache so repeating this exact dish always returns the exact same calculation
    cacheDishNutrition(userEntry, analyzedResult as DishNutritionResult);

    return NextResponse.json(analyzedResult);
  } catch (error: unknown) {
    console.error("AI Nutrition Analysis Error:", error);
    const body = await req.json().catch(() => ({}));
    const fallback = fallbackEstimation(body.mealText || "Custom Meal", body.slot || "Meal");
    return NextResponse.json(fallback);
  }
}

/**
 * Deterministic heuristic estimation if model is offline or unreachable
 */
function fallbackEstimation(text: string, slot: string): AnalyzedMeal {
  const canonical = calculateFromCanonicalDatabase(text);
  if (canonical) {
    return canonical;
  }

  const lower = text.toLowerCase();
  let kcal = 400;
  let protein = "16g";
  let carbs = "54g";
  let fat = "14g";
  let fiber = "6g";
  let origin = "Home Kitchen";

  if (lower.includes("dosa") || lower.includes("idli") || lower.includes("sambar")) {
    origin = "South India";
    kcal = lower.includes("dosa") ? 350 : 280;
    protein = "12g";
  } else if (lower.includes("roti") || lower.includes("chapati") || lower.includes("dal")) {
    origin = "North India";
    kcal = 380;
    protein = "16g";
  } else if (lower.includes("biryani") || lower.includes("pulao")) {
    origin = "Indian Regional";
    kcal = 520;
    protein = "22g";
  } else if (lower.includes("salad") || lower.includes("soup")) {
    origin = "Global Healthy";
    kcal = 220;
    protein = "12g";
  } else if (lower.includes("chicken") || lower.includes("fish") || lower.includes("egg")) {
    origin = "High Protein Kitchen";
    kcal = 440;
    protein = "32g";
  }

  return {
    recipeTitle: text.length > 50 ? `${text.slice(0, 47)}...` : text,
    kcal,
    protein,
    carbs,
    fat,
    fiber,
    origin,
    confidence: "estimated",
    breakdown: [
      {
        item: text,
        portion: "1 standard serving",
        kcal,
        protein,
      },
    ],
    healthImpact: `Estimated metabolic values for ${slot}. Provides wholesome macronutrients.`,
    suggestions: "Enjoy mindfully and allow 3-4 hours before your next eating window.",
    source: "deterministic_cache",
  };
}
