import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// In-memory cache for on-the-spot generated dish images
interface CachedDishImage {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

const dishCache = new Map<string, CachedDishImage>();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

/**
 * Generate a high-fidelity culinary prompt using Groq's high-speed inference
 */
async function generatePromptWithGroq(
  dishTitle: string,
  origin?: string,
  mealSlot?: string,
  description?: string
): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_completion_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are an expert culinary food photographer and stylist. Given a dish name, origin, and meal type, generate a concise, hyper-realistic, appetizing text-to-image prompt (maximum 28 words). Focus strictly on: authentic visual appearance of this specific dish, authentic genuine ingredients and textures, proper traditional plating, fresh herbs or garnish, and warm soft natural daylight food photography. Never include meat or unrelated items if the dish is vegetarian. Output ONLY the raw prompt without quotation marks, markdown, or commentary.",
        },
        {
          role: "user",
          content: `Dish: "${dishTitle}", Cuisine/Origin: "${origin || "Authentic"}", Meal Type: "${mealSlot || "Meal"}"${
            description ? `, Notes: ${description}` : ""
          }`,
        },
      ],
    });

    const rawPrompt = completion.choices[0]?.message?.content?.trim();
    if (rawPrompt && rawPrompt.length > 5) {
      // Strip any accidental markdown or quotes
      return rawPrompt.replace(/["`]/g, "").replace(/^Prompt:\s*/i, "").trim();
    }
  } catch (error) {
    console.warn("Groq prompt generation error, using fallback culinary prompt:", error);
  }

  // Graceful fallback if Groq rate-limited or offline
  return `Authentic delicious ${dishTitle}, ${origin || "traditional"} style, fresh garnish, beautiful rustic plating, soft natural studio lighting, professional food photography`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dishTitle, origin, mealSlot, description, forceRefresh } = body;

    if (!dishTitle || typeof dishTitle !== "string") {
      return NextResponse.json({ error: "dishTitle is required" }, { status: 400 });
    }

    const cacheKey = dishTitle.toLowerCase().trim();

    // Check cache unless force refresh requested
    if (!forceRefresh && dishCache.has(cacheKey)) {
      const cached = dishCache.get(cacheKey)!;
      // Cache valid for 2 hours
      if (Date.now() - cached.timestamp < 2 * 60 * 60 * 1000) {
        return NextResponse.json({
          success: true,
          imageUrl: cached.imageUrl,
          prompt: cached.prompt,
          dishTitle,
          cached: true,
        });
      }
    }

    // Generate prompt with Groq on the spot
    const prompt = await generatePromptWithGroq(dishTitle, origin, mealSlot, description);

    // Pick a random seed for variation
    const seed = Math.floor(Math.random() * 1000000);
    const cleanPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=600&nologo=true&seed=${seed}`;

    // Update cache
    dishCache.set(cacheKey, {
      imageUrl,
      prompt,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      dishTitle,
      cached: false,
      seed,
    });
  } catch (error: unknown) {
    console.error("Groq dish-image route error:", error);
    return NextResponse.json(
      { error: "Failed to generate dynamic dish image" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dishTitle = searchParams.get("dish");
    const origin = searchParams.get("origin") || undefined;
    const mealSlot = searchParams.get("slot") || undefined;
    const redirect = searchParams.get("redirect") === "true";
    const forceRefresh = searchParams.get("refresh") === "true";

    if (!dishTitle) {
      return NextResponse.json({ error: "dish query parameter is required" }, { status: 400 });
    }

    const cacheKey = dishTitle.toLowerCase().trim();

    let cached = !forceRefresh ? dishCache.get(cacheKey) : undefined;
    if (cached && Date.now() - cached.timestamp > 2 * 60 * 60 * 1000) {
      cached = undefined;
    }

    let imageUrl: string;
    let prompt: string;

    if (cached) {
      imageUrl = cached.imageUrl;
      prompt = cached.prompt;
    } else {
      prompt = await generatePromptWithGroq(dishTitle, origin, mealSlot);
      const seed = Math.floor(Math.random() * 1000000);
      const cleanPrompt = encodeURIComponent(prompt);
      imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=600&nologo=true&seed=${seed}`;

      dishCache.set(cacheKey, {
        imageUrl,
        prompt,
        timestamp: Date.now(),
      });
    }

    if (redirect) {
      return NextResponse.redirect(imageUrl, 307);
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      dishTitle,
      cached: !!cached,
    });
  } catch (error: unknown) {
    console.error("Groq dish-image GET error:", error);
    return NextResponse.json(
      { error: "Failed to generate dynamic dish image" },
      { status: 500 }
    );
  }
}
