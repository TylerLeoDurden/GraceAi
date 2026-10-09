import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

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
}

const NUTRITION_SYSTEM_PROMPT = `You are a clinical-grade metabolic nutritionist and culinary expert inside graceAI.
Your role is to accurately estimate calories and macronutrients for food descriptions entered by users (especially Indian regional home food, Asian, Mediterranean, and global cuisines).

CRITICAL ACCURACY RULES:
1. Estimate portions realistically based on household measures (e.g. 1 katori dal = ~150g = ~120-140 kcal; 1 standard roti = ~80-100 kcal; 1 medium paratha with ghee/butter = ~220-280 kcal; 1 plate biryani = ~450-550 kcal; 1 cup cooked rice = ~200 kcal).
2. Calculate total kcal, protein (grams), carbs (grams), fat (grams), and dietary fiber (grams).
3. Identify cuisine origin (e.g. "South India", "Punjab", "Italy", "Levantine", "Global").
4. Return ONLY a single, valid JSON object with NO surrounding markdown backticks and NO commentary.

JSON FORMAT SCHEMA:
{
  "recipeTitle": "Clean Concise Title (e.g., 2 Paneer Parathas with Curd)",
  "kcal": 520,
  "protein": "18g",
  "carbs": "54g",
  "fat": "24g",
  "fiber": "6g",
  "origin": "North India",
  "confidence": "high",
  "breakdown": [
    { "item": "Paneer Paratha", "portion": "2 medium pcs", "kcal": 420, "protein": "14g" },
    { "item": "Plain Curd / Dahi", "portion": "1 katori (150g)", "kcal": 100, "protein": "4g" }
  ],
  "healthImpact": "Rich in bioavailable calcium and complex carbs; sustains afternoon fullness.",
  "suggestions": "Add sliced cucumbers or mint chutney for extra hydration and digestive enzymes."
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mealText, slot = "Meal", targetKcal } = body;

    if (!mealText || typeof mealText !== "string" || !mealText.trim()) {
      return NextResponse.json(
        { error: "Please enter what you ate." },
        { status: 400 }
      );
    }

    const userEntry = mealText.trim();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Fallback deterministic estimator if no API key
      return NextResponse.json(fallbackEstimation(userEntry, slot));
    }

    const groq = new Groq({ apiKey });

    const userPrompt = `Analyze the following meal entered for ${slot}:
"${userEntry}"
Target slot calories if applicable: ${targetKcal || "Standard balanced slot (~400-500 kcal)"}.

Break down the dishes, estimate portion sizes, compute calories and macros, and provide a single JSON response.`;

    let content = "";
    try {
      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: NUTRITION_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2, // Low temperature for consistent numeric calculations
        max_tokens: 800,
        response_format: { type: "json_object" },
      });
      content = completion.choices[0]?.message?.content || "";
    } catch (modelErr) {
      console.warn("Primary model failed in nutrition analysis, trying fallback:", modelErr);
      const completion = await groq.chat.completions.create({
        model: "qwen/qwen3.8-27b",
        messages: [
          { role: "system", content: NUTRITION_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 800,
      });
      content = completion.choices[0]?.message?.content || "";
    }

    // Clean JSON response
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed: AnalyzedMeal = JSON.parse(cleaned);

    // Validate fields and ensure numbers are valid
    const kcal = Number(parsed.kcal) || 400;
    const recipeTitle = parsed.recipeTitle || userEntry;
    const protein = parsed.protein?.includes("g") ? parsed.protein : `${parsed.protein || 15}g`;
    const carbs = parsed.carbs?.includes("g") ? parsed.carbs : `${parsed.carbs || 50}g`;
    const fat = parsed.fat?.includes("g") ? parsed.fat : `${parsed.fat || 14}g`;
    const fiber = parsed.fiber?.includes("g") ? parsed.fiber : `${parsed.fiber || 5}g`;

    return NextResponse.json({
      recipeTitle,
      kcal,
      protein,
      carbs,
      fat,
      fiber,
      origin: parsed.origin || "Home Kitchen",
      confidence: parsed.confidence || "high",
      breakdown: Array.isArray(parsed.breakdown) ? parsed.breakdown : [],
      healthImpact: parsed.healthImpact || "Nutritious home-cooked meal.",
      suggestions: parsed.suggestions || "Pair with gentle hydration throughout the afternoon.",
    });
  } catch (error: unknown) {
    console.error("AI Nutrition Analysis Error:", error);
    // Graceful fallback estimation so user is never blocked
    const body = await req.json().catch(() => ({}));
    const fallback = fallbackEstimation(body.mealText || "Custom Meal", body.slot || "Meal");
    return NextResponse.json(fallback);
  }
}

/**
 * Deterministic heuristic estimation if model is offline or unreachable
 */
function fallbackEstimation(text: string, slot: string): AnalyzedMeal {
  const lower = text.toLowerCase();
  let kcal = 420;
  let protein = "16g";
  let carbs = "54g";
  let fat = "14g";
  let fiber = "6g";
  let origin = "Home Kitchen";

  if (lower.includes("dosa") || lower.includes("idli") || lower.includes("sambar")) {
    origin = "South India";
    kcal = lower.includes("dosa") ? 380 : 310;
    protein = "12g";
  } else if (lower.includes("roti") || lower.includes("chapati") || lower.includes("dal")) {
    origin = "North India";
    kcal = 440;
    protein = "18g";
  } else if (lower.includes("biryani") || lower.includes("pulao")) {
    origin = "Indian Regional";
    kcal = 540;
    protein = "20g";
  } else if (lower.includes("salad") || lower.includes("soup")) {
    origin = "Global Healthy";
    kcal = 280;
    protein = "14g";
  } else if (lower.includes("chicken") || lower.includes("fish") || lower.includes("egg")) {
    origin = "High Protein Kitchen";
    kcal = 480;
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
  };
}
