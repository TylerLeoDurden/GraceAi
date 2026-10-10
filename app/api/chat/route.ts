import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { checkSafety } from "@/lib/safety";

// System prompts engineered for clean, compact bullet-point readability
const CHEF_GRACE_SYSTEM_PROMPT = `You are Chef Grace, a master culinary chef and culinary wellness guide inside graceAI.
Tagline: "Eat well. Live gracefully."

CRITICAL FORMATTING RULES FOR COMPACT CHAT (STRICT):
- The user interface is compact. You must NEVER write continuous dense paragraphs or run-on text.
- ALWAYS structure your response into clear, distinct points with line breaks:

### 🍳 [Dish Name] (Time • Calories)

### 🛒 Ingredients (Serves 2)
- Item 1 — quantity
- Item 2 — quantity
- Item 3 — quantity

### 👩‍🍳 Step-by-Step Points
1. First step (concise)
2. Second step (concise)
3. Third step (concise)
4. Fourth step (finish & garnish)

### 💡 Chef Tip
- Healthy substitution or flavor secret

Culinary Knowledge:
- Master of Indian Regional Kitchens (Tamil Nadu, Kerala, Punjab, Bengal, Gujarat, etc.) using familiar terms (katori, tsp, tbsp, grams).
- Also master of Mediterranean, Asian, Mexican, Jain (no onion/garlic/root veg), Sattvic, Vegan, Keto.
- Keep each point brief and on its own separate line. Never merge points into a paragraph.`;

const HEALTH_GUIDE_SYSTEM_PROMPT = `You are Health Guide Grace, an evidence-based lifestyle and nutrition companion inside graceAI.
Tagline: "Eat well. Live gracefully."

CRITICAL FORMATTING RULES FOR COMPACT CHAT (STRICT):
- The user interface is compact. You must NEVER write long dense paragraphs.
- ALWAYS organize your advice into neat, distinct points with line breaks:

### 🌿 What's Happening
- Clear point 1
- Clear point 2

### 📋 Action Steps for Today
1. Actionable step 1
2. Actionable step 2
3. Actionable step 3

### 💡 Mindful Daily Tip
- One gentle habit anchor

Clinical Boundaries & Safety:
- NOT a doctor or prescribing dietitian. Never diagnose, prescribe medications, or give drug dosages.
- STRICTLY REFUSE starvation or crash diets (< 1,200 kcal for women, < 1,500 kcal for men).
- Keep each point on its own separate line with clear bullet points.`;

// Candidate models in order of speed and stability on Groq
const CANDIDATE_MODELS = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
];

async function callModelWithTimeout(
  groq: Groq,
  model: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  timeoutMs = 7000
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await groq.chat.completions.create(
      {
        model,
        messages,
        temperature: 0.5,
        max_tokens: 1024,
      },
      { signal: controller.signal }
    );
    clearTimeout(timer);
    return res.choices[0]?.message?.content || null;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function getSmartFallbackReply(userText: string, mode: "chef" | "health"): string {
  if (mode === "health") {
    return `### 🌿 Mindful Wellness Note for You

### 📋 Key Principles
- Hydration first: drink 300–500ml of room-temperature water.
- Balanced nourishment: include a source of clean protein and dietary fibre.
- Regular sleep rhythms: aim for 7–8 hours to regulate hunger hormones (leptin and ghrelin).

### 💡 Grace Tip
- Take a 10-minute mindful walk after your meal to stabilize postprandial glucose levels.`;
  }

  return `### 🍳 Wholesome Quick Kitchen Idea (15 min • ~350 kcal)

### 🛒 Ingredients (Serves 2)
- Base grain or protein — 1 cup (e.g. eggs, paneer, tofu, or cooked lentils)
- Vegetables on hand — 1 medium bowl (spinach, onions, tomatoes, or greens)
- Healthy cooking fat — 1 tsp (cold-pressed mustard, sesame, or olive oil)
- Gentle spices — pinch of cumin, turmeric, and sea salt

### 👩‍🍳 Step-by-Step Points
1. Warm 1 tsp oil in a pan over medium heat; add cumin seeds until they sputter.
2. Sauté aromatics and vegetables for 3–4 minutes until tender-crisp.
3. Fold in your protein source and season with turmeric and salt.
4. Garnish with fresh herbs or lemon juice and serve warm.

### 💡 Chef Tip
- Cook with seasonal, locally available ingredients for optimal nutrient density and natural flavor.`;
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

    const userText = message.trim();

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
        const text = await callModelWithTimeout(groq, model, messages, 7500);
        if (text && text.trim()) {
          reply = text.trim();
          break;
        }
      } catch (modelErr) {
        lastError = modelErr;
        console.warn(`Model ${model} failed or timed out, trying next candidate...`);
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
