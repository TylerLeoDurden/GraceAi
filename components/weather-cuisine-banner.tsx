"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  Sparkles,
  ChevronDown,
  Check,
  Compass,
  RefreshCw,
  Info,
  CalendarPlus,
  MessageSquare,
  Clock,
  X,
  Radio,
} from "lucide-react";
import {
  WeatherCulinaryPayload,
  WeatherDishRecommendation,
  POPULAR_CITIES,
} from "@/lib/weather-service";
import { dispatchLocationChange } from "@/lib/emergency-service";

interface WeatherCuisineBannerProps {
  onSelectDishForPlanner?: (dish: WeatherDishRecommendation) => void;
  compact?: boolean;
}

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const STORAGE_KEY_PLACE = "graceai_live_weather_place";

export function WeatherCuisineBanner({
  onSelectDishForPlanner,
  compact = false,
}: WeatherCuisineBannerProps) {
  const [data, setData] = useState<WeatherCulinaryPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [activeDishIdx, setActiveDishIdx] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [minutesSinceRefresh, setMinutesSinceRefresh] = useState(0);
  const [liveTimeString, setLiveTimeString] = useState<string>("");

  // Keep refs for active query parameters so the 30-min recurring timer can use them
  const currentCityRef = useRef<string | undefined>(undefined);
  const currentLatRef = useRef<number | undefined>(undefined);
  const currentLonRef = useRef<number | undefined>(undefined);
  const lastFetchTimeRef = useRef<number>(0);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch live weather and dish recommendations
  const loadWeatherRecommendations = useCallback(
    async (city?: string, lat?: number, lon?: number, isManual = false) => {
      if (isManual) setIsRefreshing(true);
      else if (!data) setIsLoading(true);

      try {
        let url = "/api/weather/recommend";
        const params = new URLSearchParams();

        if (lat !== undefined && lon !== undefined) {
          params.set("lat", lat.toString());
          params.set("lon", lon.toString());
        } else if (city) {
          params.set("city", city);
        }

        const clientTz =
          typeof Intl !== "undefined"
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : undefined;
        if (clientTz) {
          params.set("tz", clientTz);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const payload: WeatherCulinaryPayload = await res.json();
          setData(payload);
          const now = new Date();
          setLastRefreshedAt(now);
          setMinutesSinceRefresh(0);
          lastFetchTimeRef.current = now.getTime();

          currentCityRef.current = payload.location.city;
          currentLatRef.current = payload.location.latitude;
          currentLonRef.current = payload.location.longitude;

          // Persist user's place preference and notify emergency service
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                STORAGE_KEY_PLACE,
                JSON.stringify({
                  city: payload.location.city,
                  region: payload.location.region,
                  country: payload.location.country,
                  lat: payload.location.latitude,
                  lon: payload.location.longitude,
                })
              );
            } catch {
              // Ignore storage quotas
            }
          }

          dispatchLocationChange({
            city: payload.location.city,
            region: payload.location.region,
            country: payload.location.country,
            latitude: payload.location.latitude,
            longitude: payload.location.longitude,
          });

          if (isManual) {
            triggerToast(
              `Live weather updated for ${payload.location.city}: ${payload.weather.temperatureC}°C (${payload.weather.conditionLabel})`
            );
          }
        }
      } catch (err) {
        console.warn("Could not load live weather culinary recommendations:", err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Initial load: Check saved place or browser GPS
  useEffect(() => {
    lastFetchTimeRef.current = Date.now();
    setLastRefreshedAt(new Date());

    if (typeof window !== "undefined") {
      let savedPlace: { city?: string; lat?: number; lon?: number } | null = null;
      try {
        const item = localStorage.getItem(STORAGE_KEY_PLACE);
        if (item) savedPlace = JSON.parse(item);
      } catch {
        // Fall through
      }

      if (savedPlace?.city) {
        currentCityRef.current = savedPlace.city;
        currentLatRef.current = savedPlace.lat;
        currentLonRef.current = savedPlace.lon;
        loadWeatherRecommendations(savedPlace.city, savedPlace.lat, savedPlace.lon);
      } else if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            currentLatRef.current = pos.coords.latitude;
            currentLonRef.current = pos.coords.longitude;
            loadWeatherRecommendations(undefined, pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            loadWeatherRecommendations();
          },
          { timeout: 5000 }
        );
      } else {
        loadWeatherRecommendations();
      }
    }
  }, [loadWeatherRecommendations]);

  // Set up 30-minute recurring auto-refresh interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadWeatherRecommendations(
        currentCityRef.current,
        currentLatRef.current,
        currentLonRef.current,
        false
      );
    }, THIRTY_MINUTES_MS);

    // Minor 60-second ticker to update the "Updated X min ago" badge
    const tickerId = setInterval(() => {
      const elapsedMinutes = Math.floor((Date.now() - lastFetchTimeRef.current) / 60000);
      setMinutesSinceRefresh(elapsedMinutes);
    }, 60000);

    // Auto-refresh when tab becomes active after being away for >= 30 minutes
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastFetchTimeRef.current >= THIRTY_MINUTES_MS
      ) {
        loadWeatherRecommendations(
          currentCityRef.current,
          currentLatRef.current,
          currentLonRef.current,
          false
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      clearInterval(tickerId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadWeatherRecommendations]);

  // Live real-world ticking clock synchronized with the location's real-world timezone
  useEffect(() => {
    const updateLiveClock = () => {
      const tz =
        data?.timeContext?.timezone ||
        (typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : "Asia/Kolkata");
      try {
        const str = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date());
        setLiveTimeString(str);
      } catch {
        setLiveTimeString(
          new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        );
      }
    };

    updateLiveClock();
    const clockInterval = setInterval(updateLiveClock, 1000);
    return () => clearInterval(clockInterval);
  }, [data?.timeContext?.timezone]);

  const handleSelectCity = (city: string) => {
    setShowCityPicker(false);
    currentCityRef.current = city;
    currentLatRef.current = undefined;
    currentLonRef.current = undefined;
    loadWeatherRecommendations(city, undefined, undefined, true);
  };

  const handleCustomCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCity.trim()) return;
    handleSelectCity(searchCity.trim());
    setSearchCity("");
  };

  if (isLoading && !data) {
    return (
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] animate-pulse flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-[var(--border)] rounded-lg"></div>
          <div className="h-6 w-72 bg-[var(--border)] rounded-xl"></div>
        </div>
        <div className="h-10 w-32 bg-[var(--border)] rounded-2xl"></div>
      </div>
    );
  }

  if (!data) return null;

  const { location, weather, timeContext, recommendations } = data;
  const currentDish = recommendations[activeDishIdx] || recommendations[0];

  // Visual ambiance style based on weather condition
  const getAmbianceStyle = () => {
    switch (weather.condition) {
      case "rainy":
        return "from-emerald-950/20 via-sky-950/20 to-slate-900/20 border-sky-900/30";
      case "hot":
        return "from-amber-950/20 via-orange-950/15 to-stone-900/20 border-amber-900/30";
      case "chilly":
        return "from-indigo-950/25 via-blue-950/20 to-slate-900/20 border-indigo-900/30";
      case "cloudy":
        return "from-teal-950/20 via-slate-900/20 to-zinc-900/20 border-teal-900/30";
      default:
        return "from-[var(--primary)]/10 via-[var(--surface-elevated)] to-[var(--surface)] border-[var(--border)]";
    }
  };

  const minutesUntilNextUpdate = Math.max(0, 30 - minutesSinceRefresh);

  return (
    <div
      className={`relative rounded-3xl border bg-gradient-to-br ${getAmbianceStyle()} shadow-sm overflow-hidden transition-all duration-300 p-5 sm:p-6 mb-6`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-30 bg-emerald-900/95 border border-emerald-500/30 text-emerald-100 text-xs py-2 px-3.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar: Weather & Place Context */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border)]/70">
        <div className="flex items-center gap-3">
          <div className="text-2xl sm:text-3xl p-2.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
            {weather.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCityPicker(true)}
                className="group flex items-center gap-1.5 text-xs font-bold text-[var(--text)] hover:text-[var(--primary)] transition-colors"
                title="Click to switch city or location"
              >
                <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>
                  {location.city}, {location.region}
                </span>
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-transform" />
              </button>

              <span className="text-[var(--border)]">•</span>

              <div
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]"
                title={`Live Real-World Time (${timeContext.timezone || "Local"})`}
              >
                <Clock className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                <span className="tabular-nums font-mono">
                  {liveTimeString || timeContext.timeString}
                </span>
                {timeContext.timezone && (
                  <span className="text-[10px] text-[var(--text-muted)] font-normal hidden sm:inline">
                    ({timeContext.timezone.split("/").pop()?.replace(/_/g, " ")})
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="font-serif text-lg sm:text-xl font-bold text-[var(--text)]">
                {weather.temperatureC}°C
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                ({weather.conditionLabel})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-bold tracking-wider uppercase">
                {timeContext.activeSlot} Window
              </span>

              {/* 30-min live update indicator */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>
                  Live • {minutesSinceRefresh === 0 ? "Just updated" : `${minutesSinceRefresh}m ago`} (next in {minutesUntilNextUpdate}m)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change City and Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCityPicker(true)}
            className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--primary)] text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Switch Place</span>
          </button>

          <button
            type="button"
            onClick={() =>
              loadWeatherRecommendations(
                currentCityRef.current,
                currentLatRef.current,
                currentLonRef.current,
                true
              )
            }
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--primary)] text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Refresh live weather now (auto-updates every 30 min)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[var(--primary)]" : ""}`} />
            <span className="hidden sm:inline">Refresh Live</span>
          </button>
        </div>
      </div>

      {/* Main Body: Recommended Dishes for this Place & Weather */}
      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text)]">
              Curated for {location.city}&apos;s Live Climate & {timeContext.activeSlot}
            </h3>
          </div>
          <div className="flex gap-1">
            {recommendations.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveDishIdx(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeDishIdx === idx
                    ? "bg-[var(--primary)] w-6"
                    : "bg-[var(--border)] hover:bg-[var(--text-muted)]"
                }`}
                title={`View recommendation ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Featured Dish Card */}
        {currentDish && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20">
                  {currentDish.weatherFitBadge}
                </span>

                <h4 className="font-serif text-lg sm:text-xl font-bold text-[var(--text)] mt-1">
                  {currentDish.recipeTitle}
                </h4>

                <span className="text-xs text-[var(--text-muted)] block">
                  {currentDish.origin} • Optimal for {currentDish.mealSlot}
                </span>
              </div>

              {/* Nutrition Summary */}
              <div className="flex items-center gap-3 shrink-0 bg-[var(--surface)] p-2.5 rounded-xl border border-[var(--border)] text-center">
                <div>
                  <span className="font-serif text-xl font-bold text-[var(--primary)] block">
                    {currentDish.kcal}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">kcal</span>
                </div>
                <div className="h-6 w-px bg-[var(--border)]"></div>
                <div className="text-left text-[11px] space-y-0.5">
                  <div className="text-[var(--text-muted)]">
                    <strong className="text-[var(--text)]">{currentDish.protein}</strong> protein
                  </div>
                  <div className="text-[var(--text-muted)]">
                    <strong className="text-[var(--text)]">{currentDish.carbs}</strong> carbs
                  </div>
                </div>
              </div>
            </div>

            {/* Why This Fits Your Weather & Time */}
            <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-start gap-2.5 text-xs">
              <Info className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <p className="text-[var(--text)] font-medium">
                  <strong>Why this fits: </strong> {currentDish.weatherRationale}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  💡 <em>Chef Grace Tip:</em> {currentDish.culinaryTip}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[var(--text-muted)] font-medium mr-1">
                  Ingredients:
                </span>
                {currentDish.ingredients.slice(0, 3).map((ing, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]"
                  >
                    {ing}
                  </span>
                ))}
                {currentDish.ingredients.length > 3 && (
                  <span className="text-[10px] text-[var(--text-muted)]">
                    +{currentDish.ingredients.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {onSelectDishForPlanner && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDishForPlanner(currentDish);
                      triggerToast(`Added "${currentDish.recipeTitle}" to today's ${currentDish.mealSlot}!`);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Apply to Today&apos;s Plan</span>
                  </button>
                )}

                <Link
                  href={`/grace?mode=chef&prompt=${encodeURIComponent(
                    `I am in ${location.city} where the live weather is ${weather.temperatureC}°C and ${weather.conditionLabel}. Please give me the authentic, step-by-step recipe and cooking tips for: ${currentDish.recipeTitle}`
                  )}`}
                  className="px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] text-[var(--text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>Cook with Chef Grace</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick alternative pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-[var(--text-muted)]">
            Other weather picks:
          </span>
          {recommendations.map((rec, idx) => (
            <button
              key={rec.id}
              type="button"
              onClick={() => setActiveDishIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeDishIdx === idx
                  ? "bg-[var(--primary)] text-white font-semibold shadow-xs"
                  : "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]"
              }`}
            >
              {rec.recipeTitle} ({rec.kcal} kcal)
            </button>
          ))}
        </div>
      </div>

      {/* City Switcher Modal */}
      {showCityPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[var(--primary)]" />
                <h4 className="font-serif text-lg font-bold text-[var(--text)]">
                  Live Weather & Location
                </h4>
              </div>
              <button
                onClick={() => setShowCityPicker(false)}
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Search Input */}
            <form onSubmit={handleCustomCitySearch} className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-muted)]">
                Search any city worldwide (auto-updates every 30m):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="e.g. Jaipur, Tokyo, Seattle, Shimla..."
                  className="flex-1 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Auto GPS Detection Button */}
            <button
              type="button"
              onClick={() => {
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setShowCityPicker(false);
                    currentCityRef.current = undefined;
                    currentLatRef.current = pos.coords.latitude;
                    currentLonRef.current = pos.coords.longitude;
                    loadWeatherRecommendations(
                      undefined,
                      pos.coords.latitude,
                      pos.coords.longitude,
                      true
                    );
                  });
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-[var(--primary-border)] bg-[var(--primary-light)]/40 text-[var(--primary)] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[var(--primary-light)] transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Use My Exact Current Location</span>
            </button>

            {/* Popular Cities Pills */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                Popular Culinary Cities
              </span>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectCity(c.name)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                      location.city.toLowerCase() === c.name.toLowerCase()
                        ? "bg-[var(--primary)] text-white border-[var(--primary)] font-semibold"
                        : "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="font-bold block">{c.name}</span>
                    <span className="text-[10px] opacity-80 block truncate">
                      {c.cuisineFocus}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
