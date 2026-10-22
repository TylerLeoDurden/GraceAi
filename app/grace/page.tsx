"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChefHat,
  HeartPulse,
  Send,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { FormattedMessage } from "@/components/formatted-message";
import { useRealTime } from "@/lib/use-real-time";
import { getRealTimeStatus } from "@/lib/date-utils";

interface Message {
  id: string;
  role: "user" | "grace";
  content: string;
  mode: "chef" | "health";
  alert?: boolean;
  helpline?: string;
  feedback?: "up" | "down";
}

export default function GraceChatPage() {
  const { status, mounted } = useRealTime(1000);
  const [mode, setMode] = useState<"chef" | "health">("chef");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "grace",
      mode: "chef",
      content:
        "Namaste! I am Grace, your intelligent culinary chef and wellness companion powered by Groq. You are currently in Chef Grace mode. What delicious, wholesome meal can we cook together today?",
    },
  ]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserTextRef = useRef<string>("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const [weatherInfo, setWeatherInfo] = useState<{
    city: string;
    region: string;
    tempC: number;
    condition: string;
    icon: string;
  } | null>(null);

  // Load weather context on mount and auto-refresh every 30 minutes
  useEffect(() => {
    const fetchLiveChatWeather = () => {
      fetch("/api/weather/recommend", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.location && data.weather) {
            setWeatherInfo({
              city: data.location.city,
              region: data.location.region,
              tempC: data.weather.temperatureC,
              condition: data.weather.conditionLabel,
              icon: data.weather.icon,
            });
          }
        })
        .catch(() => {});
    };

    fetchLiveChatWeather();
    const interval = setInterval(fetchLiveChatWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for prompt query param from external components (e.g. weather cards)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlPrompt = params.get("prompt");
      if (urlPrompt) {
        handleSend(urlPrompt);
        // Clear param from URL without reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
  };

  const handleSend = async (textOverride?: string) => {
    const raw = textOverride || input;
    if (!raw.trim() || isTyping) return;

    const userText = raw.trim();
    lastUserTextRef.current = userText;
    setInput("");

    const userMsg: Message = {
      id: "u_" + Date.now(),
      role: "user",
      content: userText,
      mode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      // Build lightweight conversation history for model context
      const historyContext = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          mode,
          history: historyContext,
          timeContext: getRealTimeStatus(new Date()),
          weatherContext: weatherInfo
            ? {
                city: weatherInfo.city,
                region: weatherInfo.region,
                temperatureC: weatherInfo.tempC,
                conditionLabel: weatherInfo.condition,
              }
            : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      setMessages((prev) => [
        ...prev,
        {
          id: "g_" + Date.now(),
          role: "grace",
          content:
            data.reply ||
            "I am here to guide your culinary and wellness journey. Could you please rephrase your request?",
          mode,
          alert: Boolean(data.alert),
          helpline: data.helpline,
        },
      ]);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAborted = err instanceof Error && (err.name === "AbortError" || err.message?.includes("aborted"));
      console.warn("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "g_" + Date.now(),
          role: "grace",
          content: isAborted
            ? "Grace's reply took a bit longer than expected due to connection latency. Tap 'Retry' to try again."
            : "Grace encountered a brief connection pause. Please tap 'Retry' below.",
          mode,
          alert: false,
        },
      ]);
    } finally {
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  };

  const handleFeedback = (msgId: string, type: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: type } : m))
    );
  };

  const resetChat = () => {
    setMessages([
      {
        id: "m_" + Date.now(),
        role: "grace",
        mode,
        content:
          mode === "chef"
            ? "Chef Grace is ready! Tell me what ingredients you have in your pantry or what cuisine you're craving."
            : "Health Guide Grace here. Ask me about your nutrition targets, hydration, sleep rhythms, or healthy lifestyle balance.",
      },
    ]);
  };

  return (
    <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 flex flex-col h-[calc(100vh-5rem)]">
      {/* Chat Header */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 shadow-sm mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold text-[var(--text)] flex items-center gap-2">
              Grace AI Assistant
              <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                {mode === "chef" ? "Chef Mode" : "Health Guide Mode"}
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-[var(--text-muted)]">
              <span>Groq LLM</span>
              {mounted && status && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[var(--primary)] font-medium">
                    {status.dayOfWeekShort}, {status.timeString}
                  </span>
                  <span>•</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-[var(--surface-elevated)] border border-[var(--border)] text-[10px] text-[var(--text)]">
                    {status.activeMealSlot} Window
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mode Switch & Reset */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex p-1 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)] flex-1 sm:flex-initial">
            <button
              onClick={() => {
                setMode("chef");
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === "chef"
                  ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Chef Grace</span>
            </button>
            <button
              onClick={() => {
                setMode("health");
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === "health"
                  ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>Health Guide</span>
            </button>
          </div>

          <button
            onClick={resetChat}
            className="p-2.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Weather & Location Context Bar */}
      {weatherInfo && (
        <div className="px-4 py-2.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)] animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base">{weatherInfo.icon}</span>
            <span className="font-semibold text-[var(--text)]">
              {weatherInfo.city}: {weatherInfo.tempC}°C ({weatherInfo.condition})
            </span>
            <span className="hidden sm:inline opacity-70">• Live Weather Context</span>
          </div>
          <button
            type="button"
            onClick={() =>
              handleSend(
                `I am in ${weatherInfo.city} where it is currently ${weatherInfo.tempC}°C and ${weatherInfo.condition}. What dishes and seasonal nourishment do you recommend right now?`
              )
            }
            className="text-[11px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Chef Grace for weather dishes</span>
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-3xl p-4 space-y-2 leading-relaxed ${
                m.role === "user"
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : m.alert
                  ? "bg-[var(--danger)]/15 border border-[var(--danger)]/40 text-[var(--text)]"
                  : "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text)] shadow-sm"
              }`}
            >
              {m.alert && (
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--danger)]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Important Safety Notice</span>
                </div>
              )}

              <FormattedMessage content={m.content} isUser={m.role === "user"} />

              {m.helpline && (
                <div className="pt-2 border-t border-[var(--danger)]/30 text-xs font-semibold text-[var(--danger)]">
                  {m.helpline}
                </div>
              )}

              {/* Grace message footer: disclaimer chip & feedback */}
              {m.role === "grace" && !m.alert && (
                <div className="pt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    General culinary & wellness guidance
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleFeedback(m.id, "up")}
                      className={`p-1 rounded hover:bg-[var(--surface)] ${
                        m.feedback === "up" ? "text-[var(--primary)] font-bold" : ""
                      }`}
                      title="Helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(m.id, "down")}
                      className={`p-1 rounded hover:bg-[var(--surface)] ${
                        m.feedback === "down" ? "text-[var(--danger)] font-bold" : ""
                      }`}
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
              {m.role === "grace" && m.content.includes("Retry") && (
                <div className="pt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] text-[11px]">Tap to re-attempt:</span>
                  <button
                    onClick={() => handleSend(lastUserTextRef.current)}
                    className="px-3 py-1 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 flex items-center gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-center gap-2">
            <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl px-4 py-3 text-xs text-[var(--text)] flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
              <span>Grace is writing down your points...</span>
            </div>
            <button
              onClick={handleCancel}
              className="text-xs px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shadow-xs"
            >
              Cancel
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Chips */}
      <div className="py-2.5 flex gap-2 overflow-x-auto no-scrollbar">
        {mode === "chef" ? (
          <>
            <button
              onClick={() =>
                handleSend(
                  weatherInfo
                    ? `What delicious dishes do you recommend for today's weather in ${weatherInfo.city} (${weatherInfo.tempC}°C, ${weatherInfo.condition})?`
                    : "Recommend authentic dishes that match today's weather and time"
                )
              }
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--primary)] text-[var(--primary)] whitespace-nowrap hover:bg-[var(--primary)] hover:text-white font-semibold transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>{weatherInfo ? `${weatherInfo.icon} Best for ${weatherInfo.city}'s Weather` : "🌦️ Recommend for Today's Weather"}</span>
            </button>
            <button
              onClick={() => handleSend("I have spinach, eggs, and tomatoes. What can I cook?")}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] whitespace-nowrap hover:border-[var(--accent)]"
            >
              🥗 Cook with my fridge ingredients
            </button>
            <button
              onClick={() => handleSend("How can I substitute coconut milk in a South Indian vegetable stew?")}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] whitespace-nowrap hover:border-[var(--accent)]"
            >
              🥥 Coconut milk substitute
            </button>
            <button
              onClick={() => handleSend("Give me a high-protein vegetarian dinner ready in 20 minutes")}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] whitespace-nowrap hover:border-[var(--accent)]"
            >
              ⏱️ 20-min High-Protein Dinner
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleSend("Why do I get afternoon energy crashes after eating carbs?")}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] whitespace-nowrap hover:border-[var(--primary)]"
            >
              ⚡ Beat afternoon crashes
            </button>
            <button
              onClick={() => handleSend("What is the scientific formula for my daily water intake?")}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] whitespace-nowrap hover:border-[var(--primary)]"
            >
              💧 Hydration science
            </button>
            <button
              onClick={() => handleSend("I have sudden chest pain and trouble breathing")}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--danger)]/15 border border-[var(--danger)]/30 text-[var(--danger)] whitespace-nowrap"
            >
              🚨 Test Emergency Alert
            </button>
          </>
        )}
      </div>

      {/* Chat Input Bar */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-2 flex items-center gap-2 shadow-sm">
        <input
          type="text"
          placeholder={
            mode === "chef"
              ? "Ask Chef Grace (e.g. 'How do I balance spices in rasam?')..."
              : "Ask Health Guide Grace (e.g. 'How to balance blood sugar?')..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isTyping}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-[var(--text)] focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={isTyping || !input.trim()}
          className="px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
