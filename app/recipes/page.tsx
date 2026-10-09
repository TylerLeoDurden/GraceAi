"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Search,
  Clock,
  Flame,
  ChefHat,
  Filter,
  CheckCircle2,
  Heart,
  X,
  Play,
  RotateCcw,
} from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  cuisine: string;
  course: string;
  diet: string[];
  prepMin: number;
  cookMin: number;
  servings: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  image: string;
  description: string;
  ingredients: Array<{ item: string; amount: number; unit: string }>;
  steps: string[];
}

const RECIPES_DATA: Recipe[] = [
  {
    id: "1",
    title: "Kerala Moong & Brown Rice Khichdi",
    cuisine: "South Indian",
    course: "Dinner",
    diet: ["Vegetarian", "Gluten-Free", "Gut Healing"],
    prepMin: 10,
    cookMin: 20,
    servings: 2,
    kcal: 380,
    proteinG: 14,
    carbsG: 58,
    fatG: 9,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    description: "Gentle unpolished brown rice and yellow lentils tempered with cumin, curry leaves, and unrefined ghee.",
    ingredients: [
      { item: "Yellow Moong Dal", amount: 100, unit: "g" },
      { item: "Brown Rice", amount: 100, unit: "g" },
      { item: "Fresh Curry Leaves", amount: 10, unit: "leaves" },
      { item: "Cumin Seeds (Jeera)", amount: 1, unit: "tsp" },
      { item: "Turmeric Powder", amount: 0.5, unit: "tsp" },
      { item: "Fresh Ginger (grated)", amount: 1, unit: "inch" },
    ],
    steps: [
      "Rinse brown rice and moong dal until water runs clear. Soak for 20 minutes if time allows.",
      "In a heavy pot, heat 1 tsp cold-pressed oil or ghee. Add cumin seeds and let them sizzle for 30 seconds.",
      "Add grated ginger, green chillies, and fresh curry leaves; sauté until fragrant.",
      "Add soaked dal, rice, turmeric, and 4 cups of water. Bring to a gentle boil.",
      "Cover and simmer on low for 18-20 minutes until grains are tender and porridge-like.",
      "Garnish with chopped fresh coriander and a squeeze of fresh lemon juice.",
    ],
  },
  {
    id: "2",
    title: "Greek Herb-Crusted Roasted Salmon Bowl",
    cuisine: "Mediterranean",
    course: "Lunch",
    diet: ["High-Protein", "Keto", "Heart Healthy"],
    prepMin: 10,
    cookMin: 15,
    servings: 2,
    kcal: 440,
    proteinG: 34,
    carbsG: 12,
    fatG: 28,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
    description: "Omega-3 rich wild salmon fillet baked over crushed kalamata olives, cherry tomatoes, and dill.",
    ingredients: [
      { item: "Salmon Fillets", amount: 250, unit: "g" },
      { item: "Cherry Tomatoes", amount: 150, unit: "g" },
      { item: "Kalamata Olives (pitted)", amount: 50, unit: "g" },
      { item: "Extra Virgin Olive Oil", amount: 1.5, unit: "tbsp" },
      { item: "Fresh Dill & Oregano", amount: 2, unit: "tbsp" },
    ],
    steps: [
      "Preheat your oven or air fryer to 200°C (400°F).",
      "Toss halved cherry tomatoes and olives with olive oil, oregano, salt, and black pepper.",
      "Place salmon fillets on a lined baking tray and season gently with fresh herbs.",
      "Roast for 12 to 14 minutes until fish flakes easily with a fork.",
      "Serve warm over a bed of crisp greens or steamed asparagus.",
    ],
  },
  {
    id: "3",
    title: "Jain Paneer Methi Malai",
    cuisine: "North Indian",
    course: "Dinner",
    diet: ["Jain", "Vegetarian", "High Calcium"],
    prepMin: 15,
    cookMin: 20,
    servings: 3,
    kcal: 360,
    proteinG: 19,
    carbsG: 14,
    fatG: 22,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    description: "Prepared without onion, garlic, or root vegetables. Fresh fenugreek and soft paneer in cashew yogurt sauce.",
    ingredients: [
      { item: "Malai Paneer cubes", amount: 250, unit: "g" },
      { item: "Fresh Methi Leaves (chopped)", amount: 150, unit: "g" },
      { item: "Cashew Nut Paste", amount: 2, unit: "tbsp" },
      { item: "Greek Curd / Yogurt", amount: 100, unit: "g" },
      { item: "Cardamom & Cumin Powder", amount: 1, unit: "tsp" },
    ],
    steps: [
      "Blanch chopped fenugreek leaves in boiling water for 2 minutes to soften bitterness, then drain.",
      "In a pan, warm 1 tsp ghee; gently toast cardamom and cumin powder.",
      "Whisk cashew paste with curd and fold into the pan on low heat, stirring continuously.",
      "Add blanched methi and paneer cubes. Simmer gently for 6 minutes until gravy is silky.",
      "Garnish with dried kasuri methi and serve warm with multigrain rotis.",
    ],
  },
  {
    id: "4",
    title: "Kyoto Miso Tofu & Bok Choy Broth",
    cuisine: "East Asian",
    course: "Dinner",
    diet: ["Vegan", "Low Calorie", "Fermented"],
    prepMin: 5,
    cookMin: 12,
    servings: 2,
    kcal: 210,
    proteinG: 16,
    carbsG: 14,
    fatG: 7,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
    description: "Warm fermented white miso soup with organic cubed tofu, baby bok choy, and toasted sesame.",
    ingredients: [
      { item: "Silken Organic Tofu", amount: 200, unit: "g" },
      { item: "Baby Bok Choy", amount: 2, unit: "heads" },
      { item: "White Miso Paste", amount: 2, unit: "tbsp" },
      { item: "Dried Seaweed / Kombu", amount: 5, unit: "g" },
      { item: "Toasted Sesame Seeds", amount: 1, unit: "tsp" },
    ],
    steps: [
      "Bring 3 cups of water with kombu to a gentle simmer for 8 minutes to create dashi stock.",
      "Cut bok choy lengthwise and slice tofu into 2cm cubes.",
      "Add bok choy and tofu to the simmering broth for 3 minutes.",
      "Turn off the heat. Dissolve white miso paste into a ladle of warm broth, then stir into the pot (never boil miso).",
      "Ladle into ceramic bowls and top with toasted sesame seeds.",
    ],
  },
  {
    id: "5",
    title: "Chettinad Mushroom & Pepper Sukka",
    cuisine: "South Indian",
    course: "Lunch",
    diet: ["Vegan", "Immunity Boost", "Diabetic Friendly"],
    prepMin: 10,
    cookMin: 15,
    servings: 2,
    kcal: 220,
    proteinG: 8,
    carbsG: 18,
    fatG: 11,
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
    description: "Fresh oyster mushrooms dry-roasted with freshly crushed black tellicherry peppercorns and fennel.",
    ingredients: [
      { item: "Button / Oyster Mushrooms", amount: 250, unit: "g" },
      { item: "Shallots (Sambar Onions)", amount: 100, unit: "g" },
      { item: "Crushed Black Pepper", amount: 1.5, unit: "tsp" },
      { item: "Fennel Seeds (Saunf)", amount: 1, unit: "tsp" },
      { item: "Curry Leaves", amount: 15, unit: "leaves" },
    ],
    steps: [
      "Wipe mushrooms clean and quarter them.",
      "Heat cold-pressed coconut oil, splutter fennel seeds and curry leaves.",
      "Sauté sliced shallots until translucent and caramelized.",
      "Add mushrooms and toss over high flame for 5-6 minutes until juices evaporate.",
      "Finish with coarse tellicherry black pepper and fresh coriander.",
    ],
  },
  {
    id: "6",
    title: "Levantine Whipped Hummus Bowl",
    cuisine: "Mediterranean",
    course: "Lunch",
    diet: ["Vegan", "Plant Protein", "High Fiber"],
    prepMin: 15,
    cookMin: 0,
    servings: 2,
    kcal: 390,
    proteinG: 15,
    carbsG: 42,
    fatG: 18,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    description: "Creamy chickpeas whipped with sesame tahini, za'atar, lemon juice, and pomegranate arils.",
    ingredients: [
      { item: "Cooked Chickpeas", amount: 250, unit: "g" },
      { item: "Sesame Tahini", amount: 3, unit: "tbsp" },
      { item: "Lemon Juice", amount: 2, unit: "tbsp" },
      { item: "Za'atar Spice Blend", amount: 1, unit: "tsp" },
      { item: "Pomegranate Seeds", amount: 30, unit: "g" },
    ],
    steps: [
      "In a food processor, blend tahini and lemon juice with ice-cold water until pale and fluffy.",
      "Add cooked chickpeas and a pinch of sea salt; process for 4-5 minutes until ultra-smooth.",
      "Spread into a shallow bowl with the back of a spoon.",
      "Drizzle with cold-pressed olive oil, sprinkle za'atar, and top with pomegranate seeds.",
      "Serve with warm whole-grain pita or cucumber spears.",
    ],
  },
];

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedDiet, setSelectedDiet] = useState("All");
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [scaler, setScaler] = useState<number>(2);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  const cuisinesList = ["All", "South Indian", "North Indian", "Mediterranean", "East Asian"];
  const dietList = ["All", "Vegetarian", "Jain", "Vegan", "High-Protein", "Gluten-Free"];

  const filtered = RECIPES_DATA.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.some((i) => i.item.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCuisine = selectedCuisine === "All" || r.cuisine === selectedCuisine;
    const matchesDiet = selectedDiet === "All" || r.diet.includes(selectedDiet);

    return matchesSearch && matchesCuisine && matchesDiet;
  });

  const openRecipe = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    setScaler(recipe.servings);
    setActiveStepIdx(0);
  };

  return (
    <div className="max-w-[1760px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-14 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-1">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Nourishing Global Traditions</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text)]">
            World Recipe Library
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Clean, wholesome recipes from across the globe with serving scalers and step-by-step cooking mode.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 shadow-sm space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by recipe name, pantry ingredient (e.g. 'spinach', 'moong dal')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          {/* Cuisines */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs text-[var(--text-muted)] font-medium shrink-0">Cuisine:</span>
            {cuisinesList.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCuisine(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCuisine === c
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Diets */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs text-[var(--text-muted)] font-medium shrink-0">Diet:</span>
            {dietList.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDiet(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedDiet === d
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => openRecipe(recipe)}
            className="group bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
          >
            <div className="relative h-48 w-full overflow-hidden bg-[var(--surface-elevated)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{recipe.prepMin + recipe.cookMin} min</span>
              </div>
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[var(--surface)]/90 backdrop-blur-md text-[var(--text)] text-[11px] font-medium">
                {recipe.cuisine}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {recipe.diet.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-serif text-lg font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  {recipe.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                  {recipe.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[var(--text)]">{recipe.kcal} kcal</span>
                  <span className="text-[var(--text-muted)]">•</span>
                  <span className="text-[var(--primary)] font-semibold">{recipe.proteinG}g Protein</span>
                </div>
                <span className="text-[var(--accent)] font-semibold flex items-center gap-1">
                  Cook Recipe →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Detail & Cooking Mode Modal */}
      {activeRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-3xl w-full max-h-[90vh] bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-[var(--surface-elevated)] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeRecipe.image}
                alt={activeRecipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button
                onClick={() => setActiveRecipe(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <span className="text-xs uppercase tracking-wider font-semibold bg-[var(--primary)] px-2.5 py-0.5 rounded-full">
                  {activeRecipe.cuisine}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold">
                  {activeRecipe.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Scaler & Nutrition Strip */}
              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Servings:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScaler((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm text-[var(--text)]">{scaler}</span>
                    <button
                      onClick={() => setScaler((prev) => prev + 1)}
                      className="w-7 h-7 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[var(--text-muted)]">Calories: </span>
                    <strong className="text-[var(--text)]">
                      {Math.round((activeRecipe.kcal / activeRecipe.servings) * scaler)} kcal
                    </strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Protein: </span>
                    <strong className="text-[var(--primary)]">
                      {Math.round((activeRecipe.proteinG / activeRecipe.servings) * scaler)}g
                    </strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Carbs: </span>
                    <strong className="text-[var(--accent)]">
                      {Math.round((activeRecipe.carbsG / activeRecipe.servings) * scaler)}g
                    </strong>
                  </div>
                </div>
              </div>

              {/* Scaled Ingredients */}
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-semibold text-[var(--text)]">
                  Ingredients ({scaler} servings)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeRecipe.ingredients.map((ing, i) => {
                    const scaledAmount = Number(
                      ((ing.amount / activeRecipe.servings) * scaler).toFixed(1)
                    );
                    return (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex justify-between items-center"
                      >
                        <span className="font-medium text-[var(--text)]">{ing.item}</span>
                        <span className="font-bold text-[var(--primary)]">
                          {scaledAmount} {ing.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step by Step Cooking Instructions */}
              <div className="space-y-3 pt-2">
                <h4 className="font-serif text-lg font-semibold text-[var(--text)] flex items-center justify-between">
                  <span>Step-by-Step Cooking Steps</span>
                  <span className="text-xs font-sans text-[var(--text-muted)]">
                    Step {activeStepIdx + 1} of {activeRecipe.steps.length}
                  </span>
                </h4>

                <div className="p-5 rounded-2xl bg-[var(--primary-light)] border border-[var(--primary-border)] space-y-4">
                  <div className="font-serif text-base text-[var(--text)] leading-relaxed">
                    <strong>Step {activeStepIdx + 1}: </strong>
                    {activeRecipe.steps[activeStepIdx]}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--primary-border)]">
                    <button
                      onClick={() => setActiveStepIdx((prev) => Math.max(0, prev - 1))}
                      disabled={activeStepIdx === 0}
                      className="px-3 py-1.5 rounded-xl border border-[var(--primary-border)] bg-[var(--surface)] text-xs font-medium disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setActiveStepIdx((prev) =>
                          Math.min(activeRecipe.steps.length - 1, prev + 1)
                        )
                      }
                      disabled={activeStepIdx === activeRecipe.steps.length - 1}
                      className="px-4 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold disabled:opacity-40"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
