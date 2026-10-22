"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Thermometer,
  Wind,
  Sparkles,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Search,
  Droplet,
  Heart,
  Info,
  ChevronRight,
  Loader2,
  Leaf,
  Sun,
  Moon,
  Coffee,
  HelpCircle,
  Clock,
  Flame,
  X,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  PhoneCall,
} from "lucide-react";
import { useEmergencyLocation } from "@/components/emergency-modal";
import { CareAnalysisResponse } from "@/app/api/care/analyze/route";

interface ConditionGuide {
  id: string;
  category: "fever_cold" | "allergies" | "hair_care" | "skin_care";
  title: string;
  subtitle: string;
  scientificName: string;
  categoryLabel: string;
  summary: string;
  symptoms: string[];
  homeRemedies: Array<{ name: string; instructions: string }>;
  dietProtocol: {
    eat: string[];
    avoid: string[];
  };
  lifestyleTips: string[];
  redFlags: string[];
}

const CONDITION_GUIDES: ConditionGuide[] = [
  {
    id: "viral-fever",
    category: "fever_cold",
    title: "Viral Fever & Temperature Rises",
    subtitle: "What to do when your body runs hot and you feel fatigued",
    scientificName: "Pyrexia / Acute Viral Hyperthermia",
    categoryLabel: "Fever & Infection",
    summary:
      "A fever is actually your body working as it should. Your hypothalamus elevates core temperature to slow down viral replication while activating immune white blood cells. The key is gentle hydration, rest, and preventing thermal exhaustion.",
    symptoms: [
      "Body temperature above 99°F (37.2°C)",
      "Chills, muscle aches, and heavy fatigue",
      "Warm forehead and mild headache",
      "Dry lips and loss of natural appetite",
    ],
    homeRemedies: [
      {
        name: "Lukewarm Sponging (Never Cold or Ice)",
        instructions:
          "Dampen a soft cotton cloth with lukewarm water (~85°F–90°F) and gently wipe your forehead, neck, armpits, and wrists. Ice water or cold baths cause shivering, which paradoxically forces core body temperature higher.",
      },
      {
        name: "Warm Cumin & Coriander Seed Water",
        instructions:
          "Simmer 1 tablespoon of crushed coriander seeds and 1/2 teaspoon of cumin in 500ml water for 10 minutes. Strain and sip warm. It relieves internal heat sensation and supports gentle kidney drainage.",
      },
      {
        name: "Light, Breathable Cotton Layers",
        instructions:
          "Wear loose, unbleached cotton clothing. Use a light cotton bedsheet instead of heavy quilts once initial shivering passes, allowing heat to dissipate naturally.",
      },
    ],
    dietProtocol: {
      eat: [
        "Warm rice gruel (Kanji) with a pinch of rock salt and cumin",
        "Fresh tender coconut water to replenish electrolytes naturally",
        "Moong dal broth or clear vegetable soup",
        "Stewed apples, papaya, or warm pomegranate juice",
      ],
      avoid: [
        "Heavy fried snacks, oily gravies, or spicy gravies",
        "Refrigerated beverages and icy desserts",
        "Excess cow milk and refined sugar during active fever",
      ],
    },
    lifestyleTips: [
      "Strict physical and mental bed rest for at least 48 hours",
      "Check your temperature every 4 to 6 hours with a clean digital thermometer",
      "Keep your bedroom softly lit, peaceful, and well-ventilated",
    ],
    redFlags: [
      "Temperature rises above 103°F (39.4°C) or does not ease after 72 hours",
      "Stiff neck, light sensitivity (eyes hurt in light), or confusion",
      "Difficulty breathing or chest pain",
      "Unable to keep down any water or fluids due to persistent vomiting",
    ],
  },
  {
    id: "common-cold",
    category: "fever_cold",
    title: "Common Cold, Sore Throat & Cough",
    subtitle: "Clearing nasal congestion, throat tickles, and chest heaviness",
    scientificName: "Upper Respiratory Viral Rhinitis",
    categoryLabel: "Cold & Throat",
    summary:
      "When a cold virus enters the upper airway, nasal tissues swell and produce extra mucus to trap the invaders. Gentle steam, salt gargles, and warming broths soothe irritated tissues and clear your breathing passages.",
    symptoms: [
      "Blocked or constantly running nose and sinus pressure",
      "Scratchy, raw throat that stings when swallowing",
      "Dry or chesty cough, especially when lying down",
      "Sneezing spells and general low energy",
    ],
    homeRemedies: [
      {
        name: "Ajwain (Carom Seed) Steam Inhalation",
        instructions:
          "Crush 1 teaspoon of ajwain seeds into boiling water (or add 2 drops eucalyptus oil). Drape a towel over your head and breathe the warm aromatic steam through your nose for 5 to 7 minutes.",
      },
      {
        name: "Warm Salt Water Gargle (3 Times a Day)",
        instructions:
          "Stir 1/2 teaspoon of pink or sea salt into a glass of warm water. Gargle deeply for 60 seconds. Salt pulls excess fluid out of inflamed throat tissues, relieving pain naturally.",
      },
      {
        name: "Raw Honey & Fresh Ginger Spoon",
        instructions:
          "Mix 1 teaspoon of freshly squeezed ginger juice with 1 teaspoon of raw honey and a pinch of black pepper. Take slowly before bedtime to coat the throat lining and quiet nighttime coughing.",
      },
    ],
    dietProtocol: {
      eat: [
        "Hot garlic-pepper rasam or ginger bone/vegetable broth",
        "Warm ginger, tulsi (holy basil), and black pepper tea",
        "Amla (Indian gooseberry) and citrus for Vitamin C",
        "Steamed green vegetables and soft khichdi",
      ],
      avoid: [
        "Chilled water, iced smoothies, and ice creams",
        "Mucus-thickening heavy cream and deep-fried snacks",
        "Caffeinated sodas and sugary energy drinks",
      ],
    },
    lifestyleTips: [
      "Prop your head up with an extra pillow at night to ease mucus drainage",
      "Keep a warm mist humidifier or a shallow bowl of water near your bed",
      "Rest your voice and keep your neck lightly covered in cold drafts",
    ],
    redFlags: [
      "Throat pain so severe you cannot swallow your own saliva",
      "Shortness of breath, wheezing, or chest tightness",
      "Cough lasting more than 3 weeks without improvement",
      "Earache or severe pain behind the eyes and cheekbones",
    ],
  },
  {
    id: "dust-pollen-allergy",
    category: "allergies",
    title: "Dust & Pollen Allergy (Hay Fever)",
    subtitle: "Calming morning sneezing bouts, itchy eyes, and runny nose",
    scientificName: "Allergic Rhinitis / Airborne Atopy",
    categoryLabel: "Airborne Allergy",
    summary:
      "When harmless airborne dust mites or plant pollens touch your nasal passages, sensitive immune cells release histamine. This leads to rapid sneezing, itchy eyes, and clear watery discharge. Rinsing allergens away and eating quercetin-rich foods calms the reaction.",
    symptoms: [
      "Bouts of 5 to 10 rapid sneezes upon waking up",
      "Clear, watery nasal drip and itchy roof of the mouth",
      "Itchy, red, or gritty-feeling eyes",
      "Dark circles under eyes from nasal congestion",
    ],
    homeRemedies: [
      {
        name: "Saline Nasal Rinse (Neti or Saline Spray)",
        instructions:
          "Use a warm isotonic saline spray or a neti pot with distilled warm water twice daily. Physically washing pollen and dust out of the nasal lining stops histamine before it starts.",
      },
      {
        name: "Quercetin Food Protocol",
        instructions:
          "Quercetin is nature's mast-cell stabilizer. Incorporate red onions, apples, capers, blueberries, and green tea into your weekly meals to dial down allergic sensitivity.",
      },
      {
        name: "Chilled Chamomile Tea Eye Compress",
        instructions:
          "Steep two chamomile tea bags, chill them in the fridge for 10 minutes, and rest them over closed eyes for 10 minutes to soothe gritty, itchy eyelids.",
      },
    ],
    dietProtocol: {
      eat: [
        "Warm turmeric and ginger infusions",
        "Quercetin superstars: red onions, dark berries, and broccoli",
        "Vitamin C from amla, bell peppers, and citrus",
        "Omega-3 fatty acids from chia seeds, flaxseeds, and walnuts",
      ],
      avoid: [
        "High-histamine aged cheeses, cured sausages, and vinegar",
        "Artificial food flavorings and synthetic food dyes",
        "Wine and fermented yeast alcohol during active allergy flare-ups",
      ],
    },
    lifestyleTips: [
      "Keep bedroom windows closed between 5 AM and 10 AM when pollen counts peak",
      "Wash bedsheets weekly in hot water (60°C / 140°F) to eliminate dust mites",
      "Change clothes and wash your face immediately after spending time outdoors",
    ],
    redFlags: [
      "Wheezing, shortness of breath, or asthma attacks",
      "Swelling of the lips, tongue, or throat (Anaphylaxis Warning)",
      "High fever with thick discolored sinus drainage",
    ],
  },
  {
    id: "food-allergies",
    category: "allergies",
    title: "Food Intolerances & Gut Sensitivities",
    subtitle: "Soothing bloating, cramps, and post-meal digestive reactions",
    scientificName: "Dietary Hypersensitivity & Dysbiosis",
    categoryLabel: "Food & Digestion",
    summary:
      "When the digestive lining is inflamed or enzymes are low, certain food proteins (like dairy, gluten, or soy) trigger bloating, cramps, skin eruptions, and fatigue. A gentle elimination period and gut-healing spices restore harmony.",
    symptoms: [
      "Bloating, gas, and abdominal cramps within 1 to 2 hours after meals",
      "Sudden brain fog, sluggishness, or headache after eating",
      "Skin flare-ups (eczema or pimples) 24 to 48 hours later",
      "Irregular, loose, or unpredictable bowel movements",
    ],
    homeRemedies: [
      {
        name: "Cumin, Coriander & Fennel (CCF) Digestive Tea",
        instructions:
          "Boil 1/2 teaspoon each of whole cumin, coriander, and fennel seeds in 3 cups of water for 8 minutes. Strain and sip warm 20 minutes before meals to stimulate natural digestive fire.",
      },
      {
        name: "21-Day Mindful Elimination",
        instructions:
          "Pause the suspected trigger (such as commercial dairy or refined wheat) for 21 days. Notice your energy and digestion. Reintroduce one food at a time to clearly identify your body's response.",
      },
      {
        name: "Slow Chewing & Mealtime Presence",
        instructions:
          "Chew each mouthful 20 to 30 times. Saliva contains crucial enzymes that begin carbohydrate breakdown and signal stomach acid production.",
      },
    ],
    dietProtocol: {
      eat: [
        "Probiotic-rich homemade curd, fermented rice kanji, or coconut yogurt",
        "Easily digestible sprouted yellow moong dal and steamed squashes",
        "Gentle warming spices: ginger, turmeric, cardamom, and cumin",
        "Soaked chia seeds and warm oatmeal for soluble gut fiber",
      ],
      avoid: [
        "Identified personal food triggers (milk, gluten, nuts, soy)",
        "Ultra-processed packaged foods with synthetic emulsifiers",
        "Artificial sweeteners (sucralose, aspartame) that alter microbiome flora",
      ],
    },
    lifestyleTips: [
      "Take 3 deep diaphragmatic breaths before taking your first bite of food",
      "Avoid chugging large glasses of ice water during meals (dilutes gastric juices)",
      "Leave at least 3 hours between dinner and your bedtime",
    ],
    redFlags: [
      "Hives accompanied by throat swelling or breathing issues (Seek Emergency Care)",
      "Severe persistent abdominal pain or blood in stool",
      "Rapid unexplained weight loss or severe nutrient malabsorption",
    ],
  },
  {
    id: "skin-allergies-hives",
    category: "allergies",
    title: "Skin Allergies, Hives & Welts",
    subtitle: "Relieving sudden itchy rashes, red welts, and reactive skin",
    scientificName: "Acute Urticaria / Contact Dermatitis",
    categoryLabel: "Skin Allergy",
    summary:
      "Hives appear when mast cells in the skin release histamine, causing fluid to pool in small raised welts that itch intensely. Cooling the skin, applying colloidal oatmeal, and avoiding harsh soaps stops the histamine cycle.",
    symptoms: [
      "Raised, itchy red or skin-colored welts (hives) that shift locations",
      "Burning, prickly, or stinging skin sensation",
      "Rashes triggered by heat, friction, detergents, or emotional stress",
      "Skin that flushes red when gently scratched",
    ],
    homeRemedies: [
      {
        name: "Colloidal Oatmeal Cool Soak",
        instructions:
          "Grind plain rolled oats into a fine powder and mix into cool water until milky. Dip a clean washcloth and apply over the welts for 15 minutes. Oat beta-glucans naturally calm dermal itch receptors.",
      },
      {
        name: "Pure Cold Aloe Vera Gel",
        instructions:
          "Apply pure aloe vera gel directly from the leaf onto inflamed areas. Its cooling polysaccharides soothe burning without clogging pores.",
      },
      {
        name: "Loose, Soft Cotton Garments",
        instructions:
          "Wear loose cotton clothes without tight elastics. Avoid synthetic fabrics and rough wools that generate friction and trigger mast cells.",
      },
    ],
    dietProtocol: {
      eat: [
        "Cooling foods: cucumber, watermelon, celery, and fresh mint",
        "Zinc-rich pumpkin seeds and almonds to stabilize skin immunity",
        "Warm green tea packed with anti-inflammatory polyphenols",
      ],
      avoid: [
        "Aged cheeses, cured meats, and fermented alcoholic drinks",
        "Fiery hot chili peppers, vinegar, and synthetic seasonings",
        "Artificial food colors, tartrazine, and benzoates",
      ],
    },
    lifestyleTips: [
      "Take lukewarm or cool showers; hot water immediately provokes hives",
      "Switch to fragrance-free, hypoallergenic laundry detergents and soaps",
      "Keep fingernails trimmed short to avoid scratching and skin tears",
    ],
    redFlags: [
      "Swelling of the lips, tongue, eyelids, or throat (Angioedema - Emergency)",
      "Trouble breathing, hoarseness, or feeling faint",
      "Welts accompanied by high fever or joint swelling",
    ],
  },
  {
    id: "hair-fall-loss",
    category: "hair_care",
    title: "Hair Fall, Thinning & Root Weakness",
    subtitle: "Nourishing follicles, reducing shedding, and restoring hair volume",
    scientificName: "Telogen Effluvium & Follicular Atrophy",
    categoryLabel: "Hair & Scalp",
    summary:
      "Hair shedding (losing over 100 strands a day) is usually a signal of internal depletion: low ferritin (iron), protein gaps, high stress cortisol, or hormonal shifts like PCOS. Feeding roots with complete protein, rosemary massage, and gentle handling restores regrowth.",
    symptoms: [
      "Excess hair strands on pillow, shower drain, and wide-tooth comb",
      "Noticeably thinner ponytail circumference or widening part line",
      "Dry, brittle hair that snaps easily near the ends",
      "Shedding that started 2 to 3 months after a period of illness or high stress",
    ],
    homeRemedies: [
      {
        name: "Rosemary & Virgin Coconut Scalp Massage",
        instructions:
          "Mix 3 to 4 drops of pure rosemary essential oil into 1 tablespoon of warm cold-pressed coconut oil. Gently massage into your scalp with fingertips for 5 minutes twice weekly, leaving it for 2 hours before washing. Clinically shown to support follicular microcirculation.",
      },
      {
        name: "Fresh Amla & Curry Leaf Tonic",
        instructions:
          "Blend fresh curry leaves and amla (Indian gooseberry) with a little water into a paste. Apply as a scalp pack for 30 minutes once a week. Packed with beta-carotene and Vitamin C to anchor roots.",
      },
      {
        name: "Wooden Comb & Gentle Detangling",
        instructions:
          "Use a wide-tooth wooden comb. Always start detangling from the tips and work gently toward the roots. Never brush vigorously when hair is wet and vulnerable.",
      },
    ],
    dietProtocol: {
      eat: [
        "Adequate complete protein: paneer, Greek yogurt, sprouted moong, eggs, or tofu",
        "Iron & Vitamin C duo: spinach with a lemon squeeze, beetroot, and soaked black raisins",
        "Pumpkin seeds: rich in zinc and plant phytosterols for follicle balance",
        "Walnuts, chia seeds, and flaxseeds for omega-3 natural oils",
      ],
      avoid: [
        "Crash diets and severe calorie cuts (<1,200 kcal) that shock hair into resting phase",
        "Refined sugary snacks that cause insulin spikes and elevate scalp androgens",
        "Excessive alcohol and nutrient-depleting processed foods",
      ],
    },
    lifestyleTips: [
      "Sleep on a silk or satin pillowcase to stop overnight friction and strand breakage",
      "Avoid tight buns, high ponytails, or rubber bands that pull roots",
      "Wash hair with lukewarm or cool water rather than steaming hot showers",
    ],
    redFlags: [
      "Sudden, smooth, coin-sized circular bald patches (possible Alopecia Areata)",
      "Severe scalp redness, oozing pustules, or burning scalp pain",
      "Heavy shedding lasting longer than 12 consecutive weeks without slowing",
      "Hair loss paired with extreme fatigue, cold hands, or irregular periods (check thyroid and ferritin)",
    ],
  },
  {
    id: "dandruff-scalp",
    category: "hair_care",
    title: "Dandruff & Itchy, Flaky Scalp",
    subtitle: "Clearing flakes, balancing scalp oils, and restoring pH harmony",
    scientificName: "Pityriasis Capitis & Seborrheic Dermatitis",
    categoryLabel: "Scalp Care",
    summary:
      "Dandruff occurs when the scalp's natural microscopic yeast (Malassezia) feeds on excess sebum oils, causing skin cells to shed rapidly as white or greasy yellow flakes. Clarifying rinses and antifungal herbs restore scalp balance.",
    symptoms: [
      "White or yellowish flakes on hair strands, scalp, and shirt shoulders",
      "Persistent scalp itchiness and feeling of tightness",
      "Greasy patches on scalp that feel irritated in humid weather",
      "Flaking that gets worse during winter or high-stress periods",
    ],
    homeRemedies: [
      {
        name: "Diluted Apple Cider Vinegar (ACV) Scalp Rinse",
        instructions:
          "Mix 1 part raw apple cider vinegar with 3 parts water. After shampooing, pour over your scalp, massage gently for 2 minutes, and rinse with cool water. Rebalances scalp pH to 5.5, naturally inhibiting yeast.",
      },
      {
        name: "Tea Tree Oil & Fresh Aloe Vera Serum",
        instructions:
          "Add 3 drops of 100% pure tea tree oil into 2 tablespoons of fresh aloe vera gel. Apply directly to your scalp parts 30 minutes before washing. Tea tree is a time-tested antifungal agent.",
      },
      {
        name: "Targeted Antifungal Wash Routine",
        instructions:
          "Use a shampoo with Ketoconazole (1–2%) or Zinc Pyrithione twice a week. Let the lather sit on your scalp for 5 full minutes before rinsing so the active ingredients can work.",
      },
    ],
    dietProtocol: {
      eat: [
        "Probiotic foods like fresh curd or kefir to balance whole-body microbes",
        "Zinc-packed pumpkin seeds, chickpeas, and cashews",
        "Antioxidant-dense leafy greens and colorful seasonal vegetables",
      ],
      avoid: [
        "Sugary sweets and refined baked yeast pastries that feed fungal colonies",
        "Deep-fried street foods and excessively greasy snacks",
        "Heavy synthetic styling gels and silicones that choke scalp pores",
      ],
    },
    lifestyleTips: [
      "Wash your hairbrush and comb weekly in warm soapy water",
      "Never go to sleep with damp or wet hair; damp warmth encourages yeast",
      "Avoid scratching flakes with fingernails to prevent micro-abrasions and infection",
    ],
    redFlags: [
      "Scalp becomes severely red, swollen, oozes crust, or bleeds",
      "Flakes spread across eyebrows, sides of nose, or chest",
      "Medicated shampoos show no relief after 4 weeks of consistent use",
    ],
  },
  {
    id: "acne-breakouts",
    category: "skin_care",
    title: "Acne, Breakouts & Sebum Balance",
    subtitle: "Clearing pimples, balancing skin oils, and healing from within",
    scientificName: "Acne Vulgaris & Sebaceous Hyperactivity",
    categoryLabel: "Skin & Blemishes",
    summary:
      "Breakouts occur when oil glands produce excess sebum, mixing with dead skin cells and bacteria inside pores. Hormonal swings and blood-sugar spikes exacerbate this cycle. Gentle cleansing, tea tree soothing, and anti-androgenic nutrition calm the skin naturally.",
    symptoms: [
      "Red inflamed pimples, blackheads, and whiteheads on face, chest, or back",
      "Tender, deeper hormonal bumps along the jawline and chin",
      "Skin feels very oily within a few hours after washing",
      "Post-pimple red or brown marks that take weeks to fade",
    ],
    homeRemedies: [
      {
        name: "Tea Tree Night Spot Dab",
        instructions:
          "Dip a clean cotton swab in 5% diluted tea tree oil and touch directly onto active pimples before sleep. It delivers antimicrobial benefits without the harsh peeling of synthetic chemicals.",
      },
      {
        name: "Cooled Green Tea & Honey Calming Mask",
        instructions:
          "Mix 1 tablespoon of cooled brewed green tea with 1 teaspoon of raw honey. Apply over clean skin for 15 minutes, then rinse. Green tea polyphenols naturally reduce sebum production.",
      },
      {
        name: "Gentle Salicylic Cleansing (60 Seconds)",
        instructions:
          "Wash with a gentle 1% to 2% salicylic acid or gentle foaming cleanser for a full 60 seconds, allowing the active ingredients to dissolve pore debris before rinsing with lukewarm water.",
      },
    ],
    dietProtocol: {
      eat: [
        "Spearmint tea (1 to 2 cups daily, known to help balance natural androgens)",
        "Zinc-rich foods: pumpkin seeds, lentils, almonds, and oats",
        "Colorful antioxidant foods: carrots, bell peppers, tomatoes, and berries",
        "At least 2.5 liters of clean water daily for skin hydration",
      ],
      avoid: [
        "High-glycemic white flour, sugary drinks, and candy that cause insulin surges",
        "Excess commercial cow dairy if you notice it triggers jawline breakouts",
        "Reused cooking oils and heavily processed hydrogenated fats",
      ],
    },
    lifestyleTips: [
      "Change pillowcases every 3 to 4 days to keep bacteria away from your cheeks",
      "Wipe down your smartphone screen daily with a gentle alcohol wipe",
      "Never pick or squeeze pimples; it pushes inflammation deeper and creates scars",
    ],
    redFlags: [
      "Deep, painful, hard nodules that linger under the skin for weeks",
      "Noticeable pitted or raised scars forming from breakouts",
      "Sudden adult acne accompanied by irregular periods or unusual hair growth (Consult for PCOS)",
    ],
  },
  {
    id: "dry-sensitive-skin",
    category: "skin_care",
    title: "Dry Skin, Barrier Repair & Flaking",
    subtitle: "Restoring the moisture barrier, soothing tightness, and locking in hydration",
    scientificName: "Xerosis Cutis & Transepidermal Water Loss",
    categoryLabel: "Skin Barrier",
    summary:
      "When the skin's lipid barrier (ceramides and natural fatty acids) is weakened by harsh weather or stripping cleansers, moisture evaporates quickly. Skin feels tight, rough, and easily irritated. Nourishing lipids and damp-skin moisturizing rebuild protection.",
    symptoms: [
      "Tight, uncomfortable feeling across your face right after washing",
      "Flaking, rough sandpaper texture, and fine dry lines",
      "Mild stinging or burning when applying everyday lotions",
      "Redness that flares up in dry wind or air-conditioned rooms",
    ],
    homeRemedies: [
      {
        name: "The 60-Second Damp Skin Hydration Rule",
        instructions:
          "After washing your face, pat gently so skin remains damp. Apply your moisturizer within 60 seconds. This locks water into skin cells before it evaporates into dry room air.",
      },
      {
        name: "Pure Aloe Vera & Rose Water Hydrosol",
        instructions:
          "Mist pure rose water over clean skin, then apply a thin layer of pure aloe vera gel. Its natural polysaccharides bond moisture directly to skin cells without greasy weight.",
      },
      {
        name: "Cold-Pressed Jojoba or Squalane Oil Seal",
        instructions:
          "Warm 2 to 3 drops of pure squalane or cold-pressed jojoba oil between clean palms and press gently onto cheeks as your final evening step. It closely mimics your skin's natural protective sebum.",
      },
    ],
    dietProtocol: {
      eat: [
        "Nourishing healthy fats: A2 cow ghee, cold-pressed olive oil, avocados, and flaxseeds",
        "Omega-3 fatty acids from walnuts, chia seeds, and fatty fish",
        "Water-rich juicy fruits: sweet limes, oranges, watermelon, and cucumber",
      ],
      avoid: [
        "Excessive coffee, tea, and alcohol which pull moisture from cells",
        "Very salty packaged snacks that cause cellular dehydration",
        "Harsh detox fads that strip essential dietary fats",
      ],
    },
    lifestyleTips: [
      "Keep shower time under 8 minutes and use lukewarm water instead of steaming hot water",
      "Switch to a gentle, milky lotion cleanser rather than foaming bar soaps",
      "Use a bedside humidifier during dry seasons or in air-conditioned rooms",
    ],
    redFlags: [
      "Skin develops deep fissures that crack, bleed, or ooze",
      "Severe peeling, widespread blistering, or hot spreading rashes",
      "Intense burning and dryness that does not improve after 3 weeks of lipid care",
    ],
  },
  {
    id: "skin-glow-pigmentation",
    category: "skin_care",
    title: "Sun Spots, Hyperpigmentation & Natural Glow",
    subtitle: "Evening skin tone, fading dark marks, and restoring natural radiance",
    scientificName: "Melasma, Post-Inflammatory Hyperpigmentation & Photodamage",
    categoryLabel: "Radiance & Tone",
    summary:
      "Dark patches and stubborn marks happen when skin pigment cells (melanocytes) produce excess melanin in response to sun exposure or past acne inflammation. Consistent daily mineral sunscreen, antioxidant-rich foods, and gentle natural exfoliants restore uniform light reflection.",
    symptoms: [
      "Brown patches, sun spots, or freckles on forehead, cheeks, or upper lip",
      "Dull, tired complexion that lacks natural light reflection",
      "Dark spots that remain long after a blemish has healed",
    ],
    homeRemedies: [
      {
        name: "Daily Mineral SPF 50 (Rain or Shine)",
        instructions:
          "Apply two finger-lengths of broad-spectrum SPF 50 sunscreen every morning, even on cloudy days. Ultraviolet rays easily penetrate cloud cover and windows, instantly triggering pigment cells.",
      },
      {
        name: "Wild Turmeric (Kasturi Manjal) & Besan Ubtan",
        instructions:
          "Mix 1 tablespoon of besan (gram flour) with a pinch of non-staining Kasturi Manjal and 2 tablespoons of fresh curd. Apply for 12 minutes, then wash gently with cool water. Natural lactic acid smooths dull surface cells.",
      },
      {
        name: "Daily Vitamin C Boost",
        instructions:
          "Enjoy 1 fresh amla (Indian gooseberry) or a glass of fresh lemon-pomegranate juice every day. Internal Vitamin C works hand-in-hand with topical care to calm melanin production.",
      },
    ],
    dietProtocol: {
      eat: [
        "Lycopene-rich cooked tomatoes and red bell peppers (natural internal UV defense)",
        "Vitamin C champions: amla, guava, papaya, kiwi, and oranges",
        "Fresh green tea rich in polyphenols that protect collagen",
        "Soaked almonds and sunflower seeds for Vitamin E cell protection",
      ],
      avoid: [
        "Refined white sugar and fried treats that accelerate collagen glycation",
        "Tobacco smoke and exposure to heavy vehicle exhaust",
        "Unprotected outdoor sun exposure during harsh midday hours (11 AM – 3 PM)",
      ],
    },
    lifestyleTips: [
      "Get 7.5 to 8.5 hours of uninterrupted sleep; cellular skin regeneration peaks at night",
      "Do a gentle 2-minute facial upward massage each morning to boost lymphatic flow",
      "Wear UV sunglasses and a cotton hat when spending long hours outdoors",
    ],
    redFlags: [
      "Any mole or spot that changes size, shape, borders, or color (ABCDE criteria)",
      "Dark marks that itch, bleed, or crust over spontaneously",
      "Rapidly spreading dark discoloration across wide bodily areas",
    ],
  },
];

const QUICK_TOPICS = [
  "Fever & body chills",
  "Runny nose & sore throat",
  "Morning dust sneezing",
  "Hair fall & fragile strands",
  "Dandruff & itchy scalp",
  "Breakouts along jawline",
  "Tight, dry & stinging skin",
  "Sun marks & uneven tone",
];

export default function HealthCarePage() {
  const { emergencyInfo } = useEmergencyLocation();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [symptomInput, setSymptomInput] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);
  const [consultResult, setConsultResult] = useState<CareAnalysisResponse | null>(null);
  const [consultError, setConsultError] = useState("");
  const [selectedConditionModal, setSelectedConditionModal] = useState<ConditionGuide | null>(null);

  const handleConsultAI = async (overrideQuery?: string) => {
    const q = (overrideQuery || symptomInput).trim();
    if (!q) {
      setConsultError("Please describe what symptom or concern you are experiencing.");
      return;
    }

    setConsultError("");
    setIsConsulting(true);

    try {
      const res = await fetch("/api/care/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptomText: q }),
      });

      if (!res.ok) throw new Error("Could not process care request");
      const data: CareAnalysisResponse = await res.json();
      setConsultResult(data);
    } catch (err) {
      console.error("AI Consultation error:", err);
      setConsultError("Failed to fetch care guidance. Please try again.");
    } finally {
      setIsConsulting(false);
    }
  };

  const filteredGuides = CONDITION_GUIDES.filter((guide) => {
    const matchesTab = activeTab === "all" || guide.category === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      guide.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.homeRemedies.some((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-[1760px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-14 py-10 space-y-12">
      {/* Editorial Header */}
      <div className="space-y-4 max-w-4xl">
        <span className="text-xs font-serif italic text-[var(--accent)] tracking-wide">
          Health Guide Grace • Common Illnesses, Allergies & Skin Care
        </span>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[var(--text)] tracking-tight leading-tight">
          Health Care & Home Remedies
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed font-light">
          Simple kitchen remedies, nourishing broths, and evidence-based home care for everyday health: viral fever, seasonal colds, allergies, hair fall, and skin restoration.
        </p>

        <div className="pt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <ShieldCheck className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <span>
            Gentle wellness guidance for comfortable recovery. Always consult a physician for urgent red flag symptoms.
          </span>
        </div>
      </div>

      {/* SECTION 1: Talk With Grace (Humanized Consultation) */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span>Talk with Grace • Personal Health Care</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--text)]">
            Describe what you&apos;re feeling
          </h2>

          <p className="text-sm text-[var(--text-muted)] max-w-3xl leading-relaxed">
            Tell Grace what is bothering you — whether it&apos;s a persistent temperature, morning sneezes, excessive hair shedding, or irritated skin. She will suggest home remedies, healing foods, and clear guidance on when to see a doctor.
          </p>
        </div>

        {/* Input Textarea & Button */}
        <div className="space-y-4">
          <textarea
            rows={3}
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            placeholder="e.g. Woke up with a rough scratchy throat, mild fever and chills... what helps right now?"
            className="w-full p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-sm sm:text-base text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-all resize-none"
          />

          {consultError && (
            <p className="text-xs text-[var(--danger)] font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{consultError}</span>
            </p>
          )}

          {/* Natural symptom scenario chips */}
          <div className="space-y-2">
            <span className="text-xs text-[var(--text-muted)] block">
              Or tap a common concern:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSymptomInput(topic);
                    handleConsultAI(topic);
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs bg-[var(--surface-elevated)] hover:bg-[var(--primary-light)] text-[var(--text)] hover:text-[var(--primary)] border border-[var(--border)] hover:border-[var(--primary)] transition-all"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleConsultAI()}
            disabled={isConsulting || !symptomInput.trim()}
            className="px-7 py-3.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {isConsulting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Grace is preparing your care guidance...</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4" />
                <span>Show Remedies & Care Protocol</span>
              </>
            )}
          </button>
        </div>

        {/* AI Consultation Result Card */}
        {consultResult && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--background)] border border-[var(--border)] space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
              <div>
                <span className="text-xs font-serif italic text-[var(--accent)]">
                  Care Guidance & Home Steps
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--text)] mt-0.5">
                  {consultResult.conditionIdentified}
                </h3>
              </div>

              <span className="text-xs font-medium text-[var(--text-muted)]">
                Status: <strong className="text-[var(--text)]">{consultResult.severityLevel}</strong>
              </span>
            </div>

            {/* Overview */}
            <div className="text-sm text-[var(--text)] leading-relaxed">
              <strong className="block font-serif text-base text-[var(--primary)] mb-1">
                What is happening in your body:
              </strong>
              {consultResult.overview}
            </div>

            {/* Remedies & Diet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Home Remedies */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)] block">
                  Kitchen & Home Remedies
                </span>
                <div className="space-y-3">
                  {consultResult.homeRemedies.map((hr, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="text-xs font-semibold text-[var(--text)] flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                        <span>{hr.remedy}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-5">
                        {hr.howToUse}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diet Protocol */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] block">
                  Healing Foods & What to Rest From
                </span>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-medium text-[var(--success)] block mb-1">
                      ✓ Gentle & Nourishing:
                    </span>
                    <ul className="text-xs text-[var(--text)] space-y-1">
                      {consultResult.dietAndHydration.recommended.map((food, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[var(--primary)] font-bold">•</span>
                          <span>{food}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-[var(--danger)] block mb-1">
                      ✕ Things to Pause:
                    </span>
                    <ul className="text-xs text-[var(--text)] space-y-1">
                      {consultResult.dietAndHydration.avoid.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[var(--danger)] font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Red Flags & Safety */}
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--danger)]/30 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--danger)] block">
                When to See a Doctor (Red Flag Signs)
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text)]">
                {consultResult.whenToSeeDoctor.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[var(--danger)] shrink-0 mt-0.5" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Supportive Closing Message */}
            <div className="p-4 rounded-2xl bg-[var(--primary-light)] border border-[var(--primary-border)] text-xs text-[var(--text)] italic leading-relaxed">
              🌿 <strong>From Grace:</strong> &ldquo;{consultResult.supportiveMessage}&rdquo;
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Category Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--text)]">
              Curated Care Protocols
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Browse detailed home remedies, nutritional guidance, and doctor thresholds.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fever, hair fall, acne, cold..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: "All Topics" },
            { id: "fever_cold", label: "Fever & Cold" },
            { id: "allergies", label: "Allergies" },
            { id: "hair_care", label: "Hair & Scalp" },
            { id: "skin_care", label: "Skin & Glow" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-[var(--text)] text-[var(--background)] font-semibold"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: Condition Cards Grid (Expansive 3-Column Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            className="p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
          >
            {/* Card Header */}
            <div className="space-y-3">
              <span className="text-[11px] font-serif italic text-[var(--accent)] block">
                {guide.categoryLabel}
              </span>

              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[var(--text)] group-hover:text-[var(--primary)] transition-colors leading-snug">
                  {guide.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {guide.subtitle}
                </p>
              </div>

              <p className="text-xs text-[var(--text)] leading-relaxed line-clamp-3 pt-1">
                {guide.summary}
              </p>
            </div>

            {/* Symptoms snippet */}
            <div className="space-y-2 pt-3 border-t border-[var(--border)]">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-muted)] block">
                Common Signs
              </span>
              <ul className="space-y-1 text-xs text-[var(--text)]">
                {guide.symptoms.slice(0, 3).map((sym, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                    <span className="text-[var(--primary)] font-bold shrink-0">•</span>
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card Actions */}
            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedConditionModal(guide)}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Read Full Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setSymptomInput(`I need guidance on ${guide.title}`);
                  window.scrollTo({ top: 220, behavior: "smooth" });
                }}
                className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
              >
                <span>Ask Grace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Condition Modal */}
      {selectedConditionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="max-w-3xl w-full max-h-[90vh] bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-[var(--border)] bg-[var(--surface-elevated)] flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-serif italic text-[var(--accent)]">
                  {selectedConditionModal.categoryLabel}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--text)] mt-1">
                  {selectedConditionModal.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {selectedConditionModal.subtitle}
                </p>
              </div>

              <button
                onClick={() => setSelectedConditionModal(null)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm">
              {/* Biological Overview */}
              <div className="p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                <strong className="block font-serif text-base text-[var(--primary)] mb-1">
                  What is happening:
                </strong>
                {selectedConditionModal.summary}
              </div>

              {/* Home Remedies */}
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-normal text-[var(--text)] flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[var(--primary)]" />
                  <span>Kitchen & Home Remedies</span>
                </h4>
                <div className="space-y-3">
                  {selectedConditionModal.homeRemedies.map((remedy, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-1"
                    >
                      <div className="text-xs font-semibold text-[var(--text)] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
                        <span>{remedy.name}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-6">
                        {remedy.instructions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition & Diet Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-2">
                  <span className="text-xs font-semibold text-[var(--success)] block">
                    ✓ Foods & Herbs to Enjoy
                  </span>
                  <ul className="text-xs text-[var(--text)] space-y-1.5">
                    {selectedConditionModal.dietProtocol.eat.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[var(--primary)] font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-2">
                  <span className="text-xs font-semibold text-[var(--danger)] block">
                    ✕ Things to Pause
                  </span>
                  <ul className="text-xs text-[var(--text)] space-y-1.5">
                    {selectedConditionModal.dietProtocol.avoid.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[var(--danger)] font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Lifestyle & Environment */}
              <div className="p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-2">
                <span className="text-xs font-semibold text-[var(--primary)] block">
                  Rest & Room Environment
                </span>
                <ul className="text-xs text-[var(--text)] space-y-1.5">
                  {selectedConditionModal.lifestyleTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Red Flags / Doctor Threshold */}
              <div className="p-5 rounded-2xl bg-[var(--danger)]/10 border border-[var(--danger)]/25 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--danger)] uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-[var(--danger)]" />
                  <span>When to Consult a Physician Immediately</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--text)]">
                  {selectedConditionModal.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-[var(--danger)] shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[var(--danger)]/20 mt-3">
                  <span className="text-[11px] text-[var(--danger)] font-medium">
                    Experiencing severe acute symptoms?
                  </span>
                  <a
                    href={`tel:${emergencyInfo.primaryEmergency}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--danger)] text-white text-xs font-bold hover:opacity-90 transition-opacity self-start sm:self-auto shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call {emergencyInfo.primaryEmergency} ({emergencyInfo.countryName})</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                graceAI • Holistic Health Protocols
              </span>
              <button
                onClick={() => setSelectedConditionModal(null)}
                className="px-6 py-2.5 rounded-xl bg-[var(--text)] text-[var(--background)] font-medium text-xs hover:opacity-90"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
