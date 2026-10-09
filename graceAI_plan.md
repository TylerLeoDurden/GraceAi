# graceAI: Complete Build Plan

> **How to use this file:** Paste this whole document into Google AI Pro (Gemini) and say:
> *"You are my senior full-stack engineer and UI designer. Read this plan fully. Then build graceAI phase by phase. Start with Phase 1 and give me complete, copy-paste-ready code and exact setup steps. Wait for me to say 'next' before moving to the next phase."*

---

## 0. Project Summary

**Name:** graceAI
**Tagline:** *Eat well. Live gracefully.*
**What it is:** A responsive website (installable as a PWA) that combines:
1. A **Diet Planner** (personalized weekly meal plans + grocery lists)
2. A **Health Tracker** (weight, water, sleep, steps, mood, BP, blood sugar, calories/macros)
3. A **Recipe Library** covering world cuisines (grown continuously)
4. **Grace Chat**, one AI assistant with two modes: **Chef Grace** (cooking) and **Health Guide Grace** (nutrition and wellness information)

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
2. **Auth (`/login`, `/signup`)**: email + Google sign-in via Supabase.
3. **Onboarding (`/onboarding`)**: 5 friendly steps: goal, body stats (age, sex, height, weight, activity), diet type (veg, vegan, Jain, halal, eggetarian, non-veg, keto, etc.), allergies/conditions, favorite cuisines. Ends with an instant sample plan.
4. **Dashboard (`/dashboard`)**: today's meals, calorie and macro rings, water/sleep/steps tiles, streak counter, Grace daily tip.
5. **Meal Planner (`/planner`)**: weekly calendar, drag-and-drop meals, "regenerate this meal" button, swap suggestions, one-tap grocery list.
6. **Recipes (`/recipes`)**: search + filters (cuisine, diet, time, difficulty, health goal, ingredients on hand), masonry grid, cuisine carousel.
7. **Recipe detail (`/recipes/[id]`)**: ingredients with serving scaler, nutrition panel, steps, substitutions, "Start cooking" mode.
8. **Cooking mode**: full-screen, one step at a time, big text, built-in timers, keep-screen-awake, optional voice "next step".
9. **Tracker (`/tracker`)**: quick-log buttons, weekly/monthly charts, health score, insights.
10. **Grace Chat (`/grace`)**: full-screen chat, mode switch (Chef / Health Guide), quick chips ("What should I eat tonight?", "Use what's in my fridge", "Check my progress"), chat history.
11. **Profile / Settings (`/profile`)**: goals, allergies, units, language, theme, export data (PDF/CSV), **delete my account and data**.
12. **Legal pages**: Privacy Policy, Terms, Medical Disclaimer.

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

### 4.2 Health Tracker
- Metrics: weight, BMI (auto), water, sleep, steps, mood, blood pressure, blood sugar, meals/calories/macros, optional measurements.
- Quick-log widgets (tap +250 ml water, slider for mood).
- Charts: 7/30/90 day line and bar charts, goal lines, streaks, weekly summary.
- **Health score (0-100):** simple transparent formula (hydration, sleep, activity, logging consistency, calorie adherence). Show how it is calculated.
- Insights are **rule-based first** (e.g., "Water intake is below goal 4 of the last 7 days"), AI-polished second.
- Reminders via browser notifications (optional, opt-in).

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

**Context sent to the model (server-side only):** user profile (goal, diet type, allergies, conditions flag), today's plan summary, last 7 days tracker summary, selected mode. **Never send more personal data than needed. Never expose the API key to the browser.**

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
  recipe_id uuid references recipes, servings numeric default 1, locked boolean default false
);

-- Tracker
create table health_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  type text,                     -- weight|water|sleep|steps|mood|bp|glucose|meal
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
│  ├─ (auth)/login, signup
│  ├─ (app)/dashboard, planner, recipes, recipes/[id], tracker, grace, profile
│  ├─ onboarding/
│  └─ api/
│     ├─ chat/route.ts                # Gemini proxy + safety layer
│     ├─ plan/generate/route.ts       # AI weekly plan (JSON)
│     └─ recipes/search/route.ts
├─ components/ (ui, charts, chat, recipe, planner, layout)
├─ lib/
│  ├─ supabase/ (client.ts, server.ts)
│  ├─ nutrition.ts                    # BMR, TDEE, macros, BMI
│  ├─ safety.ts                       # emergency + ED detection, allergen filter
│  ├─ gemini.ts                       # model wrapper, retries, caching
│  └─ grocery.ts                      # ingredient aggregation
├─ scripts/
│  ├─ seed-themealdb.ts
│  ├─ seed-ingredients-usda.ts
│  └─ generate-grace-kitchen.ts
├─ public/ (manifest.json, icons, sw.js)
└─ .env.local                         # NEVER commit
```

**Environment variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `GEMINI_API_KEY` (server only), `UNSPLASH_ACCESS_KEY`, `USDA_API_KEY`.

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
- Supabase Auth (email + Google), onboarding quiz, `nutrition.ts` calculations.
- Dashboard with rings and tiles; tracker logging and charts; streaks and health score.
- **Done when:** a user can sign up, get targets, and log and view data.

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

### Phase 6: Polish and PWA (Weeks 11-12)
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

**Start now with Phase 1.**
