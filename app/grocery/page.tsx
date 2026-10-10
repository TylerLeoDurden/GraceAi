"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  Printer,
  FileText,
  Table,
  RotateCcw,
  CheckCircle2,
  CalendarDays,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useRealTime } from "@/lib/use-real-time";
import { getRealTimeStatus } from "@/lib/date-utils";

export interface GroceryItem {
  id: string;
  name: string;
  qty: string;
  checked: boolean;
  isCustom?: boolean;
}

export interface GroceryAisle {
  aisle: string;
  items: GroceryItem[];
}

const DEFAULT_GROCERY_AISLES: GroceryAisle[] = [
  {
    aisle: "Fresh Produce & Greens",
    items: [
      { id: "p1", name: "Baby Spinach (Palak)", qty: "500g", checked: false },
      { id: "p2", name: "Fresh Coriander & Mint", qty: "2 bunches", checked: false },
      { id: "p3", name: "Tomatoes (Country / Roma)", qty: "1 kg", checked: true },
      { id: "p4", name: "Curry Leaves & Green Chillies", qty: "100g", checked: true },
      { id: "p5", name: "Ginger & Garlic", qty: "250g", checked: false },
      { id: "p6", name: "Cucumber & Carrots", qty: "1 kg", checked: false },
      { id: "p7", name: "Bell Peppers (Mixed)", qty: "3 pcs", checked: false },
    ],
  },
  {
    aisle: "Grains, Lentils & Pulses",
    items: [
      { id: "g1", name: "Yellow Moong Dal", qty: "1 kg", checked: false },
      { id: "g2", name: "Unpolished Brown Rice", qty: "2 kg", checked: true },
      { id: "g3", name: "Whole Red Kidney Beans (Rajma)", qty: "500g", checked: false },
      { id: "g4", name: "Quinoa or Steel Cut Oats", qty: "500g", checked: false },
      { id: "g5", name: "Multigrain Atta", qty: "2 kg", checked: false },
    ],
  },
  {
    aisle: "Proteins & Dairy",
    items: [
      { id: "d1", name: "Low-Fat Malai Paneer", qty: "400g", checked: false },
      { id: "d2", name: "Organic Firm Tofu", qty: "300g", checked: false },
      { id: "d3", name: "A2 Set Curd / Greek Yogurt", qty: "1 kg", checked: false },
      { id: "d4", name: "Eggs (Free Range)", qty: "12 pack", checked: false },
    ],
  },
  {
    aisle: "Pantry, Spices & Oils",
    items: [
      { id: "o1", name: "Cold-Pressed Mustard Oil / Ghee", qty: "500ml", checked: false },
      { id: "o2", name: "Whole Cumin & Mustard Seeds", qty: "100g", checked: false },
      { id: "o3", name: "Turmeric & Kashmiri Red Chili", qty: "100g", checked: true },
    ],
  },
];

const AISLE_OPTIONS = [
  "Fresh Produce & Greens",
  "Grains, Lentils & Pulses",
  "Proteins & Dairy",
  "Pantry, Spices & Oils",
  "Custom & Household",
];

const STORAGE_KEY = "graceai_custom_groceries_v1";

export default function GroceryPage() {
  const { status } = useRealTime(1000);
  const [aisles, setAisles] = useState<GroceryAisle[]>(DEFAULT_GROCERY_AISLES);
  const [filterMode, setFilterMode] = useState<"all" | "pending" | "completed">("all");

  // Manual entry state
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [selectedAisle, setSelectedAisle] = useState(AISLE_OPTIONS[0]);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  // Load from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAisles(parsed);
          }
        } catch (e) {
          console.warn("Could not load saved groceries:", e);
        }
      }
    }
  }, []);

  const saveAisles = (updated: GroceryAisle[]) => {
    setAisles(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const allItems = aisles.flatMap((a) => a.items);
  const totalCount = allItems.length;
  const checkedCount = allItems.filter((i) => i.checked).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const handleToggle = (itemId: string) => {
    const updated = aisles.map((aisle) => ({
      ...aisle,
      items: aisle.items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    }));
    saveAisles(updated);
  };

  const handleAddManualItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemName.trim()) return;

    const trimmedName = newItemName.trim();
    const trimmedQty = newItemQty.trim() || "1 unit";

    const newItem: GroceryItem = {
      id: "custom_" + Date.now(),
      name: trimmedName,
      qty: trimmedQty,
      checked: false,
      isCustom: true,
    };

    let foundAisle = false;
    const updated = aisles.map((aisle) => {
      if (aisle.aisle === selectedAisle) {
        foundAisle = true;
        return {
          ...aisle,
          items: [newItem, ...aisle.items],
        };
      }
      return aisle;
    });

    if (!foundAisle) {
      updated.push({
        aisle: selectedAisle,
        items: [newItem],
      });
    }

    saveAisles(updated);
    setNewItemName("");
    setNewItemQty("");
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = aisles
      .map((aisle) => ({
        ...aisle,
        items: aisle.items.filter((item) => item.id !== itemId),
      }))
      .filter((aisle) => aisle.items.length > 0);
    saveAisles(updated);
  };

  const handleClearCompleted = () => {
    const updated = aisles
      .map((aisle) => ({
        ...aisle,
        items: aisle.items.filter((item) => !item.checked),
      }))
      .filter((aisle) => aisle.items.length > 0);
    saveAisles(updated);
  };

  const handleReset = () => {
    if (confirm("Reset grocery list to default weekly plan items?")) {
      saveAisles(DEFAULT_GROCERY_AISLES);
    }
  };

  const generateFormattedText = () => {
    const dateStr = status?.formattedDate || new Date().toLocaleDateString();

    let text = `========================================\n`;
    text += `GRACE AI • GROCERY SHOPPING LIST\n`;
    text += `Date: ${dateStr}\n`;
    text += `Progress: ${checkedCount} of ${totalCount} items completed (${progressPercent}%)\n`;
    text += `========================================\n\n`;

    aisles.forEach((a) => {
      if (a.items.length === 0) return;
      text += `--- ${a.aisle.toUpperCase()} ---\n`;
      a.items.forEach((item) => {
        const marker = item.checked ? "[x]" : "[ ]";
        text += `${marker} ${item.name} — ${item.qty}\n`;
      });
      text += `\n`;
    });

    text += `Generated with care by GraceAI — Eat well. Live gracefully.\n`;
    return text;
  };

  const handleDownloadTxt = () => {
    const content = generateFormattedText();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `graceAI-grocery-list-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    let csv = `"Category","Item Name","Quantity","Status"\n`;
    aisles.forEach((aisle) => {
      aisle.items.forEach((item) => {
        const safeName = item.name.replace(/"/g, '""');
        const safeQty = item.qty.replace(/"/g, '""');
        const status = item.checked ? "Completed" : "Pending";
        csv += `"${aisle.aisle}","${safeName}","${safeQty}","${status}"\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `graceAI-grocery-list-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = async () => {
    try {
      const content = generateFormattedText();
      await navigator.clipboard.writeText(content);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2500);
    } catch (e) {
      console.warn("Clipboard write failed:", e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 md:py-12 space-y-8 print:p-0">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          href="/planner"
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Meal Planner</span>
        </Link>

        {status && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-light)] border border-[var(--primary-border)] text-xs text-[var(--text)]">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
            <span>
              {status.dayOfWeek} • {status.formattedShortDate}
            </span>
          </div>
        )}
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-serif italic text-[var(--accent)] tracking-wide">
            Market Trips & Pantry Stocking
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[var(--text)] tracking-tight">
            Grocery Shopping List
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] font-light leading-relaxed">
            Add manual items anytime, group them by local market aisles, and download your list as text or spreadsheet.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap print:hidden">
          <button
            onClick={handleDownloadTxt}
            className="px-4 py-2.5 rounded-2xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Download .txt</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
          >
            <Table className="w-4 h-4" />
            <span>Download .csv</span>
          </button>

          <button
            onClick={handleCopyClipboard}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-xs ${
              copiedFeedback
                ? "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/40"
                : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-elevated)]"
            }`}
          >
            {copiedFeedback ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--text)] transition-colors"
            title="Print list"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="text-xs text-[var(--text-muted)] font-medium">Total Items</div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
            {totalCount}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Across {aisles.length} categories</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="text-xs text-[var(--text-muted)] font-medium">Completed Items</div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--primary)] mt-1">
            {checkedCount}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{totalCount - checkedCount} items remaining</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="text-xs text-[var(--text-muted)] font-medium">Shopping Progress</div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--accent)] mt-1">
            {progressPercent}%
          </div>
          <div className="w-full bg-[var(--border)] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[var(--accent)] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Manual Add Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs print:hidden space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span>Manual Entry: Add Item to Grocery List</span>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Add any ingredient, pantry staple, or household item with its portion size and aisle.
        </p>

        <form onSubmit={handleAddManualItem} className="pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <input
              type="text"
              placeholder="Item name (e.g. Sourdough bread, Mustard oil, Almond milk)..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="sm:col-span-5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
            <input
              type="text"
              placeholder="Quantity (e.g. 500g, 2 packs, 1 bottle)..."
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              className="sm:col-span-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
            <select
              value={selectedAisle}
              onChange={(e) => setSelectedAisle(e.target.value)}
              className="sm:col-span-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
            >
              {AISLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!newItemName.trim()}
              className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add to List</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main List Box */}
      <div className="editorial-card rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
        {/* Filter and management toolbar */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--surface-elevated)] flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterMode === "all"
                  ? "bg-[var(--surface-elevated)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilterMode("pending")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterMode === "pending"
                  ? "bg-[var(--surface-elevated)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              Pending ({totalCount - checkedCount})
            </button>
            <button
              onClick={() => setFilterMode("completed")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterMode === "completed"
                  ? "bg-[var(--surface-elevated)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              Completed ({checkedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCompleted}
              disabled={checkedCount === 0}
              className="px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors disabled:opacity-40 text-xs"
            >
              Clear Checked
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1.5 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Plan List</span>
            </button>
          </div>
        </div>

        {/* Grouped Aisle Items */}
        <div className="p-5 sm:p-8 space-y-8">
          {aisles.map((aisle, aisleIdx) => {
            const filteredItems = aisle.items.filter((item) => {
              if (filterMode === "pending") return !item.checked;
              if (filterMode === "completed") return item.checked;
              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={aisleIdx} className="space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <h3 className="font-serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                    <span>{aisle.aisle}</span>
                  </h3>
                  <span className="text-xs text-[var(--text-muted)]">
                    {filteredItems.length} items
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all group ${
                        item.checked
                          ? "bg-[var(--surface-elevated)] border-[var(--border)] opacity-60 text-[var(--text-muted)]"
                          : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)] shadow-xs"
                      }`}
                    >
                      <label
                        className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                        onClick={() => handleToggle(item.id)}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded accent-[var(--primary)] cursor-pointer"
                        />
                        <span
                          className={`text-xs sm:text-sm ${
                            item.checked ? "line-through text-[var(--text-muted)]" : "font-medium"
                          }`}
                        >
                          {item.name}
                        </span>
                      </label>

                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2.5 py-1 rounded-xl border border-[var(--border)]">
                          {item.qty}
                        </span>

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all print:hidden"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {totalCount === 0 && (
            <div className="py-16 text-center space-y-3 text-[var(--text-muted)]">
              <ShoppingBag className="w-10 h-10 mx-auto opacity-40 text-[var(--primary)]" />
              <p className="text-base font-serif text-[var(--text)]">Your grocery list is empty.</p>
              <p className="text-xs">Add items above or return to your weekly meal planner.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
