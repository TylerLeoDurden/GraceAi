/**
 * Real-world Date & Time utilities for graceAI.
 * Provides timezone-aware formatting, week-calendar calculation,
 * time-of-day greetings, active meal-slot determination, and local storage helpers.
 */

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type MealSlotName = "Breakfast" | "Lunch" | "Snack" | "Dinner";

export interface DayInfo {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayName: DayOfWeek;
  dayShort: string; // Mon, Tue...
  dayOfMonth: number;
  monthShort: string; // Oct
  formattedDisplay: string; // "Fri, Oct 9"
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export interface WeekInfo {
  days: DayInfo[];
  weekLabel: string; // e.g. "Oct 5 – Oct 11, 2026"
  weekNumber: number;
  year: number;
  weekKey: string; // e.g. "2026-W41"
  weekOffset: number;
  isCurrentWeek: boolean;
}

export const DEFAULT_WEEK_INFO: WeekInfo = {
  days: [
    { date: new Date("2026-10-05T00:00:00Z"), dateString: "2026-10-05", dayName: "Monday", dayShort: "Mon", dayOfMonth: 5, monthShort: "Oct", formattedDisplay: "Mon, Oct 5", isToday: false, isPast: true, isFuture: false },
    { date: new Date("2026-10-06T00:00:00Z"), dateString: "2026-10-06", dayName: "Tuesday", dayShort: "Tue", dayOfMonth: 6, monthShort: "Oct", formattedDisplay: "Tue, Oct 6", isToday: false, isPast: true, isFuture: false },
    { date: new Date("2026-10-07T00:00:00Z"), dateString: "2026-10-07", dayName: "Wednesday", dayShort: "Wed", dayOfMonth: 7, monthShort: "Oct", formattedDisplay: "Wed, Oct 7", isToday: false, isPast: true, isFuture: false },
    { date: new Date("2026-10-08T00:00:00Z"), dateString: "2026-10-08", dayName: "Thursday", dayShort: "Thu", dayOfMonth: 8, monthShort: "Oct", formattedDisplay: "Thu, Oct 8", isToday: false, isPast: true, isFuture: false },
    { date: new Date("2026-10-09T00:00:00Z"), dateString: "2026-10-09", dayName: "Friday", dayShort: "Fri", dayOfMonth: 9, monthShort: "Oct", formattedDisplay: "Fri, Oct 9", isToday: true, isPast: false, isFuture: false },
    { date: new Date("2026-10-10T00:00:00Z"), dateString: "2026-10-10", dayName: "Saturday", dayShort: "Sat", dayOfMonth: 10, monthShort: "Oct", formattedDisplay: "Sat, Oct 10", isToday: false, isPast: false, isFuture: true },
    { date: new Date("2026-10-11T00:00:00Z"), dateString: "2026-10-11", dayName: "Sunday", dayShort: "Sun", dayOfMonth: 11, monthShort: "Oct", formattedDisplay: "Sun, Oct 11", isToday: false, isPast: false, isFuture: true },
  ],
  weekLabel: "Oct 5 – Oct 11, 2026",
  weekNumber: 41,
  year: 2026,
  weekKey: "2026-W41",
  weekOffset: 0,
  isCurrentWeek: true,
};

export interface RealTimeStatus {
  now: Date;
  isoDate: string; // YYYY-MM-DD
  dayOfWeek: DayOfWeek;
  dayOfWeekShort: string;
  formattedDate: string; // e.g. "Friday, October 9, 2026"
  formattedShortDate: string; // e.g. "Fri, Oct 9"
  timeString: string; // e.g. "3:10 PM"
  timeStringWithSec: string; // e.g. "3:10:45 PM"
  time24: string; // e.g. "15:10"
  hours: number;
  minutes: number;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  greeting: string;
  activeMealSlot: MealSlotName;
  activeMealWindow: string;
  nextMealSlot: MealSlotName;
  nextMealWindow: string;
}

/**
 * Formats a Date object to YYYY-MM-DD using local time (not UTC, to respect user's timezone)
 */
export function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Gets ISO week number of the year (1-53)
 */
export function getISOWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Determine the active meal slot based on hour of the day
 */
export function getMealSlotInfo(hours: number, minutes: number): {
  activeSlot: MealSlotName;
  activeWindow: string;
  nextSlot: MealSlotName;
  nextWindow: string;
} {
  const totalMinutes = hours * 60 + minutes;

  // 05:00 to 11:00 -> Breakfast
  if (totalMinutes >= 5 * 60 && totalMinutes < 11 * 60) {
    return {
      activeSlot: "Breakfast",
      activeWindow: "7:30 AM – 10:30 AM",
      nextSlot: "Lunch",
      nextWindow: "12:30 PM – 2:30 PM",
    };
  }
  // 11:00 to 15:30 -> Lunch
  if (totalMinutes >= 11 * 60 && totalMinutes < 15 * 60 + 30) {
    return {
      activeSlot: "Lunch",
      activeWindow: "12:30 PM – 2:30 PM",
      nextSlot: "Snack",
      nextWindow: "4:30 PM – 6:00 PM",
    };
  }
  // 15:30 to 19:00 -> Snack / Tea
  if (totalMinutes >= 15 * 60 + 30 && totalMinutes < 19 * 60) {
    return {
      activeSlot: "Snack",
      activeWindow: "4:30 PM – 6:00 PM",
      nextSlot: "Dinner",
      nextWindow: "7:30 PM – 9:30 PM",
    };
  }
  // 19:00 to 22:30 -> Dinner
  if (totalMinutes >= 19 * 60 && totalMinutes < 22 * 60 + 30) {
    return {
      activeSlot: "Dinner",
      activeWindow: "7:30 PM – 9:30 PM",
      nextSlot: "Breakfast",
      nextWindow: "Tomorrow 8:00 AM",
    };
  }
  // Late night / early morning (22:30 to 05:00) -> Rest / Overnight
  return {
    activeSlot: "Dinner",
    activeWindow: "Overnight Rest",
    nextSlot: "Breakfast",
    nextWindow: "Tomorrow 8:00 AM",
  };
}

/**
 * Get comprehensive real-world time status for a given Date
 */
export function getRealTimeStatus(date: Date = new Date()): RealTimeStatus {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  let timeOfDay: "morning" | "afternoon" | "evening" | "night" = "morning";
  let greeting = "Good morning";

  if (hours >= 5 && hours < 12) {
    timeOfDay = "morning";
    greeting = "Good morning";
  } else if (hours >= 12 && hours < 17) {
    timeOfDay = "afternoon";
    greeting = "Good afternoon";
  } else if (hours >= 17 && hours < 21) {
    timeOfDay = "evening";
    greeting = "Good evening";
  } else {
    timeOfDay = "night";
    greeting = "Restful night";
  }

  const daysOfWeek: DayOfWeek[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = daysOfWeek[date.getDay()];
  const dayOfWeekShort = dayOfWeek.slice(0, 3);

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedShortDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const timeStringWithSec = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const time24 = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  const mealInfo = getMealSlotInfo(hours, minutes);

  return {
    now: date,
    isoDate: toLocalDateString(date),
    dayOfWeek,
    dayOfWeekShort,
    formattedDate,
    formattedShortDate,
    timeString,
    timeStringWithSec,
    time24,
    hours,
    minutes,
    timeOfDay,
    greeting,
    activeMealSlot: mealInfo.activeSlot,
    activeMealWindow: mealInfo.activeWindow,
    nextMealSlot: mealInfo.nextSlot,
    nextMealWindow: mealInfo.nextWindow,
  };
}

/**
 * Returns Monday-to-Sunday dates for the week with the specified weekOffset
 * weekOffset = 0: current week
 * weekOffset = -1: last week
 * weekOffset = +1: next week
 */
export function getWeekDays(referenceDate: Date = new Date(), weekOffset = 0): WeekInfo {
  const todayStr = toLocalDateString(referenceDate);

  // Clone date and adjust by weekOffset
  const targetDate = new Date(referenceDate);
  targetDate.setDate(targetDate.getDate() + weekOffset * 7);

  // Find Monday of that week
  // JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  const currentDay = targetDate.getDay();
  // Distance to previous Monday
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(targetDate);
  monday.setDate(targetDate.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const days: DayInfo[] = [];
  const daysOfWeek: DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    const dateStr = toLocalDateString(dayDate);

    const isToday = dateStr === todayStr;
    const isPast = dateStr < todayStr;
    const isFuture = dateStr > todayStr;

    days.push({
      date: dayDate,
      dateString: dateStr,
      dayName: daysOfWeek[i],
      dayShort: daysOfWeek[i].slice(0, 3),
      dayOfMonth: dayDate.getDate(),
      monthShort: dayDate.toLocaleDateString("en-US", { month: "short" }),
      formattedDisplay: dayDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      isToday,
      isPast,
      isFuture,
    });
  }

  const firstDay = days[0];
  const lastDay = days[6];

  const weekLabel = `${firstDay.monthShort} ${firstDay.dayOfMonth} – ${
    firstDay.monthShort === lastDay.monthShort ? "" : lastDay.monthShort + " "
  }${lastDay.dayOfMonth}, ${lastDay.date.getFullYear()}`;

  const weekNumber = getISOWeekNumber(days[3].date); // Mid-week determines week number
  const year = days[3].date.getFullYear();
  const weekKey = `${year}-W${String(weekNumber).padStart(2, "0")}`;

  return {
    days,
    weekLabel,
    weekNumber,
    year,
    weekKey,
    weekOffset,
    isCurrentWeek: weekOffset === 0,
  };
}
