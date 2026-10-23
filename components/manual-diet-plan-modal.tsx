"use client";

import { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Loader2,
  Check,
  CheckCircle2,
  UtensilsCrossed,
  CalendarDays,
  Flame,
  ShieldCheck,
  AlertCircle,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Heart,
  Leaf,
  Dumbbell,
  Activity,
  Apple,
  Globe,
} from "lucide-react";

export interface ManualMealSlot {
  name: string;
  time: string;
  recipeTitle: string;
  kcal: number;
  protein: string;
  carbs?: string;
  fat?: string;
  origin: string;
  locked: boolean;
  completed?: boolean;
}

export interface ManualDietPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSelectedDay: string;
  allDays?: string[];
  onApplyPlan: (targetDays: string[], meals: ManualMealSlot[], dietTitle?: string) => void;
}

export interface DietaryPattern {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  tag: string;
  defaultTargetKcal: number;
  defaultTargetProtein: number;
  description: string;
  slots: Array<{
    name: string;
    time: string;
    recipeTitle: string;
    kcal: number;
    protein: string;
    carbs: string;
    fat: string;
    origin: string;
  }>;
  suggestions: Record<string, Array<{ title: string; kcal: number; protein: string; origin: string }>>;
}

export const DIETARY_PATTERNS: DietaryPattern[] = [
  {
    id: "balanced",
    name: "Balanced Heritage",
    subtitle: "Everyday Wholesome Nourishment",
    icon: "🥗",
    tag: "Circadian Friendly",
    defaultTargetKcal: 1800,
    defaultTargetProtein: 75,
    description: "Centuries-proven balance of whole grains, warm lentils, seasonal vegetables, and healthy culinary fats.",
    slots: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        recipeTitle: "Moong Dal Idli with Fresh Coconut Chutney & Sambhar",
        kcal: 340,
        protein: "14g",
        carbs: "54g",
        fat: "8g",
        origin: "Tamil Nadu",
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        recipeTitle: "Kerala Spiced Brown Rice, Yellow Dal & Cabbage Thoran",
        kcal: 490,
        protein: "18g",
        carbs: "78g",
        fat: "11g",
        origin: "Kerala",
      },
      {
        name: "Snack",
        time: "5:00 PM",
        recipeTitle: "Dry Roasted Makhana (Fox Nuts) with Cinnamon Masala Chai",
        kcal: 150,
        protein: "4g",
        carbs: "24g",
        fat: "4g",
        origin: "North India",
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        recipeTitle: "Mediterranean Roasted Vegetable & Warm Lentil Salad",
        kcal: 420,
        protein: "22g",
        carbs: "56g",
        fat: "12g",
        origin: "Greece",
      },
    ],
    suggestions: {
      Breakfast: [
        { title: "Rava Upma with Mixed Vegetables & Ginger", kcal: 310, protein: "9g", origin: "Karnataka" },
        { title: "Steel-Cut Oats with Chia, Walnuts & Honey", kcal: 350, protein: "11g", origin: "Global" },
        { title: "Red Rice Poha with Peanuts & Fresh Coriander", kcal: 330, protein: "10g", origin: "Maharashtra" },
      ],
      Lunch: [
        { title: "Rajma (Kidney Beans) with Jeera Brown Rice", kcal: 520, protein: "22g", origin: "Punjab" },
        { title: "Dal Tadka with Steamed Quinoa & Methi Subzi", kcal: 470, protein: "19g", origin: "Gujarat" },
        { title: "Hyderabadi Vegetable Biryani with Cucumber Raita", kcal: 510, protein: "16g", origin: "Telangana" },
      ],
      Snack: [
        { title: "Spiced Buttermilk (Chaas) with Roasted Jeera", kcal: 80, protein: "4g", origin: "India" },
        { title: "Sprouted Moong Chaat with Pomegranate & Lime", kcal: 160, protein: "8g", origin: "Maharashtra" },
        { title: "Sliced Apple with a Spoonful of Almond Butter", kcal: 170, protein: "4g", origin: "Global" },
      ],
      Dinner: [
        { title: "Rustic Minestrone Stew with White Cannellini Beans", kcal: 380, protein: "18g", origin: "Italy" },
        { title: "Palak Khichdi with Ghee & Roasted Papad", kcal: 410, protein: "16g", origin: "Gujarat" },
        { title: "Kyoto Tofu & Seaweed Clear Broth with Soba Noodles", kcal: 360, protein: "20g", origin: "Japan" },
      ],
    },
  },
  {
    id: "vegetarian",
    name: "Pure Vegetarian",
    subtitle: "Lacto-Vegetarian Vitality",
    icon: "🌿",
    tag: "High Fiber & Pulses",
    defaultTargetKcal: 1850,
    defaultTargetProtein: 80,
    description: "Protein-dense pulses, fresh paneer, spiced curd, and fiber-rich unpolished grains for sustained satiety.",
    slots: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        recipeTitle: "Besan Chilla Stuffed with Spiced Grated Paneer",
        kcal: 360,
        protein: "19g",
        carbs: "38g",
        fat: "15g",
        origin: "Rajasthan",
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        recipeTitle: "Palak Paneer with 2 Multigrain Phulkas & Beetroot Raita",
        kcal: 530,
        protein: "26g",
        carbs: "58g",
        fat: "22g",
        origin: "Punjab",
      },
      {
        name: "Snack",
        time: "5:00 PM",
        recipeTitle: "Sprouted Kala Chana Sundal with Coconut & Curry Leaves",
        kcal: 170,
        protein: "9g",
        carbs: "26g",
        fat: "4g",
        origin: "Tamil Nadu",
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        recipeTitle: "Chettinad Mushroom Pepper Masala with Jeera Rice",
        kcal: 440,
        protein: "15g",
        carbs: "68g",
        fat: "12g",
        origin: "Chettinad",
      },
    ],
    suggestions: {
      Breakfast: [
        { title: "2 Paneer Parathas with 1 Bowl Homemade Curd", kcal: 440, protein: "22g", origin: "Punjab" },
        { title: "Multigrain Dosa with Coconut & Tomato Chutney", kcal: 340, protein: "11g", origin: "South India" },
      ],
      Lunch: [
        { title: "Gujarati Kadhi & Khichdi with Steamed Bhindi", kcal: 460, protein: "17g", origin: "Gujarat" },
        { title: "Chole (Chickpea Curry) with Brown Rice & Onion Salad", kcal: 540, protein: "23g", origin: "North India" },
      ],
      Snack: [
        { title: "Boiled Sweet Corn with Chaat Masala & Lime", kcal: 130, protein: "4g", origin: "India" },
        { title: "Walnuts and Dry Roasted Peanuts Handful", kcal: 180, protein: "6g", origin: "Global" },
      ],
      Dinner: [
        { title: "Grilled Paneer Tikka Skewers with Mint Dip", kcal: 430, protein: "27g", origin: "Punjab" },
        { title: "Mixed Lentil Dal Fry with Warm Multigrain Roti", kcal: 410, protein: "20g", origin: "North India" },
      ],
    },
  },
  {
    id: "plant-based",
    name: "Plant-Based (Vegan)",
    subtitle: "100% Dairy-Free & Cruelty-Free",
    icon: "🌱",
    tag: "Clean Plant Power",
    defaultTargetKcal: 1750,
    defaultTargetProtein: 75,
    description: "Wholly botanical meals emphasizing organic tofu, edamame, nutrient-dense seeds, and complex legumes.",
    slots: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        recipeTitle: "Turmeric Spiced Tofu Scramble with Wilted Spinach & Sourdough",
        kcal: 340,
        protein: "22g",
        carbs: "34g",
        fat: "13g",
        origin: "California",
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        recipeTitle: "Black Bean & Roasted Corn Quinoa Fiesta Bowl with Avocado",
        kcal: 500,
        protein: "21g",
        carbs: "74g",
        fat: "14g",
        origin: "Mexico",
      },
      {
        name: "Snack",
        time: "5:00 PM",
        recipeTitle: "Crispy Roasted Edamame with Sea Salt & Smoked Paprika",
        kcal: 140,
        protein: "12g",
        carbs: "9g",
        fat: "5g",
        origin: "Japan",
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        recipeTitle: "Creamy Coconut Red Lentil Dal with Steamed Broccoli",
        kcal: 430,
        protein: "22g",
        carbs: "58g",
        fat: "13g",
        origin: "Sri Lanka",
      },
    ],
    suggestions: {
      Breakfast: [
        { title: "Chia Pudding with Almond Milk, Berries & Cacao Nibs", kcal: 290, protein: "10g", origin: "Global" },
        { title: "Avocado Mash Toast with Nutritional Yeast & Hemp Seeds", kcal: 350, protein: "12g", origin: "California" },
      ],
      Lunch: [
        { title: "Thai Green Curry with Tempeh & Jasmine Brown Rice", kcal: 510, protein: "24g", origin: "Thailand" },
        { title: "Mediterranean Falafel Bowl with Tahini & Tabouli", kcal: 480, protein: "19g", origin: "Levant" },
      ],
      Snack: [
        { title: "Green Smoothie with Spinach, Banana & Plant Protein", kcal: 180, protein: "16g", origin: "Global" },
        { title: "Hummus with Cucumber & Bell Pepper Batons", kcal: 140, protein: "6g", origin: "Middle East" },
      ],
      Dinner: [
        { title: "Stir-Fried Bok Choy, Shiitake & Tofu with Brown Rice", kcal: 390, protein: "23g", origin: "East Asian" },
        { title: "Zucchini Noodles with Walnut Basil Pesto & Cannellini", kcal: 380, protein: "17g", origin: "Italy" },
      ],
    },
  },
  {
    id: "sattvic",
    name: "Sattvic / Ayurvedic",
    subtitle: "Mindful, Pure & Easy to Digest",
    icon: "🧘",
    tag: "No Onion / No Garlic",
    defaultTargetKcal: 1650,
    defaultTargetProtein: 65,
    description: "Prepared with love using gentle spices (cumin, ginger, turmeric), cooling herbs, and no heavy alliums.",
    slots: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        recipeTitle: "Warm Apple & Cinnamon Porridge with Soaked Almonds",
        kcal: 320,
        protein: "9g",
        carbs: "56g",
        fat: "7g",
        origin: "Ayurvedic Hearth",
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        recipeTitle: "Moong Dal Khichdi with A2 Cow Ghee & Bottle Gourd (Lauki)",
        kcal: 470,
        protein: "17g",
        carbs: "72g",
        fat: "12g",
        origin: "Vedic Tradition",
      },
      {
        name: "Snack",
        time: "5:00 PM",
        recipeTitle: "Warm Turmeric Ashwagandha Golden Almond Milk",
        kcal: 140,
        protein: "5g",
        carbs: "14g",
        fat: "7g",
        origin: "Kerala Ayurveda",
      },
      {
        name: "Dinner",
        time: "7:30 PM",
        recipeTitle: "Ash Gourd & Yellow Mung Clear Broth with Steamed Zucchini",
        kcal: 340,
        protein: "15g",
        carbs: "50g",
        fat: "8g",
        origin: "Sattvic Kitchen",
      },
    ],
    suggestions: {
      Breakfast: [
        { title: "Red Rice Poha with Coconut Flakes & Fresh Curry Leaves", kcal: 310, protein: "8g", origin: "Maharashtra" },
        { title: "Steamed Idli with Mild Coconut Chutney", kcal: 280, protein: "10g", origin: "Tamil Nadu" },
      ],
      Lunch: [
        { title: "Jeera Basmati Rice with Ghiya Subzi & Moong Dal", kcal: 450, protein: "16g", origin: "Rajasthan" },
        { title: "Pumpkin & Sweet Potato Stew with Steamed Millets", kcal: 430, protein: "14g", origin: "Ayurvedic" },
      ],
      Snack: [
        { title: "Handful of Soaked Almonds & Walnuts with Raisins", kcal: 160, protein: "5g", origin: "India" },
        { title: "Fresh Coconut Water with Tender Malai", kcal: 90, protein: "2g", origin: "Coastal India" },
      ],
      Dinner: [
        { title: "Clear Vegetable Shorba with Soft Moong Dumplings", kcal: 320, protein: "14g", origin: "Awadh" },
        { title: "Steamed Beetroot & Green Pea Subzi with Jowar Roti", kcal: 360, protein: "12g", origin: "Maharashtra" },
      ],
    },
  },
  {
    id: "high-protein",
    name: "High Protein & Strength",
    subtitle: "Metabolic Muscle & Recovery",
    icon: "💪",
    tag: "100g+ Daily Target",
    defaultTargetKcal: 2000,
    defaultTargetProtein: 120,
    description: "Designed for active individuals, resistance training recovery, and metabolic satiety through lean proteins.",
    slots: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        recipeTitle: "3 Egg White & 1 Whole Egg Scramble with Sourdough & Avocado",
        kcal: 390,
        protein: "28g",
        carbs: "28g",
        fat: "18g",
        origin: "California",
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        recipeTitle: "Grilled Herb Chicken Breast (or Paneer) with Quinoa & Steamed Greens",
        kcal: 540,
        protein: "46g",
        carbs: "44g",
        fat: "18g",
        origin: "Mediterranean",
      },
      {
        name: "Snack",
        time: "5:00 PM",
        recipeTitle: "Thick Greek Yogurt Bowl with Berries, Chia & Pumpkin Seeds",
        kcal: 220,
        protein: "21g",
        carbs: "18g",
        fat: "7g",
        origin: "Greece",
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        recipeTitle: "Baked Herbed Salmon (or Tofu) with Edamame & Roasted Asparagus",
        kcal: 480,
        protein: "42g",
        carbs: "22g",
        fat: "24g",
        origin: "Nordic",
      },
    ],
    suggestions: {
      Breakfast: [
        { title: "Whey / Plant Protein Oatmeal with Peanut Butter & Banana", kcal: 420, protein: "32g", origin: "Global" },
        { title: "High-Protein Besan Paneer Chilla (Double Paneer)", kcal: 410, protein: "27g", origin: "North India" },
      ],
      Lunch: [
        { title: "Tuna / Chickpea Salad with Olive Oil & Boiled Eggs", kcal: 510, protein: "40g", origin: "Mediterranean" },
        { title: "Chicken Tikka / Paneer Bowl with Brown Rice & Dal", kcal: 560, protein: "48g", origin: "Punjab" },
      ],
      Snack: [
        { title: "Roasted Soy Crisps with Lime & Chaat Masala", kcal: 180, protein: "18g", origin: "India" },
        { title: "3 Hard Boiled Eggs with Black Pepper & Sea Salt", kcal: 210, protein: "19g", origin: "Global" },
      ],
      Dinner: [
        { title: "Pan-Seared White Fish with Lentil Puree & Green Beans", kcal: 460, protein: "44g", origin: "French Coast" },
        { title: "Stir-Fried Tempeh with Broccoli, Edamame & Sesame", kcal: 440, protein: "36g", origin: "East Asian" },
      ],
    },
  },
  {
    id: "mediterranean",
    name: "Mediterranean & Heart",
    subtitle: "Longevity & Cardiovascular Health",
    icon: "🥑",
    tag: "Polyphenols & EVOO",
    defaultTargetKcal: 1800,
    defaultTargetProtein: 85,
    description: "Extra virgin olive oil, wild seafood, aromatic garlic, leafy greens, walnuts, and rainbow produce.",
    slots: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        recipeTitle: "Authentic Greek Yogurt with Crushed Walnuts, Figs & Thyme Honey",
        kcal: 340,
        protein: "19g",
        carbs: "34g",
        fat: "14g",
        origin: "Crete",
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        recipeTitle: "Lemon Herb Baked Fish with Warm Quinoa Tabbouleh",
        kcal: 510,
        protein: "38g",
        carbs: "46g",
        fat: "18g",
        origin: "Greece",
      },
      {
        name: "Snack",
        time: "5:00 PM",
        recipeTitle: "Kalamata Olives, Cherry Tomatoes & Creamy Hummus Dip",
        kcal: 160,
        protein: "6g",
        carbs: "14g",
        fat: "10g",
        origin: "Levant",
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        recipeTitle: "Tuscan White Bean & Lacinato Kale Stew with Olive Oil Drizzle",
        kcal: 430,
        protein: "22g",
        carbs: "58g",
        fat: "13g",
        origin: "Italy",
      },
    ],
    suggestions: {
      Breakfast: [
        { title: "Shakshuka (Poached Eggs in Spiced Tomato & Pepper Sauce)", kcal: 360, protein: "20g", origin: "North Africa" },
        { title: "Tomato & Basil Bruschetta on Whole Grain with Ricotta", kcal: 320, protein: "14g", origin: "Italy" },
      ],
      Lunch: [
        { title: "Spanakopita Salad with Chickpeas, Feta & Lemon Vinaigrette", kcal: 480, protein: "21g", origin: "Greek Islands" },
        { title: "Grilled Sardines with Warm Potato & Parsley Salad", kcal: 470, protein: "34g", origin: "Portugal" },
      ],
      Snack: [
        { title: "Handful of Raw Almonds & Dried Apricots", kcal: 170, protein: "5g", origin: "Spain" },
        { title: "Cucumber Tzatziki with Toasted Pita Chips", kcal: 150, protein: "6g", origin: "Greece" },
      ],
      Dinner: [
        { title: "Herb-Crusted Baked Seabass with Roasted Ratatouille", kcal: 420, protein: "36g", origin: "Provence" },
        { title: "Lentil Soup with Swiss Chard & Pomegranate Molasses", kcal: 390, protein: "21g", origin: "Lebanon" },
      ],
    },
  },
  {
    id: "diabetic",
    name: "Diabetic & Low-GI",
    subtitle: "Steady Glucose & High Fiber",
    icon: "🩺",
    tag: "Glycemic Stability",
    defaultTargetKcal: 1650,
    defaultTargetProtein: 80,
    description: "Stabilizes postprandial glucose curves using bitter gourd, fenugreek, resistant starches, and low-GI legumes.",
    slots: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        recipeTitle: "Methi (Fenugreek) Besan Chilla with Mint Chutney",
        kcal: 320,
        protein: "17g",
        carbs: "34g",
        fat: "12g",
        origin: "Rajasthan",
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        recipeTitle: "Karela (Bitter Gourd) Subzi with Brown Rice & Thick Toor Dal",
        kcal: 480,
        protein: "20g",
        carbs: "68g",
        fat: "12g",
        origin: "Maharashtra",
      },
      {
        name: "Snack",
        time: "5:00 PM",
        recipeTitle: "Roasted Chana (Bengal Gram) with Spiced Jeera Buttermilk",
        kcal: 140,
        protein: "9g",
        carbs: "18g",
        fat: "3g",
        origin: "India",
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        recipeTitle: "Stir-Fried Tofu / Paneer with Broccoli, Bok Choy & Flaxseed",
        kcal: 410,
        protein: "28g",
        carbs: "24g",
        fat: "22g",
        origin: "East Asia",
      },
    ],
    suggestions: {
      Breakfast: [
        { title: "Ragi (Finger Millet) Dosa with Peanut Coriander Chutney", kcal: 330, protein: "11g", origin: "Karnataka" },
        { title: "Chia Seed Pudding with Unsweetened Almond Milk & Cinnamon", kcal: 280, protein: "10g", origin: "Global" },
      ],
      Lunch: [
        { title: "Whole Green Moong Dal with 2 Jowar Rotis & Raw Salad", kcal: 490, protein: "22g", origin: "North India" },
        { title: "Barley (Jau) Vegetable Khichdi with Fresh Curd", kcal: 440, protein: "18g", origin: "Vedic" },
      ],
      Snack: [
        { title: "Handful of Soaked Walnuts & Pumpkin Seeds", kcal: 160, protein: "6g", origin: "Global" },
        { title: "Spiced Jamun / Guava Salad with Rock Salt", kcal: 90, protein: "2g", origin: "India" },
      ],
      Dinner: [
        { title: "Clear Vegetable & Sprouted Bean Soup with Grilled Paneer", kcal: 370, protein: "24g", origin: "India" },
        { title: "Baked Fish with Steamed Cauliflower & Garlic Spinach", kcal: 390, protein: "36g", origin: "Global" },
      ],
    },
  },
  {
    id: "low-carb",
    name: "Low-Carb & Keto",
    subtitle: "High Satiety & Healthy Fats",
    icon: "🥩",
    tag: "Net Carbs < 40g",
    defaultTargetKcal: 1750,
    defaultTargetProtein: 95,
    description: "Keeps insulin levels resting with cruciferous vegetables, virgin oils, paneer, nuts, seeds, and rich proteins.",
    slots: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        recipeTitle: "Avocado, Spinach & Feta 3-Egg Omelet with Olive Oil",
        kcal: 410,
        protein: "24g",
        carbs: "7g",
        fat: "32g",
        origin: "Mediterranean",
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        recipeTitle: "Paneer / Chicken Tikka Salad with Mint Yogurt Dressing",
        kcal: 510,
        protein: "38g",
        carbs: "12g",
        fat: "35g",
        origin: "Punjab",
      },
      {
        name: "Snack",
        time: "5:00 PM",
        recipeTitle: "Spiced Roasted Almonds & Pecans with Pink Himalayan Salt",
        kcal: 180,
        protein: "6g",
        carbs: "5g",
        fat: "16g",
        origin: "Global",
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        recipeTitle: "Cauliflower Fried Rice with Tofu / Shrimp & Sesame Oil",
        kcal: 420,
        protein: "28g",
        carbs: "14g",
        fat: "28g",
        origin: "Pan-Asian",
      },
    ],
    suggestions: {
      Breakfast: [
        { title: "Boiled Eggs with Guacamole and Sliced Cucumbers", kcal: 350, protein: "18g", origin: "California" },
        { title: "Chia & Flax Seed Porridge with Heavy Cream & Cinnamon", kcal: 380, protein: "12g", origin: "Keto Kitchen" },
      ],
      Lunch: [
        { title: "Grilled Fish with Garlic Butter Asparagus & Mushrooms", kcal: 490, protein: "39g", origin: "French" },
        { title: "Cabbage & Bell Pepper Stir Fry with Pan-Fried Paneer Cubes", kcal: 460, protein: "24g", origin: "India" },
      ],
      Snack: [
        { title: "Cheddar / Gouda Cheese Cubes with Green Olives", kcal: 170, protein: "9g", origin: "European" },
        { title: "Celery Sticks with Almond Butter", kcal: 140, protein: "5g", origin: "Global" },
      ],
      Dinner: [
        { title: "Palak Paneer (No Roti, Extra Spinach Bowl)", kcal: 430, protein: "26g", origin: "Punjab" },
        { title: "Zucchini Noodles Carbonara with Bacon / Mushrooms", kcal: 440, protein: "22g", origin: "Italian" },
      ],
    },
  },
];

const ALL_WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function ManualDietPlanModal({
  isOpen,
  onClose,
  currentSelectedDay,
  allDays = ALL_WEEK_DAYS,
  onApplyPlan,
}: ManualDietPlanModalProps) {
  // Selected Dietary Pattern
  const [selectedPatternId, setSelectedPatternId] = useState<string>("balanced");

  // Plan Scope
  const [scopeType, setScopeType] = useState<"current_day" | "whole_week" | "custom_days">("current_day");
  const [customDays, setCustomDays] = useState<string[]>([currentSelectedDay]);

  // Target Metrics
  const [targetKcal, setTargetKcal] = useState<number>(1800);
  const [targetProtein, setTargetProtein] = useState<number>(75);

  // Active editable meal slots
  const [slots, setSlots] = useState<ManualMealSlot[]>(() => {
    const pat = DIETARY_PATTERNS[0];
    return pat.slots.map((s) => ({
      name: s.name,
      time: s.time,
      recipeTitle: s.recipeTitle,
      kcal: s.kcal,
      protein: s.protein,
      carbs: s.carbs,
      fat: s.fat,
      origin: s.origin,
      locked: false,
      completed: false,
    }));
  });

  // State for AI single-slot auto-calculation
  const [calculatingSlotIdx, setCalculatingSlotIdx] = useState<number | null>(null);
  const [calcNotice, setCalcNotice] = useState<string | null>(null);

  // When selected pattern changes, user can choose to load pattern or keep current
  const activePattern = useMemo(() => {
    return DIETARY_PATTERNS.find((p) => p.id === selectedPatternId) || DIETARY_PATTERNS[0];
  }, [selectedPatternId]);

  if (!isOpen) return null;

  // Handle switching pattern and pre-filling
  const handleSelectPattern = (pattern: DietaryPattern) => {
    setSelectedPatternId(pattern.id);
    setTargetKcal(pattern.defaultTargetKcal);
    setTargetProtein(pattern.defaultTargetProtein);
    setSlots(
      pattern.slots.map((s) => ({
        name: s.name,
        time: s.time,
        recipeTitle: s.recipeTitle,
        kcal: s.kcal,
        protein: s.protein,
        carbs: s.carbs,
        fat: s.fat,
        origin: s.origin,
        locked: false,
        completed: false,
      }))
    );
  };

  // Reset to empty slots for 100% manual entry
  const handleClearSlots = () => {
    setSlots([
      { name: "Breakfast", time: "8:00 AM", recipeTitle: "", kcal: 0, protein: "0g", origin: "Custom", locked: false },
      { name: "Lunch", time: "1:00 PM", recipeTitle: "", kcal: 0, protein: "0g", origin: "Custom", locked: false },
      { name: "Snack", time: "5:00 PM", recipeTitle: "", kcal: 0, protein: "0g", origin: "Custom", locked: false },
      { name: "Dinner", time: "8:00 PM", recipeTitle: "", kcal: 0, protein: "0g", origin: "Custom", locked: false },
    ]);
  };

  // Update a single slot field
  const updateSlot = (idx: number, field: keyof ManualMealSlot, value: any) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  // Adjust calories with delta
  const adjustCalories = (idx: number, delta: number) => {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === idx ? { ...s, kcal: Math.max(0, (s.kcal || 0) + delta) } : s
      )
    );
  };

  // Auto-calculate nutrition with AI / canonical database for a single slot
  const handleAutoCalculateSlot = async (idx: number) => {
    const slot = slots[idx];
    if (!slot.recipeTitle.trim()) {
      setCalcNotice("Please type a dish description first!");
      setTimeout(() => setCalcNotice(null), 3000);
      return;
    }

    setCalculatingSlotIdx(idx);
    setCalcNotice(null);

    try {
      const res = await fetch("/api/nutrition/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealText: slot.recipeTitle.trim(),
          slot: slot.name,
        }),
      });

      const data = await res.json();
      if (res.ok && data.isFood !== false && data.kcal) {
        setSlots((prev) =>
          prev.map((s, i) =>
            i === idx
              ? {
                  ...s,
                  recipeTitle: data.recipeTitle || s.recipeTitle,
                  kcal: data.kcal,
                  protein: data.protein || s.protein,
                  carbs: data.carbs || s.carbs,
                  fat: data.fat || s.fat,
                  origin: data.origin || s.origin,
                }
              : s
          )
        );
        setCalcNotice(`✨ Auto-analyzed: ${data.kcal} kcal, ${data.protein} protein!`);
      } else {
        setCalcNotice(data.error || "Could not recognize food. Check spelling.");
      }
    } catch {
      setCalcNotice("Connection issue during nutrient estimation.");
    } finally {
      setCalculatingSlotIdx(null);
      setTimeout(() => setCalcNotice(null), 4000);
    }
  };

  // Choose a suggested dish for a slot
  const handleApplySuggestion = (idx: number, suggestion: { title: string; kcal: number; protein: string; origin: string }) => {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              recipeTitle: suggestion.title,
              kcal: suggestion.kcal,
              protein: suggestion.protein,
              origin: suggestion.origin,
            }
          : s
      )
    );
  };

  // Toggle custom days
  const toggleCustomDay = (day: string) => {
    setCustomDays((prev) =>
      prev.includes(day)
        ? prev.length > 1
          ? prev.filter((d) => d !== day)
          : prev
        : [...prev, day]
    );
  };

  // Live nutritional totals
  const totalKcal = slots.reduce((acc, s) => acc + (Number(s.kcal) || 0), 0);
  const totalProteinG = slots.reduce((acc, s) => {
    const num = parseInt(s.protein?.replace(/[^0-9]/g, "") || "0", 10);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const caloriePct = targetKcal > 0 ? Math.min(130, Math.round((totalKcal / targetKcal) * 100)) : 100;
  const isTooLowCalorie = totalKcal > 0 && totalKcal < 1200;

  // Handle finalize and apply
  const handleSaveAndApply = () => {
    let targetDays: string[] = [];
    if (scopeType === "current_day") {
      targetDays = [currentSelectedDay];
    } else if (scopeType === "whole_week") {
      targetDays = allDays;
    } else {
      targetDays = customDays;
    }

    onApplyPlan(targetDays, slots, activePattern.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-5 animate-in fade-in">
      <div className="max-w-4xl w-full max-h-[92vh] bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[var(--text)]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--border)] bg-[var(--surface-elevated)] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center shadow-sm shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
                  Personalized Dietary Meal Planner
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-[10px] font-bold">
                  Clinical Shield
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--text)]">
                Manual Dietary Meal Plan Creator
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-light mt-0.5">
                Design or fine-tune an authentic 4-meal daily rhythm aligned with your dietary philosophy.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Notice Banner if active */}
          {calcNotice && (
            <div className="p-3 rounded-2xl bg-[var(--primary-light)]/60 border border-[var(--primary-border)] text-xs text-[var(--primary)] font-semibold flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{calcNotice}</span>
            </div>
          )}

          {/* Section 1: Choose Dietary Philosophy / Pattern */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>1. Select Dietary Pattern / Philosophy</span>
                </label>
                <p className="text-xs text-[var(--text-muted)]">
                  Choose a style to load curated recipes, or keep customizing your own dishes.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearSlots}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] flex items-center gap-1 underline underline-offset-2 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Start with blank slots</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DIETARY_PATTERNS.map((pattern) => {
                const isSelected = selectedPatternId === pattern.id;
                return (
                  <button
                    key={pattern.id}
                    type="button"
                    onClick={() => handleSelectPattern(pattern)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md scale-[1.02]"
                        : "bg-[var(--surface-elevated)] text-[var(--text)] border-[var(--border)] hover:border-[var(--primary)]/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{pattern.icon}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="font-semibold text-xs leading-tight">{pattern.name}</div>
                      <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? "text-white/80" : "text-[var(--text-muted)]"}`}>
                        {pattern.subtitle}
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-current/15 text-[10px] font-mono opacity-90">
                      {pattern.defaultTargetKcal} kcal • {pattern.defaultTargetProtein}g P
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Plan Scope & Targets */}
          <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>2. Apply To Which Days?</span>
                </label>
                <span className="text-xs text-[var(--text-muted)]">
                  Choose where this dietary plan should be assigned in your Weekly Planner.
                </span>
              </div>

              {/* Scope Selector Pills */}
              <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setScopeType("current_day")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    scopeType === "current_day"
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {currentSelectedDay} Only
                </button>
                <button
                  type="button"
                  onClick={() => setScopeType("whole_week")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    scopeType === "whole_week"
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  All 7 Days (Full Week)
                </button>
                <button
                  type="button"
                  onClick={() => setScopeType("custom_days")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    scopeType === "custom_days"
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  Custom Days
                </button>
              </div>
            </div>

            {/* Custom Days Checkbox Row */}
            {scopeType === "custom_days" && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border)]">
                <span className="text-xs text-[var(--text-muted)]">Select target days:</span>
                {allDays.map((day) => {
                  const isChecked = customDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleCustomDay(day)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors ${
                        isChecked
                          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                          : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Calorie & Protein Targets Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[var(--border)]">
              <div>
                <label className="text-xs font-medium text-[var(--text)] flex items-center justify-between mb-1.5">
                  <span>Daily Calorie Target:</span>
                  <span className="font-mono font-bold text-[var(--primary)]">{targetKcal} kcal</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1200}
                    max={3000}
                    step={50}
                    value={targetKcal}
                    onChange={(e) => setTargetKcal(Number(e.target.value))}
                    className="flex-1 accent-[var(--primary)] cursor-pointer"
                  />
                  <div className="flex gap-1">
                    {[1600, 1800, 2000, 2200].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setTargetKcal(k)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border ${
                          targetKcal === k
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]"
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text)] flex items-center justify-between mb-1.5">
                  <span>Daily Protein Goal:</span>
                  <span className="font-mono font-bold text-[var(--primary)]">{targetProtein}g</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={45}
                    max={160}
                    step={5}
                    value={targetProtein}
                    onChange={(e) => setTargetProtein(Number(e.target.value))}
                    className="flex-1 accent-[var(--primary)] cursor-pointer"
                  />
                  <div className="flex gap-1">
                    {[65, 80, 100, 120].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTargetProtein(p)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border ${
                          targetProtein === p
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]"
                        }`}
                      >
                        {p}g
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Interactive 4-Meal Slot Manual Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>3. Curate 4 Scheduled Meal Windows</span>
                </label>
                <p className="text-xs text-[var(--text-muted)]">
                  Edit dish names, customize calories and macros, or click the wand to auto-calculate.
                </p>
              </div>

              <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Circadian Synchronized</span>
              </div>
            </div>

            <div className="space-y-4">
              {slots.map((slot, idx) => {
                const isCalculating = calculatingSlotIdx === idx;
                const slotSuggestions = activePattern.suggestions[slot.name] || [];

                return (
                  <div
                    key={slot.name}
                    className="p-4 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3 transition-all hover:border-[var(--primary)]/40"
                  >
                    {/* Slot Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-[11px] font-bold uppercase tracking-wider">
                          {slot.name}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                          <Clock className="w-3 h-3" />
                          <input
                            type="text"
                            value={slot.time}
                            onChange={(e) => updateSlot(idx, "time", e.target.value)}
                            className="bg-transparent border-b border-dashed border-[var(--border)] text-xs text-[var(--text)] w-16 focus:outline-none focus:border-[var(--primary)]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs">
                          <Globe className="w-3 h-3 text-[var(--text-muted)]" />
                          <input
                            type="text"
                            value={slot.origin}
                            onChange={(e) => updateSlot(idx, "origin", e.target.value)}
                            placeholder="Cuisine"
                            className="bg-transparent border-b border-dashed border-[var(--border)] text-xs text-[var(--text)] w-24 focus:outline-none focus:border-[var(--primary)] text-right"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dish Title & AI Calculate Button */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={slot.recipeTitle}
                        onChange={(e) => updateSlot(idx, "recipeTitle", e.target.value)}
                        placeholder={`e.g. Authentic ${slot.name} recipe description...`}
                        className="flex-1 p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-all font-medium"
                      />

                      <button
                        type="button"
                        onClick={() => handleAutoCalculateSlot(idx)}
                        disabled={isCalculating || !slot.recipeTitle.trim()}
                        className="px-3.5 py-2.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs shrink-0"
                        title="Auto-calculate accurate calories and protein using ICMR/USDA database"
                      >
                        {isCalculating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Auto-Calculate</span>
                      </button>
                    </div>

                    {/* Nutrition Inputs Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {/* Calories Counter with + / - buttons */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[var(--text-muted)]">Calories:</span>
                        <button
                          type="button"
                          onClick={() => adjustCalories(idx, -50)}
                          className="w-6 h-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] flex items-center justify-center text-xs font-bold"
                          title="-50 kcal"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={slot.kcal}
                          onChange={(e) => updateSlot(idx, "kcal", Number(e.target.value) || 0)}
                          className="w-16 p-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-center text-xs font-mono font-bold text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                        />
                        <button
                          type="button"
                          onClick={() => adjustCalories(idx, 50)}
                          className="w-6 h-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] flex items-center justify-center text-xs font-bold"
                          title="+50 kcal"
                        >
                          +
                        </button>
                        <span className="text-[11px] text-[var(--text-muted)] font-mono">kcal</span>
                      </div>

                      {/* Protein Input */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[var(--text-muted)]">Protein:</span>
                        <input
                          type="text"
                          value={slot.protein}
                          onChange={(e) => updateSlot(idx, "protein", e.target.value)}
                          placeholder="e.g. 18g"
                          className="w-16 p-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-center text-xs font-mono font-bold text-[var(--primary)] focus:outline-none focus:border-[var(--primary)]"
                        />
                      </div>

                      {/* Optional Carbs & Fat */}
                      <div className="hidden md:flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                        {slot.carbs && <span>C: {slot.carbs}</span>}
                        {slot.fat && <span>F: {slot.fat}</span>}
                      </div>
                    </div>

                    {/* Quick Suggestions Chips for this slot */}
                    {slotSuggestions.length > 0 && (
                      <div className="pt-2 border-t border-[var(--border)]/60">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] shrink-0">
                            Quick Fill:
                          </span>
                          {slotSuggestions.map((sug) => (
                            <button
                              key={sug.title}
                              type="button"
                              onClick={() => handleApplySuggestion(idx, sug)}
                              className="px-2.5 py-1 rounded-xl text-[11px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors whitespace-nowrap shrink-0"
                              title={`Apply: ${sug.title} (${sug.kcal} kcal)`}
                            >
                              {sug.title} ({sug.kcal} kcal)
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Live Nutritional Balance & Clinical Safety Shield */}
          <div className="p-5 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-serif text-base font-semibold text-[var(--text)]">
                  Live Nutritional Balance Summary
                </span>
              </div>
              <div className="text-xs font-mono flex items-center gap-3">
                <span>
                  Total Calories: <strong className="text-[var(--text)] text-sm">{totalKcal} kcal</strong> / {targetKcal} kcal
                </span>
                <span>•</span>
                <span>
                  Total Protein: <strong className="text-[var(--primary)] text-sm">{totalProteinG}g</strong> / {targetProtein}g
                </span>
              </div>
            </div>

            {/* Target Calorie Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-[var(--surface)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isTooLowCalorie
                      ? "bg-amber-500"
                      : caloriePct > 115
                      ? "bg-amber-600"
                      : "bg-[var(--primary)]"
                  }`}
                  style={{ width: `${Math.min(100, caloriePct)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                <span>0 kcal</span>
                <span>Target: {targetKcal} kcal ({caloriePct}% filled)</span>
                <span>3,000 kcal</span>
              </div>
            </div>

            {/* Clinical Safety Warning if under 1200 kcal */}
            {isTooLowCalorie && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">graceAI Clinical Safety Guardrail</span>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                    Your manual plan total ({totalKcal} kcal) is below 1,200 kcal. Severe calorie restriction can cause metabolic slowdown, fatigue, and muscle loss. We advise adding nutrient-dense whole grains, nuts, or legumes to your snack or lunch.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--surface-elevated)] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[var(--text-muted)]">
            <span>Applying to: </span>
            <strong className="text-[var(--text)]">
              {scopeType === "current_day"
                ? currentSelectedDay
                : scopeType === "whole_week"
                ? "All 7 Days of the Week"
                : `${customDays.length} Selected Days`}
            </strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              id="apply-diet-plan-btn"
              onClick={handleSaveAndApply}
              className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Apply Dietary Meal Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
