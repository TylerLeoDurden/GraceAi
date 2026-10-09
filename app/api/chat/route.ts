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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, mode = "chef", history = [] } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const userText = message.trim();

    // 1. Hard-coded safety triage before calling LLM
    const safety = checkSafety(userText);

    if (safety.isEmergency) {
      return NextResponse.json({
        reply:
          safety.message ||
          "These symptoms may indicate an urgent medical emergency. Please contact emergency services immediately.",
        alert: true,
        emergencyType: safety.emergencyType,
        helpline: safety.helpline,
      });
    }

    if (safety.isDisorderedEating) {
      return NextResponse.json({
        reply:
          safety.message ||
          "graceAI strictly adheres to metabolic safety floors (minimum 1,200 kcal/day). We do not provide extreme restriction or starvation advice.",
        alert: true,
      });
    }

    // 2. Initialize Groq SDK with server environment key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          reply:
            "The Grace AI connection is being configured. Please ensure GROQ_API_KEY is active in your environment.",
          alert: false,
        },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const systemPrompt =
      mode === "health"
        ? HEALTH_GUIDE_SYSTEM_PROMPT
        : CHEF_GRACE_SYSTEM_PROMPT;

    // Build chat message history (limiting to last 8 messages for optimal context)
    const formattedHistory = Array.isArray(history)
      ? history.slice(-8).map((h: { role: string; content: string }) => ({
          role: h.role === "grace" ? ("assistant" as const) : ("user" as const),
          content: String(h.content),
        }))
      : [];

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...formattedHistory,
      { role: "user" as const, content: userText },
    ];

    // Primary model: openai/gpt-oss-120b; fallback: qwen/qwen3.8-27b
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages,
        temperature: 0.5,
        max_tokens: 1024,
      });
    } catch (modelErr) {
      console.warn("Primary model error, attempting fallback:", modelErr);
      completion = await groq.chat.completions.create({
        model: "qwen/qwen3.8-27b",
        messages,
        temperature: 0.5,
        max_tokens: 1024,
      });
    }

    const reply =
      completion.choices[0]?.message?.content ||
      "I am here to help you cook and live gracefully. Could you please rephrase your question?";

    return NextResponse.json({
      reply,
      alert: false,
      mode,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Internal error";
    console.error("Grace Chat API Error:", errMsg);
    return NextResponse.json(
      {
        reply:
          "Grace is taking a brief mindful pause. Please try asking again in a moment.",
        error: errMsg,
      },
      { status: 500 }
    );
  }
}
