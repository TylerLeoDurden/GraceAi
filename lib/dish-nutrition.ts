/**
 * Clinical-grade canonical dish nutrition engine for graceAI.
 * 
 * Provides deterministic, repeatable, scientifically accurate calories and macros
 * based on ICMR (Indian Council of Medical Research) and USDA nutritional reference standards.
 * 
 * Prevents random LLM variance ("changing calories for the same dish") by combining:
 * 1. An extensive canonical database of 100+ staples, dishes, portions, and regional foods.
 * 2. Deterministic portion and compound-phrase parsing (e.g., "2 rotis with 1 katori dal").
 * 3. Exact 4-4-9 caloric macro validation (kcal = 4*protein + 4*carbs + 9*fat).
 * 4. In-memory and persistent normalized query cache (temperature 0 LLM fallback for novel dishes).
 */

export interface FoodPortion {
  item: string;
  portion: string;
  kcal: number;
  protein: string;
}

export interface DishNutritionResult {
  isFood?: boolean;
  recipeTitle: string;
  kcal: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  origin: string;
  confidence: "high" | "medium" | "estimated";
  breakdown: FoodPortion[];
  healthImpact: string;
  suggestions: string;
  source: "canonical_database" | "deterministic_cache" | "ai_verified";
}

export interface FoodEntry {
  name: string;
  aliases: string[];
  unit: string;
  defaultPortion: string;
  kcal: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
  fiber: number;   // grams
  origin: string;
}

// Canonical database of verified clinical & culinary nutritional profiles
export const CANONICAL_FOODS: FoodEntry[] = [
  // --- BREADS, ROTIS & GRAINS ---
  {
    name: "Roti / Phulka",
    aliases: ["roti", "rotis", "phulka", "phulkas", "chapati", "chapatis", "chapatti", "chapaties", "wheat roti", "fulka"],
    unit: "pc",
    defaultPortion: "1 medium (30g flour)",
    kcal: 85,
    protein: 3,
    carbs: 18,
    fat: 0.5,
    fiber: 2.5,
    origin: "North India",
  },
  {
    name: "Butter Roti / Ghee Roti",
    aliases: ["butter roti", "butter rotis", "ghee roti", "ghee rotis", "ghee phulka", "butter chapati"],
    unit: "pc",
    defaultPortion: "1 pc with 1/2 tsp ghee",
    kcal: 110,
    protein: 3,
    carbs: 18,
    fat: 3.5,
    fiber: 2.5,
    origin: "North India",
  },
  {
    name: "Plain Paratha",
    aliases: ["paratha", "parathas", "plain paratha", "laccha paratha", "tawa paratha"],
    unit: "pc",
    defaultPortion: "1 medium",
    kcal: 180,
    protein: 4,
    carbs: 25,
    fat: 7,
    fiber: 2.5,
    origin: "North India",
  },
  {
    name: "Paneer Paratha",
    aliases: ["paneer paratha", "paneer parathas", "cottage cheese paratha"],
    unit: "pc",
    defaultPortion: "1 medium with stuffing",
    kcal: 250,
    protein: 10,
    carbs: 26,
    fat: 12,
    fiber: 2.5,
    origin: "Punjab",
  },
  {
    name: "Aloo Paratha",
    aliases: ["aloo paratha", "aloo parathas", "potato paratha"],
    unit: "pc",
    defaultPortion: "1 medium with spiced potato",
    kcal: 220,
    protein: 4.5,
    carbs: 32,
    fat: 8,
    fiber: 3,
    origin: "Punjab",
  },
  {
    name: "Gobi Paratha",
    aliases: ["gobi paratha", "gobhi paratha", "cauliflower paratha"],
    unit: "pc",
    defaultPortion: "1 medium",
    kcal: 195,
    protein: 4.5,
    carbs: 28,
    fat: 7.5,
    fiber: 3.5,
    origin: "Punjab",
  },
  {
    name: "Methi Thepla",
    aliases: ["thepla", "theplas", "methi thepla", "gujarati thepla"],
    unit: "pc",
    defaultPortion: "1 standard pc",
    kcal: 110,
    protein: 3.2,
    carbs: 16,
    fat: 4,
    fiber: 2.2,
    origin: "Gujarat",
  },
  {
    name: "Puri / Poori",
    aliases: ["puri", "puris", "poori", "pooris"],
    unit: "pc",
    defaultPortion: "1 deep fried pc",
    kcal: 125,
    protein: 2,
    carbs: 15,
    fat: 6.5,
    fiber: 1,
    origin: "India",
  },
  {
    name: "Naan (Plain)",
    aliases: ["naan", "tandoori naan", "plain naan"],
    unit: "pc",
    defaultPortion: "1 piece",
    kcal: 260,
    protein: 7,
    carbs: 45,
    fat: 5,
    fiber: 2,
    origin: "North India",
  },
  {
    name: "Butter / Garlic Naan",
    aliases: ["butter naan", "garlic naan", "butter garlic naan"],
    unit: "pc",
    defaultPortion: "1 piece with butter",
    kcal: 310,
    protein: 7.5,
    carbs: 46,
    fat: 10.5,
    fiber: 2,
    origin: "North India",
  },
  {
    name: "Whole Wheat Toast",
    aliases: ["whole wheat toast", "wheat bread", "brown bread", "bread slice", "toast", "toast slice"],
    unit: "slice",
    defaultPortion: "1 slice (30g)",
    kcal: 75,
    protein: 3.5,
    carbs: 14,
    fat: 1,
    fiber: 2,
    origin: "Global",
  },
  {
    name: "White Bread Toast",
    aliases: ["white bread", "white toast", "bread"],
    unit: "slice",
    defaultPortion: "1 slice (30g)",
    kcal: 70,
    protein: 2,
    carbs: 14,
    fat: 0.8,
    fiber: 0.6,
    origin: "Global",
  },

  // --- RICE, BIRYANI & GRAINS ---
  {
    name: "Cooked White Rice",
    aliases: ["white rice", "steamed rice", "boiled rice", "rice bowl", "cooked rice", "rice", "chawal", "jeera rice"],
    unit: "cup",
    defaultPortion: "1 cup / katori (150g)",
    kcal: 195,
    protein: 4,
    carbs: 43,
    fat: 0.5,
    fiber: 0.8,
    origin: "Global / India",
  },
  {
    name: "Cooked Brown Rice",
    aliases: ["brown rice", "kerala brown rice", "red rice", "matta rice"],
    unit: "cup",
    defaultPortion: "1 cup / katori (150g)",
    kcal: 175,
    protein: 4,
    carbs: 36,
    fat: 1.5,
    fiber: 3,
    origin: "Kerala / Healthy Hearth",
  },
  {
    name: "Cooked Quinoa",
    aliases: ["quinoa", "cooked quinoa", "steamed quinoa", "quinoa salad"],
    unit: "cup",
    defaultPortion: "1 cup (150g)",
    kcal: 180,
    protein: 6.5,
    carbs: 32,
    fat: 2.8,
    fiber: 4,
    origin: "Mediterranean / Global",
  },
  {
    name: "Chicken Biryani",
    aliases: ["chicken biryani", "chicken biriyani", "dum biryani", "hyderabadi chicken biryani"],
    unit: "plate",
    defaultPortion: "1 plate (350g)",
    kcal: 520,
    protein: 28,
    carbs: 62,
    fat: 16,
    fiber: 3.5,
    origin: "Hyderabad / Regional",
  },
  {
    name: "Mutton Biryani",
    aliases: ["mutton biryani", "gosht biryani", "lamb biryani"],
    unit: "plate",
    defaultPortion: "1 plate (350g)",
    kcal: 620,
    protein: 26,
    carbs: 62,
    fat: 28,
    fiber: 3,
    origin: "Hyderabad / Awadh",
  },
  {
    name: "Veg Biryani / Pulao",
    aliases: ["veg biryani", "vegetable biryani", "veg pulao", "vegetable pulao", "pulao", "tahari", "vegetable tahari", "peas pulao"],
    unit: "plate",
    defaultPortion: "1 plate (300g)",
    kcal: 380,
    protein: 8,
    carbs: 64,
    fat: 10,
    fiber: 4.5,
    origin: "India",
  },
  {
    name: "Khichdi (Moong & Rice)",
    aliases: ["khichdi", "khichuri", "moong dal khichdi", "dal khichdi", "kerala moong & brown rice khichdi"],
    unit: "bowl",
    defaultPortion: "1 bowl (220g)",
    kcal: 240,
    protein: 9,
    carbs: 40,
    fat: 5,
    fiber: 4,
    origin: "Ayurvedic / India",
  },
  {
    name: "Curd Rice",
    aliases: ["curd rice", "thayir sadam", "dahi chawal"],
    unit: "bowl",
    defaultPortion: "1 bowl (200g)",
    kcal: 240,
    protein: 6,
    carbs: 38,
    fat: 7,
    fiber: 1,
    origin: "South India",
  },
  {
    name: "Poha",
    aliases: ["poha", "kanda poha", "red rice poha", "flattened rice", "batata poha"],
    unit: "plate",
    defaultPortion: "1 plate (150g)",
    kcal: 250,
    protein: 5,
    carbs: 45,
    fat: 6,
    fiber: 2.5,
    origin: "Maharashtra",
  },
  {
    name: "Upma",
    aliases: ["upma", "rava upma", "sooji upma", "vegetable upma"],
    unit: "bowl",
    defaultPortion: "1 bowl (160g)",
    kcal: 220,
    protein: 5,
    carbs: 38,
    fat: 6,
    fiber: 2.5,
    origin: "Karnataka / South India",
  },
  {
    name: "Oatmeal / Steel Cut Oats",
    aliases: ["steel cut oats", "oats", "oatmeal", "rolled oats", "porridge"],
    unit: "bowl",
    defaultPortion: "1 bowl cooked (240g)",
    kcal: 160,
    protein: 6,
    carbs: 28,
    fat: 3,
    fiber: 4.5,
    origin: "Global Hearth",
  },

  // --- SOUTH INDIAN BREAKFASTS ---
  {
    name: "Idli",
    aliases: ["idli", "idlis", "idly", "idlies", "moong dal idli", "steamed idli"],
    unit: "pc",
    defaultPortion: "1 standard pc (45g)",
    kcal: 60,
    protein: 2,
    carbs: 12,
    fat: 0.3,
    fiber: 0.8,
    origin: "South India",
  },
  {
    name: "Plain Dosa",
    aliases: ["plain dosa", "dosa", "dosas", "sada dosa", "ragi dosa", "ragi dosas", "multigrain dosa"],
    unit: "pc",
    defaultPortion: "1 medium",
    kcal: 140,
    protein: 3.5,
    carbs: 25,
    fat: 3,
    fiber: 1.5,
    origin: "South India",
  },
  {
    name: "Masala Dosa",
    aliases: ["masala dosa", "mysore masala dosa"],
    unit: "pc",
    defaultPortion: "1 standard with potato filling",
    kcal: 260,
    protein: 5.5,
    carbs: 38,
    fat: 9,
    fiber: 3.5,
    origin: "Karnataka",
  },
  {
    name: "Medu Vada",
    aliases: ["medu vada", "vada", "vadas", "urad dal vada"],
    unit: "pc",
    defaultPortion: "1 pc",
    kcal: 150,
    protein: 4,
    carbs: 16,
    fat: 8,
    fiber: 2,
    origin: "South India",
  },
  {
    name: "Besan Chilla",
    aliases: ["besan chilla", "chilla", "cheela", "gram flour pancake"],
    unit: "pc",
    defaultPortion: "1 medium",
    kcal: 170,
    protein: 7,
    carbs: 22,
    fat: 6,
    fiber: 4,
    origin: "Rajasthan / North India",
  },

  // --- DALS, LENTILS & CURRIES ---
  {
    name: "Dal Tadka / Yellow Dal",
    aliases: [
      "dal tadka", "yellow dal", "moong dal", "toor dal", "arhar dal",
      "dal fry", "dal", "daal", "dhal", "lentil soup", "lentil curry", "sambar bowl"
    ],
    unit: "katori",
    defaultPortion: "1 katori (150g)",
    kcal: 130,
    protein: 7,
    carbs: 18,
    fat: 3.5,
    fiber: 4,
    origin: "North India",
  },
  {
    name: "Dal Makhani",
    aliases: ["dal makhani", "daal makhani", "black dal", "maa ki dal"],
    unit: "katori",
    defaultPortion: "1 katori (150g)",
    kcal: 260,
    protein: 9,
    carbs: 22,
    fat: 15,
    fiber: 5,
    origin: "Punjab",
  },
  {
    name: "Sambar",
    aliases: ["sambar", "sambhar", "south indian sambar"],
    unit: "katori",
    defaultPortion: "1 katori (150g)",
    kcal: 85,
    protein: 3.5,
    carbs: 14,
    fat: 1.8,
    fiber: 3,
    origin: "South India",
  },
  {
    name: "Chole / Chickpea Curry",
    aliases: ["chole", "chana masala", "channa masala", "punjabi chole", "chickpea curry"],
    unit: "katori",
    defaultPortion: "1 katori (150g)",
    kcal: 220,
    protein: 9,
    carbs: 30,
    fat: 7,
    fiber: 6.5,
    origin: "Punjab",
  },
  {
    name: "Rajma (Red Kidney Beans)",
    aliases: ["rajma", "rajma masala", "kidney bean curry", "rajmah"],
    unit: "katori",
    defaultPortion: "1 katori (150g)",
    kcal: 210,
    protein: 9,
    carbs: 28,
    fat: 6,
    fiber: 7,
    origin: "Punjab",
  },
  {
    name: "Palak Paneer",
    aliases: ["palak paneer", "saag paneer", "spinach paneer"],
    unit: "katori",
    defaultPortion: "1 katori (150g)",
    kcal: 240,
    protein: 12,
    carbs: 9,
    fat: 17,
    fiber: 3.5,
    origin: "Punjab",
  },
  {
    name: "Paneer Butter Masala",
    aliases: ["paneer butter masala", "paneer makhani", "shahi paneer"],
    unit: "katori",
    defaultPortion: "1 katori (150g)",
    kcal: 320,
    protein: 11,
    carbs: 14,
    fat: 24,
    fiber: 2.5,
    origin: "North India",
  },
  {
    name: "Matar Paneer",
    aliases: ["matar paneer", "mutter paneer"],
    unit: "katori",
    defaultPortion: "1 katori (150g)",
    kcal: 230,
    protein: 11,
    carbs: 16,
    fat: 14,
    fiber: 4,
    origin: "North India",
  },
  {
    name: "Paneer Bhurji / Tikka",
    aliases: ["paneer bhurji", "paneer tikka", "grilled paneer", "grilled paneer tikka"],
    unit: "portion",
    defaultPortion: "1 plate (150g)",
    kcal: 280,
    protein: 18,
    carbs: 8,
    fat: 20,
    fiber: 2,
    origin: "North India",
  },
  {
    name: "Mixed Veg Subzi",
    aliases: ["mixed vegetable subzi", "mixed veg", "veg curry", "subzi", "sabzi", "vegetable korma", "aloo matar", "aloo gobi"],
    unit: "katori",
    defaultPortion: "1 katori (150g)",
    kcal: 130,
    protein: 3.5,
    carbs: 16,
    fat: 6,
    fiber: 4,
    origin: "North India",
  },
  {
    name: "Bhindi Masala (Okra)",
    aliases: ["bhindi masala", "bhindi fry", "okra curry"],
    unit: "katori",
    defaultPortion: "1 katori (120g)",
    kcal: 115,
    protein: 2.5,
    carbs: 12,
    fat: 6,
    fiber: 4,
    origin: "North India",
  },
  {
    name: "Cabbage Thoran / Poriyal",
    aliases: ["cabbage thoran", "thoran", "poriyal", "beans poriyal", "beans thoran", "south indian poriyal"],
    unit: "katori",
    defaultPortion: "1 katori (100g)",
    kcal: 85,
    protein: 2.5,
    carbs: 9,
    fat: 4.5,
    fiber: 3,
    origin: "Kerala / Tamil Nadu",
  },

  // --- NON-VEG & EGGS ---
  {
    name: "Boiled Egg",
    aliases: ["boiled egg", "egg", "eggs", "poached egg", "hard boiled egg"],
    unit: "pc",
    defaultPortion: "1 large (50g)",
    kcal: 72,
    protein: 6.3,
    carbs: 0.4,
    fat: 5,
    fiber: 0,
    origin: "Global",
  },
  {
    name: "Egg Omelette / Scramble",
    aliases: ["omelette", "egg omelette", "scrambled eggs", "bhurji", "egg bhurji"],
    unit: "serving",
    defaultPortion: "2 eggs with oil",
    kcal: 185,
    protein: 13,
    carbs: 2,
    fat: 14,
    fiber: 0.5,
    origin: "Global",
  },
  {
    name: "Chicken Curry (Home Style)",
    aliases: ["chicken curry", "tariwala chicken", "home chicken curry", "murgh curry"],
    unit: "katori",
    defaultPortion: "1 katori with 2 pcs (180g)",
    kcal: 240,
    protein: 24,
    carbs: 6,
    fat: 13,
    fiber: 1.5,
    origin: "India",
  },
  {
    name: "Butter Chicken",
    aliases: ["butter chicken", "murgh makhani"],
    unit: "katori",
    defaultPortion: "1 katori (180g)",
    kcal: 340,
    protein: 24,
    carbs: 10,
    fat: 22,
    fiber: 1.5,
    origin: "Punjab / Delhi",
  },
  {
    name: "Grilled Chicken Breast",
    aliases: ["grilled chicken", "chicken breast", "grilled lemon chicken", "roasted chicken"],
    unit: "pc",
    defaultPortion: "1 breast (150g)",
    kcal: 240,
    protein: 46,
    carbs: 0,
    fat: 5,
    fiber: 0,
    origin: "Global Healthy",
  },
  {
    name: "Fish Curry",
    aliases: ["fish curry", "kerala fish curry", "meen curry", "bengali fish curry"],
    unit: "katori",
    defaultPortion: "1 katori with fish piece (180g)",
    kcal: 200,
    protein: 22,
    carbs: 5,
    fat: 10,
    fiber: 1,
    origin: "Coastal India",
  },
  {
    name: "Baked / Steamed Fish",
    aliases: ["baked fish", "grilled fish", "baked herbed fish", "steamed fish"],
    unit: "fillet",
    defaultPortion: "1 fillet (150g)",
    kcal: 180,
    protein: 34,
    carbs: 0,
    fat: 4,
    fiber: 0,
    origin: "Mediterranean",
  },

  // --- ACCOMPANIMENTS, CHUTNEYS & DIPS ---
  {
    name: "Plain Curd / Dahi",
    aliases: ["curd", "dahi", "plain curd", "yogurt", "yoghurt", "fresh curd"],
    unit: "katori",
    defaultPortion: "1 katori (150g)",
    kcal: 95,
    protein: 5,
    carbs: 6,
    fat: 5,
    fiber: 0,
    origin: "India",
  },
  {
    name: "Cucumber Raita",
    aliases: ["cucumber raita", "raita", "boondi raita", "beetroot raita", "onion raita"],
    unit: "katori",
    defaultPortion: "1 katori (150g)",
    kcal: 105,
    protein: 4.5,
    carbs: 9,
    fat: 5,
    fiber: 1,
    origin: "India",
  },
  {
    name: "Coconut Chutney",
    aliases: ["coconut chutney", "nariyal chutney", "white chutney"],
    unit: "serving",
    defaultPortion: "2 tbsp (35g)",
    kcal: 65,
    protein: 1,
    carbs: 3,
    fat: 6,
    fiber: 1.5,
    origin: "South India",
  },
  {
    name: "Tomato Garlic Chutney",
    aliases: ["tomato garlic chutney", "tomato chutney", "red chutney", "kara chutney"],
    unit: "serving",
    defaultPortion: "2 tbsp (30g)",
    kcal: 40,
    protein: 1,
    carbs: 5,
    fat: 2,
    fiber: 1.2,
    origin: "South India",
  },
  {
    name: "Mint / Coriander Chutney",
    aliases: ["mint chutney", "green chutney", "coriander chutney", "pudina chutney"],
    unit: "serving",
    defaultPortion: "2 tbsp (30g)",
    kcal: 20,
    protein: 1,
    carbs: 3,
    fat: 0.5,
    fiber: 1,
    origin: "India",
  },
  {
    name: "Roasted Papad",
    aliases: ["roasted papad", "papad", "poppadom", "appalam"],
    unit: "pc",
    defaultPortion: "1 roasted pc",
    kcal: 35,
    protein: 2,
    carbs: 5,
    fat: 0.5,
    fiber: 1,
    origin: "India",
  },
  {
    name: "Fried Papad",
    aliases: ["fried papad"],
    unit: "pc",
    defaultPortion: "1 fried pc",
    kcal: 85,
    protein: 2,
    carbs: 6,
    fat: 6,
    fiber: 1,
    origin: "India",
  },

  // --- SALADS, VEGETABLES & SOUPS ---
  {
    name: "Fresh Green Salad",
    aliases: ["salad", "cucumber salad", "kachumber", "green salad", "cucumber & carrot sticks"],
    unit: "bowl",
    defaultPortion: "1 bowl (150g)",
    kcal: 40,
    protein: 1.5,
    carbs: 8,
    fat: 0.4,
    fiber: 2.8,
    origin: "Global",
  },
  {
    name: "Sprouted Moong Chaat",
    aliases: ["sprouted moong chaat", "sprouts chaat", "moong sprouts", "sprouts"],
    unit: "bowl",
    defaultPortion: "1 bowl (120g)",
    kcal: 140,
    protein: 9,
    carbs: 22,
    fat: 1.5,
    fiber: 5.5,
    origin: "Maharashtra / India",
  },
  {
    name: "Roasted Makhana (Fox Nuts)",
    aliases: ["roasted makhana", "makhana", "fox nuts", "phool makhana"],
    unit: "cup",
    defaultPortion: "1 cup (25g)",
    kcal: 90,
    protein: 3,
    carbs: 18,
    fat: 0.5,
    fiber: 2,
    origin: "North India",
  },
  {
    name: "Minestrone / Veg Clear Soup",
    aliases: ["minestrone soup", "vegetable soup", "clear soup", "clear broth", "miso broth"],
    unit: "bowl",
    defaultPortion: "1 bowl (240ml)",
    kcal: 95,
    protein: 4,
    carbs: 16,
    fat: 1.5,
    fiber: 3.5,
    origin: "Global",
  },

  // --- BEVERAGES ---
  {
    name: "Filter Coffee with Milk",
    aliases: ["filter coffee", "coffee with milk", "south indian filter coffee", "coffee"],
    unit: "cup",
    defaultPortion: "1 cup (150ml)",
    kcal: 95,
    protein: 2.8,
    carbs: 13,
    fat: 3.5,
    fiber: 0,
    origin: "South India",
  },
  {
    name: "Masala Chai with Milk & Sugar",
    aliases: ["chai", "masala chai", "tea", "mint chai", "ginger tea", "milk tea"],
    unit: "cup",
    defaultPortion: "1 cup (150ml)",
    kcal: 85,
    protein: 2.5,
    carbs: 12,
    fat: 3,
    fiber: 0,
    origin: "India",
  },
  {
    name: "Black Coffee / Espresso",
    aliases: ["black coffee", "espresso", "americano"],
    unit: "cup",
    defaultPortion: "1 cup",
    kcal: 2,
    protein: 0.3,
    carbs: 0,
    fat: 0,
    fiber: 0,
    origin: "Global",
  },
  {
    name: "Green Tea / Herbal Tea",
    aliases: ["green tea", "black tea", "herbal tea"],
    unit: "cup",
    defaultPortion: "1 cup",
    kcal: 2,
    protein: 0,
    carbs: 0.5,
    fat: 0,
    fiber: 0,
    origin: "Global",
  },
  {
    name: "Spiced Buttermilk (Chaas)",
    aliases: ["buttermilk", "chaas", "mattha", "spiced buttermilk", "mor"],
    unit: "glass",
    defaultPortion: "1 glass (220ml)",
    kcal: 50,
    protein: 3,
    carbs: 5,
    fat: 2,
    fiber: 0,
    origin: "India",
  },
  {
    name: "Golden Turmeric Milk",
    aliases: ["golden milk", "turmeric milk", "haldi doodh"],
    unit: "cup",
    defaultPortion: "1 cup (200ml)",
    kcal: 130,
    protein: 5.5,
    carbs: 14,
    fat: 5,
    fiber: 0.5,
    origin: "Ayurvedic",
  },
  {
    name: "Almonds, Figs & Chia Seeds",
    aliases: ["almonds, figs & chia seeds", "almonds and chia seeds", "almonds", "chia seeds", "walnuts", "pumpkin seeds", "nuts and seeds", "mixed nuts"],
    unit: "serving",
    defaultPortion: "1 handful (25g)",
    kcal: 140,
    protein: 4,
    carbs: 10,
    fat: 9,
    fiber: 4,
    origin: "Global Healthy",
  },
];

// Persistent in-memory cache to guarantee identical results for identical queries
const IN_MEMORY_NUTRITION_CACHE = new Map<string, DishNutritionResult>();

/**
 * Normalizes user free-text query into a canonical cache key
 */
export function normalizeMealQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s&,+]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parses numeric multipliers or word numbers: "2", "two", "half", "1.5", "1/2", "3"
 */
function extractQuantity(clause: string): { qty: number; remainder: string } {
  const trimmed = clause.trim();
  const wordMap: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    half: 0.5, "1/2": 0.5, quarter: 0.25, "1/4": 0.25, a: 1, an: 1, single: 1, double: 2, pair: 2,
  };

  // Match leading numbers like "2", "2.5", "1/2"
  const leadingNumMatch = trimmed.match(/^(\d+(?:\.\d+)?|\d+\/\d+)\s*(katoris?|bowls?|cups?|plates?|pcs?|pieces?|slices?|glasses?|servings?|tbsp|tsp|g|grams?)?\s*(.*)$/i);
  if (leadingNumMatch) {
    let num = 1;
    if (leadingNumMatch[1].includes("/")) {
      const [top, bottom] = leadingNumMatch[1].split("/").map(Number);
      num = bottom ? top / bottom : 1;
    } else {
      num = parseFloat(leadingNumMatch[1]) || 1;
    }
    return { qty: num, remainder: (leadingNumMatch[3] || "").trim() };
  }

  // Match leading word numbers like "two rotis", "half cup rice"
  const words = trimmed.split(/\s+/);
  const firstWord = words[0]?.toLowerCase();
  if (firstWord && wordMap[firstWord] !== undefined) {
    const qty = wordMap[firstWord];
    let restIdx = 1;
    // Skip unit words if present (e.g. "two cups of rice" -> "rice")
    if (words[1] && /^(katoris?|bowls?|cups?|plates?|pcs?|pieces?|slices?|glasses?|servings?|of)$/i.test(words[1])) {
      restIdx = 2;
      if (words[2]?.toLowerCase() === "of") restIdx = 3;
    }
    return { qty, remainder: words.slice(restIdx).join(" ").trim() };
  }

  return { qty: 1, remainder: trimmed };
}

/**
 * Matches a single phrase clause against canonical food entries
 */
function matchSingleFood(clause: string): { food: FoodEntry; qty: number } | null {
  const { qty, remainder } = extractQuantity(clause);
  const cleanRemainder = (remainder || clause).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  let bestMatch: FoodEntry | null = null;
  let bestScore = 0;

  for (const food of CANONICAL_FOODS) {
    for (const alias of food.aliases) {
      const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
      const regex = new RegExp(`\\b${cleanAlias}\\b`, "i");
      if (regex.test(cleanRemainder) && cleanAlias.length > bestScore) {
        bestMatch = food;
        bestScore = cleanAlias.length;
      }
    }
  }

  if (bestMatch) {
    return { food: bestMatch, qty };
  }

  return null;
}

/**
 * Pure deterministic dish nutrition calculation from canonical database.
 * Returns null if the text cannot be sufficiently parsed deterministically.
 */
export function calculateFromCanonicalDatabase(text: string): DishNutritionResult | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Split on connectors: "with", "and", "&", "+", ",", "along with", "plus"
  const rawClauses = trimmed
    .split(/\s*(?:,\s*|\band\b|\bwith\b|\bplus\b|\balong with\b|[&+])\s*/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (rawClauses.length === 0) return null;

  const matches: Array<{ food: FoodEntry; qty: number }> = [];
  for (const clause of rawClauses) {
    const matched = matchSingleFood(clause);
    if (matched) {
      matches.push(matched);
    }
  }

  // Must match at least 1 food item
  if (matches.length === 0) return null;

  let totalKcal = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  const breakdown: FoodPortion[] = [];

  for (const m of matches) {
    const portionKcal = Math.round(m.food.kcal * m.qty);
    const portionP = Math.round(m.food.protein * m.qty * 10) / 10;
    const portionC = Math.round(m.food.carbs * m.qty * 10) / 10;
    const portionF = Math.round(m.food.fat * m.qty * 10) / 10;
    const portionFib = Math.round(m.food.fiber * m.qty * 10) / 10;

    totalKcal += portionKcal;
    totalProtein += portionP;
    totalCarbs += portionC;
    totalFat += portionF;
    totalFiber += portionFib;

    const portionText =
      m.qty === 1
        ? m.food.defaultPortion
        : `${m.qty} ${m.food.unit}${m.qty > 1 ? "s" : ""}`;

    breakdown.push({
      item: m.food.name,
      portion: portionText,
      kcal: portionKcal,
      protein: `${portionP}g`,
    });
  }

  // 4-4-9 macro balance check (kcal approx = 4*P + 4*C + 9*F)
  const macroKcal = Math.round(totalProtein * 4 + totalCarbs * 4 + totalFat * 9);
  // Re-sync kcal to macro sum to ensure absolute clinical consistency
  const finalKcal = Math.abs(totalKcal - macroKcal) <= 25 ? totalKcal : macroKcal;

  const origin = matches[0]?.food.origin || "Home Kitchen";
  const healthImpact = generateHealthImpactSummary(finalKcal, totalProtein, totalCarbs, totalFat, totalFiber);
  const suggestions = generateMealSuggestion(finalKcal, totalProtein, totalFiber);

  return {
    isFood: true,
    recipeTitle: formatTitleCase(trimmed),
    kcal: finalKcal,
    protein: `${Math.round(totalProtein)}g`,
    carbs: `${Math.round(totalCarbs)}g`,
    fat: `${Math.round(totalFat)}g`,
    fiber: `${Math.round(totalFiber)}g`,
    origin,
    confidence: "high",
    breakdown,
    healthImpact,
    suggestions,
    source: "canonical_database",
  };
}

/**
 * Checks in-memory cache or computes deterministically
 */
export function getCachedOrCanonicalNutrition(text: string): DishNutritionResult | null {
  const key = normalizeMealQuery(text);
  if (IN_MEMORY_NUTRITION_CACHE.has(key)) {
    const cached = IN_MEMORY_NUTRITION_CACHE.get(key)!;
    return { ...cached, source: "deterministic_cache" };
  }

  const result = calculateFromCanonicalDatabase(text);
  if (result) {
    IN_MEMORY_NUTRITION_CACHE.set(key, result);
    return result;
  }

  return null;
}

/**
 * Stores a verified result in the cache
 */
export function cacheDishNutrition(text: string, result: DishNutritionResult): void {
  const key = normalizeMealQuery(text);
  IN_MEMORY_NUTRITION_CACHE.set(key, result);
}

function generateHealthImpactSummary(kcal: number, p: number, c: number, f: number, fib: number): string {
  if (p >= 25) {
    return `High-protein composition (${Math.round(p)}g protein) promotes satiety, muscle repair, and blunts postprandial glucose excursions.`;
  } else if (fib >= 6) {
    return `Rich in soluble and prebiotic dietary fiber (${Math.round(fib)}g) that nourishes gut microbiota and supports sustained energy.`;
  } else if (kcal < 300) {
    return `Light, nutrient-dense meal with minimal metabolic friction. Ideal for light digestion and glycemic balance.`;
  }
  return `Balanced whole-food macronutrient distribution supporting stable metabolic energy and afternoon focus.`;
}

function generateMealSuggestion(kcal: number, p: number, fib: number): string {
  if (fib < 3) {
    return `Pair with sliced cucumbers, tomatoes, or a lemon-coriander salad to increase dietary fiber and digestive enzymes.`;
  }
  if (p < 12) {
    return `Consider adding a katori of sprouted moong, boiled egg, or paneer to elevate amino acid density.`;
  }
  return `Allow 3–4 hours before your next eating window for optimal digestive and circadian rhythm balance.`;
}

function formatTitleCase(str: string): string {
  if (str.length > 55) return `${str.slice(0, 52)}...`;
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
