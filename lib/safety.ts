/**
 * graceAI Safety Layer
 * Enforces emergency triage, eating disorder safeguards, and allergen security in code.
 */

import { getEmergencyInfo, EmergencyContactInfo } from "./emergency-service";

export interface SafetyCheckResult {
  isEmergency: boolean;
  isDisorderedEating: boolean;
  emergencyType?: "medical" | "mental_health" | "allergic_reaction";
  message?: string;
  helpline?: string;
  emergencyInfo?: EmergencyContactInfo;
}

const MEDICAL_EMERGENCY_PATTERNS = [
  /chest pain/i,
  /crushing pressure/i,
  /shortness of breath/i,
  /trouble breathing/i,
  /can't breathe/i,
  /facial drooping/i,
  /arm weakness/i,
  /slurred speech/i,
  /stroke/i,
  /seizure/i,
  /anaphylaxis/i,
  /throat closing/i,
  /severe swelling/i,
  /unconscious/i,
  /overdose/i,
  /poison/i,
  /heavy bleeding/i,
];

const MENTAL_HEALTH_CRISIS_PATTERNS = [
  /kill myself/i,
  /suicide/i,
  /end my life/i,
  /want to die/i,
  /self harm/i,
  /cutting myself/i,
  /no reason to live/i,
];

const DISORDERED_EATING_PATTERNS = [
  /eat 500 calories/i,
  /eat 600 calories/i,
  /eat 700 calories/i,
  /eat 800 calories/i,
  /water fast for \d+ days/i,
  /purge after eating/i,
  /make myself throw up/i,
  /starve myself/i,
  /extreme restriction/i,
  /punish myself with food/i,
];

/**
 * Validates user input before sending to any AI endpoint or plan generator
 */
export function checkSafety(userInput: string, countryOrLocation?: string): SafetyCheckResult {
  const text = userInput.trim().toLowerCase();
  const emergencyInfo = getEmergencyInfo(countryOrLocation);

  // 1. Mental health crisis check
  for (const pattern of MENTAL_HEALTH_CRISIS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isEmergency: true,
        isDisorderedEating: false,
        emergencyType: "mental_health",
        message:
          "If you are going through a difficult time or having thoughts of self-harm, please know that you are not alone. Free, confidential support is available 24/7.",
        helpline: `${emergencyInfo.flagEmoji} ${emergencyInfo.countryName}: ${emergencyInfo.mentalHealth.name} at ${emergencyInfo.mentalHealth.number} | General Emergency: ${emergencyInfo.primaryEmergency}`,
        emergencyInfo,
      };
    }
  }

  // 2. Acute medical emergency check
  for (const pattern of MEDICAL_EMERGENCY_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isEmergency: true,
        isDisorderedEating: false,
        emergencyType: "medical",
        message:
          "These symptoms may indicate an urgent medical emergency requiring immediate professional care. Please contact emergency services right now.",
        helpline: `${emergencyInfo.flagEmoji} ${emergencyInfo.countryName} Emergency: ${emergencyInfo.primaryEmergency} | Ambulance: ${emergencyInfo.medicalEmergency} | Mental Health: ${emergencyInfo.mentalHealth.number}`,
        emergencyInfo,
      };
    }
  }

  // 3. Disordered eating check
  for (const pattern of DISORDERED_EATING_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isEmergency: false,
        isDisorderedEating: true,
        message:
          "graceAI cares about your long-term health and wellbeing. Extremely low calorie diets or purging behaviors can cause serious harm to your heart, metabolism, and mental health. We cannot provide plans below safe biological floors (1,200 kcal/day). We encourage speaking with a licensed healthcare professional.",
      };
    }
  }

  return {
    isEmergency: false,
    isDisorderedEating: false,
  };
}

/**
 * Allergen enforcement check
 * Verifies that a recipe or meal item does not include user allergens
 */
export function containsAllergen(
  ingredientsOrTags: string[],
  userAllergens: string[]
): boolean {
  if (!userAllergens || userAllergens.length === 0) return false;

  const normalizedAllergens = userAllergens.map((a) => a.toLowerCase().trim());

  return ingredientsOrTags.some((item) => {
    const lowerItem = item.toLowerCase();
    return normalizedAllergens.some((allergen) =>
      lowerItem.includes(allergen) || allergen.includes(lowerItem)
    );
  });
}
