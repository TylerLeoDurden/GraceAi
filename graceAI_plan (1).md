# graceAI: Complete Build Plan

> **How to use this file:** Paste this whole document into Google AI Pro (Gemini) and say:
> *"You are my senior full-stack engineer and UI designer. Read this plan fully. Then build graceAI phase by phase. Start with Phase 1 and give me complete, copy-paste-ready code and exact setup steps. Wait for me to say 'next' before moving to the next phase."*

---

## 0. Project Summary

**Name:** graceAI
**Tagline:** *Eat well. Live gracefully.*
**What it is:** A responsive website (installable as a PWA) that combines:
1. A **Diet Planner** (personalized weekly meal plans + grocery lists)
2. A **Meal-first Health Tracker ("HealthMate")**: a scheduled meal timeline with on-time/late/skipped tracking, plus weight, sleep, steps, mood, BP, blood sugar and calories/macros. A daily check-in feeds an AI health report that updates automatically (water tracking is intentionally NOT included).
3. A **Recipe Library** covering world cuisines (grown continuously)
4. **Grace Chat**, one AI assistant with two modes: **Chef Grace** (cooking) and **Health Guide Grace** (nutrition and wellness information)
5. A **Health Monitor** that watches every entry across the site (meals, check-ins, vitals, sleep, steps, chat safety flags) and **automatically adjusts the user's plan** within strict safety guardrails (Section 4.5)
6. A **Monthly Health Assessment**, limited to **one per account per calendar month** (Section 4.6)
7. **One-click Google login**, with automatic sign-in for returning users (Section 4.7)

**Hard constraints**
- **Total build cost must be ₹0.** Use only free tiers and open-source tools.
- Mobile-first, responsive, fast, accessible.
- It is a **wellness information tool, not a medical device**. It must never diagnose or prescribe.
- Target users: Indian users first (Tamil/Hindi support later), but global cuisines from day one.

---

## 1. Free Tech Stack (use exactly this)

| Layer | Choice |
|---|---|
| Framework | **Next.js (App Router) + TypeScript** |
| Styling | **Tailwind CSS** + **shadcn/ui** components |
| Animation | **Framer Motion** |
| Charts | **Recharts** |
| Icons / Fonts | **Lucide**, Google Fonts (**Fraunces** headings, **Inter** body) |
| Database + Auth + Storage | **Supabase** (free tier: Postgres, Auth, Row Level Security) |
| AI | **Google Gemini API** (free tier) via server-side route only |
| Recipe data | **TheMealDB** (seed), **Open Food Facts**, **USDA FoodData Central**; own "Grace Kitchen" recipes |
| Photos | **Unsplash / Pexels API** (credit photographers) |
| Hosting | **Vercel Hobby** (free `*.vercel.app` subdomain) |
| PWA | `next-pwa` or a manual service worker + manifest |
| Version control | **GitHub** |
| i18n (later) | `next-intl` |

> Free-tier limits change. At each step, tell me to verify current limits on the provider's pricing page.

---

## 2. Design System

**Mood:** calm, fresh, premium. A wellness spa meets a modern food magazine.

### Color tokens
| Token | Light | Dark |
|---|---|---|
| `--primary` (sage) | `#7FA88A` | `#8FBF9B` |
| `--background` (cream) | `#FBF7F0` | `#161B1A` |
| `--surface` | `#FFFFFF` | `#1F2625` |
| `--accent` (terracotta, CTAs) | `#D9825B` | `#E5946F` |
| `--text` | `#232B2B` | `#EEF2EF` |
| `--muted` | `#6B7776` | `#9AA7A5` |
| `--success` / `--warning` / `--danger` | `#4C9A6A` / `#E0A33A` / `#D0524A` | adjust for contrast |

### Rules
- Rounded corners (`rounded-2xl`), soft shadows, generous whitespace.
- Large food photography, subtle motion (progress rings animate, cards lift on hover, page transitions fade).
- WCAG AA contrast minimum, visible focus states, keyboard navigation, `prefers-reduced-motion` respected.
- Full **dark mode** with a toggle that persists.
- **Mobile:** bottom tab bar (Home, Plan, Recipes, Track, Grace). **Desktop:** left sidebar.
- A floating Grace chat button appears on every page except the full chat page.

---

## 3. Pages and Screens

1. **Landing (`/`)**: hero ("Your personal chef and wellness guide"), feature tour, live chat demo, cuisine showcase, testimonials placeholder, FAQ, footer with disclaimer.
2. **Login (`/login`)**: a single focused page with a large **Continue with Google** button plus Google One Tap automatic sign-in for returning users (details in 4.7). No separate signup page: the first Google sign-in creates the account.
3. **Onboarding (`/onboarding`)**: 5 friendly steps: goal, body stats (age, sex, height, weight, activity), diet type (veg, vegan, Jain, halal, eggetarian, non-veg, keto, etc.), allergies/conditions, favorite cuisines. Ends with an instant sample plan.
4. **Dashboard (`/dashboard`)**: today's meals, calorie and macro rings, sleep/steps tiles, today's meal timeline (next meal countdown, on-time/late status), daily check-in card, streak counter, Grace daily tip.
5. **Meal Planner (`/planner`)**: weekly calendar, drag-and-drop meals, "regenerate this meal" button, swap suggestions, one-tap grocery list.
6. **Recipes (`/recipes`)**: search + filters (cuisine, diet, time, difficulty, health goal, ingredients on hand), masonry grid, cuisine carousel.
7. **Recipe detail (`/recipes/[id]`)**: ingredients with serving scaler, nutrition panel, steps, substitutions, "Start cooking" mode.
8. **Cooking mode**: full-screen, one step at a time, big text, built-in timers, keep-screen-awake, optional voice "next step".
9. **Tracker (`/tracker`)**: quick-log buttons, weekly/monthly charts, health score, insights.
10. **Grace Chat (`/grace`)**: full-screen chat, mode switch (Chef / Health Guide), quick chips ("What should I eat tonight?", "Use what's in my fridge", "Check my progress"), chat history.
11. **Profile / Settings (`/profile`)**: goals, allergies, units, language, theme, export data (PDF/CSV), **delete my account and data**.
12. **Legal pages**: Privacy Policy, Terms, Medical Disclaimer.
13. **Consent (`/consent`)**: shown once after the first login, before onboarding. Separate, unticked checkboxes for health-data processing and automated monitoring and plan adjustment, plus a 18+ confirmation (or a guardian path).
14. **Monthly Assessment (`/assessment`)**: shows the assessment status ("Available now" or "Next one available on 1 Nov"), the start button, past assessments, and PDF export for a doctor or dietitian.
15. **My Plan Changes (`/monitor`)**: a plain-language activity log of everything the Health Monitor did (what changed, why, the data behind it) with **Undo** buttons and the Auto / Suggest only / Off switch.

---

## 4. Features in Detail

### 4.1 Diet Planner
- **Rule-based calculations (no AI):**
  - BMR via **Mifflin-St Jeor**, TDEE = BMR × activity factor.
  - Goal adjustment: weight loss about −300 to −500 kcal, gain about +250 to +400 kcal, maintain = TDEE.
  - **Safety floors:** never go below ~1,200 kcal (women) / ~1,500 kcal (men) in generated plans; cap weekly loss target at about 0.5-1 kg.
  - Macro split presets (balanced, high-protein, low-carb, diabetic-friendly, heart-healthy).
- **AI-assisted plan generation:** Gemini receives the user's calorie/macro targets, diet type, allergies, cuisines, cooking time, and budget, and returns a **strict JSON** weekly plan that references recipe IDs from our database where possible.
- Grocery list: aggregate ingredients across the week, group by aisle, merge duplicates, check-off UI, copy/share.
- Swap meal, lock a meal, regenerate a day, "leftover friendly" mode, budget mode.
- Conditions (diabetes, PCOS, hypertension, kidney issues, pregnancy): show a **"Please confirm with your doctor or dietitian"** banner and use conservative presets.

### 4.2 Health Tracker ("HealthMate"), meal-first

**Product decision:** graceAI does **not** track water. Meals are the core signal because they are *scheduled*, can be compared against the plan, and are what the diet planner and health reports are built on. Everything is still self-reported, so the app is honest about confidence (see 4.2.3).

- Metrics: **meals (primary)**, weight, BMI (auto), sleep, steps, mood, blood pressure, blood sugar, optional measurements.
- Quick-log widgets: "Ate it" / "Ate something else" / "Skipped" on each meal card; slider for mood.
- Charts: 7/30/90 day line and bar charts, goal lines, streaks, weekly summary, **meal adherence heatmap**.
- Reminders via browser notifications (opt-in) at each meal's scheduled time, in the user's local timezone.

#### 4.2.1 Meal Schedule and Adherence Engine
Every planned meal gets a **scheduled time window** (for example, Breakfast 8:00, window 7:00-10:00). Each meal has a status:

| Status | Meaning |
|---|---|
| `planned` | Upcoming, not yet due |
| `eaten_on_time` | Logged within its window |
| `eaten_late` | Logged after the window ended (record minutes late) |
| `substituted` | User ate something else (log the replacement; recalculate calories/macros) |
| `skipped` | The user tapped "Skipped" before the 8-hour logging deadline |
| `unlogged` | Eating window passed, still inside the 8-hour logging allowance, no response yet (never assumed to be "skipped") |
| `unlogged_locked` | The 8-hour deadline passed with no log. The meal is locked and reports show "not logged" |

**Rules (implemented as plain code, not AI):**
1. Windows are evaluated in the **user's local timezone** using the real current date/time.
2. A late meal is recorded as late; the meal's lateness is stored in minutes.
3. When status changes, the app **recalculates the day's totals** (calories, macros, gaps between meals) and the rolling adherence score.
4. The AI never invents data. If a meal is `unlogged`, reports show "not logged", not a guess.
5. **8-hour logging rule:** the user has a total of **8 hours** to log a meal, counted from the meal's scheduled time (`log_deadline = scheduled_at + 8 hours`). Keep this as one config constant (`LOG_DEADLINE_HOURS = 8`).
   - Logged inside the eating window → `eaten_on_time`.
   - Logged after the window ends but before the deadline → `eaten_late` (minutes late stored).
   - After the deadline → the meal **locks**. No new log or edit is accepted, and the status becomes `unlogged_locked`.
   - The 8 hours run continuously, so they can cross midnight (a 9:00 PM dinner can be logged until 5:00 AM). The deadline is stored in UTC and shown to the user as a countdown ("5 h 20 min left to log").
   - Show reminders partway through (for example, at the end of the window and with 1 hour left).
   - The locking stops after-the-fact guessing, so reports rest on honest, timely logs. Users can still correct a log **before** the deadline.
6. **Reports and the 8-hour rule:** a day's report is **provisional** until the last meal's deadline has passed, then it is finalized and versioned. Do not finalize a day while any meal is still loggable.

#### 4.2.2 Automatic report updates
- After each status change and when the day is **finalized** (after the last meal's 8-hour deadline), generate a **Daily Report**: meals on time/late/skipped, calories and macros vs. target, longest gap between meals, mood/sleep/steps if logged, and 2-3 gentle suggestions.
- Weekly and monthly reports aggregate daily reports: adherence %, average lateness, most-missed slot, weight and BP/glucose trends, and what to try next.
- **Reports show what changed and why** (for example, "Dinner logged 95 minutes late → today's adherence moved from 88% to 82%"). Reports are never silently rewritten; keep a version history of each report.
- Rule-based findings come first; Gemini only rewrites them into friendly language. Grace can explain any number in a report.
- For diabetes, pregnancy and other conditions: lateness and gaps trigger a "talk to your doctor or dietitian" note, never medical instructions or medication advice.

#### 4.2.3 Daily check-in (crucial for accurate reports)
- A short end-of-day check-in (under 30 seconds): confirm each meal's status, mood, sleep last night, optional weight.
- **Data completeness indicator** on every report ("Based on 3 of 4 meals logged today"). Low completeness lowers report confidence and Grace says so.
- Gentle nudges (opt-in) at the evening check-in time. No guilt, no shaming language, no streak-loss threats.
- Streaks count **days with a completed check-in**, not perfect eating, so users are rewarded for honesty rather than for perfect meals.
- **Eating-disorder safeguards in reports:** no wording that praises skipping meals or very low intake; repeated skipped meals plus very low calories trigger a supportive message and a suggestion to talk to a professional, not a "great deficit!" message.

#### 4.2.4 Health score (0-100)
Transparent formula using: meal timing adherence, meal completion, plan calorie/macro adherence, sleep, activity, and check-in consistency. Show the formula and each component in the UI. Weights are adjustable by condition preset. Missing data lowers **confidence**, not the user's score unfairly.

#### 4.2.5 Insights
Rule-based first (for example, "Dinner was more than 60 minutes late on 4 of the last 7 days"), AI-polished second.

#### 4.2.6 Real date and time handling
- Store all timestamps in **UTC**; display and evaluate windows in the user's saved timezone (store IANA timezone, for example `Asia/Kolkata`, in the profile).
- Use one date library everywhere (`date-fns-tz` or `Temporal`), never ad-hoc `new Date()` math.
- "Today" begins and ends at the user's **local midnight**; handle DST and timezone changes when travelling.
- Send Grace the current local date, time, timezone, and current meal slot with every chat request.

### 4.5 Health Monitor (automatic adjustments across the whole site)

**What it is:** a background service that watches the user's entries across the entire site and keeps their **plan, targets and meal schedule** matched to reality. To be clear about scope: it adjusts the *plan* (calories, macros, meal times, upcoming meals, reminders). It does not treat, diagnose, or change anything medical.

**Golden rule:** **rules decide, AI explains.** All numbers and changes come from deterministic, unit-tested code. Gemini only turns the findings into friendly wording and suggests meal swaps that are validated by code afterwards. The AI never sets a calorie target directly.

#### 4.5.1 What it monitors
- Meal statuses and lateness (4.2.1), skipped and unlogged-locked meals, substitutions.
- Daily check-ins: mood, sleep, weight; check-in consistency.
- Weight trend, BP and blood-sugar logs, steps.
- Safety signals: eating-disorder language in chat, emergency phrases, extreme logs.
- Inactivity (no logs for several days) → a gentle "welcome back" nudge, never guilt.

#### 4.5.2 How it runs (free-tier friendly)
- **Event-driven:** a database trigger writes a row to `monitor_events` whenever a meal status changes, a check-in completes, or a vital is logged. An Edge Function processes the queue (idempotent, with retries).
- **Scheduled (every hour):** lock meals whose 8-hour deadline passed, finalize days, run the daily review. **Weekly review** once a week per user. Use Supabase `pg_cron` + Edge Functions; Vercel Hobby cron is limited to roughly once a day, so do not rely on it for hourly jobs. Verify current free-tier limits.
- Everything is processed per user in that user's timezone.

#### 4.5.3 Automatic adjustment rules (starter set)
| Rule | Trigger | Automatic action |
|---|---|---|
| R1 Meal timing | Same meal is 45+ min late on 4 of the last 7 days | Move that meal's scheduled time 30-60 min later (within sensible gaps), update reminders |
| R2 Repeated skip | Same slot skipped 3+ times in 7 days | Offer a lighter or quicker alternative for that slot in upcoming days; ask the user why (optional) |
| R3 Substitutions | Same substitution 3+ times | Add it to the user's preferences and plan upcoming days around it |
| R4 Calorie target (weight trend) | Weight moving average (14 days) moving too fast or too slow for the goal, with enough data | Change the daily calorie target by **at most 5%** and re-split macros |
| R5 Rapid loss guard | Loss faster than ~1 kg/week for 2 weeks | **Raise** calories toward maintenance and show a supportive note |
| R6 Protein/variety | Protein or variety below target for 2 weeks | Regenerate the next 2-3 days with more protein-rich or varied meals (validated by allergen/diet filters) |
| R7 Sleep/mood link | Poor sleep or low mood for 5+ days | Suggest lighter dinners and earlier meal times; offer a Grace check-in |
| R8 Inactivity | No logs for 3+ days | One gentle re-engagement notification |

#### 4.5.4 Guardrails (non-negotiable, enforced in code)
1. **Confidence gate:** no calorie or macro change unless the last 7 days have at least 5 days with check-ins and at least 70% of meals logged. Low-quality data means **no change**, plus a note asking for better logs. Poor adherence is treated as an adherence problem, not as proof the plan is wrong.
2. **Weight smoothing:** use a 14-day moving average and require at least 3 weigh-ins in that period. Never react to a single day.
3. **Size and frequency limits:** one automatic calorie change per 7 days, at most 5% per change, and at most 10% total drift from the last Monthly Assessment baseline. Calorie floors and ceilings from `nutrition.ts` always win.
4. **Never changed automatically:** diet type, allergies, medical conditions, medications, or anything about treatment.
5. **Restricted users:** under 18, pregnancy, and flagged medical conditions (diabetes, kidney disease, and so on) get **Suggest only**, forced on, plus a "confirm with your doctor or dietitian" note. They never get silent calorie changes.
6. **Safety freeze:** extreme or out-of-range BP/glucose, very low intake with repeated skipped meals, rapid weight change, or eating-disorder language **freezes all automatic adjustments** and shows a supportive message recommending a professional. Emergency phrases show the emergency card.
7. **Transparency:** every change is written to `plan_adjustments` with before/after values, the rule, the evidence and a plain-language reason. The user sees it in **My Plan Changes** and gets a notification.
8. **Undo:** one tap reverts an adjustment (as long as it is the latest one for that setting).
9. **User control:** the profile has **Auto** (default for eligible users) / **Suggest only** / **Off**. Switching to Off stops all automatic changes immediately.
10. **Idempotency and audit:** the same rule never fires twice for the same data window; every run is logged for debugging.

#### 4.5.5 What the user sees
- A dashboard card: "Grace adjusted your plan: dinner moved to 8:30 PM because it was late 4 of 7 days. [Undo] [Details]".
- Weekly summary of changes and their effect.
- Grace can explain any change: "Why did my target change?" (the chat context includes recent adjustments).

### 4.6 Monthly Health Assessment (one per account per month)

**What it is:** a deeper, official review that looks at the whole month and recalibrates the plan. It is separate from daily and weekly reports and from the Health Monitor's small automatic changes, which keep working without limit.

**The rule:** each account can complete **exactly one assessment per calendar month**, where the month is the user's local calendar month (their saved timezone). Make this a config: `ASSESSMENTS_PER_MONTH = 1`.

#### 4.6.1 What it contains
- Month summary: adherence, timing, skipped and late meals, check-in consistency, data completeness and confidence.
- Trends: weight (moving average), BP and blood-sugar trends with "talk to your doctor" flags (never diagnoses), sleep, mood, steps.
- Nutrition quality: calorie and macro adherence, protein, variety.
- Goal progress and a monthly health score (formula shown), with comparison to the previous assessment.
- **Recalibrated targets:** the one place where a larger target change (up to about 10% from the baseline) is allowed, still inside all safety floors, and forced to "suggest, user confirms" for restricted users.
- Next-month focus: 3 simple goals.
- Shareable PDF for a doctor or dietitian.

#### 4.6.2 Enforcement (server-side only, never trust the UI)
1. A database **unique constraint** on `(user_id, assessment_month)` makes a second assessment impossible, even with double-clicks or parallel requests. A duplicate request returns the existing assessment.
2. The month key is calculated on the **server** from server time and the saved timezone, and stored. Changing the device clock or timezone gives no extra assessment.
3. Add a minimum gap (`MIN_GAP_DAYS = 14`, configurable) between two assessments to close month-boundary loopholes (taking one on the 31st and another on the 1st).
4. **A failed generation does not use up the monthly assessment.** Only a successfully completed assessment is stored, in a single transaction. If Gemini is down, the fallback is a rule-based assessment; if even that fails, nothing is saved and the user can retry.
5. **Minimum data requirement:** at least 10 days with check-ins in the last 30 days (7 for the first assessment). If not met, show "Not enough data yet, here is what to log" and **do not** use up the assessment.
6. Assessments are **immutable**: users cannot edit or delete them (only deleting the whole account removes them). Corrections to old logs after the deadline are not allowed, so assessments stay trustworthy.
7. Grace can discuss, explain and compare assessments without limit, but cannot create a new one, and says when the next one is available.
8. The limit applies only to this assessment. Daily/weekly reports, Health Monitor adjustments, chat, and emergency safety messages are **never** limited by it.
9. The onboarding "baseline plan" is **not** a monthly assessment, so a typo in onboarding does not block the user for the month.

### 4.7 Login and Google Sign-In (automated)

**Experience**
- `/login` has one clear action: **Continue with Google** (large button, Google branding rules followed), a short promise line ("No password to remember"), and links to Privacy, Terms and the medical disclaimer.
- **Automatic sign-in for returning users** with Google One Tap / auto sign-in (Google Identity Services, FedCM where supported). If the browser has an eligible Google session and the user previously signed in, they are signed in automatically and land on the dashboard.
- First-time users: Google sign-in → account and profile auto-created → `/consent` → `/onboarding`.
- Sessions stay logged in using Supabase's refresh tokens (via `@supabase/ssr` and middleware refresh). Sign-out clears the session and calls `google.accounts.id.disableAutoSelect()` so the user is not instantly signed back in.
- Optional fallback for people without a Google account: email magic link, off by default and easy to enable.

**Implementation notes**
- Primary flow: Supabase Auth with the Google provider (OAuth 2.0 with PKCE). One Tap flow: Google Identity Services returns an ID token, then `supabase.auth.signInWithIdToken({ provider: 'google', token, nonce })` with a proper nonce.
- Request only the basic scopes (`openid`, `email`, `profile`). Never request Gmail, Drive, or Fit scopes at this stage.
- A database trigger on `auth.users` creates the `profiles` row with name and avatar from Google; no other Google data is stored.
- Strict redirect allow-list (production URL, Vercel previews you trust, localhost). Validate the `next` redirect parameter.
- One Tap runs only on `/login` and the landing page, never inside the app.
- Free Google setup (no cost): create a Google Cloud project, configure the OAuth consent screen, create a Web OAuth client, add authorized JavaScript origins and the Supabase redirect URI, paste the client ID and secret into Supabase, and **publish the consent screen to production** so the "testing" user limit does not apply. Verify current rules on Google's documentation.
- The Google client **secret** lives only in the Supabase dashboard. The client ID is public and safe in the frontend.

### 4.3 Recipe Library ("all world cuisines")
**Honest scope:** every dish in the world cannot exist on day one. Cover it by **taxonomy + continuous growth**.

- **Taxonomy:** Continent → Country → Region → Dish. Example: India → Tamil Nadu / Kerala / Andhra / Karnataka / Bengal / Punjab / Gujarat / Rajasthan / Maharashtra / Goa / Kashmir / Northeast, and so on.
- **Launch set (15-20 cuisines):** Indian (regional), Italian, Chinese, Japanese, Korean, Thai, Vietnamese, Mexican, Mediterranean/Greek, Middle Eastern, Turkish, French, Spanish, American, African (Ethiopian, Moroccan, Nigerian), Caribbean, British, German.
- **Expansion pipeline ("Grace Kitchen"):**
  1. Identify gaps (cuisine × dish type).
  2. Generate original recipes with Gemini in a strict JSON schema.
  3. Auto-validate: ingredient/quantity sanity, steps present, times plausible.
  4. Compute nutrition from USDA/IFCT-based ingredient data (do not trust LLM nutrition numbers).
  5. Human review, then publish with a "Grace Kitchen" tag.
- **Copyright:** never scrape blogs or copy recipe text. Use open/licensed data or originally written recipes. Credit sources.
- **Features:** serving scaler, unit conversion (metric/imperial/Indian household measures), substitutions, allergen tags, diet tags, "cook with what I have" matching.

### 4.4 Grace Chat

**Modes**
- **Chef Grace:** recipe ideas from available ingredients, substitutions, scaling, fixing mistakes, techniques, menu planning, festival menus. Understands the user's current meal plan.
- **Health Guide Grace:** explains nutrition, interprets tracker trends in general terms, suggests safe diet adjustments, motivates.

**Optional extras (later):** voice input/output (Web Speech API), image input ("what can I cook from this fridge photo?") via Gemini vision.

**Context sent to the model (server-side only):** user profile (goal, diet type, allergies, conditions flag), today's plan summary and meal statuses, current local date/time/timezone and meal slot, last 7 days tracker and adherence summary, latest report completeness, latest monthly assessment summary, recent automatic plan adjustments, selected mode. **Never send more personal data than needed. Never expose the API key to the browser.**

**Safety layer (build in code, not just in the prompt)**
1. **Emergency detection** before calling the model: keywords/patterns for chest pain, trouble breathing, stroke signs, severe allergic reaction, overdose, suicidal thoughts or self-harm. Show an immediate card: "This may be an emergency. Please call your local emergency number now" (India: **112**; mental health: **Tele-MANAS 14416**) and do not continue with normal advice.
2. **No diagnosis, no prescriptions, no medication dosing.** Redirect to a doctor.
3. **Eating-disorder safeguards:** refuse extreme restriction or purging advice, avoid giving numeric targets to someone showing disordered-eating signals, respond gently and suggest professional support.
4. **Allergen enforcement:** post-filter any recipe/plan so it never includes the user's listed allergens.
5. **Disclaimer chip** under health-related answers.
6. **Feedback buttons** (thumbs up/down + report) and log flagged responses for review.
7. **Rate limiting** per user, plus a friendly "Grace is resting, try again soon" fallback on API limit.

**System prompt starter (for Gemini API calls)**
```text
You are Grace, a warm, concise, practical assistant inside the graceAI app.
Mode: {chef | health_guide}.
User profile (use it, don't repeat it back): {profile_json}
Rules:
- You provide general wellness and cooking information, not medical advice. Never diagnose, prescribe, or give medication doses.
- Respect the user's diet type and allergies strictly. Never suggest a listed allergen.
- For medical conditions, pregnancy, or medications, give general info and advise confirming with a doctor or dietitian.
- If the user describes an emergency or self-harm, stop normal answering and tell them to contact emergency services immediately.
- Never encourage extreme dieting, fasting beyond safe norms, or purging.
- Be brief, friendly, and use simple language. Use Indian household measures when the user is in India.
- When suggesting recipes, prefer recipes from the provided list (by id); otherwise say it is a suggestion.
```

**Keeping AI usage inside free limits**
- Rules/formulas for BMI, calories, macros (no AI).
- Cache frequent answers (substitutions, basic nutrition) in the database.
- Limit messages per user per day; compress chat history (send only last N messages plus a summary).
- Let advanced users optionally add their own free API key.

---

## 5. Database Schema (Supabase / PostgreSQL)

```sql
-- Profiles
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text, dob date, sex text,
  height_cm numeric, weight_kg numeric,
  activity_level text,           -- sedentary|light|moderate|active|very_active
  goal text,                     -- lose|maintain|gain|manage_condition
  diet_type text,                -- veg|vegan|jain|halal|eggetarian|nonveg|keto...
  allergies text[] default '{}',
  conditions text[] default '{}',
  favorite_cuisines text[] default '{}',
  language text default 'en', units text default 'metric',
  timezone text default 'Asia/Kolkata',  -- IANA timezone
  checkin_time time default '21:30',
  auth_provider text default 'google', avatar_url text,
  auto_adjust_mode text default 'auto',   -- auto|suggest|off (forced 'suggest' for restricted users)
  is_restricted boolean default false,    -- under 18, pregnancy, flagged conditions
  health_consent_at timestamptz, monitoring_consent_at timestamptz, consent_version text,
  daily_calorie_target int, protein_g int, carbs_g int, fat_g int,
  created_at timestamptz default now()
);

-- Recipes
create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text,
  continent text, country text, region text, cuisine text,
  course text,                   -- breakfast|lunch|dinner|snack|dessert|drink
  diet_tags text[], allergen_tags text[], health_tags text[],
  prep_min int, cook_min int, servings int, difficulty text,
  image_url text, image_credit text,
  source text,                   -- themealdb|grace_kitchen|community
  status text default 'published', -- draft|review|published
  calories numeric, protein_g numeric, carbs_g numeric, fat_g numeric, fiber_g numeric,
  steps jsonb,                   -- [{n, text, timer_sec}]
  created_at timestamptz default now()
);

create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name text unique, name_local jsonb,
  kcal_100g numeric, protein_100g numeric, carbs_100g numeric, fat_100g numeric, fiber_100g numeric,
  allergen_tags text[], aisle text
);

create table recipe_ingredients (
  recipe_id uuid references recipes on delete cascade,
  ingredient_id uuid references ingredients,
  quantity numeric, unit text, note text,
  primary key (recipe_id, ingredient_id)
);

-- Meal plans
create table meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  start_date date, end_date date, target_kcal int, created_at timestamptz default now()
);
create table plan_meals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references meal_plans on delete cascade,
  day date, slot text,           -- breakfast|lunch|snack|dinner
  recipe_id uuid references recipes, servings numeric default 1, locked boolean default false,
  scheduled_at timestamptz,      -- planned meal time (UTC)
  window_start timestamptz, window_end timestamptz,
  log_deadline timestamptz,      -- scheduled_at + 8 hours (LOG_DEADLINE_HOURS)
  locked boolean default false,  -- true once the deadline passes
  status text default 'planned', -- planned|eaten_on_time|eaten_late|substituted|skipped|unlogged|unlogged_locked
  logged_at timestamptz,         -- when the user logged it
  minutes_late int,              -- null if on time or not eaten
  substitute_note text,          -- what they ate instead
  actual_kcal numeric, actual_protein_g numeric, actual_carbs_g numeric, actual_fat_g numeric
);

-- Daily check-ins (needed for accurate reports)
create table daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  day date not null,             -- user's local date
  completed_at timestamptz,
  mood int, sleep_hours numeric, weight_kg numeric, notes text,
  meals_logged int, meals_planned int,
  unique (user_id, day)
);

-- Reports with version history (never silently overwritten)
create table health_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  period text,                   -- daily|weekly|monthly
  period_start date, period_end date,
  version int default 1,
  completeness numeric,          -- 0-1 share of expected data actually logged
  adherence_score numeric, health_score numeric,
  findings jsonb,                -- rule-based facts
  summary_text text,             -- AI-polished text
  change_reason text,            -- why this version differs from the last
  created_at timestamptz default now()
);

-- Tracker
create table health_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  type text,                     -- weight|sleep|steps|mood|bp|glucose (meals live in plan_meals; no water tracking)
  value jsonb, logged_at timestamptz default now()
);

-- Chat
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  mode text, created_at timestamptz default now()
);
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions on delete cascade,
  role text, content text, flagged boolean default false,
  created_at timestamptz default now()
);

-- Consents (versioned, withdrawable)
create table consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  type text,                     -- health_data|automated_monitoring|terms|age_18
  version text, granted_at timestamptz default now(), withdrawn_at timestamptz
);

-- Health Monitor
create table monitor_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  event_type text,               -- meal_status|checkin|vital|chat_flag|schedule_tick
  payload jsonb, created_at timestamptz default now(),
  processed_at timestamptz, attempts int default 0, error text
);

create table plan_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  rule_id text,                  -- R1..R8
  kind text,                     -- calorie_target|macro_split|meal_time|meal_swap|nudge
  status text,                   -- applied|suggested|dismissed|reverted|blocked
  before jsonb, after jsonb,
  reason text,                   -- plain-language explanation shown to the user
  evidence jsonb,                -- data window and numbers behind the decision
  confidence numeric,
  data_window_start date, data_window_end date,
  created_at timestamptz default now(), reverted_at timestamptz,
  unique (user_id, rule_id, data_window_end)   -- idempotency: same rule, same window, once
);

-- Monthly Health Assessment: ONE per account per calendar month
create table monthly_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  assessment_month date not null,    -- first day of the month in the user's timezone, set by the server
  timezone text not null,
  period_start date, period_end date,
  completeness numeric,
  health_score numeric, adherence_score numeric,
  findings jsonb, recommendations jsonb,
  previous_targets jsonb, new_targets jsonb,
  summary_text text, model_version text,
  created_at timestamptz default now(),
  unique (user_id, assessment_month)  -- makes a second assessment in the same month impossible
);
-- Only completed assessments are inserted (failed runs are not stored, so they do not use the quota).
-- RLS: users can SELECT their own rows; INSERT only through a server function (service role);
-- add triggers that block UPDATE and DELETE (immutable); rows are removed only when the account is deleted.

-- Profile auto-creation on first Google login
create function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name, avatar_url, auth_provider)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'google');
  return new;
end; $$ language plpgsql security definer;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Favorites
create table favorites (
  user_id uuid references profiles on delete cascade,
  recipe_id uuid references recipes on delete cascade,
  primary key (user_id, recipe_id)
);
```

**Row Level Security (mandatory):** enable RLS on every user table. Policy pattern: `using (auth.uid() = user_id)` for select/insert/update/delete. `recipes` and `ingredients` are readable by everyone, writable by admin only.

---

## 6. Project Structure

```text
graceai/
├─ app/
│  ├─ (marketing)/page.tsx            # landing
│  ├─ (auth)/login                    # Google login + One Tap
│  ├─ auth/callback/route.ts          # OAuth code exchange
│  ├─ consent/
│  ├─ (app)/dashboard, planner, recipes, recipes/[id], tracker, grace, profile, assessment, monitor
│  ├─ onboarding/
│  └─ api/
│     ├─ chat/route.ts                # Gemini proxy + safety layer
│     ├─ plan/generate/route.ts       # AI weekly plan (JSON)
│     ├─ assessment/route.ts          # monthly assessment (server-enforced limit)
│     ├─ monitor/run/route.ts         # secured worker endpoint (also Edge Function)
│     └─ recipes/search/route.ts
├─ components/ (ui, charts, chat, recipe, planner, layout)
├─ lib/
│  ├─ supabase/ (client.ts, server.ts)
│  ├─ nutrition.ts                    # BMR, TDEE, macros, BMI
│  ├─ safety.ts                       # emergency + ED detection, allergen filter
│  ├─ monitor/ (rules.ts, guardrails.ts, runner.ts)   # R1-R8, safety freeze, confidence gate
│  ├─ assessment.ts                   # data check, scoring, one-per-month logic
│  ├─ auth/google-onetap.ts
│  ├─ gemini.ts                       # model wrapper, retries, caching
│  └─ grocery.ts                      # ingredient aggregation
├─ scripts/
│  ├─ seed-themealdb.ts
│  ├─ seed-ingredients-usda.ts
│  └─ generate-grace-kitchen.ts
├─ public/ (manifest.json, icons, sw.js)
└─ .env.local                         # NEVER commit
```

**Environment variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `GEMINI_API_KEY` (server only), `UNSPLASH_ACCESS_KEY`, `USDA_API_KEY`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (public), `MONITOR_CRON_SECRET` (server only, protects the worker endpoint). The Google client secret is stored in the Supabase dashboard, not in the repo.

---

## 7. Build Phases (give code + steps for each, then wait for "next")

### Phase 1: Foundation and Design (Week 1)
- Create the Next.js + TypeScript + Tailwind + shadcn/ui project; set up fonts, color tokens, dark mode, layout shell (sidebar + bottom nav).
- Build the **landing page** with the full design system.
- Deploy to Vercel via GitHub.
- **Done when:** a beautiful, responsive landing page is live on a free URL.

### Phase 2: Recipes (Weeks 2-3)
- Supabase project, run the schema, set RLS.
- Seed script for TheMealDB; ingredient seed from USDA.
- Recipes list (filters, search, cuisine carousel), detail page, serving scaler, favorites.
- **Done when:** 300+ recipes browsable with filters.

### Phase 3: Auth, Onboarding, Tracker (Weeks 4-6)
- **Login page with Google sign-in and One Tap automatic sign-in (4.7)**, profile auto-creation trigger, consent screen, then the onboarding quiz and `nutrition.ts` calculations.
- Dashboard with rings, tiles and today's meal timeline; **meal schedule and adherence engine (4.2.1)**, daily check-in, auto-updating daily/weekly reports with version history, charts, streaks and health score.
- Timezone-correct date/time handling (4.2.6).
- **Done when:** a user can sign in with Google (and is auto-signed-in on return), give consent, get targets, and log and view data.

### Phase 4: Diet Planner (Weeks 7-8)
- Planner UI (weekly calendar, drag/drop, lock, swap).
- `/api/plan/generate` using Gemini with JSON output, validation against the schema and allergen filter, fallback to a rule-based plan if the API fails.
- Grocery list generator.
- **Done when:** one tap makes a 7-day plan and a grocery list.

### Phase 5: Grace Chat (Weeks 9-10)
- Chat UI (streaming responses, chips, mode switch, history).
- `/api/chat` with `safety.ts`, context builder, rate limiting, caching, feedback buttons.
- Floating assistant on all pages; Cooking mode with timers and voice "next".
- **Done when:** Chef and Health Guide modes work, and emergency/ED tests pass.

### Phase 5B: Health Monitor and Monthly Assessment (Weeks 11-12)
- `monitor_events` queue, hourly and weekly scheduled jobs, rules R1-R8, guardrails (confidence gate, size/frequency limits, safety freeze, restricted users).
- `plan_adjustments` log, **My Plan Changes** page, undo, Auto/Suggest/Off switch, dashboard adjustment card.
- Monthly Assessment: data-sufficiency check, scoring, recalibration, PDF export, unique-per-month enforcement and immutability in the database.
- Give Grace the assessment and adjustment context.
- **Done when:** adjustments happen automatically within guardrails and are fully explainable and reversible, and a second assessment in the same month is impossible even via direct API calls.

### Phase 6: Polish and PWA (Weeks 13-14)
- PWA manifest and offline shell, notifications (opt-in), accessibility audit, performance (Lighthouse 90+), SEO.
- Tamil/Hindi translation with `next-intl`.
- Privacy Policy, Terms, Medical Disclaimer; data export and delete-account flow.
- **Done when:** installable app, passes accessibility checks, legal pages live.

### Phase 7: Growth (after launch)
- Grace Kitchen expansion pipeline toward 100+ countries, community recipes with moderation, wearable/Google Fit sync, dietitian partnerships, optional paid tier (Grace Plus).

---

## 8. Testing Checklist

- [ ] Allergen test: a user with a peanut allergy never receives a peanut recipe or plan.
- [ ] Emergency phrases trigger the emergency card, not a normal reply.
- [ ] Eating-disorder phrases ("I want to eat 500 kcal a day") get a gentle redirect, not a plan.
- [ ] Calorie floor is never violated in generated plans.
- [ ] RLS: user A cannot read user B's logs or chats.
- [ ] API keys never appear in client bundles or the Git repo.
- [ ] Works at 360 px, 768 px, 1280 px widths; keyboard-only navigation works.
- [ ] Lighthouse: Performance, Accessibility, SEO, PWA all 90+.
- [ ] Gemini rate-limit fallback message appears gracefully.

---

## 9. Legal, Privacy and Ethics

- Health data is sensitive. Follow India's **DPDP Act 2023** principles: explicit consent, collect only what you need, purpose limitation, easy **data export and deletion**, encrypted transport (HTTPS) and storage.
- **Automated decisions:** get explicit, separate consent for automated monitoring and plan adjustment; explain it in plain language; allow withdrawal at any time (turning Off stops all automatic changes); keep a visible log and undo for every change.
- **Google data minimization:** use only basic profile scopes (name, email, avatar). Do not request extra Google scopes without a new consent step and policy update.
- Show a **medical disclaimer** on onboarding, in the chat, and in the footer: *"graceAI provides general wellness and cooking information. It is not a substitute for professional medical advice, diagnosis, or treatment."*
- Credit image and data sources (Unsplash, TheMealDB, USDA, Open Food Facts) and respect their terms (confirm production-use terms before launch).
- Have a lawyer review Terms and Privacy before charging money or going large-scale.
- Later, get a registered dietitian to review nutrition rules and the health prompts.

---

## 10. Success Metrics

- Activation: % of signups who finish onboarding and generate a plan.
- Weekly active users logging at least 3 days.
- Chat helpfulness (thumbs-up rate) and safety flags per 1,000 chats.
- Recipe catalog growth per week and cuisine coverage count.
- Lighthouse scores and error rate.

---

## 11. Instructions for Gemini (read carefully)

1. Work **one phase at a time**. For each phase, provide: goal, files to create/edit, **complete code**, terminal commands, environment setup, and a short test checklist.
2. Use **only free tools** listed above. If something might cost money, warn me first and offer a free alternative.
3. Keep code **TypeScript, clean, commented, and beginner-friendly**. Explain each setup step as if I am new to this.
4. Never put secrets in client code. All Gemini calls go through server routes.
5. Implement the **safety layer in code** (Section 4.4), not just in prompts.
6. Match the **design system in Section 2** exactly, and make every screen responsive and accessible.
7. At the end of each phase, summarize what was built, what to test, and what comes next, then ask whether I want to continue.
8. If any free-tier limit or API detail may have changed, tell me to verify it on the official docs instead of guessing.

9. The Health Monitor must be **rule-based**; Gemini may only explain results and propose meal swaps that code then validates. Implement every guardrail in Section 4.5.4 in code, with unit tests.
10. Enforce the **one-assessment-per-month** limit in the database (unique constraint) and in the server route, never only in the UI; failed generations must not use up the quota.
11. Implement Google login exactly as in Section 4.7 (PKCE OAuth plus One Tap with a nonce, `disableAutoSelect` on sign-out). Never put the Google client secret or Supabase service-role key in client code.

**Start now with Phase 1.**
