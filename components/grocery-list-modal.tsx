"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  Printer,
  X,
  FileText,
  Table,
  RotateCcw,
  CheckCircle2,
  Filter,
} from "lucide-react";

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

interface GroceryListModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekLabel?: string;
}

export function GroceryListModal({
  isOpen,
  onClose,
  weekLabel = "Current Week",
}: GroceryListModalProps) {
  const [aisles, setAisles] = useState<GroceryAisle[]>(DEFAULT_GROCERY_AISLES);
  const [filterMode, setFilterMode] = useState<"all" | "pending" | "completed">("all");

  // Manual entry state
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [selectedAisle, setSelectedAisle] = useState(AISLE_OPTIONS[0]);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  // Load from local storage on mount
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

  // Save to local storage on changes
  const saveAisles = (updated: GroceryAisle[]) => {
    setAisles(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  if (!isOpen) return null;

  // Stats calculation
  const allItems = aisles.flatMap((a) => a.items);
  const totalCount = allItems.length;
  const checkedCount = allItems.filter((i) => i.checked).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Toggle item checked state
  const handleToggle = (itemId: string) => {
    const updated = aisles.map((aisle) => ({
      ...aisle,
      items: aisle.items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    }));
    saveAisles(updated);
  };

  // Add custom manual item
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

  // Delete an item
  const handleDeleteItem = (itemId: string) => {
    const updated = aisles
      .map((aisle) => ({
        ...aisle,
        items: aisle.items.filter((item) => item.id !== itemId),
      }))
      .filter((aisle) => aisle.items.length > 0);
    saveAisles(updated);
  };

  // Clear completed items
  const handleClearCompleted = () => {
    const updated = aisles
      .map((aisle) => ({
        ...aisle,
        items: aisle.items.filter((item) => !item.checked),
      }))
      .filter((aisle) => aisle.items.length > 0);
    saveAisles(updated);
  };

  // Reset to default sample list
  const handleReset = () => {
    if (confirm("Reset grocery list to default weekly meal plan items?")) {
      saveAisles(DEFAULT_GROCERY_AISLES);
    }
  };

  // Format list for download / copy
  const generateFormattedText = () => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    let text = `========================================\n`;
    text += `GRACE AI • GROCERY SHOPPING LIST\n`;
    text += `Week: ${weekLabel} (Generated: ${dateStr})\n`;
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

  // Download as Plain Text (.txt)
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

  // Download as CSV (.csv)
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

  // Copy to clipboard
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

  // Print list
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 print:p-0 print:bg-white">
      <div className="max-w-3xl w-full max-h-[92vh] bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in print:shadow-none print:border-none print:max-h-full">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-elevated)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-[var(--text)]">
                  Grocery Shopping List
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] font-semibold">
                  {checkedCount}/{totalCount} checked
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {weekLabel} • Manual item entry & one-click download.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors print:hidden"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--border)] h-1.5 shrink-0">
          <div
            className="bg-[var(--primary)] h-1.5 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Manual Item Entry Bar */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)] shrink-0 print:hidden">
          <form onSubmit={handleAddManualItem} className="space-y-2.5">
            <div className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Add Custom Grocery Item</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Item name (e.g. Sourdough bread, Mustard oil)..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
              />
              <input
                type="text"
                placeholder="Qty (e.g. 500g, 1 pack)"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                className="w-full sm:w-36 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
              />
              <select
                value={selectedAisle}
                onChange={(e) => setSelectedAisle(e.target.value)}
                className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
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
                className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </form>
        </div>

        {/* Toolbar: Filter tabs & Export Options */}
        <div className="px-4 py-2.5 bg-[var(--surface-elevated)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 print:hidden">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterMode === "all"
                  ? "bg-[var(--surface-elevated)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilterMode("pending")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterMode === "pending"
                  ? "bg-[var(--surface-elevated)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              Pending ({totalCount - checkedCount})
            </button>
            <button
              onClick={() => setFilterMode("completed")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterMode === "completed"
                  ? "bg-[var(--surface-elevated)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              Done ({checkedCount})
            </button>
          </div>

          {/* Download & Share Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleDownloadTxt}
              className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--text)] font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              title="Download formatted text file"
            >
              <FileText className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Download .txt</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--text)] font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              title="Download as spreadsheet (CSV)"
            >
              <Table className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Download .csv</span>
            </button>

            <button
              onClick={handleCopyClipboard}
              className={`px-3 py-1.5 rounded-xl border border-[var(--border)] font-medium flex items-center gap-1.5 transition-all shadow-xs ${
                copiedFeedback
                  ? "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/40"
                  : "bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--text)]"
              }`}
              title="Copy checklist to clipboard"
            >
              {copiedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              title="Print grocery list"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Items List grouped by Aisle */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {aisles.map((aisle, aisleIdx) => {
            const filteredItems = aisle.items.filter((item) => {
              if (filterMode === "pending") return !item.checked;
              if (filterMode === "completed") return item.checked;
              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={aisleIdx} className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
                  <h4 className="font-serif text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                    <span>{aisle.aisle}</span>
                  </h4>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {filteredItems.length} items
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all group ${
                        item.checked
                          ? "bg-[var(--surface-elevated)] border-[var(--border)] opacity-60 text-[var(--text-muted)]"
                          : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <label
                        className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                        onClick={() => handleToggle(item.id)}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded accent-[var(--primary)] cursor-pointer"
                        />
                        <span
                          className={`text-xs ${
                            item.checked ? "line-through text-[var(--text-muted)]" : "font-medium"
                          }`}
                        >
                          {item.name}
                        </span>
                      </label>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2 py-0.5 rounded-lg border border-[var(--border)]">
                          {item.qty}
                        </span>

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all print:hidden"
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
            <div className="py-12 text-center space-y-2 text-[var(--text-muted)]">
              <ShoppingBag className="w-8 h-8 mx-auto opacity-40 text-[var(--primary)]" />
              <p className="text-sm font-serif">Your grocery list is empty.</p>
              <p className="text-xs">Add custom items above or reset to your weekly meal plan.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-elevated)] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCompleted}
              disabled={checkedCount === 0}
              className="text-[11px] px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors disabled:opacity-40"
            >
              Clear Completed ({checkedCount})
            </button>
            <button
              onClick={handleReset}
              className="text-[11px] px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Plan</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download List</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[var(--text)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
