# Mealio — starter app

A working React + Vite scaffold covering every screen from your spec: Home,
Search, Snap-a-Meal, Fridge Scan, Cook-From-Ingredients, Create-Your-Own-Recipe,
Recipe Detail + Remix, Cook Mode (timers, TTS, in-step AI questions), Saved
folders, Shopping List, Meal Planner, History, Achievements/XP, My Kitchen
profile, Settings, and an AI Chef chat. All buttons work today.

## Real meals, real photos
On startup the app fetches real recipes with real photos from
[TheMealDB](https://www.themealdb.com/api.php) — a free, no-API-key recipe
database (`src/data/mealdb.js`). This covers Home, Search, "Cook From
Ingredients," and Fridge Scan. If the network is unavailable, the app falls
back to 8 built-in offline recipes (emoji thumbnails, no photos) from
`src/data/mockData.js` so it still runs. TheMealDB's free tier is meant for
development/hobby use — for a production app, get a paid key from them or
plug in a different recipe/nutrition API (e.g. Spoonacular, Edamam) using the
same pattern in `mealdb.js`.

## Option A — unzip and go
Unzip `mealio-app.zip`, then:
```
npm install
npm run dev
```
Open the printed local URL (mobile-width layout, ~480px).

## Option B — hand it to Aider
Put `build_mealio.py` in an empty folder (or a fresh git repo), then either:
- run it yourself: `python build_mealio.py`, or
- paste this into your Aider chat: *"Run build_mealio.py, then npm install,
  then let's keep iterating on it."*

Aider can then take over editing individual files (e.g. `src/pages/Home.jsx`)
using your Aider → Ollama → Qwen2.5-Coder 3B chain, or OpenRouter for a
stronger model on trickier files.

## Where the "AI" is currently fake, and how to make it real
Everything AI-sounding right now is simulated with plain JS so the app runs
with zero API keys:
- **Snap a Meal / Fridge Scan** (`src/pages/CreateScan.jsx`) — picks a random
  matching recipe (now a real one, with a real photo) instead of running real
  image recognition. Swap in a vision model call (e.g. an OpenRouter
  multimodal model, or a local Ollama vision model) inside `handleFile`.
- **Recipe Remix / "Ask Mealio"** (`src/pages/RecipeDetail.jsx`,
  `src/pages/CookMode.jsx`) — canned text per option. Replace with a real
  LLM call (Ollama/Qwen or OpenRouter) that receives the recipe JSON + the
  user's request and returns a rewritten recipe.
- **AI Chef chat** (`src/pages/AIChef.jsx`) — simple keyword matching in
  `craftReply`. Replace with a real chat completion call, passing the
  recipe catalog as context.
- **Create Your Own Recipe "tidy up"** (`src/pages/CreateScan.jsx`,
  `cleanUpWithAI`) — naive comma-splitting. Replace with an LLM call that
  turns rough notes into structured ingredients/steps.

State (saved recipes, shopping list, meal plan, XP, history) persists in
the browser via `localStorage` — see `src/context/AppContext.jsx`. Swap that
for real API calls once you have a backend (e.g. Cloudflare Workers).

## Deploying
This is a static Vite app, so it deploys cleanly to Cloudflare Pages/Workers:
```
npm run build
wrangler pages deploy dist
```
