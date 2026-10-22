import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  getCachedOrCanonicalNutrition,
  calculateFromCanonicalDatabase,
  cacheDishNutrition,
  DishNutritionResult,
} from "@/lib/dish-nutrition";

export interface AnalyzedMeal {
  isFood?: boolean;
  error?: string;
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

const NUTRITION_SYSTEM_PROMPT = `You are a clinical-grade metabolic nutritionist, culinary expert, and food validator inside graceAI.
Your role has TWO MANDATORY RESPONSIBILITIES for every user input:

STEP 1: FOOD VALIDATION & ENTITY CLASSIFICATION (CRITICAL)
Determine if the user's input is a legitimate, edible food, beverage, ingredient, recipe, or meal.
- If the input is a PERSON'S NAME (e.g. user's own name, friend's name, historical/celebrity name like "Sudhakar", "Tyler", "John", "Grace", "Priya", "Rahul", "Alex"), a human being, an animal or pet (e.g. "dog", "cat", "hamster"), an inanimate non-food object (e.g. "phone", "iPhone", "laptop", "shoe", "table", "car"), a geographic place, a concept, or random nonsense / gibberish (e.g. "asdfghjkl", "12345"):
  IT IS NOT FOOD. People and non-food items CANNOT be eaten and do NOT contain culinary calories.
- If it is NOT an edible food or drink:
  You MUST return "isFood": false.
  Set "error": A polite, friendly explanation mentioning why the input cannot be logged as food (e.g., "'[Input]' is a person's name / non-food item, not an edible meal or drink. Please enter what you ate!").
  Do NOT invent or calculate calories or macronutrients.

STEP 2: CLINICAL NUTRITIONAL CALCULATION (ONLY IF isFood IS TRUE)
If and only if the input is genuine, edible food or drink:
- Set "isFood": true.
- Base calculations strictly on standardized clinical food composition tables (ICMR and USDA):
  - 1 medium whole wheat roti / phulka (30g flour) = ~85 kcal (3g P, 18g C, 0.5g F).
  - 1 katori cooked dal (150g) = ~130 kcal (7g P, 18g C, 3.5g F).
  - 1 cup cooked white rice (150g) = ~195 kcal (4g P, 43g C, 0.5g F).
  - 1 cup cooked brown rice (150g) = ~175 kcal (4g P, 36g C, 1.5g F).
  - 1 plain paratha = ~180 kcal; 1 paneer paratha = ~250 kcal; 1 aloo paratha = ~220 kcal.
  - 1 plain dosa = ~140 kcal; 1 idli = ~60 kcal; 1 katori sambar = ~85 kcal.
  - 1 plate chicken biryani (350g) = ~520 kcal (28g P, 62g C, 16g F).
  - 1 large boiled egg = ~72 kcal (6.3g P, 0.4g C, 5g F).
  - 1 cup whole milk (240ml) = ~150 kcal; 1 cup chai with milk & sugar = ~85 kcal.
- 4-4-9 CALORIC INTEGRITY LAW: Total kcal ≈ (protein_grams * 4) + (carbs_grams * 4) + (fat_grams * 9).
- Return realistic breakdown, origin cuisine, health impact, and suggestion.

Return ONLY a single valid JSON object with NO markdown backticks and NO commentary.

JSON FORMAT SCHEMA:
When isFood is false:
{
  "isFood": false,
  "error": "Explanation of why this cannot be logged as food, and guidance to enter a real dish."
}

When isFood is true:
{
  "isFood": true,
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

const CANDIDATE_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mealText, slot = "Meal" } = body;

    if (!mealText || typeof mealText !== "string" || !mealText.trim()) {
      return NextResponse.json(
        { isFood: false, error: "Please describe what you ate or plan to eat." },
        { status: 400 }
      );
    }

    const userEntry = mealText.trim();

    // 1. Check Canonical Nutritional Database & Query Cache first
    // This guarantees deterministic, 100% reproducible results for established dishes
    const cachedOrCanonical = getCachedOrCanonicalNutrition(userEntry);
    if (cachedOrCanonical) {
      return NextResponse.json({ ...cachedOrCanonical, isFood: true });
    }

    // 2. If not matched in canonical database, consult Groq AI
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      const fallback = fallbackEstimation(userEntry, slot);
      const statusCode = fallback.isFood === false ? 422 : 200;
      return NextResponse.json(fallback, { status: statusCode });
    }

    const groq = new Groq({ apiKey });

    let content = "";
    for (const model of CANDIDATE_MODELS) {
      try {
        const reqOpts: Record<string, unknown> = {
          model,
          messages: [
            { role: "system", content: NUTRITION_SYSTEM_PROMPT },
            { role: "user", content: `Analyze the following input:\n"${userEntry}"` },
          ],
          temperature: 0, // Deterministic zero-temperature
          max_tokens: 800,
          response_format: { type: "json_object" },
        };

        if (model.includes("gpt-oss")) {
          reqOpts.reasoning_effort = "low";
        }

        const completion = await (
          groq.chat.completions.create as (opts: unknown) => Promise<Groq.Chat.ChatCompletion>
        )(reqOpts);
        content = completion.choices[0]?.message?.content || "";
        if (content.trim()) break;
      } catch (modelErr) {
        console.warn(`Groq model ${model} failed in nutrition analysis, trying next:`, modelErr);
      }
    }

    if (!content.trim()) {
      const fallback = fallbackEstimation(userEntry, slot);
      const statusCode = fallback.isFood === false ? 422 : 200;
      return NextResponse.json(fallback, { status: statusCode });
    }

    // Clean JSON response
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // If Groq detected that this is NOT food (e.g. person's name, non-food object, animal, gibberish)
    if (parsed.isFood === false) {
      return NextResponse.json(
        {
          isFood: false,
          error:
            parsed.error ||
            `"${userEntry}" appears to be a person's name or non-food item, not an edible dish or beverage. Please enter what you ate!`,
        },
        { status: 422 }
      );
    }

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
      isFood: true,
      recipeTitle,
      kcal,
      protein: `${Math.round(proteinNum)}g`,
      carbs: `${Math.round(carbsNum)}g`,
      fat: `${Math.round(fatNum)}g`,
      fiber: `${Math.round(fiberNum)}g`,
      origin: parsed.origin || "Home Kitchen",
      confidence: parsed.confidence || "high",
      breakdown:
        Array.isArray(parsed.breakdown) && parsed.breakdown.length > 0
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
    const statusCode = fallback.isFood === false ? 422 : 200;
    return NextResponse.json(fallback, { status: statusCode });
  }
}

/**
 * Deterministic heuristic estimation if Groq models are offline or unreachable
 */
function fallbackEstimation(
  text: string,
  slot: string
): { isFood: false; error: string } | AnalyzedMeal {
  const canonical = calculateFromCanonicalDatabase(text);
  if (canonical) {
    return { ...canonical, isFood: true };
  }

  // Common food lexicon to detect if text could plausibly be edible food/beverage
  const FOOD_KEYWORDS = [
    "roti", "phulka", "chapati", "paratha", "thepla", "naan", "kulcha", "puri", "poori", "bread", "toast",
    "rice", "chawal", "biryani", "pulao", "khichdi", "curd rice", "poha", "upma", "oats", "oatmeal", "porridge",
    "dosa", "idli", "vada", "chilla", "cheela", "sambar", "rasam",
    "dal", "daal", "dhal", "tadka", "makhani", "chole", "chana", "rajma", "curry", "subzi", "sabji", "korma",
    "paneer", "tofu", "egg", "eggs", "omelette", "bhurji", "chicken", "mutton", "fish", "meat", "pork", "beef",
    "salad", "soup", "broth", "chaat", "sprouts", "makhana", "seeds", "nuts", "almonds",
    "tea", "chai", "coffee", "milk", "chaas", "buttermilk", "lassi", "juice", "smoothie", "water",
    "pasta", "pizza", "burger", "sandwich", "wrap", "roll", "taco", "burrito", "noodle", "noodles",
    "fruit", "apple", "banana", "orange", "mango", "berry", "berries", "yogurt", "curd", "dahi", "cheese",
    "katori", "bowl", "plate", "cup", "glass", "slice", "piece", "serving", "grams", "gm", "spoon", "tbsp", "tsp"
  ];

  const lower = text.toLowerCase().trim();
  const words = lower.split(/[\s,+/&.-]+/).filter(Boolean);
  const hasFoodKeyword = words.some((w) => FOOD_KEYWORDS.includes(w));

  // If no food keywords are present, do NOT invent calories for non-food items or personal names!
  if (!hasFoodKeyword) {
    return {
      isFood: false,
      error: `"${text}" does not appear to be an edible food or drink. People, personal names, and non-food items cannot be logged as calories. Please enter what you ate!`,
    };
  }

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
    isFood: true,
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
