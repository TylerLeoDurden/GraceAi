"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  X,
  ArrowUpRight,
  ChefHat,
  HeartPulse,
  Send,
  Loader2,
  AlertTriangle,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import { FormattedMessage } from "./formatted-message";
import { getRealTimeStatus } from "@/lib/date-utils";

export function FloatingGrace() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<"chef" | "health">("chef");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string; alert?: boolean }>>([
    {
      role: "assistant",
      text: "Hello! Tell me what ingredients you have in your kitchen, and I will write a simple point-by-point recipe for you.",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
  };

  const handleSend = async (query?: string) => {
    const textToSend = query || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg = textToSend.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          mode,
          history: messages.slice(-6).map((m) => ({
            role: m.role === "assistant" ? "grace" : "user",
            content: m.text,
          })),
          timeContext: getRealTimeStatus(new Date()),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "I am here to guide your culinary journey.",
          alert: Boolean(data.alert),
        },
      ]);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAborted = err instanceof Error && (err.name === "AbortError" || err.message?.includes("aborted"));
      console.warn("Floating Grace error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: isAborted
            ? "Request took longer than expected due to connection latency. Please try asking again."
            : "Grace encountered a connection pause. Please try asking again.",
        },
      ]);
    } finally {
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        text:
          mode === "chef"
            ? "What are we cooking today? Tell me what you have on hand."
            : "I can help with daily hydration, post-meal energy, or sleep rhythms. What's on your mind?",
      },
    ]);
  };

  if (pathname === "/grace") {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-8 right-5 z-40">
      {isOpen && (
        <div
          className={`mb-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all duration-200 ${
            isExpanded
              ? "w-[94vw] sm:w-[500px] h-[600px] max-h-[85vh]"
              : "w-[94vw] sm:w-[420px] h-[500px] max-h-[82vh]"
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-[var(--surface-elevated)] border-b border-[var(--border)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Grace"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <h4 className="font-serif text-base font-semibold text-[var(--text)]">
                  Grace
                </h4>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {mode === "chef" ? "In the Kitchen" : "Daily Wellness"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[var(--text-muted)]">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
                title={isExpanded ? "Standard view" : "Enlarge view"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={resetChat}
                className="p-1.5 rounded-lg hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <Link
                href="/grace"
                className="p-1.5 rounded-lg hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
                title="Fullscreen view"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 m-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] text-xs shrink-0">
            <button
              onClick={() => setMode("chef")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-all ${
                mode === "chef"
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-sm font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Recipes</span>
            </button>
            <button
              onClick={() => setMode("health")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-all ${
                mode === "health"
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-sm font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Nutrition & Habits</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs bg-[var(--background)]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-[var(--text)] text-[var(--background)]"
                      : m.alert
                      ? "bg-[var(--danger)]/10 text-[var(--text)] border border-[var(--danger)]/25"
                      : "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]"
                  }`}
                >
                  {m.alert && (
                    <div className="flex items-center gap-1.5 text-[var(--danger)] font-semibold text-[11px] mb-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Health Notice</span>
                    </div>
                  )}

                  <FormattedMessage content={m.text} isUser={m.role === "user"} />
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start items-center gap-2">
                <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary)]" />
                  <span>Writing down points...</span>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-3 py-2 bg-[var(--surface-elevated)] border-t border-[var(--border)] flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {mode === "chef" ? (
              <>
                <button
                  onClick={() => handleSend("What can I make with whatever is in my fridge? Give it in points.")}
                  className="whitespace-nowrap text-[11px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-muted)] px-3 py-1 rounded-full text-[var(--text)] transition-colors"
                >
                  Use what&apos;s in my fridge
                </button>
                <button
                  onClick={() => handleSend("Give me a point-by-point recipe for South Indian Dosa")}
                  className="whitespace-nowrap text-[11px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-muted)] px-3 py-1 rounded-full text-[var(--text)] transition-colors"
                >
                  Crisp Dosa recipe
                </button>
                <button
                  onClick={() => handleSend("Quick 15-minute dinner in points")}
                  className="whitespace-nowrap text-[11px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-muted)] px-3 py-1 rounded-full text-[var(--text)] transition-colors"
                >
                  15-min dinner
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSend("Why do I feel tired after lunch? Give 3 practical tips")}
                  className="whitespace-nowrap text-[11px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-muted)] px-3 py-1 rounded-full text-[var(--text)] transition-colors"
                >
                  Post-lunch dip
                </button>
                <button
                  onClick={() => handleSend("How much water should I drink daily? Give the formula")}
                  className="whitespace-nowrap text-[11px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-muted)] px-3 py-1 rounded-full text-[var(--text)] transition-colors"
                >
                  Hydration goal
                </button>
              </>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder={mode === "chef" ? "Ask for any recipe or cooking tip..." : "Ask a wellness question..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isTyping}
              className="flex-1 bg-[var(--surface-elevated)] text-xs rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-none focus:border-[var(--text-muted)] text-[var(--text)] placeholder:text-[var(--text-muted)] disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="p-2.5 rounded-xl bg-[var(--text)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ask Grace"
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Ask Grace"
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="font-serif font-medium text-sm text-[var(--text)] hidden sm:inline">
          Ask Grace
        </span>
      </button>
    </div>
  );
}
