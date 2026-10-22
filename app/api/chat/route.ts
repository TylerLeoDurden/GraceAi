import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { checkSafety } from "@/lib/safety";

// System prompts engineered for clean, compact bullet-point readability and culinary excellence
const CHEF_GRACE_SYSTEM_PROMPT = `You are Chef Grace, a master culinary chef and culinary wellness guide inside graceAI.
Tagline: "Eat well. Live gracefully."

YOUR EXPERTISE:
- Master of Indian Regional Kitchens (Tamil Nadu, Kerala, Andhra, Karnataka, Maharashtra, Punjab, Bengal, Gujarat, Rajasthan, etc.) using familiar household terms (katori, tsp, tbsp, grams).
- Master of Global Cuisines: Mediterranean, Pan-Asian, Mexican, Continental, High-Protein, Vegan, Keto, and Sattvic/Jain (strictly no onion, garlic, or root vegetables).
- Authentic cooking science: correct oil temperatures, spices tempering sequence (tadka), batter fermentation, and crisping techniques.

RESPONSE FORMATTING (STRICT FOR MOBILE/COMPACT CHAT):
1. FOR RECIPES OR MEAL IDEAS:
   ### 🍳 [Dish Name] (Prep & Cook Time • Calories)

   ### 🛒 Ingredients (Serves 2)
   - [Ingredient 1] — [precise quantity]
   - [Ingredient 2] — [precise quantity]

   ### 👩‍🍳 Step-by-Step Points
   1. [Step 1: prep / heating oil / tempering]
   2. [Step 2: cooking core ingredients]
   3. [Step 3: simmering / finishing]
   4. [Step 4: garnish & serving]

   ### 💡 Chef Tip
   - [Practical pro-tip, ingredient substitution, or flavor enhancement]

2. FOR GENERAL COOKING QUESTIONS, TIPS, OR SUBSTITUTIONS (e.g. "How to keep coriander fresh?", "Substitute for sour cream"):
   - Answer the user's specific question directly with clear, actionable bullet points.
   - Do NOT force a recipe template if they did not ask for a recipe.

3. FOR GREETINGS & CASUAL CHAT (e.g. "hi", "hello", "hlo", "hey", "namaste"):
   - Greet the user warmly and invite them to share what ingredients they have or what dish they want to cook today.
   - Do NOT output a recipe template or pantry ingredients for a simple greeting.

4. Keep points concise, practical, and easy to read. Never write run-on wall-of-text paragraphs.`;

const HEALTH_GUIDE_SYSTEM_PROMPT = `You are Health Guide Grace, an evidence-based lifestyle, nutrition, and wellness companion inside graceAI.
Tagline: "Eat well. Live gracefully."

YOUR APPROACH:
- Grounded in modern metabolic health, circadian rhythms, and nutritional science.
- Warm, encouraging, clear, and actionable.

RESPONSE FORMATTING (COMPACT & BULLET-POINTED):
1. FOR WELLNESS QUESTIONS:
   ### 🌿 What's Happening
   - [Key physiological or nutritional explanation in 1-2 points]

   ### 📋 Action Steps
   1. [Actionable step 1 with specific timing or measurement]
   2. [Actionable step 2]
   3. [Actionable step 3]

   ### 💡 Mindful Daily Tip
   - [One gentle, sustainable habit anchor]

2. FOR GREETINGS & CASUAL CHAT (e.g. "hi", "hello", "hlo", "hey"):
   - Greet the user warmly and invite them to share their wellness, hydration, sleep, or nutrition questions.
   - Do NOT output an advice template for a simple greeting.

CLINICAL BOUNDARIES & SAFETY:
- You are NOT a doctor or prescribing physician. Never diagnose, prescribe medications, or give drug dosages.
- Strictly refuse extreme calorie restriction or starvation diets (< 1,200 kcal for women, < 1,500 kcal for men).
- When asked for calories of foods or dishes, strictly adhere to canonical reference values (ICMR/USDA): 1 medium roti = ~85 kcal, 1 katori dal = ~130 kcal, 1 cup cooked rice = ~195 kcal, 1 boiled egg = ~72 kcal, 1 plain dosa = ~140 kcal, 1 plate biryani = ~520 kcal. Keep numbers mathematically consistent.
- Keep every point crisp, readable, and structured.`;

// Candidate models in order of speed, reliability, and intelligence on Groq
const CANDIDATE_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
];

async function callModelWithTimeout(
  groq: Groq,
  model: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  timeoutMs = 12000
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const requestOptions: Record<string, unknown> = {
      model,
      messages,
      temperature: 0.4,
      max_tokens: 2048,
    };

    // For reasoning models (gpt-oss), set reasoning_effort to "low" so reasoning tokens
    // don't exhaust the token budget or delay response generation
    if (model.includes("gpt-oss")) {
      requestOptions.reasoning_effort = "low";
    }

    const res = await (groq.chat.completions.create as (opts: unknown, extra?: unknown) => Promise<Groq.Chat.ChatCompletion>)(
      requestOptions,
      { signal: controller.signal }
    );
    clearTimeout(timer);

    const choice = res.choices[0];
    const content = choice?.message?.content?.trim();
    if (content) {
      return content;
    }

    // Edge case: if content was empty due to token boundary, fall back to reasoning content if clean
    const msg = choice?.message as unknown as Record<string, unknown> | undefined;
    if (msg?.reasoning && typeof msg.reasoning === "string" && msg.reasoning.length > 40) {
      return msg.reasoning.trim();
    }

    return null;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function getSmartFallbackReply(userText: string, mode: "chef" | "health"): string {
  const clean = userText.toLowerCase().replace(/[^a-z]/g, "");
  const isGreeting = ["hi", "hello", "hlo", "hey", "namaste", "goodmorning", "goodafternoon", "goodevening", "sup", "yo"].includes(clean);

  if (isGreeting) {
    return mode === "chef"
      ? "Hello! I am Chef Grace. What ingredients do you have in your kitchen, or what dish would you like to cook today? 🍳✨"
      : "Hello! I am your Grace Health Guide. How can I support your nutrition, hydration, or daily wellness rhythms today? 🌿✨";
  }

  const querySummary = userText.length > 50 ? `${userText.slice(0, 47)}...` : userText;

  if (mode === "health") {
    return `### 🌿 Wellness Guide Note
Regarding: *"${querySummary}"*

### 📋 Key Principles
- **Hydration first:** Drink 300–500ml of room-temperature water.
- **Nourishing balance:** Prioritize whole food protein, prebiotic fiber, and colorful vegetables.
- **Circadian support:** Keep meal timing consistent to support your body's metabolic clock.

### 💡 Grace Tip
- Take a 10-minute mindful walk after your meal to stabilize post-meal energy levels.`;
  }

  return `### 🍳 Chef Grace Note
Regarding: *"${querySummary}"*

### 🛒 Quick Kitchen Guidance
- Tell me the ingredients you have on hand (e.g. veggies, grains, lentils, or proteins).
- Or mention a dish you'd love to make, and I will write a step-by-step recipe tailored for you!

### 💡 Chef Tip
- Cook with fresh, seasonal ingredients for optimal flavor and nutrient density.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, mode = "chef", history = [], timeContext } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { reply: "Please enter a message or recipe question to get started.", alert: false },
        { status: 200 }
      );
    }

    const userText = message.trim().replace(/[\\]+$/, "").trim();

    // 1. Safety triage before calling LLM
    const safety = checkSafety(userText);

    if (safety.isEmergency) {
      return NextResponse.json({
        reply:
          safety.message ||
          "These symptoms may indicate an urgent medical emergency. Please contact emergency services immediately.",
        alert: true,
        emergencyType: safety.emergencyType,
        helpline: safety.helpline,
        mode,
      });
    }

    if (safety.isDisorderedEating) {
      return NextResponse.json({
        reply:
          safety.message ||
          "graceAI strictly adheres to metabolic safety floors (minimum 1,200 kcal/day). We do not provide extreme restriction or starvation advice.",
        alert: true,
        mode,
      });
    }

    // 2. Initialize Groq SDK with server environment key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: getSmartFallbackReply(userText, mode),
        alert: false,
        mode,
      });
    }

    const groq = new Groq({ apiKey });

    const timeContextNote = timeContext
      ? `\n\nREAL-WORLD CALENDAR CONTEXT: Today is ${timeContext.dayOfWeek}, ${timeContext.formattedDate}. Current local time: ${timeContext.timeString}. Active meal window: ${timeContext.activeMealSlot}. If the user asks for suggestions or daily guidance, naturally tailor recommendations to this time of day.`
      : "";

    const systemPrompt =
      (mode === "health"
        ? HEALTH_GUIDE_SYSTEM_PROMPT
        : CHEF_GRACE_SYSTEM_PROMPT) + timeContextNote;

    // Build chat message history (limiting to last 6 messages for speed and token efficiency)
    const formattedHistory = Array.isArray(history)
      ? history.slice(-6).map((h: { role: string; content?: string; text?: string }) => ({
          role: h.role === "grace" || h.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: String(h.content || h.text || ""),
        }))
      : [];

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...formattedHistory,
      { role: "user" as const, content: userText },
    ];

    // 3. Fallback model cascade with strict timeouts to prevent hanging
    let reply: string | null = null;
    let lastError: unknown = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const text = await callModelWithTimeout(groq, model, messages, 12000);
        if (text && text.trim()) {
          reply = text.trim();
          break;
        }
      } catch (modelErr) {
        lastError = modelErr;
        const errStr = modelErr instanceof Error ? modelErr.message : String(modelErr);
        console.warn(`Model ${model} failed or timed out: ${errStr}, trying next candidate...`);
      }
    }

    if (!reply) {
      console.warn("All candidate models failed. Providing graceful fallback.", lastError);
      reply = getSmartFallbackReply(userText, mode);
    }

    return NextResponse.json({
      reply,
      alert: false,
      mode,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Internal error";
    console.error("Grace Chat API Error:", errMsg);
    return NextResponse.json({
      reply: getSmartFallbackReply("general", "chef"),
      alert: false,
      mode: "chef",
    });
  }
}
