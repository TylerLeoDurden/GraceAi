/**
 * Nutrition calculation engine for graceAI
 * Implements Mifflin-St Jeor equation and standard clinical reference algorithms.
 * Hard safety floors prevent dangerous restriction.
 */

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type HealthGoal = "lose" | "maintain" | "gain" | "manage_condition";

export interface UserStats {
  age: number;
  sex: "female" | "male" | "other";
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: HealthGoal;
}

export interface MacroBreakdown {
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface NutritionPlanSummary {
  bmr: number;
  tdee: number;
  targetKcal: number;
  bmi: number;
  bmiCategory: string;
  macros: MacroBreakdown;
  safetyNote?: string;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // desk job, little to no exercise
  light: 1.375, // light exercise 1-3 days/week
  moderate: 1.55, // moderate exercise 3-5 days/week
  active: 1.725, // hard exercise 6-7 days/week
  very_active: 1.9, // physical work or intense athletic training
};

/**
 * Calculates Basal Metabolic Rate using Mifflin-St Jeor Formula
 */
export function calculateBMR(stats: Pick<UserStats, "age" | "sex" | "heightCm" | "weightKg">): number {
  const { age, sex, heightCm, weightKg } = stats;

  // Mifflin-St Jeor:
  // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (sex === "female") {
    return Math.round(base - 161);
  } else if (sex === "male") {
    return Math.round(base + 5);
  } else {
    // Non-binary/other: average the offset (-78)
    return Math.round(base - 78);
  }
}

/**
 * Calculates Total Daily Energy Expenditure
 */
export function calculateTDEE(stats: Pick<UserStats, "age" | "sex" | "heightCm" | "weightKg" | "activityLevel">): number {
  const bmr = calculateBMR(stats);
  const factor = ACTIVITY_MULTIPLIERS[stats.activityLevel] || 1.375;
  return Math.round(bmr * factor);
}

/**
 * Calculates BMI & Classification
 */
export function calculateBMI(heightCm: number, weightKg: number): { bmi: number; category: string } {
  const heightM = heightCm / 100;
  if (heightM <= 0) return { bmi: 0, category: "Unknown" };

  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category = "Normal weight";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 24.9) category = "Healthy weight";
  else if (bmi < 29.9) category = "Overweight";
  else category = "Obesity range";

  return { bmi, category };
}

/**
 * Calculates full nutrition targets respecting strict safety floors:
 * - Minimum 1,200 kcal for women
 * - Minimum 1,500 kcal for men
 */
export function calculateNutritionPlan(stats: UserStats): NutritionPlanSummary {
  const bmr = calculateBMR(stats);
  const tdee = calculateTDEE(stats);
  const { bmi, category: bmiCategory } = calculateBMI(stats.heightCm, stats.weightKg);

  let target = tdee;
  let safetyNote = "";

  if (stats.goal === "lose") {
    target = tdee - 400; // gentle, sustainable deficit (approx 0.4kg/wk)
  } else if (stats.goal === "gain") {
    target = tdee + 350; // lean mass focus
  } else if (stats.goal === "manage_condition") {
    target = tdee; // maintain while prioritizing glycemic stability
  }

  // Safety floor check
  const floor = stats.sex === "female" ? 1200 : 1500;
  if (target < floor) {
    target = floor;
    safetyNote = `Target adjusted to safety floor of ${floor} kcal to protect endocrine & metabolic health.`;
  }

  // Macro split: Balanced Mediterranean / Indian Whole-Food split
  // 25% Protein, 45% Complex Carbs, 30% Healthy Fats
  const proteinKcal = target * 0.25;
  const carbsKcal = target * 0.45;
  const fatKcal = target * 0.3;

  const proteinG = Math.round(proteinKcal / 4);
  const carbsG = Math.round(carbsKcal / 4);
  const fatG = Math.round(fatKcal / 9);
  const fiberG = Math.round((target / 1000) * 14); // 14g fiber per 1,000 kcal

  return {
    bmr,
    tdee,
    targetKcal: Math.round(target),
    bmi,
    bmiCategory,
    macros: {
      proteinG,
      carbsG,
      fatG,
      fiberG,
    },
    safetyNote,
  };
}
