"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  Check,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Flame,
  Utensils,
  Sun,
  Coffee,
  Sunset,
  Moon,
  RotateCcw,
  ChefHat,
  ChevronRight,
} from "lucide-react";
import { useRealTime } from "@/lib/use-real-time";
import { DayOfWeek, MealSlotName } from "@/lib/date-utils";

export interface RhythmMealItem {
  day: DayOfWeek;
  slot: MealSlotName;
  recipeTitle: string;
  origin: string;
  prepTime: string;
  kcal: number;
  proteinG: number;
  proteinLabel: string;
  carbsG: number;
  carbsLabel: string;
  fibreG: number;
  fibreLabel: string;
  fatG: number;
  imageUrl: string;
  windowLabel: string;
}

// 7 Days × 4 Meals = 28 Authentic, clinical-grade recipes
export const WEEKLY_RHYTHM_MATRIX: Record<DayOfWeek, Record<MealSlotName, RhythmMealItem>> = {
  Monday: {
    Breakfast: {
      day: "Monday",
      slot: "Breakfast",
      recipeTitle: "South Indian Moong Dal Idli & Coconut Chutney",
      origin: "Tamil Nadu",
      prepTime: "20 min prep",
      kcal: 320,
      proteinG: 12,
      proteinLabel: "Clean lentils",
      carbsG: 52,
      carbsLabel: "Fermented grains",
      fibreG: 7,
      fibreLabel: "Soluble prebiotic fibre",
      fatG: 6,
      imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
      windowLabel: "Breakfast window: 7:30 AM – 9:30 AM",
    },
    Lunch: {
      day: "Monday",
      slot: "Lunch",
      recipeTitle: "Kerala Moong & Brown Rice Bowl",
      origin: "Kerala",
      prepTime: "25 min prep",
      kcal: 480,
      proteinG: 18,
      proteinLabel: "Clean lentils",
      carbsG: 68,
      carbsLabel: "Unpolished rice",
      fibreG: 9,
      fibreLabel: "High gut satiety",
      fatG: 8,
      imageUrl: "/images/dishes/moong_khichdi.jpg",
      windowLabel: "Lunch window: 12:30 PM – 2:30 PM",
    },
    Snack: {
      day: "Monday",
      slot: "Snack",
      recipeTitle: "Roasted Makhana (Fox Nuts) with Mint Chai",
      origin: "North India",
      prepTime: "10 min prep",
      kcal: 150,
      proteinG: 5,
      proteinLabel: "Lotus seed protein",
      carbsG: 22,
      carbsLabel: "Low-glycemic crunch",
      fibreG: 4,
      fibreLabel: "Light gut satiety",
      fatG: 4,
      imageUrl: "/images/dishes/roasted_makhana_chai.jpg",
      windowLabel: "Snack window: 4:30 PM – 6:00 PM",
    },
    Dinner: {
      day: "Monday",
      slot: "Dinner",
      recipeTitle: "Mediterranean Roasted Vegetable & Lentil Salad",
      origin: "Greece",
      prepTime: "25 min prep",
      kcal: 410,
      proteinG: 20,
      proteinLabel: "French green lentils",
      carbsG: 48,
      carbsLabel: "Roasted courgettes",
      fibreG: 11,
      fibreLabel: "Slow digestive greens",
      fatG: 10,
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
      windowLabel: "Dinner window: 7:30 PM – 9:30 PM",
    },
  },
  Tuesday: {
    Breakfast: {
      day: "Tuesday",
      slot: "Breakfast",
      recipeTitle: "Steel-Cut Oats with Chia, Figs & Almonds",
      origin: "Global Hearth",
      prepTime: "15 min prep",
      kcal: 350,
      proteinG: 12,
      proteinLabel: "Chia & raw almonds",
      carbsG: 56,
      carbsLabel: "Beta-glucan oats",
      fibreG: 10,
      fibreLabel: "Heart-protective fibre",
      fatG: 8,
      imageUrl: "/images/dishes/steel_cut_oats.jpg",
      windowLabel: "Breakfast window: 7:30 AM – 9:30 AM",
    },
    Lunch: {
      day: "Tuesday",
      slot: "Lunch",
      recipeTitle: "Palak Paneer with Multigrain Phulka",
      origin: "Punjab",
      prepTime: "25 min prep",
      kcal: 510,
      proteinG: 24,
      proteinLabel: "Fresh cottage paneer",
      carbsG: 46,
      carbsLabel: "Whole grain phulkas",
      fibreG: 8,
      fibreLabel: "Iron-rich spinach greens",
      fatG: 14,
      imageUrl: "/images/dishes/palak_paneer.jpg",
      windowLabel: "Lunch window: 12:30 PM – 2:30 PM",
    },
    Snack: {
      day: "Tuesday",
      slot: "Snack",
      recipeTitle: "Cucumber & Carrot Sticks with Spiced Curd Dip",
      origin: "Global",
      prepTime: "5 min prep",
      kcal: 120,
      proteinG: 6,
      proteinLabel: "Probiotic yogurt",
      carbsG: 16,
      carbsLabel: "Hydrating raw crudités",
      fibreG: 5,
      fibreLabel: "Cooling digestion",
      fatG: 3,
      imageUrl: "/images/dishes/crudites.jpg",
      windowLabel: "Snack window: 4:30 PM – 6:00 PM",
    },
    Dinner: {
      day: "Tuesday",
      slot: "Dinner",
      recipeTitle: "Kyoto Miso Tofu & Vegetable Clear Broth",
      origin: "Japan",
      prepTime: "20 min prep",
      kcal: 360,
      proteinG: 22,
      proteinLabel: "Silken tofu & edamame",
      carbsG: 38,
      carbsLabel: "Shiitake & bok choy",
      fibreG: 7,
      fibreLabel: "Fermented miso flora",
      fatG: 6,
      imageUrl: "/images/dishes/miso_soup.jpg",
      windowLabel: "Dinner window: 7:30 PM – 9:30 PM",
    },
  },
  Wednesday: {
    Breakfast: {
      day: "Wednesday",
      slot: "Breakfast",
      recipeTitle: "Rava Upma with Mixed Vegetables & Ginger",
      origin: "Karnataka",
      prepTime: "15 min prep",
      kcal: 310,
      proteinG: 9,
      proteinLabel: "Roasted semolina & peas",
      carbsG: 54,
      carbsLabel: "Complex durum wheat",
      fibreG: 6,
      fibreLabel: "Ginger root satiety",
      fatG: 6,
      imageUrl: "/images/dishes/rava_upma.jpg",
      windowLabel: "Breakfast window: 7:30 AM – 9:30 AM",
    },
    Lunch: {
      day: "Wednesday",
      slot: "Lunch",
      recipeTitle: "Chettinad Mushroom Biryani & Beetroot Raita",
      origin: "Tamil Nadu",
      prepTime: "30 min prep",
      kcal: 490,
      proteinG: 16,
      proteinLabel: "Cremini mushroom protein",
      carbsG: 66,
      carbsLabel: "Cumin basmati rice",
      fibreG: 8,
      fibreLabel: "Beetroot polyphenol fibre",
      fatG: 10,
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
      windowLabel: "Lunch window: 12:30 PM – 2:30 PM",
    },
    Snack: {
      day: "Wednesday",
      slot: "Snack",
      recipeTitle: "Sprouted Moong Chaat with Pomegranate & Lime",
      origin: "Maharashtra",
      prepTime: "10 min prep",
      kcal: 160,
      proteinG: 8,
      proteinLabel: "Bio-available sprouts",
      carbsG: 26,
      carbsLabel: "Pomegranate arils",
      fibreG: 6,
      fibreLabel: "Enzyme active crunch",
      fatG: 2,
      imageUrl: "/images/dishes/crudites.jpg",
      windowLabel: "Snack window: 4:30 PM – 6:00 PM",
    },
    Dinner: {
      day: "Wednesday",
      slot: "Dinner",
      recipeTitle: "Baked Herbed Paneer with Steamed Broccoli",
      origin: "Mediterranean",
      prepTime: "25 min prep",
      kcal: 430,
      proteinG: 28,
      proteinLabel: "Herb roasted paneer",
      carbsG: 24,
      carbsLabel: "Cruciferous broccoli",
      fibreG: 8,
      fibreLabel: "Sulforaphane rich greens",
      fatG: 12,
      imageUrl: "/images/dishes/palak_paneer.jpg",
      windowLabel: "Dinner window: 7:30 PM – 9:30 PM",
    },
  },
  Thursday: {
    Breakfast: {
      day: "Thursday",
      slot: "Breakfast",
      recipeTitle: "Besan Chilla with Grated Paneer & Mint Chutney",
      origin: "Rajasthan",
      prepTime: "15 min prep",
      kcal: 340,
      proteinG: 16,
      proteinLabel: "Gram flour & paneer",
      carbsG: 38,
      carbsLabel: "Slow-burning chickpea",
      fibreG: 6,
      fibreLabel: "Mint & coriander greens",
      fatG: 8,
      imageUrl: "/images/dishes/besan_chilla.jpg",
      windowLabel: "Breakfast window: 7:30 AM – 9:30 AM",
    },
    Lunch: {
      day: "Thursday",
      slot: "Lunch",
      recipeTitle: "Rajma (Red Kidney Beans) with Jeera Brown Rice",
      origin: "Punjab",
      prepTime: "30 min prep",
      kcal: 520,
      proteinG: 22,
      proteinLabel: "Clean kidney beans",
      carbsG: 72,
      carbsLabel: "Cumin-infused brown rice",
      fibreG: 12,
      fibreLabel: "High satiety legume fibre",
      fatG: 7,
      imageUrl: "/images/dishes/rajma.jpg",
      windowLabel: "Lunch window: 12:30 PM – 2:30 PM",
    },
    Snack: {
      day: "Thursday",
      slot: "Snack",
      recipeTitle: "Roasted Walnuts & Pumpkin Seeds with Green Tea",
      origin: "Global",
      prepTime: "5 min prep",
      kcal: 180,
      proteinG: 6,
      proteinLabel: "Zinc-rich pumpkin seeds",
      carbsG: 10,
      carbsLabel: "Low glycemic omegas",
      fibreG: 4,
      fibreLabel: "Cellular gut nourishment",
      fatG: 12,
      imageUrl: "/images/dishes/walnuts.jpg",
      windowLabel: "Snack window: 4:30 PM – 6:00 PM",
    },
    Dinner: {
      day: "Thursday",
      slot: "Dinner",
      recipeTitle: "Stir-Fried Tofu with Bok Choy & Edamame",
      origin: "East Asian",
      prepTime: "20 min prep",
      kcal: 390,
      proteinG: 25,
      proteinLabel: "Pan-seared firm tofu",
      carbsG: 32,
      carbsLabel: "Crisp sesame greens",
      fibreG: 8,
      fibreLabel: "Prebiotic vegetable fibre",
      fatG: 10,
      imageUrl: "/images/dishes/miso_soup.jpg",
      windowLabel: "Dinner window: 7:30 PM – 9:30 PM",
    },
  },
  Friday: {
    Breakfast: {
      day: "Friday",
      slot: "Breakfast",
      recipeTitle: "Avocado & Poached Egg Whole-Wheat Toast",
      origin: "California",
      prepTime: "15 min prep",
      kcal: 360,
      proteinG: 17,
      proteinLabel: "Pasture egg & seeds",
      carbsG: 34,
      carbsLabel: "Stoneground sourdough",
      fibreG: 9,
      fibreLabel: "Monounsaturated avocado",
      fatG: 12,
      imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
      windowLabel: "Breakfast window: 7:30 AM – 9:30 AM",
    },
    Lunch: {
      day: "Friday",
      slot: "Lunch",
      recipeTitle: "Dal Tadka, Steamed Quinoa & Methi Subzi",
      origin: "Gujarat",
      prepTime: "25 min prep",
      kcal: 470,
      proteinG: 20,
      proteinLabel: "Yellow dal & quinoa",
      carbsG: 62,
      carbsLabel: "Fenugreek & whole grains",
      fibreG: 9,
      fibreLabel: "Glucose balancing fenugreek",
      fatG: 8,
      imageUrl: "/images/dishes/dal_curry.jpg",
      windowLabel: "Lunch window: 12:30 PM – 2:30 PM",
    },
    Snack: {
      day: "Friday",
      slot: "Snack",
      recipeTitle: "Chana Jor Garam with Chopped Tomatoes & Lemon",
      origin: "India",
      prepTime: "5 min prep",
      kcal: 140,
      proteinG: 7,
      proteinLabel: "Pressed black chickpeas",
      carbsG: 24,
      carbsLabel: "Tangy spiced legume",
      fibreG: 5,
      fibreLabel: "Crunchy gut fibre",
      fatG: 3,
      imageUrl: "/images/dishes/roasted_makhana_chai.jpg",
      windowLabel: "Snack window: 4:30 PM – 6:00 PM",
    },
    Dinner: {
      day: "Friday",
      slot: "Dinner",
      recipeTitle: "Rustic Tuscan Minestrone with White Cannellini",
      origin: "Italy",
      prepTime: "30 min prep",
      kcal: 380,
      proteinG: 18,
      proteinLabel: "Creamy white beans",
      carbsG: 52,
      carbsLabel: "Tuscan tomatoes & zucchini",
      fibreG: 11,
      fibreLabel: "Slow-cooked vegetable broth",
      fatG: 6,
      imageUrl: "/images/dishes/minestrone.jpg",
      windowLabel: "Dinner window: 7:30 PM – 9:30 PM",
    },
  },
  Saturday: {
    Breakfast: {
      day: "Saturday",
      slot: "Breakfast",
      recipeTitle: "Red Rice Poha with Peanuts, Curry Leaf & Coconut",
      origin: "Maharashtra",
      prepTime: "15 min prep",
      kcal: 330,
      proteinG: 10,
      proteinLabel: "Roasted peanuts",
      carbsG: 54,
      carbsLabel: "Iron-rich red flattened rice",
      fibreG: 6,
      fibreLabel: "Curry leaf digestive zest",
      fatG: 8,
      imageUrl: "/images/dishes/red_rice_poha.jpg",
      windowLabel: "Breakfast window: 8:00 AM – 10:00 AM",
    },
    Lunch: {
      day: "Saturday",
      slot: "Lunch",
      recipeTitle: "Mexican Chipotle Black Bean & Corn Bowl",
      origin: "Mexico",
      prepTime: "20 min prep",
      kcal: 500,
      proteinG: 21,
      proteinLabel: "Simmered black beans",
      carbsG: 68,
      carbsLabel: "Charred sweet corn",
      fibreG: 13,
      fibreLabel: "High-fibre legume satiety",
      fatG: 9,
      imageUrl: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
      windowLabel: "Lunch window: 1:00 PM – 3:00 PM",
    },
    Snack: {
      day: "Saturday",
      slot: "Snack",
      recipeTitle: "Spiced Buttermilk (Chaas) with Mint & Cumin",
      origin: "India",
      prepTime: "5 min prep",
      kcal: 80,
      proteinG: 4,
      proteinLabel: "Cultured churned whey",
      carbsG: 8,
      carbsLabel: "Natural hydration minerals",
      fibreG: 2,
      fibreLabel: "Roasted cumin gut soother",
      fatG: 2,
      imageUrl: "/images/dishes/spiced_chaas.jpg",
      windowLabel: "Snack window: 4:30 PM – 6:00 PM",
    },
    Dinner: {
      day: "Saturday",
      slot: "Dinner",
      recipeTitle: "Grilled Paneer Tikka with Roasted Bell Peppers",
      origin: "North India",
      prepTime: "25 min prep",
      kcal: 440,
      proteinG: 26,
      proteinLabel: "Marinated cottage cheese",
      carbsG: 24,
      carbsLabel: "Charred sweet capsicum",
      fibreG: 6,
      fibreLabel: "Antioxidant tandoori spices",
      fatG: 12,
      imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
      windowLabel: "Dinner window: 8:00 PM – 10:00 PM",
    },
  },
  Sunday: {
    Breakfast: {
      day: "Sunday",
      slot: "Breakfast",
      recipeTitle: "Multigrain Dosa with Tomato-Garlic Chutney",
      origin: "South India",
      prepTime: "20 min prep",
      kcal: 340,
      proteinG: 11,
      proteinLabel: "Millet & urad dal ferment",
      carbsG: 54,
      carbsLabel: "Crisp fermented batter",
      fibreG: 6,
      fibreLabel: "Roasted tomato lycopene",
      fatG: 7,
      imageUrl: "/images/dishes/dosa.jpg",
      windowLabel: "Breakfast window: 8:30 AM – 10:30 AM",
    },
    Lunch: {
      day: "Sunday",
      slot: "Lunch",
      recipeTitle: "Hyderabadi Spiced Vegetable Tahari with Salan",
      origin: "Telangana",
      prepTime: "35 min prep",
      kcal: 530,
      proteinG: 18,
      proteinLabel: "Soya chunks & tender peas",
      carbsG: 74,
      carbsLabel: "Long grain aromatic rice",
      fibreG: 9,
      fibreLabel: "Slow-carbed feast bowl",
      fatG: 11,
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
      windowLabel: "Lunch window: 1:00 PM – 3:00 PM",
    },
    Snack: {
      day: "Sunday",
      slot: "Snack",
      recipeTitle: "Turmeric Ashwagandha Golden Milk with Nuts",
      origin: "Ayurvedic",
      prepTime: "10 min prep",
      kcal: 130,
      proteinG: 6,
      proteinLabel: "Warm spiced milk",
      carbsG: 14,
      carbsLabel: "Natural almond richness",
      fibreG: 2,
      fibreLabel: "Adaptogenic restorative",
      fatG: 5,
      imageUrl: "/images/dishes/golden_milk.jpg",
      windowLabel: "Snack window: 4:30 PM – 6:00 PM",
    },
    Dinner: {
      day: "Sunday",
      slot: "Dinner",
      recipeTitle: "Light Zucchini Noodle Pad Thai with Peanuts",
      origin: "Thailand",
      prepTime: "20 min prep",
      kcal: 360,
      proteinG: 16,
      proteinLabel: "Tamarind marinated tofu",
      carbsG: 36,
      carbsLabel: "Spiralized zucchini noodles",
      fibreG: 7,
      fibreLabel: "Raw bean sprout crunch",
      fatG: 9,
      imageUrl: "/images/dishes/pad_thai.jpg",
      windowLabel: "Dinner window: 7:30 PM – 9:30 PM",
    },
  },
};

const DAYS_LIST: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEALS_LIST: MealSlotName[] = ["Breakfast", "Lunch", "Snack", "Dinner"];

export function DynamicActiveRhythm() {
  const { status, mounted } = useRealTime(1000);

  // Default to today and active meal slot from real-time status
  const todayDay = (status?.dayOfWeek as DayOfWeek) || "Thursday";
  const activeSlotNow = (status?.activeMealSlot as MealSlotName) || "Lunch";

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("Thursday");
  const [selectedSlot, setSelectedSlot] = useState<MealSlotName>("Lunch");
  const [hasUserOverridden, setHasUserOverridden] = useState(false);
  const [logState, setLogState] = useState<"idle" | "eaten" | "other" | "skipped">("idle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic on-the-spot Groq image state
  const [dynamicImages, setDynamicImages] = useState<
    Record<string, { url: string; prompt?: string; cached?: boolean }>
  >({});
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageGenerationStatus, setImageGenerationStatus] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Sync to real-time status once mounted if user hasn't overridden
  useEffect(() => {
    if (!mounted || !status) return;
    if (!hasUserOverridden) {
      if (status.dayOfWeek) setSelectedDay(status.dayOfWeek as DayOfWeek);
      if (status.activeMealSlot) setSelectedSlot(status.activeMealSlot as MealSlotName);
    }
  }, [mounted, status, hasUserOverridden]);

  // Read logged state from localStorage per (day, slot)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const logKey = `graceai_hero_log_${selectedDay}_${selectedSlot}`;
      const saved = localStorage.getItem(logKey);
      if (saved === "eaten" || saved === "other" || saved === "skipped") {
        setLogState(saved);
      } else {
        setLogState("idle");
      }
    } catch {
      setLogState("idle");
    }
  }, [selectedDay, selectedSlot]);

  // Calculate remaining window hours
  const windowRemainingText = useMemo(() => {
    if (!status) return "Flexible window active";
    const currentHours = status.hours;
    let cutoff = 10;
    if (selectedSlot === "Lunch") cutoff = 15;
    else if (selectedSlot === "Snack") cutoff = 18;
    else if (selectedSlot === "Dinner") cutoff = 22;

    const diff = cutoff - currentHours;
    if (diff > 0) return `Flexible log window: ${diff}h remaining`;
    if (diff === 0) return "Flexible log window: Final hour today";
    return "Window archived for today";
  }, [status, selectedSlot]);

  const activeDish: RhythmMealItem = useMemo(() => {
    const dayItem = WEEKLY_RHYTHM_MATRIX[selectedDay] || WEEKLY_RHYTHM_MATRIX.Thursday;
    return dayItem[selectedSlot] || dayItem.Lunch;
  }, [selectedDay, selectedSlot]);

  // Dynamically generate images on the spot using Groq when dish changes
  useEffect(() => {
    let isMounted = true;
    const title = activeDish.recipeTitle;
    setImageLoaded(false);
    setImageError(false);

    if (!dynamicImages[title]) {
      setIsGeneratingImage(true);
      setImageGenerationStatus("Groq visualizing dish on the spot...");

      fetch("/api/groq/dish-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishTitle: title,
          origin: activeDish.origin,
          mealSlot: activeDish.slot,
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (isMounted && res.success && res.imageUrl) {
            setDynamicImages((prev) => ({
              ...prev,
              [title]: {
                url: res.imageUrl,
                prompt: res.prompt,
                cached: res.cached,
              },
            }));
          }
        })
        .catch((err) => {
          console.warn("Dynamic image generation error:", err);
        })
        .finally(() => {
          if (isMounted) setIsGeneratingImage(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeDish.recipeTitle, activeDish.origin, activeDish.slot, dynamicImages]);

  const handleRegenerateOnTheSpot = async () => {
    const title = activeDish.recipeTitle;
    setIsGeneratingImage(true);
    setImageGenerationStatus("Groq crafting new visual on the spot...");
    try {
      const res = await fetch("/api/groq/dish-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishTitle: title,
          origin: activeDish.origin,
          mealSlot: activeDish.slot,
          forceRefresh: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setDynamicImages((prev) => ({
          ...prev,
          [title]: {
            url: data.imageUrl,
            prompt: data.prompt,
            cached: false,
          },
        }));
        setImageLoaded(false);
        triggerToast(`✨ Groq generated a fresh on-the-spot visual for ${title}!`);
      }
    } catch (err) {
      console.error("Failed to regenerate dish image:", err);
      triggerToast("Could not regenerate image at this moment.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const isCurrentLive =
    status && status.dayOfWeek === selectedDay && status.activeMealSlot === selectedSlot;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogAction = (action: "eaten" | "other" | "skipped") => {
    setLogState(action);
    if (typeof window !== "undefined") {
      try {
        const logKey = `graceai_hero_log_${selectedDay}_${selectedSlot}`;
        localStorage.setItem(logKey, action);
      } catch {
        // Fall through
      }
    }

    if (action === "eaten") {
      triggerToast(`Nourished! Logged "${activeDish.recipeTitle}" for ${selectedDay} ${selectedSlot}! 🌿`);
    } else if (action === "other") {
      triggerToast(`Custom meal logged for ${selectedDay} ${selectedSlot}. Open Tracker to fine-tune!`);
    } else if (action === "skipped") {
      triggerToast(`Marked ${selectedSlot} as skipped for ${selectedDay}. Keep hydrated! 💧`);
    }
  };

  const resetToRealTime = () => {
    if (status) {
      setSelectedDay(status.dayOfWeek as DayOfWeek);
      setSelectedSlot(status.activeMealSlot as MealSlotName);
      setHasUserOverridden(false);
      triggerToast(`Locked to real-time: ${status.dayOfWeek} ${status.activeMealSlot}`);
    }
  };

  const currentDynamic = dynamicImages[activeDish.recipeTitle]?.url;
  const displayedImageUrl = !imageError && currentDynamic ? currentDynamic : activeDish.imageUrl;

  return (
    <div className="editorial-card rounded-3xl p-6 sm:p-7 space-y-5 relative shadow-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
      {/* Toast alert */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-2xl bg-[var(--text)] text-[var(--background)] text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP: Day of the Week Selector Pills */}
      <div>
        <div className="flex items-center justify-between pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Explore Day by Day
          </span>
          {hasUserOverridden && (
            <button
              type="button"
              onClick={resetToRealTime}
              className="text-[11px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Back to Today ({todayDay})</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 p-1 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
          {DAYS_LIST.map((d) => {
            const isSelected = selectedDay === d;
            const isToday = status?.dayOfWeek === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setSelectedDay(d);
                  setHasUserOverridden(true);
                }}
                className={`py-1.5 px-1 rounded-xl text-center transition-all ${
                  isSelected
                    ? "bg-[var(--primary)] text-white font-bold shadow-xs scale-100"
                    : "hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] font-medium"
                }`}
              >
                <div className="text-[11px] uppercase tracking-wider">{d.slice(0, 3)}</div>
                {isToday && (
                  <div
                    className={`w-1 h-1 rounded-full mx-auto mt-0.5 ${
                      isSelected ? "bg-white" : "bg-[var(--primary)]"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MEAL SLOT SELECTOR TABS */}
      <div className="flex items-center justify-between gap-1.5 p-1 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
        {MEALS_LIST.map((slot) => {
          const isSlotSelected = selectedSlot === slot;
          const isNow = isCurrentLive && slot === activeSlotNow;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => {
                setSelectedSlot(slot);
                setHasUserOverridden(true);
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isSlotSelected
                  ? "bg-[var(--surface)] text-[var(--primary)] border border-[var(--border)] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {slot === "Breakfast" && <Coffee className="w-3.5 h-3.5" />}
              {slot === "Lunch" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
              {slot === "Snack" && <Sunset className="w-3.5 h-3.5 text-orange-500" />}
              {slot === "Dinner" && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{slot}</span>
              {isNow && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* ACTIVE DISH HEADER */}
      <div className="flex items-center justify-between pb-1 border-b border-[var(--border)] pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-muted)]">
              {selectedDay.toUpperCase()}’S ACTIVE RHYTHM
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-muted)] font-medium">
              {activeDish.origin}
            </span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[var(--text)] tracking-tight mt-0.5">
            {activeDish.recipeTitle}
          </h3>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] font-semibold flex items-center gap-1.5 shrink-0 border border-[var(--primary)]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
          <span>{selectedSlot}</span>
        </span>
      </div>

      {/* RECIPE PHOTO & STATS BADGE */}
      <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden bg-[var(--surface-elevated)] group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={displayedImageUrl}
          src={displayedImageUrl}
          alt={activeDish.recipeTitle}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
            imageLoaded ? "opacity-100 blur-0" : "opacity-80 blur-xs"
          }`}
        />

        {/* Shimmer loading overlay while Groq is generating on the spot */}
        {isGeneratingImage && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 transition-all z-20">
            <div className="px-3.5 py-2 rounded-full bg-black/85 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" />
              <span>{imageGenerationStatus || "Groq visualizing dish on the spot..."}</span>
            </div>
          </div>
        )}

        {/* Groq Dynamic AI Badge & Regenerate Button */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <div
            className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-[11px] font-semibold text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-md cursor-help"
            title={dynamicImages[activeDish.recipeTitle]?.prompt || "Generated on the spot by Groq AI"}
          >
            <Sparkles className={`w-3 h-3 ${isGeneratingImage ? "animate-spin text-amber-300" : "text-emerald-400"}`} />
            <span>{isGeneratingImage ? "Groq Generating..." : "Groq AI Visual"}</span>
          </div>

          <button
            type="button"
            onClick={handleRegenerateOnTheSpot}
            disabled={isGeneratingImage}
            title="Generate fresh visual with Groq on the spot"
            className="px-2 py-1 rounded-full bg-black/65 backdrop-blur-md hover:bg-black/90 text-white/90 hover:text-white border border-white/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 text-[10px] font-semibold flex items-center gap-1 shadow-md"
          >
            <RotateCcw className={`w-3 h-3 ${isGeneratingImage ? "animate-spin" : ""}`} />
            <span>Regenerate</span>
          </button>
        </div>

        {/* Prep & kcal pill */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-[var(--surface)]/90 backdrop-blur-md text-xs font-semibold text-[var(--text)] flex items-center gap-2 shadow-lg border border-[var(--border)] z-10">
          <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>{activeDish.prepTime}</span>
          <span>•</span>
          <span className="text-[var(--accent)] font-bold">{activeDish.kcal} kcal</span>
        </div>

        {/* Quick link to Cook with Grace */}
        <Link
          href={`/grace?mode=chef&prompt=${encodeURIComponent(
            `Please give me the authentic, healthy step-by-step recipe and clinical nutrition notes for: ${activeDish.recipeTitle} (${selectedDay} ${selectedSlot})`
          )}`}
          className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-[var(--surface)]/90 backdrop-blur-md hover:bg-[var(--primary)] hover:text-white text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 transition-colors shadow-lg border border-[var(--border)] z-10"
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Cook This</span>
        </Link>
      </div>

      {/* DYNAMIC MACRO BREAKDOWN (Exact for Day + Meal) */}
      <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
        <div className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            Protein
          </div>
          <div className="font-serif font-bold text-lg text-[var(--primary)] mt-0.5">
            {activeDish.proteinG}g
          </div>
          <div className="text-[10px] text-[var(--text-muted)] truncate" title={activeDish.proteinLabel}>
            {activeDish.proteinLabel}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            Carbs
          </div>
          <div className="font-serif font-bold text-lg text-[var(--accent)] mt-0.5">
            {activeDish.carbsG}g
          </div>
          <div className="text-[10px] text-[var(--text-muted)] truncate" title={activeDish.carbsLabel}>
            {activeDish.carbsLabel}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            Fibre
          </div>
          <div className="font-serif font-bold text-lg text-emerald-500 mt-0.5">
            {activeDish.fibreG}g
          </div>
          <div className="text-[10px] text-[var(--text-muted)] truncate" title={activeDish.fibreLabel}>
            {activeDish.fibreLabel}
          </div>
        </div>
      </div>

      {/* DAILY NOURISHMENT RHYTHM CARD WITH INTERACTIVE LOGGING */}
      <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text)]">Daily Nourishment Rhythm</div>
              <div className="text-[11px] text-[var(--text-muted)]">{activeDish.windowLabel}</div>
            </div>
          </div>

          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
              logState === "eaten"
                ? "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30"
                : logState === "other"
                ? "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30"
                : logState === "skipped"
                ? "bg-[var(--text-muted)]/15 text-[var(--text-muted)] border-[var(--text-muted)]/30"
                : "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20"
            }`}
          >
            {logState === "eaten" && <Check className="w-3 h-3" />}
            <span>
              {logState === "eaten"
                ? "Logged with care"
                : logState === "other"
                ? "Alternate logged"
                : logState === "skipped"
                ? "Skipped"
                : "Active window"}
            </span>
          </span>
        </div>

        {/* Flexible logging window & mindful actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] pt-1.5 border-t border-[var(--border)]">
          <span className="text-[var(--text-muted)]">{windowRemainingText}</span>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleLogAction("eaten")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                logState === "eaten"
                  ? "bg-[var(--success)] text-white shadow-xs"
                  : "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-xs"
              }`}
            >
              {logState === "eaten" ? "✓ Nourished" : "I Ate This"}
            </button>

            <button
              type="button"
              onClick={() => handleLogAction("other")}
              className={`px-2.5 py-1 rounded-xl text-xs transition-colors border ${
                logState === "other"
                  ? "bg-[var(--surface)] border-[var(--warning)] text-[var(--warning)] font-semibold"
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              Ate Something Else
            </button>

            <button
              type="button"
              onClick={() => handleLogAction("skipped")}
              className={`px-2.5 py-1 rounded-xl text-xs transition-colors border ${
                logState === "skipped"
                  ? "bg-[var(--surface)] border-zinc-500 text-zinc-400 font-semibold"
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              Skipped
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
