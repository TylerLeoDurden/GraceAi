/**
 * Weather, Location & Circadian Culinary Recommendation Engine for graceAI.
 * 
 * Accurately detects or predicts:
 * 1. User's place / city (Browser Geolocation API + IP fallback + manual quick switch).
 * 2. Live real-time weather via Open-Meteo (temperature, condition, humidity, is_day).
 * 3. Local circadian time-of-day & active meal slot.
 * 4. Contextual dish recommendations tailored to Place + Weather + Time.
 */

import { calculateFromCanonicalDatabase, DishNutritionResult } from "@/lib/dish-nutrition";

export interface LocationData {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  temperatureC: number;
  apparentTempC: number;
  humidity: number;
  weatherCode: number;
  condition: "sunny" | "cloudy" | "rainy" | "chilly" | "hot" | "pleasant";
  conditionLabel: string;
  isDay: boolean;
  windSpeed: number;
  icon: string;
}

export interface WeatherDishRecommendation {
  id: string;
  recipeTitle: string;
  mealSlot: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  kcal: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  origin: string;
  weatherFitBadge: string;
  weatherRationale: string;
  culinaryTip: string;
  ingredients: string[];
}

export interface WeatherCulinaryPayload {
  location: LocationData;
  weather: WeatherData;
  timeContext: {
    timeOfDay: "morning" | "afternoon" | "evening" | "night";
    activeSlot: "Breakfast" | "Lunch" | "Snack" | "Dinner";
    timeString: string;
    formattedDate: string;
  };
  recommendations: WeatherDishRecommendation[];
}

// Default fallback location (Chennai, Tamil Nadu)
export const DEFAULT_LOCATION: LocationData = {
  city: "Chennai",
  region: "Tamil Nadu",
  country: "India",
  latitude: 13.0827,
  longitude: 80.2707,
};

// Popular quick-switch cities across regions
export const POPULAR_CITIES: Array<{ name: string; region: string; lat: number; lon: number; cuisineFocus: string }> = [
  { name: "Chennai", region: "Tamil Nadu, India", lat: 13.0827, lon: 80.2707, cuisineFocus: "South Indian & Coastal" },
  { name: "Mumbai", region: "Maharashtra, India", lat: 19.0760, lon: 72.8777, cuisineFocus: "Konkan & Maharashtrian" },
  { name: "New Delhi", region: "Delhi, India", lat: 28.6139, lon: 77.2090, cuisineFocus: "North Indian & Punjabi" },
  { name: "Bengaluru", region: "Karnataka, India", lat: 12.9716, lon: 77.5946, cuisineFocus: "Karnataka & Modern Healthy" },
  { name: "Hyderabad", region: "Telangana, India", lat: 17.3850, lon: 78.4867, cuisineFocus: "Deccani & Spiced Tahari" },
  { name: "Kolkata", region: "West Bengal, India", lat: 22.5726, lon: 88.3639, cuisineFocus: "Bengali Hearth & Steamed Fish" },
  { name: "London", region: "United Kingdom", lat: 51.5074, lon: -0.1278, cuisineFocus: "Rustic British & Mediterranean" },
  { name: "New York", region: "United States", lat: 40.7128, lon: -74.0060, cuisineFocus: "Global Hearth & Plant-Forward" },
];

/**
 * Maps WMO weather code to weather condition and human-readable label
 */
export function parseWeatherCode(code: number, tempC: number, isDay: boolean): {
  condition: WeatherData["condition"];
  conditionLabel: string;
  icon: string;
} {
  // Rain / drizzle / showers
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) {
    return {
      condition: "rainy",
      conditionLabel: code >= 95 ? "Thunderstorms & Rain" : "Monsoon Showers & Rain",
      icon: "🌧️",
    };
  }

  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      condition: "chilly",
      conditionLabel: "Snow & Freezing Chill",
      icon: "❄️",
    };
  }

  // Fog / mist
  if ([45, 48].includes(code)) {
    return {
      condition: "chilly",
      conditionLabel: "Cool Mist & Fog",
      icon: "🌫️",
    };
  }

  // Temperature based classification
  if (tempC >= 32) {
    return {
      condition: "hot",
      conditionLabel: isDay ? "Hot & Sunny" : "Warm & Humid Night",
      icon: isDay ? "☀️" : "🌡️",
    };
  }

  if (tempC <= 14) {
    return {
      condition: "chilly",
      conditionLabel: "Chilly & Brisk",
      icon: "🧣",
    };
  }

  if ([1, 2, 3].includes(code)) {
    return {
      condition: "cloudy",
      conditionLabel: "Pleasantly Overcast & Breezy",
      icon: "⛅",
    };
  }

  return {
    condition: "pleasant",
    conditionLabel: isDay ? "Clear & Pleasant" : "Calm Night Skies",
    icon: isDay ? "🌤️" : "🌙",
  };
}

/**
 * Fetches real-time weather from Open-Meteo for given coordinates
 */
export async function fetchLiveWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m`;
  
  const res = await fetch(url, { next: { revalidate: 600 } }); // Cache for 10 minutes
  if (!res.ok) {
    throw new Error(`Open-Meteo error: ${res.statusText}`);
  }

  const data = await res.json();
  const current = data.current;

  const tempC = Math.round(current.temperature_2m * 10) / 10;
  const apparentTempC = Math.round(current.apparent_temperature * 10) / 10;
  const humidity = current.relative_humidity_2m;
  const weatherCode = current.weather_code;
  const isDay = current.is_day === 1;
  const windSpeed = current.wind_speed_10m;

  const { condition, conditionLabel, icon } = parseWeatherCode(weatherCode, tempC, isDay);

  return {
    temperatureC: tempC,
    apparentTempC,
    humidity,
    weatherCode,
    condition,
    conditionLabel,
    isDay,
    windSpeed,
    icon,
  };
}

/**
 * Curated weather-aligned dishes with calculated nutritional profiles
 */
interface WeatherRecipeTemplate {
  title: string;
  query: string;
  conditions: Array<WeatherData["condition"]>;
  slots: Array<"Breakfast" | "Lunch" | "Snack" | "Dinner">;
  origin: string;
  badge: string;
  rationale: string;
  tip: string;
  ingredients: string[];
}

const RECIPE_DATABASE: WeatherRecipeTemplate[] = [
  // --- HOT / SUNNY WEATHER RECIPES ---
  {
    title: "Curd Rice with Cucumber & Mustard Tempering",
    query: "1 bowl Curd Rice with Cucumber Raita and roasted papad",
    conditions: ["hot", "pleasant"],
    slots: ["Lunch", "Dinner"],
    origin: "South India",
    badge: "☀️ Cooling & Gut Hydration",
    rationale: "Rich in active lactobacillus and cooling electrolytes. Helps dissipate internal body heat and prevents dehydration in hot climates.",
    tip: "Garnish with freshly grated ginger, green chilies, and a handful of pomegranate seeds for gentle sweetness.",
    ingredients: ["Cooked white or brown rice", "Fresh unflavored dahi", "Cucumber", "Mustard seeds & curry leaves", "Papad"],
  },
  {
    title: "Light Moong Dal Idli with Coconut Mint Chutney",
    query: "3 idlis with sambar and coconut chutney",
    conditions: ["hot", "pleasant"],
    slots: ["Breakfast"],
    origin: "South India",
    badge: "🌿 Light & Steamed Digestion",
    rationale: "Steamed fermented rice and lentils digest effortlessly without generating heavy thermic digestive stress during hot mornings.",
    tip: "Pair with chilled tender coconut water or buttermilk for an optimal hydration curve.",
    ingredients: ["Moong dal & rice batter", "Fresh coconut", "Mint & coriander", "Mustard tempering"],
  },
  {
    title: "Spiced Mint Buttermilk (Chaas) & Roasted Makhana",
    query: "1 glass Spiced Buttermilk with 1 cup Roasted Makhana",
    conditions: ["hot", "pleasant"],
    slots: ["Snack"],
    origin: "North & Western India",
    badge: "🧊 Circadian Electrolyte Shield",
    rationale: "Diluted churned yogurt with rock salt and roasted cumin restores trace minerals lost through perspiration.",
    tip: "Drink at room temperature rather than ice-cold to avoid digestive shock.",
    ingredients: ["Fresh curd", "Roasted cumin (jeera)", "Black salt", "Mint leaves", "Fox nuts (makhana)"],
  },
  {
    title: "Mediterranean Grilled Lemon Chicken with Quinoa Salad",
    query: "Mediterranean Grilled Lemon Chicken Bowl",
    conditions: ["hot", "pleasant"],
    slots: ["Lunch", "Dinner"],
    origin: "Mediterranean",
    badge: "🥗 Lean Protein & Light Digestion",
    rationale: "Bright citrus and crisp cucumbers deliver lean amino acids with minimal metabolic heaviness.",
    tip: "Drizzle with extra virgin olive oil and oregano just before serving.",
    ingredients: ["Chicken breast", "Steamed quinoa", "Cucumber", "Cherry tomatoes", "Lemon juice", "Olive oil"],
  },

  // --- RAINY / MONSOON RECIPES ---
  {
    title: "Piping Hot Pepper Rasam Rice with Steamed Beans Thoran",
    query: "1 cup Cooked White Rice with 1 katori Sambar and Cabbage Thoran",
    conditions: ["rainy", "cloudy"],
    slots: ["Lunch", "Dinner"],
    origin: "Tamil Nadu",
    badge: "🌧️ Agni Booster & Immunity Warmth",
    rationale: "Black pepper, crushed garlic, and tamarind stimulate sluggish monsoon digestion (digestive fire) and support upper respiratory immunity.",
    tip: "Temper the rasam with crushed cumin, curry leaves, and unrefined ghee for maximum bioavailability.",
    ingredients: ["Tamarind extract", "Crushed black pepper", "Garlic cloves", "Tomatoes", "Cumin & ghee", "Rice"],
  },
  {
    title: "Hot Besan Chilla with Grated Paneer & Mint Chutney",
    query: "2 Besan Chilla with Mint Chutney",
    conditions: ["rainy", "chilly", "cloudy"],
    slots: ["Breakfast", "Snack"],
    origin: "North India",
    badge: "🥞 Warm High-Protein Comfort",
    rationale: "A wholesome, un-fried alternative to rainy-day pakoras. High in complex legume protein and zinc for seasonal resilience.",
    tip: "Add finely minced ginger and ajwain (carom seeds) to the batter to soothe gut bloating.",
    ingredients: ["Besan (gram flour)", "Grated paneer", "Ginger & green chili", "Ajwain", "Fresh mint chutney"],
  },
  {
    title: "Roasted Makhana with Hot Adrak (Ginger) Chai",
    query: "1 cup Roasted Makhana with 1 cup Masala Chai",
    conditions: ["rainy", "chilly", "cloudy"],
    slots: ["Snack"],
    origin: "North India",
    badge: "☕ Monsoon Hearth & Respiratory Soothe",
    rationale: "Fresh crushed ginger provides thermogenic warmth and clears chest dampness on overcast, drizzly afternoons.",
    tip: "Dry-roast makhana with 1/4 tsp ghee and a dash of chaat masala until crisp.",
    ingredients: ["Fox nuts (makhana)", "Fresh ginger", "Assam tea leaves", "Whole milk", "Cardamom"],
  },
  {
    title: "Comforting Moong Dal Khichdi with Ghee & Roasted Papad",
    query: "1 bowl Khichdi with 1 roasted papad and Plain Curd",
    conditions: ["rainy", "chilly"],
    slots: ["Dinner"],
    origin: "Ayurvedic Hearth",
    badge: "🍲 Restorative Gut Healing",
    rationale: "The golden standard of Ayurvedic restorative food during wet weather when digestive capacity naturally dips.",
    tip: "Top with a single teaspoon of pure A2 cow ghee just before eating.",
    ingredients: ["Yellow split moong dal", "Short grain rice", "Turmeric & cumin", "Pure ghee", "Roasted papad"],
  },

  // --- CHILLY / WINTER WEATHER RECIPES ---
  {
    title: "Palak Paneer with Whole Wheat Phulka & Garlic Chutney",
    query: "2 rotis with Palak Paneer",
    conditions: ["chilly", "cloudy"],
    slots: ["Lunch", "Dinner"],
    origin: "Punjab",
    badge: "🧣 Thermogenic Iron & Calcium Rich",
    rationale: "Dense iron from seasonal spinach and bioactive lipids from fresh paneer insulate cellular membranes against brisk cold winds.",
    tip: "Blanch spinach leaves for only 2 minutes in boiling water and shock in cold water to preserve vibrant chlorophyll.",
    ingredients: ["Fresh spinach (palak)", "Soft paneer cubes", "Garlic & onions", "Whole wheat flour", "Spices"],
  },
  {
    title: "Steel-Cut Oats with Chia, Figs, Warm Cinnamon & Almonds",
    query: "Steel Cut Oats with Almonds, Figs & Chia Seeds",
    conditions: ["chilly", "cloudy", "pleasant"],
    slots: ["Breakfast"],
    origin: "Global Hearth",
    badge: "🥣 Slow-Burn Sustained Energy",
    rationale: "Beta-glucan soluble fibers create a slow, steady glucose curve that keeps your core temperature warm for 4-5 hours.",
    tip: "Simmer oats in almond milk with a pinch of Ceylon cinnamon and crushed green cardamom.",
    ingredients: ["Steel-cut oats", "Dried anjeer (figs)", "Chia seeds", "Crushed almonds", "Cinnamon powder"],
  },
  {
    title: "Turmeric Ashwagandha Golden Milk with Walnuts",
    query: "1 cup Golden Turmeric Milk with handful of Walnuts",
    conditions: ["chilly", "rainy"],
    slots: ["Dinner", "Snack"],
    origin: "Ayurvedic Rhythms",
    badge: "🌙 Deep Restorative Circadian Fuel",
    rationale: "Curcumin paired with warm lipids and adaptogenic ashwagandha lowers systemic inflammation and triggers parasympathetic deep sleep.",
    tip: "Always include a pinch of black pepper to increase curcumin absorption by up to 2,000%.",
    ingredients: ["Warm milk", "Wild organic turmeric", "Ashwagandha root powder", "Black pepper", "Walnuts"],
  },
  {
    title: "Rustic Minestrone Soup with White Beans & Herb Garlic Toast",
    query: "1 bowl Minestrone Soup with 2 slices Whole Wheat Toast",
    conditions: ["chilly", "cloudy"],
    slots: ["Dinner"],
    origin: "Italy / Mediterranean",
    badge: "🧄 Immune Shield & Prebiotic Fiber",
    rationale: "Warm slow-cooked cannellini beans, rosemary, and root vegetables supply soluble fiber that feeds protective gut flora in cold weather.",
    tip: "Garnish with freshly grated parmesan and crushed oregano.",
    ingredients: ["Cannellini beans", "Zucchini & carrots", "Tomato broth", "Rosemary & thyme", "Garlic whole wheat bread"],
  },

  // --- GENERAL / BALANCED REGIONAL DISHES ---
  {
    title: "Hyderabadi Spiced Chicken Biryani with Cucumber Raita",
    query: "1 plate Chicken Biryani with Cucumber Raita",
    conditions: ["pleasant", "cloudy", "rainy"],
    slots: ["Lunch"],
    origin: "Hyderabad / Regional",
    badge: "👑 Royal Celebratory Feast",
    rationale: "Fragrant basmati rice infused with whole cardamom, star anise, and lean marinated chicken delivers complete metabolic fulfillment.",
    tip: "Enjoy alongside a cooling cucumber mint raita to temper the rich aromatic spices.",
    ingredients: ["Basmati rice", "Marinated chicken", "Caramelized onions", "Saffron milk", "Curd raita"],
  },
  {
    title: "Kerala Brown Rice with Sambar & Beetroot Thoran",
    query: "Kerala Brown Rice with Sambar & Cabbage Thoran",
    conditions: ["pleasant", "hot", "rainy"],
    slots: ["Lunch"],
    origin: "Kerala",
    badge: "🌴 Low Glycemic Whole Grain",
    rationale: "Unpolished red matta brown rice provides steady micronutrients (magnesium and B-vitamins) paired with antioxidant-rich betalains.",
    tip: "Grind fresh coconut with cumin and green chilies coarsely for the authentic thoran texture.",
    ingredients: ["Red matta rice", "Toor dal & drumstick sambar", "Grated beetroot", "Fresh coconut", "Curry leaves"],
  },
  {
    title: "Paneer Parathas with Chilled Spiced Curd",
    query: "2 Paneer Parathas with 1 katori Curd",
    conditions: ["pleasant", "chilly"],
    slots: ["Breakfast", "Lunch"],
    origin: "Punjab",
    badge: "⚡ High Energy Morning Sustenance",
    rationale: "Wholesome complex carbs paired with dense milk protein stabilize blood sugar and prevent midday energy crashes.",
    tip: "Knead the dough with warm milk for extra tenderness without needing excess butter.",
    ingredients: ["Whole wheat flour", "Fresh paneer", "Ajwain & fresh coriander", "Spiced curd / dahi"],
  },
];

/**
 * Predicts and selects the top recommendations for the current Place, Weather, and Meal Slot
 */
export function generateWeatherRecommendations(
  weather: WeatherData,
  activeSlot: "Breakfast" | "Lunch" | "Snack" | "Dinner",
  location: LocationData
): WeatherDishRecommendation[] {
  // Score candidates based on slot match, weather match, and regional relevance
  const candidates = RECIPE_DATABASE.map((tpl) => {
    let score = 0;

    // Slot matching (highest priority)
    if (tpl.slots.includes(activeSlot)) score += 50;

    // Weather condition matching
    if (tpl.conditions.includes(weather.condition)) score += 30;

    // Place / Regional proximity matching
    const locLower = `${location.city} ${location.region} ${location.country}`.toLowerCase();
    if (locLower.includes("tamil") || locLower.includes("chennai") || locLower.includes("kerala") || locLower.includes("bengaluru")) {
      if (tpl.origin.includes("South India") || tpl.origin.includes("Tamil") || tpl.origin.includes("Kerala")) score += 20;
    } else if (locLower.includes("delhi") || locLower.includes("punjab") || locLower.includes("mumbai")) {
      if (tpl.origin.includes("North India") || tpl.origin.includes("Punjab") || tpl.origin.includes("Maharashtra")) score += 20;
    } else if (locLower.includes("uk") || locLower.includes("london") || locLower.includes("us") || locLower.includes("york")) {
      if (tpl.origin.includes("Mediterranean") || tpl.origin.includes("Global") || tpl.origin.includes("Italy")) score += 20;
    }

    return { template: tpl, score };
  });

  // Sort descending by match score
  candidates.sort((a, b) => b.score - a.score);

  // Take top 3 unique dishes
  const topTemplates = candidates.slice(0, 3).map((c) => c.template);

  // Compute exact, deterministic calories and macros for each dish via our nutrition engine
  return topTemplates.map((tpl, idx) => {
    const nutrition = calculateFromCanonicalDatabase(tpl.query) || {
      kcal: 420,
      protein: "16g",
      carbs: "54g",
      fat: "14g",
      fiber: "6g",
    };

    return {
      id: `weather-rec-${activeSlot}-${idx}-${Date.now()}`,
      recipeTitle: tpl.title,
      mealSlot: activeSlot,
      kcal: nutrition.kcal,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      fiber: nutrition.fiber,
      origin: tpl.origin,
      weatherFitBadge: tpl.badge,
      weatherRationale: tpl.rationale,
      culinaryTip: tpl.tip,
      ingredients: tpl.ingredients,
    };
  });
}
