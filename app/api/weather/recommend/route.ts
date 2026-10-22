import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import {
  fetchLiveWeather,
  generateWeatherRecommendations,
  DEFAULT_LOCATION,
  LocationData,
  WeatherData,
} from "@/lib/weather-service";
import { getMealSlotInfo } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const cityParam = searchParams.get("city");
    const slotOverride = searchParams.get("slot");
    const clientTz = searchParams.get("tz");

    let location: LocationData = { ...DEFAULT_LOCATION };

    // 1. If explicit coordinates supplied
    if (latParam && lonParam) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (!isNaN(lat) && !isNaN(lon)) {
        location = {
          city: cityParam || "Detected Location",
          region: "Local Region",
          country: "Live",
          latitude: lat,
          longitude: lon,
          timezone: clientTz || DEFAULT_LOCATION.timezone,
          utcOffsetSeconds: DEFAULT_LOCATION.utcOffsetSeconds,
        };
      }
    } else if (cityParam) {
      // Geocode city name via Open-Meteo free geocoding
      try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityParam)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl, { next: { revalidate: 86400 } });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const first = geoData.results?.[0];
          if (first) {
            location = {
              city: first.name,
              region: first.admin1 || first.country || "Region",
              country: first.country || "Global",
              latitude: first.latitude,
              longitude: first.longitude,
              timezone: first.timezone || clientTz || DEFAULT_LOCATION.timezone,
            };
          }
        }
      } catch (geoErr) {
        unstable_rethrow(geoErr);
        console.warn("Geocoding lookup failed:", geoErr);
      }
    } else {
      // Auto-detect location via IP if available from request headers or free IP geo
      try {
        const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
        const ipUrl = clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1"
          ? `https://freeipapi.com/api/json/${clientIp}`
          : `https://freeipapi.com/api/json`;
        const ipRes = await fetch(ipUrl, { next: { revalidate: 3600 } });
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.latitude && ipData.longitude) {
            location = {
              city: ipData.cityName || "Chennai",
              region: ipData.regionName || "Tamil Nadu",
              country: ipData.countryName || "India",
              latitude: ipData.latitude,
              longitude: ipData.longitude,
              timezone: ipData.timeZone || clientTz || DEFAULT_LOCATION.timezone,
            };
          }
        }
      } catch (ipErr) {
        unstable_rethrow(ipErr);
        console.warn("IP geolocation fallback failed:", ipErr);
      }
    }

    // 2. Fetch real-time weather from Open-Meteo with auto timezone
    let weather: WeatherData;
    try {
      weather = await fetchLiveWeather(location.latitude, location.longitude);
      if (weather.timezone) {
        location.timezone = weather.timezone;
        location.utcOffsetSeconds = weather.utcOffsetSeconds;
      }
    } catch {
      weather = {
        temperatureC: 28,
        apparentTempC: 31,
        humidity: 68,
        weatherCode: 3,
        condition: "pleasant",
        conditionLabel: "Pleasant & Clear",
        isDay: true,
        windSpeed: 10,
        icon: "🌤️",
        timezone: location.timezone || clientTz || DEFAULT_LOCATION.timezone,
        utcOffsetSeconds: location.utcOffsetSeconds ?? DEFAULT_LOCATION.utcOffsetSeconds,
      };
    }

    // 3. Determine real-world local time for this location's timezone
    const targetTimezone = weather.timezone || location.timezone || clientTz || "Asia/Kolkata";
    const now = new Date();

    // Accurately extract local hour & minute in the location's real-world timezone
    const timeParts = new Intl.DateTimeFormat("en-US", {
      timeZone: targetTimezone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(now);

    const hours = parseInt(timeParts.find((p) => p.type === "hour")?.value || "0", 10);
    const minutes = parseInt(timeParts.find((p) => p.type === "minute")?.value || "0", 10);

    const timeString = new Intl.DateTimeFormat("en-US", {
      timeZone: targetTimezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now);

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      timeZone: targetTimezone,
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(now);

    const slotInfo = getMealSlotInfo(hours, minutes);
    const activeSlot = (slotOverride as "Breakfast" | "Lunch" | "Snack" | "Dinner") || slotInfo.activeSlot;

    let timeOfDay: "morning" | "afternoon" | "evening" | "night" = "morning";
    if (hours >= 12 && hours < 16) timeOfDay = "afternoon";
    else if (hours >= 16 && hours < 21) timeOfDay = "evening";
    else if (hours >= 21 || hours < 5) timeOfDay = "night";

    // 4. Generate recommendations tailored to Place + Weather + Real-World Time
    const recommendations = generateWeatherRecommendations(weather, activeSlot, location);

    return NextResponse.json({
      location,
      weather,
      timeContext: {
        timeOfDay,
        activeSlot,
        timeString,
        formattedDate,
        timezone: targetTimezone,
        utcOffsetSeconds: weather.utcOffsetSeconds ?? location.utcOffsetSeconds ?? 19800,
      },
      recommendations,
      updatedAt: now.toISOString(),
      refreshIntervalMinutes: 30,
    });
  } catch (error: unknown) {
    unstable_rethrow(error);
    console.error("Weather Recommendation API Error:", error);
    return NextResponse.json(
      { error: "Could not generate weather recommendations." },
      { status: 500 }
    );
  }
}
