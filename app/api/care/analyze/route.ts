import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export interface CareAnalysisResponse {
  conditionIdentified: string;
  severityLevel: "Mild (Home Care)" | "Moderate (Monitor Closely)" | "Urgent (See Doctor)";
  overview: string;
  homeRemedies: Array<{ remedy: string; howToUse: string }>;
  dietAndHydration: {
    recommended: string[];
    avoid: string[];
  };
  lifestyleCare: string[];
  whenToSeeDoctor: string[];
  supportiveMessage: string;
}

const CARE_SYSTEM_PROMPT = `You are Health Guide Grace, an evidence-based clinical wellness and nutritional guide in graceAI.
The user is asking about a common condition (such as fever, common cold, cough, seasonal/food/skin allergy, hair fall, or skin care concerns like acne/dry skin).

IMPORTANT SAFETY & COMPLIANCE RULES:
1. Provide gentle, supportive, evidence-based wellness, dietary, and home care information.
2. DO NOT prescribe prescription medications or provide an official medical diagnosis.
3. Always include clear, explicit medical red flags ("When to see a doctor immediately").
4. Return ONLY a single valid JSON object following the schema below.

JSON SCHEMA:
{
  "conditionIdentified": "Short descriptive title of the condition/symptom",
  "severityLevel": "Mild (Home Care)" | "Moderate (Monitor Closely)" | "Urgent (See Doctor)",
  "overview": "Clear 2-sentence explanation of what is happening in the body",
  "homeRemedies": [
    { "remedy": "Name of remedy", "howToUse": "Actionable instructions and frequency" }
  ],
  "dietAndHydration": {
    "recommended": ["Nutrient 1 / food", "Nutrient 2"],
    "avoid": ["Item to limit or avoid", "Item 2"]
  },
  "lifestyleCare": [
    "Rest or environmental tip 1",
    "Tip 2"
  ],
  "whenToSeeDoctor": [
    "Red flag symptom 1",
    "Red flag symptom 2"
  ],
  "supportiveMessage": "Empathetic, calming closing note from Grace"
}`;

// Deterministic fallback for common queries
function getDeterministicCare(query: string): CareAnalysisResponse {
  const q = query.toLowerCase();

  if (q.includes("fever") || q.includes("temperature") || q.includes("chill")) {
    return {
      conditionIdentified: "Fever & Temperature Elevation Care",
      severityLevel: "Moderate (Monitor Closely)",
      overview: "Fever is your body's natural defense mechanism, orchestrated by the hypothalamus to create an inhospitable environment for pathogens and activate white blood cells.",
      homeRemedies: [
        { remedy: "Lukewarm Sponge Bath", howToUse: "Wipe forehead, neck, and underarms with lukewarm water (never cold or ice water) if temperature exceeds 101°F." },
        { remedy: "Hydration & Electrolyte Replenishment", howToUse: "Sip tender coconut water, diluted kanji (rice gruel with a pinch of rock salt), or clear vegetable broth every 45 minutes." },
        { remedy: "Light Natural Clothing", howToUse: "Wear breathable cotton clothing and rest under a light cotton sheet to prevent body heat trapping." }
      ],
      dietAndHydration: {
        recommended: ["Light rice porridge (Kanji) with cumin", "Warm boiled coriander seed water", "Coconut water", "Stewed apples or papaya"],
        avoid: ["Heavy fried foods", "Very cold or refrigerated beverages", "Refined sugar and heavy dairy"]
      },
      lifestyleCare: [
        "Strict bed rest; avoid mental exertion or screen fatigue",
        "Keep the room well-ventilated with circulating fresh air",
        "Check and record oral or axillary temperature every 4 hours"
      ],
      whenToSeeDoctor: [
        "Temperature exceeds 103°F (39.4°C) or does not reduce with fever management",
        "Fever persists for more than 72 hours",
        "Presence of severe headache, stiff neck, shortness of breath, or confusion",
        "Severe persistent vomiting or inability to retain fluids"
      ],
      supportiveMessage: "Rest deeply and stay hydrated. Your immune system is actively working to restore your equilibrium."
    };
  }

  if (q.includes("cold") || q.includes("cough") || q.includes("throat") || q.includes("nose") || q.includes("mucus")) {
    return {
      conditionIdentified: "Common Cold, Sore Throat & Congestion",
      severityLevel: "Mild (Home Care)",
      overview: "Viral rhinitis triggers inflammation of the upper respiratory mucosa, increasing protective mucus secretions and causing nasal blockage and throat irritation.",
      homeRemedies: [
        { remedy: "Steam Inhalation", howToUse: "Inhale warm steam with crushed ajwain (carom seeds) or a drop of eucalyptus oil for 5-7 minutes twice daily to loosen mucus." },
        { remedy: "Warm Saline Gargles", howToUse: "Dissolve 1/2 tsp rock salt in warm water; gargle for 60 seconds 3 times daily to reduce throat tissue swelling." },
        { remedy: "Golden Turmeric-Black Pepper Elixir", howToUse: "Warm 1 cup of warm water or plant milk with 1/4 tsp pure turmeric and a pinch of black pepper before bedtime." }
      ],
      dietAndHydration: {
        recommended: ["Hot ginger-tulsi tea with raw honey", "Garlic and pepper rasam", "Warm vegetable soups", "Amla (Indian gooseberry) for Vitamin C"],
        avoid: ["Chilled water and ice creams", "Deep fried or excessively greasy snacks", "Excess dairy if you feel congested"]
      },
      lifestyleCare: [
        "Elevate head with an extra pillow while sleeping to ease nasal drainage",
        "Use a room humidifier or place a warm water bowl near your bedside",
        "Rest your vocal cords and avoid cold drafts"
      ],
      whenToSeeDoctor: [
        "Sore throat so severe you cannot swallow saliva or fluids",
        "Breathing difficulty, wheezing, or chest tightness",
        "Symptoms worsen significantly after 7-10 days",
        "High fever accompanies the cough"
      ],
      supportiveMessage: "Give yourself permission to slow down. Warm broths and consistent steam will gently soothe your airways."
    };
  }

  if (q.includes("hair") || q.includes("fall") || q.includes("bald") || q.includes("dandruff") || q.includes("scalp")) {
    return {
      conditionIdentified: "Hair Fall, Scalp Health & Follicle Care",
      severityLevel: "Mild (Home Care)",
      overview: "Excessive shedding (telogen effluvium) is frequently tied to ferritin (iron) depletion, protein deficit, high cortisol, hormonal shifts (DHT/PCOS), or scalp microbiome imbalances.",
      homeRemedies: [
        { remedy: "Rosemary & Coconut Scalp Oil Massage", howToUse: "Blend 3 drops of pure rosemary essential oil into 1 tbsp warm cold-pressed virgin coconut oil; gently massage into scalp 2 hours before washing (2x weekly)." },
        { remedy: "Amla & Curry Leaf Infusion", howToUse: "Simmer fresh curry leaves and amla in oil or prepare fresh curry leaf chutney to supply follicles with beta-carotene and antioxidants." },
        { remedy: "Diluted Apple Cider Vinegar Rinse", howToUse: "For dandruff, mix 1 part ACV with 4 parts water; pour over scalp after shampooing and rinse after 2 minutes to restore acidic pH." }
      ],
      dietAndHydration: {
        recommended: ["Sprouted moong and lentils for plant keratin building blocks", "Pumpkin seeds (rich in zinc to inhibit 5-alpha reductase)", "Spinach and beetroot with lime for iron absorption", "Walnuts and chia seeds for omega-3"],
        avoid: ["Crash dieting or extreme calorie cuts below 1,200 kcal", "Refined sugar spikes that elevate scalp androgens", "Excessive processed meats"]
      },
      lifestyleCare: [
        "Use a wide-tooth wooden comb on dry hair; never vigorously brush wet strands",
        "Wash hair with lukewarm or cool water; avoid hot water stripping sebum",
        "Switch to a silk or satin pillowcase to reduce mechanical friction during sleep"
      ],
      whenToSeeDoctor: [
        "Sudden coin-sized circular bald patches (possible Alopecia Areata)",
        "Severe burning, redness, or painful pustules across scalp",
        "Hair shedding exceeds 200+ strands daily for more than 8 weeks",
        "Noticeable thinning accompanied by irregular periods or extreme fatigue (check thyroid/ferritin)"
      ],
      supportiveMessage: "Hair responds directly to inner cellular nourishment and nervous system calm. Consistency over 8-12 weeks yields transformative regrowth."
    };
  }

  if (q.includes("skin") || q.includes("acne") || q.includes("pimple") || q.includes("glow") || q.includes("dry") || q.includes("itch")) {
    return {
      conditionIdentified: "Skin Care, Acne Management & Barrier Restoration",
      severityLevel: "Mild (Home Care)",
      overview: "Skin health mirrors the gut-skin axis and epidermal lipid barrier integrity. Sebum overproduction, insulin spikes, and barrier breakdown are primary triggers for breakouts and dryness.",
      homeRemedies: [
        { remedy: "Pure Aloe Vera & Cucumber Compress", howToUse: "Apply fresh scraped aloe vera gel directly to inflamed skin or blemishes for 15 minutes before rinsing with cool water." },
        { remedy: "Gentle Double Hydration Technique", howToUse: "Apply a gentle moisturizer or rose water immediately over damp skin within 60 seconds of washing to lock in trans-epidermal moisture." },
        { remedy: "Diluted Tea Tree Spot Protocol", howToUse: "For active pimples, dab 1 drop of 5% diluted tea tree oil directly on the blemish at night for antimicrobial action." }
      ],
      dietAndHydration: {
        recommended: ["Green tea and spearmint tea (proven to regulate sebum)", "Zinc-rich pumpkin seeds and almonds", "Antioxidant berries, papaya, and amla", "Minimum 2.5L filtered water daily"],
        avoid: ["High glycemic index foods (white bread, sugary sodas)", "Excessive cow milk dairy if prone to hormonal cystic acne", "Heavily reused cooking oils"]
      },
      lifestyleCare: [
        "Never pop, squeeze, or pick at acne lesions to prevent scarring",
        "Apply broad-spectrum SPF 50 sunscreen every morning without fail",
        "Wash pillowcases twice weekly to eliminate bacterial transfer"
      ],
      whenToSeeDoctor: [
        "Deep, cystic, painful nodules that persist under the skin",
        "Spreading rash accompanied by fever or swelling of eyes/lips",
        "Severe peeling, blistering, or signs of secondary skin infection"
      ],
      supportiveMessage: "Treat your skin with kindness. Less is more: focus on protecting your skin barrier and nourishing your gut microbiome."
    };
  }

  // Allergy default
  return {
    conditionIdentified: "Allergy Relief & Histamine Balance Care",
    severityLevel: "Mild (Home Care)",
    overview: "Allergies arise when your immune system misidentifies harmless environmental or dietary proteins as threats, releasing histamine from mast cells and causing inflammation.",
    homeRemedies: [
      { remedy: "Saline Nasal Rinse (Isotonic Wash)", howToUse: "Rinse nasal passages with sterile saline spray or gentle neti wash morning and evening to physically clear allergens." },
      { remedy: "Cool Compress for Itch Relief", howToUse: "Place a clean, cool, damp cloth over itchy eyes, hives, or skin for 10 minutes to constrict local blood vessels." },
      { remedy: "Natural Quercetin Boost", howToUse: "Consume quercetin-rich foods (red onions, capers, apples) which stabilize mast cells and modulate natural histamine release." }
    ],
    dietAndHydration: {
      recommended: ["Fresh ginger and turmeric infusions", "Vitamin C-packed citrus, amla, and bell peppers", "Omega-3 rich chia seeds and flaxseed meal", "Generous room-temperature water intake"],
      avoid: ["High-histamine aged cheeses and processed cured meats", "Artificial food colorings and synthetic preservatives", "Alcohol and fermented yeast products during flare-ups"]
    },
    lifestyleCare: [
      "Keep bedroom windows closed during peak morning pollen hours (5 AM – 10 AM)",
      "Wash outdoor clothes and shower immediately upon returning home after high-pollen days",
      "Use HEPA filtration or frequently vacuum carpets and drapery"
    ],
    whenToSeeDoctor: [
      "Any difficulty breathing, wheezing, or tightness in the chest",
      "Swelling of the tongue, lips, mouth, or throat (Anaphylaxis Emergency)",
      "Dizziness, lightheadedness, or sudden drop in blood pressure",
      "Hives or rash spreading rapidly across the entire body"
    ],
    supportiveMessage: "Minimizing allergen load in your home environment paired with natural anti-inflammatory foods brings swift, gentle comfort."
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptomText = "" } = body;

    if (!symptomText.trim()) {
      return NextResponse.json(
        { error: "Please provide a symptom description." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      const fallback = getDeterministicCare(symptomText);
      return NextResponse.json(fallback);
    }

    try {
      const groq = new Groq({ apiKey });

      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: CARE_SYSTEM_PROMPT },
          {
            role: "user",
            content: `The user has the following health concern or symptom: "${symptomText}". Provide comprehensive home care, remedies, nutrition, and safety red flags in strict JSON format.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content || "";
      const parsed = JSON.parse(raw);
      const fallback = getDeterministicCare(symptomText);

      const responseData: CareAnalysisResponse = {
        conditionIdentified: parsed.conditionIdentified || fallback.conditionIdentified,
        severityLevel: parsed.severityLevel || fallback.severityLevel,
        overview: parsed.overview || fallback.overview,
        homeRemedies: Array.isArray(parsed.homeRemedies) && parsed.homeRemedies.length ? parsed.homeRemedies : fallback.homeRemedies,
        dietAndHydration: {
          recommended: Array.isArray(parsed.dietAndHydration?.recommended) && parsed.dietAndHydration.recommended.length ? parsed.dietAndHydration.recommended : fallback.dietAndHydration.recommended,
          avoid: Array.isArray(parsed.dietAndHydration?.avoid) && parsed.dietAndHydration.avoid.length ? parsed.dietAndHydration.avoid : fallback.dietAndHydration.avoid,
        },
        lifestyleCare: Array.isArray(parsed.lifestyleCare) && parsed.lifestyleCare.length ? parsed.lifestyleCare : fallback.lifestyleCare,
        whenToSeeDoctor: Array.isArray(parsed.whenToSeeDoctor) && parsed.whenToSeeDoctor.length ? parsed.whenToSeeDoctor : fallback.whenToSeeDoctor,
        supportiveMessage: parsed.supportiveMessage || fallback.supportiveMessage,
      };

      return NextResponse.json(responseData);
    } catch (llmErr) {
      console.warn("Groq care analysis error, using clinical fallback:", llmErr);
      const fallback = getDeterministicCare(symptomText);
      return NextResponse.json(fallback);
    }
  } catch (error: unknown) {
    console.error("Care API error:", error);
    return NextResponse.json(
      { error: "Failed to process health care inquiry." },
      { status: 500 }
    );
  }
}
