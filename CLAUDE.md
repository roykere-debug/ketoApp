# CLAUDE.md — MyKetoApp

## Project Overview

**MyKetoApp** is a Hebrew-first React Native keto diet tracker built with Expo. It combines food logging, AI-powered food scanning, a conversational keto coach, and recipe generation — all backed by Google Gemini and Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo ~54 + React Native 0.81 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router 6 (file-based) |
| Styling | NativeWind 4 (Tailwind for RN) |
| State | Zustand 5 + AsyncStorage persistence |
| Backend | Supabase (Postgres + Auth) |
| AI | Google Gemini 2.0 Flash |
| Icons | Lucide React Native |
| Components | CVA (Class Variance Authority) pattern |

---

## Project Structure

```
app/
  _layout.tsx           # Root layout (fonts, splash)
  index.tsx             # Welcome/landing
  login.tsx             # Supabase auth
  (tabs)/
    _layout.tsx         # Tab navigator
    index.tsx           # Dashboard (daily macros, meals)
    scanner.tsx         # Camera + AI food recognition
    coach.tsx           # AI chat coach
    profile.tsx         # User profile sync
  recipes.tsx           # AI recipe generator

components/
  ui/                   # Primitive UI (Button, Card, Input, Text)
  modals/               # AddFoodModal

services/
  ai.ts                 # Gemini API calls
  foods.ts              # Supabase food queries
  recipes.ts            # Recipe + image generation

store/
  mealsStore.ts         # Daily meals + goals
  userStore.ts          # Profile + Supabase sync
  favoritesStore.ts     # Saved recipes

lib/
  supabase.ts           # Supabase client
  utils.ts              # cn/clsx helper
```

---

## Commands

```bash
npx expo start          # Start dev server
npx expo start --ios    # iOS simulator
npx expo start --android
npm run setup-db        # Seed food items into Supabase
```

---

## Environment Variables

Required in `.env`:
```
EXPO_PUBLIC_GOOGLE_API_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # setup script only
```

---

## Key Conventions

### Styling
- Use NativeWind Tailwind classes. Primary color is `#800020` (dark maroon), mapped to `primary` in `tailwind.config.js`.
- RTL layout: use `flex-row-reverse` and `text-right` throughout. The app is Hebrew-first.
- Font: `Assistant` Google Font loaded in `_layout.tsx`.

### Components
- UI primitives in `components/ui/` use CVA for variant-based styling.
- New screens go in `app/`. New reusable components go in `components/`.
- Always type props with TypeScript interfaces.

### State
- Use Zustand stores for shared state. Stores are persisted to AsyncStorage.
- Access stores via selectors to avoid unnecessary re-renders.
- Keep local screen state (loading, form values) in `useState`.

### AI / Services
- All Gemini calls go through `services/ai.ts` or `services/recipes.ts`. Do not call the Gemini API directly from screens.
- AI responses should always be in Hebrew.
- Wrap all API calls in try/catch with user-friendly error feedback (Alert).

### Supabase
- Row Level Security is enabled. Users can only read/write their own data.
- Food items have public read access.
- Use `lib/supabase.ts` for the client — do not create additional instances.

---

## Data Models

### Meal (mealsStore)
```ts
{ id, name, calories, protein, fat, carbs, ketoScore (1-10), timestamp, imageBase64? }
```

### UserProfile (userStore)
```ts
{ name, age, weight, height, gender, activityLevel, dailyCarbLimit }
```

### Recipe (favoritesStore + recipes.tsx)
```ts
{ id, title, ingredients[], instructions, ketoScore, nutrition: {calories,protein,fat,carbs}, imagePrompt? }
```

### FoodItem (Supabase)
```ts
{ id, name, name_hebrew, calories, protein, fat, carbs, fiber, sugar, serving_size, category, brand, barcode, is_verified }
```

---

## Keto Score

The keto score (1–10) measures how well a meal aligns with ketogenic principles. It is calculated by Gemini during food analysis and is also aggregated daily in `mealsStore.getTodaysKetoScore()`. Higher fat, lower carbs = higher score.

---

## Areas for Improvement

When improving or extending this app, focus on:

1. **Apple Health integration** — The toggle exists in `profile.tsx` but is not wired up.
2. **Barcode scanning** — `food_items` has a `barcode` column but no barcode scanning flow.
3. **Onboarding flow** — `completeOnboarding()` exists in `userStore` but there is no onboarding screen.
4. **Daily goal customization** — `setDailyGoals()` exists in `mealsStore` but no UI exposes it.
5. **Push notifications** — Could remind users to log meals or hit carb limits.
6. **Meal history** — Currently only today's meals shown; no historical view.
7. **Web support** — Camera and some native modules may not work on web platform.
8. **Error boundaries** — No global error boundary around tab screens.
9. **i18n** — Hebrew is hardcoded; extracting strings would allow future localization.
10. **Testing** — No tests exist yet. Add Jest + React Native Testing Library.

---

## Do Not

- Do not change the RTL/Hebrew text direction — the entire UI is designed around it.
- Do not create a second Supabase client instance.
- Do not call Gemini directly from screen components — go through `services/`.
- Do not store secrets in code — use `.env` variables with `EXPO_PUBLIC_` prefix.
- Do not use `console.log` for production logging — use proper error handling.
