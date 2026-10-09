"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Sparkles,
  ShoppingBag,
  Lock,
  Unlock,
  RefreshCw,
  Clock,
  CheckCircle2,
  X,
  Share2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";

interface MealSlot {
  name: string;
  time: string;
  recipeTitle: string;
  kcal: number;
  protein: string;
  origin: string;
  locked: boolean;
}

const INITIAL_DAYS: Record<string, MealSlot[]> = {
  Monday: [
    { name: "Breakfast", time: "8:00 AM", recipeTitle: "South Indian Moong Dal Idli & Coconut Chutney", kcal: 320, protein: "12g", origin: "Tamil Nadu", locked: false },
    { name: "Lunch", time: "1:00 PM", recipeTitle: "Kerala Spiced Brown Rice & Sambar Bowl", kcal: 480, protein: "18g", origin: "Kerala", locked: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Roasted Makhana (Fox Nuts) with Mint Chai", kcal: 150, protein: "4g", origin: "North India", locked: false },
    { name: "Dinner", time: "8:00 PM", recipeTitle: "Mediterranean Roasted Vegetable & Lentil Salad", kcal: 410, protein: "20g", origin: "Greece", locked: false },
  ],
  Tuesday: [
    { name: "Breakfast", time: "8:00 AM", recipeTitle: "Steel-Cut Oats with Chia, Figs & Almonds", kcal: 350, protein: "11g", origin: "Global Hearth", locked: false },
    { name: "Lunch", time: "1:00 PM", recipeTitle: "Palak Paneer with Multigrain Phulka", kcal: 510, protein: "24g", origin: "Punjab", locked: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Cucumber & Carrot Sticks with Spiced Curd Dip", kcal: 120, protein: "6g", origin: "Global", locked: false },
    { name: "Dinner", time: "8:00 PM", recipeTitle: "Kyoto Miso Tofu & Vegetable Clear Broth", kcal: 360, protein: "22g", origin: "Japan", locked: false },
  ],
  Wednesday: [
    { name: "Breakfast", time: "8:00 AM", recipeTitle: "Rava Upma with Mixed Vegetables & Ginger", kcal: 310, protein: "9g", origin: "Karnataka", locked: false },
    { name: "Lunch", time: "1:00 PM", recipeTitle: "Chettinad Mushroom Biryani & Beetroot Raita", kcal: 490, protein: "15g", origin: "Tamil Nadu", locked: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Sprouted Moong Chaat with Pomegranate & Lime", kcal: 160, protein: "8g", origin: "Maharashtra", locked: false },
    { name: "Dinner", time: "8:00 PM", recipeTitle: "Baked Herbed Fish with Steamed Broccoli", kcal: 430, protein: "32g", origin: "Mediterranean", locked: false },
  ],
  Thursday: [
    { name: "Breakfast", time: "8:00 AM", recipeTitle: "Besan Chilla with Grated Paneer Stuffing", kcal: 340, protein: "16g", origin: "Rajasthan", locked: false },
    { name: "Lunch", time: "1:00 PM", recipeTitle: "Rajma (Red Kidney Beans) with Jeera Brown Rice", kcal: 520, protein: "22g", origin: "Punjab", locked: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Handful of Walnuts & Roasted Pumpkin Seeds", kcal: 180, protein: "5g", origin: "Global", locked: false },
    { name: "Dinner", time: "8:00 PM", recipeTitle: "Stir-Fried Tofu with Bok Choy & Edamame", kcal: 390, protein: "25g", origin: "East Asian", locked: false },
  ],
  Friday: [
    { name: "Breakfast", time: "8:00 AM", recipeTitle: "Avocado & Poached Egg Whole-Wheat Toast", kcal: 360, protein: "17g", origin: "California", locked: false },
    { name: "Lunch", time: "1:00 PM", recipeTitle: "Dal Tadka, Steamed Quinoa & Methi Subzi", kcal: 470, protein: "19g", origin: "Gujarat", locked: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Chana Jor Garam with Chopped Tomatoes & Coriander", kcal: 140, protein: "7g", origin: "India", locked: false },
    { name: "Dinner", time: "8:00 PM", recipeTitle: "Rustic Minestrone Soup with White Beans", kcal: 380, protein: "18g", origin: "Italy", locked: false },
  ],
  Saturday: [
    { name: "Breakfast", time: "8:30 AM", recipeTitle: "Red Rice Poha with Peanuts & Fresh Coconut", kcal: 330, protein: "10g", origin: "Maharashtra", locked: false },
    { name: "Lunch", time: "1:30 PM", recipeTitle: "Mexican Chipotle Black Bean & Corn Bowl", kcal: 500, protein: "21g", origin: "Mexico", locked: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Spiced Buttermilk (Chaas) with Mint & Ginger", kcal: 80, protein: "4g", origin: "India", locked: false },
    { name: "Dinner", time: "8:30 PM", recipeTitle: "Grilled Paneer Tikka with Grilled Bell Peppers", kcal: 440, protein: "26g", origin: "North India", locked: false },
  ],
  Sunday: [
    { name: "Breakfast", time: "9:00 AM", recipeTitle: "Multigrain Dosa with Tomato-Garlic Chutney", kcal: 340, protein: "11g", origin: "South India", locked: false },
    { name: "Lunch", time: "1:30 PM", recipeTitle: "Hyderabadi Spiced Vegetable Tahari with Salan", kcal: 530, protein: "18g", origin: "Telangana", locked: false },
    { name: "Snack", time: "5:00 PM", recipeTitle: "Turmeric Ashwagandha Golden Milk", kcal: 130, protein: "5g", origin: "Ayurvedic", locked: false },
    { name: "Dinner", time: "8:00 PM", recipeTitle: "Light Zucchini Noodle Pad Thai with Crushed Peanuts", kcal: 360, protein: "16g", origin: "Thailand", locked: false },
  ],
};

const SAMPLE_GROCERY_AISLES = [
  {
    aisle: "Fresh Produce & Greens",
    items: [
      { name: "Baby Spinach (Palak)", qty: "500g", checked: false },
      { name: "Fresh Coriander & Mint", qty: "2 bunches", checked: false },
      { name: "Tomatoes (Country / Roma)", qty: "1 kg", checked: true },
      { name: "Curry Leaves & Green Chillies", qty: "100g", checked: true },
      { name: "Ginger & Garlic", qty: "250g", checked: false },
      { name: "Cucumber & Carrots", qty: "1 kg", checked: false },
      { name: "Bell Peppers (Mixed)", qty: "3 pcs", checked: false },
    ],
  },
  {
    aisle: "Grains, Lentils & Pulses",
    items: [
      { name: "Yellow Moong Dal", qty: "1 kg", checked: false },
      { name: "Unpolished Brown Rice", qty: "2 kg", checked: true },
      { name: "Whole Red Kidney Beans (Rajma)", qty: "500g", checked: false },
      { name: "Quinoa or Steel Cut Oats", qty: "500g", checked: false },
      { name: "Multigrain Atta", qty: "2 kg", checked: false },
    ],
  },
  {
    aisle: "Proteins & Dairy",
    items: [
      { name: "Low-Fat Malai Paneer", qty: "400g", checked: false },
      { name: "Organic Firm Tofu", qty: "300g", checked: false },
      { name: "A2 Set Curd / Greek Yogurt", qty: "1 kg", checked: false },
      { name: "Eggs (Free Range)", qty: "12 pack", checked: false },
    ],
  },
  {
    aisle: "Pantry Spices & Healthy Fats",
    items: [
      { name: "Cold-Pressed Mustard / Coconut Oil", qty: "1 bottle", checked: false },
      { name: "Roasted Makhana", qty: "200g", checked: false },
      { name: "Chia Seeds & Pumpkin Seeds", qty: "200g", checked: false },
      { name: "Whole Cumin & Mustard Seeds", qty: "100g", checked: true },
    ],
  },
];

export default function PlannerPage() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [planData, setPlanData] = useState(INITIAL_DAYS);
  const [groceryModalOpen, setGroceryModalOpen] = useState(false);
  const [groceries, setGroceries] = useState(SAMPLE_GROCERY_AISLES);

  const toggleLock = (day: string, slotIdx: number) => {
    setPlanData((prev) => {
      const copy = { ...prev };
      copy[day] = copy[day].map((item, idx) =>
        idx === slotIdx ? { ...item, locked: !item.locked } : item
      );
      return copy;
    });
  };

  const handleSwap = (day: string, slotIdx: number) => {
    const alternates = [
      { recipeTitle: "Spiced Pumpkin & Chickpea Tagine", kcal: 430, protein: "17g", origin: "Moroccan" },
      { recipeTitle: "Gujarati Methi Thepla & Fresh Curd", kcal: 360, protein: "12g", origin: "Gujarat" },
      { recipeTitle: "Mediterranean Grilled Lemon Chicken Bowl", kcal: 490, protein: "38g", origin: "Greek" },
      { recipeTitle: "South Indian Spiced Sambar Rice with Pappad", kcal: 450, protein: "15g", origin: "Tamil Nadu" },
    ];
    const picked = alternates[Math.floor(Math.random() * alternates.length)];

    setPlanData((prev) => {
      const copy = { ...prev };
      copy[day] = copy[day].map((item, idx) =>
        idx === slotIdx ? { ...item, ...picked } : item
      );
      return copy;
    });
  };

  const toggleGroceryItem = (aisleIdx: number, itemIdx: number) => {
    setGroceries((prev) => {
      const copy = [...prev];
      copy[aisleIdx].items[itemIdx].checked = !copy[aisleIdx].items[itemIdx].checked;
      return copy;
    });
  };

  const activeMeals = planData[selectedDay];
  const dayKcal = activeMeals.reduce((acc, m) => acc + m.kcal, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Weekly Nutrition Calendar</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text)]">
            Meal Planner
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Tailored weekly nourishment. Lock your staples, swap meals with one tap, or export your grocery list.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setGroceryModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Generate Grocery List</span>
          </button>
        </div>
      </div>

      {/* Day Selector Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {Object.keys(planData).map((day) => {
          const isSelected = selectedDay === day;
          const totalKcal = planData[day].reduce((a, b) => a + b.kcal, 0);

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`p-4 rounded-2xl text-left min-w-[130px] border transition-all ${
                isSelected
                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                  : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-elevated)]"
              }`}
            >
              <div className="font-serif font-semibold text-base">{day}</div>
              <div className={`text-xs mt-1 ${isSelected ? "text-white/80" : "text-[var(--text-muted)]"}`}>
                {totalKcal} kcal
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Overview Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl font-semibold text-[var(--text)]">
            {selectedDay}’s Menu
          </span>
          <span className="px-3 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-semibold">
            {dayKcal} kcal total
          </span>
          <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
            Safe floor met • Balanced Macro Split
          </span>
        </div>
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
          <span>Tap <strong>Swap</strong> to rotate with an alternate recipe</span>
        </div>
      </div>

      {/* Meals Grid for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeMeals.map((slot, idx) => (
          <div
            key={idx}
            className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                  {slot.name}
                </span>
                <button
                  onClick={() => toggleLock(selectedDay, idx)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    slot.locked
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                  title={slot.locked ? "Meal is locked" : "Lock meal"}
                >
                  {slot.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{slot.time}</span>
                <span>•</span>
                <span>{slot.origin}</span>
              </div>

              <h3 className="font-serif text-base font-semibold text-[var(--text)] leading-snug">
                {slot.recipeTitle}
              </h3>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--text)]">{slot.kcal} kcal</span>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="text-[var(--primary)] font-semibold">{slot.protein} P</span>
              </div>

              <button
                onClick={() => handleSwap(selectedDay, idx)}
                disabled={slot.locked}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                  slot.locked
                    ? "opacity-40 cursor-not-allowed border-[var(--border)] text-[var(--text-muted)]"
                    : "border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                <span>Swap</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Grocery List Modal */}
      {groceryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-2xl w-full max-h-[85vh] bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-elevated)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[var(--text)]">
                    Aggregated Grocery List
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Organized by supermarket / mandi aisles for efficient shopping.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGroceryModalOpen(false)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aisle Items List */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {groceries.map((aisle, aisleIdx) => (
                <div key={aisleIdx} className="space-y-3">
                  <h4 className="font-serif text-base font-semibold text-[var(--primary)] flex items-center gap-2 border-b border-[var(--border)] pb-1.5">
                    <span>{aisle.aisle}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aisle.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        onClick={() => toggleGroceryItem(aisleIdx, itemIdx)}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          item.checked
                            ? "bg-[var(--surface-elevated)] border-[var(--border)] opacity-60 line-through text-[var(--text-muted)]"
                            : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            readOnly
                            className="rounded accent-[var(--primary)]"
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-[var(--text-muted)]">
                          {item.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-muted)]">
                Check off items as you shop in your local market.
              </span>
              <button
                onClick={() => setGroceryModalOpen(false)}
                className="px-6 py-2.5 rounded-2xl bg-[var(--text)] text-[var(--background)] font-medium text-xs hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
