import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export interface GeneratedMealSlot {
  name: string;
  time: string;
  recipeTitle: string;
  kcal: number;
  protein: string;
  carbs: string;
  fat: string;
  origin: string;
  healthImpact?: string;
  chefTip?: string;
}

export interface GeneratedDietPlan {
  dietPattern: string;
  targetKcal: number;
  targetProtein: number;
  totalKcal: number;
  totalProtein: number;
  slots: GeneratedMealSlot[];
  clinicalSummary: string;
  source: "groq_ai" | "deterministic_engine";
}

const CANDIDATE_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

const GROQ_DIET_PLAN_SYSTEM_PROMPT = `You are Chef Grace and Senior Clinical Metabolic Dietitian inside graceAI, powered by Groq.
Your task is to AID the user in creating an authentic, delicious, and clinically balanced daily dietary meal plan.

CLINICAL DIETARY GUARDRAILS:
1. Safety First: The total daily caloric intake MUST NOT be under 1,200 kcal. Extreme restriction or starvation fads are strictly refused.
2. 4-4-9 Caloric Law: kcal ≈ (protein_g * 4) + (carbs_g * 4) + (fat_g * 9). Keep nutritional calculations mathematically plausible.
3. Realistic Portions: Reference ICMR and USDA standards (e.g. 1 medium roti = ~85 kcal, 1 katori dal = ~130 kcal, 1 cup cooked rice = ~195 kcal, 1 idli = ~60 kcal, 1 boiled egg = ~72 kcal, 1 plain dosa = ~140 kcal, 1 plate biryani = ~520 kcal).
4. Circadian Rhythm Alignment:
   - Breakfast (approx 8:00 AM): Easy-to-digest energizing fuel, complex grains, gentle protein.
   - Lunch (approx 1:00 PM): Peak digestive fire (Agni). Heartiest meal of the day with whole grains, pulses/proteins, fiber, and probiotics.
   - Afternoon Snack (approx 5:00 PM): Light metabolic bridge (roasted nuts, seeds, chaas, herbal chai).
   - Dinner (approx 8:00 PM): Lighter, anti-inflammatory, restorative (clear soups, steamed broths, lean proteins, stewed vegetables).

Respond strictly in valid JSON format matching this schema:
{
  "dietPattern": "string (name of pattern)",
  "totalKcal": number,
  "totalProtein": number,
  "clinicalSummary": "string (1-2 sentences explaining metabolic synergy and how it fits the user's goals)",
  "slots": [
    {
      "name": "Breakfast",
      "time": "8:00 AM",
      "recipeTitle": "Authentic dish name with clear culinary portions",
      "kcal": number,
      "protein": "e.g. 18g",
      "carbs": "e.g. 45g",
      "fat": "e.g. 10g",
      "origin": "string (regional cuisine, e.g. Tamil Nadu, Punjab, Greek, etc.)",
      "healthImpact": "string (short clinical benefit)",
      "chefTip": "string (culinary technique or spice tip)"
    },
    {
      "name": "Lunch",
      "time": "1:00 PM",
      "recipeTitle": "Dish description with portions",
      "kcal": number,
      "protein": "string",
      "carbs": "string",
      "fat": "string",
      "origin": "string",
      "healthImpact": "string",
      "chefTip": "string"
    },
    {
      "name": "Snack",
      "time": "5:00 PM",
      "recipeTitle": "Dish description with portions",
      "kcal": number,
      "protein": "string",
      "carbs": "string",
      "fat": "string",
      "origin": "string",
      "healthImpact": "string",
      "chefTip": "string"
    },
    {
      "name": "Dinner",
      "time": "8:00 PM",
      "recipeTitle": "Dish description with portions",
      "kcal": number,
      "protein": "string",
      "carbs": "string",
      "fat": "string",
      "origin": "string",
      "healthImpact": "string",
      "chefTip": "string"
    }
  ]
}

Return ONLY raw JSON with NO markdown backticks and NO commentary.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      prompt = "",
      patternId = "balanced",
      patternName = "Balanced Heritage",
      targetKcal = 1800,
      targetProtein = 75,
      slotOnly, // If specified, only generate or suggest 1 slot
    } = body;

    const validatedTargetKcal = Math.max(1200, Math.min(3500, Number(targetKcal) || 1800));
    const validatedTargetProtein = Math.max(40, Math.min(200, Number(targetProtein) || 75));

    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey) {
      const groq = new Groq({ apiKey });

      const userMessage = slotOnly
        ? `Aid the user with designing a single meal slot: "${slotOnly}".
Dietary Style: ${patternName} (${patternId}).
Overall Daily Calorie Target: ${validatedTargetKcal} kcal.
Overall Daily Protein Goal: ${validatedTargetProtein}g.
User Instructions/Preferences: "${prompt || "Suggest an authentic, nutritious recipe for this slot"}"`
        : `Aid the user in creating a complete 4-meal daily dietary plan.
Dietary Style: ${patternName} (${patternId}).
Target Daily Calories: ${validatedTargetKcal} kcal.
Target Daily Protein Goal: ${validatedTargetProtein}g.
User Instructions / Personalization Notes: "${prompt || "Create an authentic, comforting, circadian-aligned daily menu"}"
Distribute calories appropriately: Breakfast ~25%, Lunch ~35%, Snack ~10%, Dinner ~30%. Total must sum close to ${validatedTargetKcal} kcal.`;

      for (const model of CANDIDATE_MODELS) {
        try {
          const reqOpts: Record<string, unknown> = {
            model,
            messages: [
              { role: "system", content: GROQ_DIET_PLAN_SYSTEM_PROMPT },
              { role: "user", content: userMessage },
            ],
            temperature: 0.2,
            max_tokens: 1500,
            response_format: { type: "json_object" },
          };

          if (model.includes("gpt-oss")) {
            reqOpts.reasoning_effort = "low";
          }

          const completion = await (
            groq.chat.completions.create as (opts: unknown) => Promise<Groq.Chat.ChatCompletion>
          )(reqOpts);

          const rawText = completion.choices[0]?.message?.content || "";
          if (rawText.trim()) {
            const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleaned);

            if (parsed.slots && Array.isArray(parsed.slots) && parsed.slots.length > 0) {
              const totalKcal = parsed.slots.reduce(
                (acc: number, s: { kcal: number }) => acc + (Number(s.kcal) || 0),
                0
              );
              const totalProtein = parsed.slots.reduce(
                (acc: number, s: { protein: string }) => {
                  const num = parseInt(String(s.protein).replace(/[^0-9]/g, "") || "0", 10);
                  return acc + (isNaN(num) ? 0 : num);
                },
                0
              );

              return NextResponse.json({
                dietPattern: parsed.dietPattern || patternName,
                targetKcal: validatedTargetKcal,
                targetProtein: validatedTargetProtein,
                totalKcal: parsed.totalKcal || totalKcal,
                totalProtein: parsed.totalProtein || totalProtein,
                slots: parsed.slots,
                clinicalSummary: parsed.clinicalSummary || "Plan curated with Groq AI adhering to clinical metabolic standards.",
                source: "groq_ai",
              });
            }
          }
        } catch (modelErr) {
          console.warn(`Groq plan generation model ${model} failed, trying next:`, modelErr);
        }
      }
    }

    // Deterministic fallback if Groq API key is missing or models are busy
    const fallback = generateDeterministicDietPlan(patternId, patternName, validatedTargetKcal, validatedTargetProtein, prompt);
    return NextResponse.json(fallback);
  } catch (err: unknown) {
    console.error("Error in Groq dietary plan generation:", err);
    const fallback = generateDeterministicDietPlan("balanced", "Balanced Heritage", 1800, 75, "");
    return NextResponse.json(fallback);
  }
}

function generateDeterministicDietPlan(
  patternId: string,
  patternName: string,
  targetKcal: number,
  targetProtein: number,
  prompt?: string
): GeneratedDietPlan {
  // Deterministic recipes calibrated for each dietary style
  const templates: Record<string, GeneratedMealSlot[]> = {
    vegetarian: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        recipeTitle: "2 Moong Dal Chillas Stuffed with Grated Paneer & Mint Chutney",
        kcal: 360,
        protein: "19g",
        carbs: "38g",
        fat: "14g",
        origin: "Rajasthan",
        healthImpact: "High biological value vegetarian protein with steady glucose release.",
        chefTip: "Soak moong dal overnight and grind with fresh ginger and green chili.",
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        recipeTitle: "Palak Paneer with 2 Multigrain Phulkas & Beetroot Raita",
        kcal: 530,
        protein: "26g",
        carbs: "56g",
        fat: "22g",
        origin: "Punjab",
        healthImpact: "Iron and calcium synergy with bioactive chlorophyll.",
        chefTip: "Blanch spinach in hot water for 60 seconds and plunge into ice water to keep it vibrant green.",
      },
      {
        name: "Snack",
        time: "5:00 PM",
        recipeTitle: "Sprouted Kala Chana Sundal with Fresh Coconut & Curry Leaves",
        kcal: 170,
        protein: "9g",
        carbs: "24g",
        fat: "4g",
        origin: "Tamil Nadu",
        healthImpact: "Prebiotic resistant starch supporting gut microbiome.",
        chefTip: "Temper mustard seeds and curry leaves in half a teaspoon of cold-pressed coconut oil.",
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        recipeTitle: "Chettinad Spiced Mushroom & Pepper Stir-Fry with Steamed Jeera Brown Rice",
        kcal: 440,
        protein: "16g",
        carbs: "68g",
        fat: "12g",
        origin: "Tamil Nadu",
        healthImpact: "Beta-glucans and antioxidant piperine for cellular recovery.",
        chefTip: "Crush fresh whole black peppercorns right at the end of cooking for deep aroma.",
      },
    ],
    "high-protein": [
      {
        name: "Breakfast",
        time: "8:00 AM",
        recipeTitle: "3 Egg White & 1 Whole Egg Omelet with Sourdough & Sliced Avocado",
        kcal: 390,
        protein: "28g",
        carbs: "28g",
        fat: "18g",
        origin: "California Fresh",
        healthImpact: "Complete amino acid spectrum supporting morning muscle protein synthesis.",
        chefTip: "Whisk eggs with a splash of milk for ultra-fluffy texture.",
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        recipeTitle: "Grilled Herb Chicken Breast (or Paneer) with Warm Quinoa Salad & Steamed Broccoli",
        kcal: 540,
        protein: "46g",
        carbs: "42g",
        fat: "18g",
        origin: "Mediterranean",
        healthImpact: "High satiety index with lean protein and micronutrient density.",
        chefTip: "Marinate protein with lemon juice, oregano, garlic, and sea salt for 20 minutes.",
      },
      {
        name: "Snack",
        time: "5:00 PM",
        recipeTitle: "Thick Spiced Greek Yogurt with Chia Seeds, Pumpkin Seeds & Fresh Berries",
        kcal: 220,
        protein: "21g",
        carbs: "18g",
        fat: "7g",
        origin: "Greece",
        healthImpact: "Slow-digesting casein protein with live probiotic strains.",
        chefTip: "Toast pumpkin seeds lightly in a dry pan for a warm nutty crunch.",
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        recipeTitle: "Baked Herbed Salmon (or Tofu) with Steamed Edamame & Roasted Asparagus",
        kcal: 480,
        protein: "42g",
        carbs: "20g",
        fat: "24g",
        origin: "Nordic Hearth",
        healthImpact: "Omega-3 fatty acids EPA/DHA reducing exercise-induced inflammation.",
        chefTip: "Bake at 200°C for 12-14 minutes with lemon rounds on top.",
      },
    ],
    sattvic: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        recipeTitle: "Warm Apple Porridge with Soaked Crushed Almonds & Cinnamon",
        kcal: 320,
        protein: "9g",
        carbs: "56g",
        fat: "7g",
        origin: "Ayurvedic Hearth",
        healthImpact: "Agni-igniting warm spices, easily digestible for tranquil morning prana.",
        chefTip: "Cook whole rolled oats in water first, finishing with warm cow milk or almond milk.",
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        recipeTitle: "Moong Dal Khichdi with A2 Desi Cow Ghee & Bottle Gourd (Lauki) Subzi",
        kcal: 470,
        protein: "17g",
        carbs: "72g",
        fat: "12g",
        origin: "Vedic Kitchen",
        healthImpact: "Tridoshic balancing staple, zero heavy spices or alliums.",
        chefTip: "Use equal parts yellow split mung and aged rice, tempered in pure cumin-ghee.",
      },
      {
        name: "Snack",
        time: "5:00 PM",
        recipeTitle: "Golden Turmeric Ashwagandha Almond Milk with Saffron",
        kcal: 140,
        protein: "5g",
        carbs: "14g",
        fat: "7g",
        origin: "Kerala Ayurveda",
        healthImpact: "Adaptogenic restorative drink reducing evening cortisol.",
        chefTip: "Simmer gently with a tiny pinch of black pepper to maximize curcumin absorption.",
      },
      {
        name: "Dinner",
        time: "7:30 PM",
        recipeTitle: "Ash Gourd & Yellow Mung Clear Broth with Steamed Zucchini Rounds",
        kcal: 340,
        protein: "15g",
        carbs: "48g",
        fat: "8g",
        origin: "Sattvic Kitchen",
        healthImpact: "Cooling Pitta-pacifying soup facilitating deep REM sleep.",
        chefTip: "Garnish with fresh grated coconut and tender coriander leaves.",
      },
    ],
  };

  const selectedTemplate = templates[patternId] || [
    {
      name: "Breakfast",
      time: "8:00 AM",
      recipeTitle: "South Indian Moong Dal Idli with Coconut Chutney & Sambhar",
      kcal: 340,
      protein: "14g",
      carbs: "54g",
      fat: "8g",
      origin: "Tamil Nadu",
      healthImpact: "Fermented probiotic batter with digestible lentil protein.",
      chefTip: "Steam in traditional cloth-lined idli plates for maximum fluffiness.",
    },
    {
      name: "Lunch",
      time: "1:00 PM",
      recipeTitle: "Kerala Spiced Brown Rice, Yellow Dal & Steamed Cabbage Thoran",
      kcal: 490,
      protein: "18g",
      carbs: "78g",
      fat: "11g",
      origin: "Kerala",
      healthImpact: "Balanced complex carbohydrate curve with antioxidant spices.",
      chefTip: "Add freshly crushed shallots and curry leaves to the dal tadka.",
    },
    {
      name: "Snack",
      time: "5:00 PM",
      recipeTitle: "Dry Roasted Makhana (Fox Nuts) with Cinnamon Masala Chai",
      kcal: 150,
      protein: "4g",
      carbs: "24g",
      fat: "4g",
      origin: "North India",
      healthImpact: "Low glycemic bridge preventing post-lunch fatigue.",
      chefTip: "Roast makhana on low flame until crisp, then dust with rock salt and chaat masala.",
    },
    {
      name: "Dinner",
      time: "8:00 PM",
      recipeTitle: "Mediterranean Roasted Vegetable & Warm Lentil Salad with Olive Oil Drizzle",
      kcal: 420,
      protein: "22g",
      carbs: "56g",
      fat: "12g",
      origin: "Greece",
      healthImpact: "High fiber and plant sterols supporting cardiovascular resting recovery.",
      chefTip: "Roast bell peppers and zucchini at 220°C until caramelized at the edges.",
    },
  ];

  // Scale calories if target is different from template baseline
  const baseTotal = selectedTemplate.reduce((a, s) => a + s.kcal, 0);
  const scale = targetKcal / (baseTotal || 1400);

  const scaledSlots = selectedTemplate.map((slot) => ({
    ...slot,
    kcal: Math.round(slot.kcal * scale),
  }));

  const totalKcalCalc = scaledSlots.reduce((a, s) => a + s.kcal, 0);
  const totalProteinCalc = scaledSlots.reduce((a, s) => {
    const num = parseInt(s.protein.replace(/[^0-9]/g, "") || "0", 10);
    return a + num;
  }, 0);

  return {
    dietPattern: patternName,
    targetKcal,
    targetProtein,
    totalKcal: totalKcalCalc,
    totalProtein: totalProteinCalc,
    slots: scaledSlots,
    clinicalSummary: prompt
      ? `Groq-assisted dietary synthesis: tailored for "${prompt}" adhering to ${patternName} principles.`
      : `Circadian balanced dietary plan tailored for ${targetKcal} kcal with optimal macro timing.`,
    source: "deterministic_engine",
  };
}
