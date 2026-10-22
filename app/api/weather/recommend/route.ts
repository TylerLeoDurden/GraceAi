import { NextRequest, NextResponse } from "next/server";
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
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const cityParam = searchParams.get("city");
    const slotOverride = searchParams.get("slot");

    let location: LocationData = DEFAULT_LOCATION;

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
            };
          }
        }
      } catch (geoErr) {
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
            };
          }
        }
      } catch (ipErr) {
        console.warn("IP geolocation fallback failed:", ipErr);
      }
    }

    // 2. Fetch real-time weather from Open-Meteo
    let weather: WeatherData;
    try {
      weather = await fetchLiveWeather(location.latitude, location.longitude);
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
      };
    }

    // 3. Determine time of day and active meal window
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const slotInfo = getMealSlotInfo(hours, minutes);

    const activeSlot = (slotOverride as "Breakfast" | "Lunch" | "Snack" | "Dinner") || slotInfo.activeSlot;

    let timeOfDay: "morning" | "afternoon" | "evening" | "night" = "morning";
    if (hours >= 12 && hours < 16) timeOfDay = "afternoon";
    else if (hours >= 16 && hours < 21) timeOfDay = "evening";
    else if (hours >= 21 || hours < 5) timeOfDay = "night";

    const timeString = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const formattedDate = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

    // 4. Generate recommendations tailored to Place + Weather + Time
    const recommendations = generateWeatherRecommendations(weather, activeSlot, location);

    return NextResponse.json({
      location,
      weather,
      timeContext: {
        timeOfDay,
        activeSlot,
        timeString,
        formattedDate,
      },
      recommendations,
    });
  } catch (error: unknown) {
    console.error("Weather Recommendation API Error:", error);
    return NextResponse.json(
      { error: "Could not generate weather recommendations." },
      { status: 500 }
    );
  }
}
