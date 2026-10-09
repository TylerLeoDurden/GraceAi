import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export interface MealLogItem {
  slot: string; // Breakfast, Lunch, Snack, Dinner
  scheduledTime: string;
  recipeTitle: string;
  kcal: number;
  protein: string;
  status: "eaten_on_time" | "eaten_late" | "substituted" | "skipped" | "unlogged" | "planned";
  minutesLate?: number;
  customNote?: string;
}

export interface DayReportInput {
  dateString: string;
  dayName: string;
  targetKcal: number;
  meals: MealLogItem[];
  sleepHours: number;
  steps: number;
  mood: string;
  previousAdherence?: number;
}

export interface HealthReportOutput {
  dateString: string;
  dayName: string;
  generatedAt: string;
  version: number;
  completeness: number; // 0 to 1
  completenessLabel: string; // "4 of 4 meals logged"
  adherenceScore: number; // 0-100
  totalKcalConsumed: number;
  targetKcal: number;
  kcalDelta: number; // actual - target
  totalProteinGrams: number;
  summaryText: string;
  keyFindings: string[];
  whatChangedAndWhy: string[];
  gentleSuggestions: string[];
}

const REPORT_PROMPT = `You are Health Guide Grace, a clinical-grade metabolic wellness interpreter inside graceAI.
Your role is to summarize daily meal adherence and health logs into an encouraging, honest report.

RULES:
1. "Rules decide, AI explains." Be precise with the numbers provided.
2. If meals were substituted or entered manually, explicitly explain how that impacted total calories and adherence.
3. Be supportive, calm, and practical. NEVER use shaming language. If calories are low or meals were skipped, provide gentle encouragement to nourish well rather than praising extreme restriction.
4. Return ONLY a single valid JSON object.

JSON SCHEMA:
{
  "summaryText": "Concise 2-3 sentence overview of today's nourishment and adherence.",
  "keyFindings": [
    "Fact 1 (e.g. 3 of 4 meals eaten within optimal scheduled windows)",
    "Fact 2 (e.g. Total intake reached 1,740 kcal vs 1,800 kcal target)"
  ],
  "whatChangedAndWhy": [
    "Detail on what happened with substitutions or manual entries"
  ],
  "gentleSuggestions": [
    "Actionable tip 1 for tomorrow",
    "Actionable tip 2"
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const body: DayReportInput = await req.json();
    const {
      dateString,
      dayName,
      targetKcal = 1800,
      meals = [],
      sleepHours = 7.5,
      steps = 8000,
      mood = "Energized",
    } = body;

    // 1. Compute rule-based metrics
    const totalMealsPlanned = meals.length || 4;
    const loggedMeals = meals.filter((m) =>
      ["eaten_on_time", "eaten_late", "substituted", "skipped"].includes(m.status)
    );
    const completeness = totalMealsPlanned > 0 ? loggedMeals.length / totalMealsPlanned : 0;
    const completenessLabel = `${loggedMeals.length} of ${totalMealsPlanned} meals logged today`;

    // Calculate calories & protein consumed
    const consumedMeals = meals.filter((m) =>
      ["eaten_on_time", "eaten_late", "substituted"].includes(m.status)
    );
    const totalKcalConsumed = consumedMeals.reduce((sum, m) => sum + (m.kcal || 0), 0);
    const totalProteinGrams = consumedMeals.reduce((sum, m) => {
      const p = parseInt(m.protein) || 0;
      return sum + p;
    }, 0);

    const kcalDelta = totalKcalConsumed - targetKcal;

    // Adherence scoring (0-100)
    // On-time meals = 25 pts each (max 75-100), substitutions = 20 pts, skipped = 5 pts
    let timingPoints = 0;
    meals.forEach((m) => {
      if (m.status === "eaten_on_time") timingPoints += 25;
      else if (m.status === "substituted") timingPoints += 22;
      else if (m.status === "eaten_late") timingPoints += 18;
      else if (m.status === "skipped") timingPoints += 10;
    });

    const timingScore = Math.min(60, Math.round((timingPoints / (totalMealsPlanned * 25)) * 60));
    // Calorie proximity (40 pts max)
    const calProximity = Math.max(0, 40 - Math.round(Math.abs(kcalDelta) / 40));
    const adherenceScore = Math.min(100, timingScore + calProximity);

    // Identify what changed & why
    const changes: string[] = [];
    meals.forEach((m) => {
      if (m.status === "substituted") {
        changes.push(
          `${m.slot} manually entered as "${m.recipeTitle}" (${m.kcal} kcal, ${m.protein} P).`
        );
      } else if (m.status === "eaten_late") {
        changes.push(
          `${m.slot} logged ${m.minutesLate || 30} minutes after window ended.`
        );
      } else if (m.status === "skipped") {
        changes.push(`${m.slot} was skipped.`);
      }
    });

    if (changes.length === 0) {
      changes.push("All planned meals enjoyed on schedule.");
    }

    // 2. Call Groq for supportive AI synthesis
    const apiKey = process.env.GROQ_API_KEY;
    let summaryText = `Today you logged ${totalKcalConsumed} kcal (${kcalDelta >= 0 ? "+" : ""}${kcalDelta} vs target). Adherence reached ${adherenceScore}%.`;
    let keyFindings = [
      `${completenessLabel} (${Math.round(completeness * 100)}% completeness).`,
      `Nutritional delivery: ${totalKcalConsumed} kcal and ~${totalProteinGrams}g protein.`,
    ];
    let gentleSuggestions = [
      "Maintain a 3-4 hour digestion window between meals.",
      "Stay hydrated between eating windows for sustained focus.",
    ];

    if (apiKey) {
      try {
        const groq = new Groq({ apiKey });
        const userPrompt = `Generate the daily health report for ${dayName}, ${dateString}:
- Target calories: ${targetKcal} kcal
- Actual consumed: ${totalKcalConsumed} kcal (Difference: ${kcalDelta} kcal)
- Total protein: ${totalProteinGrams}g
- Logged meals: ${JSON.stringify(meals)}
- Sleep: ${sleepHours} hours
- Steps: ${steps}
- Mood: ${mood}
- Timing adherence score: ${adherenceScore}/100
- Specific meal changes: ${JSON.stringify(changes)}`;

        const completion = await groq.chat.completions.create({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: REPORT_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 600,
          response_format: { type: "json_object" },
        });

        const raw = completion.choices[0]?.message?.content || "";
        const parsed = JSON.parse(raw);
        if (parsed.summaryText) summaryText = parsed.summaryText;
        if (Array.isArray(parsed.keyFindings) && parsed.keyFindings.length) keyFindings = parsed.keyFindings;
        if (Array.isArray(parsed.gentleSuggestions) && parsed.gentleSuggestions.length) gentleSuggestions = parsed.gentleSuggestions;
      } catch (err) {
        console.warn("Report AI generation error, using deterministic findings:", err);
      }
    }

    const report: HealthReportOutput = {
      dateString,
      dayName,
      generatedAt: new Date().toISOString(),
      version: 1,
      completeness,
      completenessLabel,
      adherenceScore,
      totalKcalConsumed,
      targetKcal,
      kcalDelta,
      totalProteinGrams,
      summaryText,
      keyFindings,
      whatChangedAndWhy: changes,
      gentleSuggestions,
    };

    return NextResponse.json(report);
  } catch (error: unknown) {
    console.error("Report generate error:", error);
    return NextResponse.json(
      { error: "Could not generate report." },
      { status: 500 }
    );
  }
}
