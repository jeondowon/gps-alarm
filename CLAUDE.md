# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # Start Vite development server
pnpm build    # Production build
```

No test runner or linter is configured.

## Environment

Requires a `VITE_GOOGLE_MAPS_API_KEY` in `.env` (see `.env.example`). The Google Maps API key is used for location search, geocoding, and map rendering.

## Architecture

This is a **client-side only** React 18 + TypeScript + Vite app — a Figma-exported mobile-first GPS alarm web app. There is no backend; state is persisted via `localStorage`.

**Entry points:**

- `src/main.tsx` → renders `App.tsx` → `routes.tsx` (13 routes via React Router 7)

**Alarm flow:** `HomeScreen` (location search + radius) → `RadiusSelectionScreen` → `GoogleMapsRadiusScreen` → `ActiveAlarmScreen` (polls geolocation, computes distance) → `AlarmTriggerScreen` (alarm fires when within radius).

**AlarmData** (`src/app/types/alarm.ts`) is the central interface passed between screens via `localStorage`: `{ destination, address, lat, lng, radius }`.

**Key structural details:**

- `src/app/components/` — 14 screen-level components (one per route)
- `src/app/components/ui/` — 45+ shadcn/Radix UI primitives
- `src/styles/theme.css` — design tokens and CSS variables for light/dark themes
- `ThemeProvider.tsx` wraps the app via next-themes

**Mapping:** Google Maps API is used in `GoogleMapsRadiusScreen` for interactive radius selection and `ActiveAlarmScreen` for live tracking. Leaflet (`react-leaflet`) is also installed but used as an alternative.

**Figma asset resolver:** `vite.config.ts` includes a custom Vite plugin (`figmaAssetResolver`) that rewrites `figma:asset/<file>` imports to `/src/assets/<file>`. Use this pattern when referencing Figma-exported assets.

**Path alias:** `@/` maps to `src/` (configured in `tsconfig.json` and `vite.config.ts`).

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.
- Always answer in Korean.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
