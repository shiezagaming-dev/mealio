// Free, no-API-key-required recipe database with real photos.
// Docs: https://www.themealdb.com/api.php
// Rate/feature limits apply on the free "test" key ("1") — for production,
// consider a paid key or self-hosting a recipe dataset.

const BASE = 'https://www.themealdb.com/api/json/v1/1';

// Turn a TheMealDB "meal" object into our app's recipe shape.
export function mapMealDbToRecipe(meal) {
  if (!meal) return null;

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), qty: measure?.trim() || '', unit: '' });
    }
  }

  const steps = (meal.strInstructions || '')
    .split(/\r?\n|\.(?=\s|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .map((s) => (s.endsWith('.') ? s : `${s}.`));

  const tags = (meal.strTags || '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (meal.strCategory) tags.push(meal.strCategory.toLowerCase());

  return {
    id: `mdb_${meal.idMeal}`,
    name: meal.strMeal,
    image: meal.strMealThumb,
    emoji: '🍽️',
    color: '#F3E9D2',
    time: 30, // TheMealDB doesn't provide cook time; shown as an estimate
    difficulty: 'Medium',
    servings: 4,
    cuisine: meal.strArea || 'International',
    tags,
    rating: null,
    ingredients,
    steps: steps.length ? steps : ['See full instructions on the source page.'],
    nutrition: null,
    source: meal.strSource || meal.strYoutube || null,
    live: true,
  };
}

async function safeFetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('MealDB request failed (offline?):', e);
    return null;
  }
}

export async function fetchRandomMeals(count = 8) {
  const requests = Array.from({ length: count }, () => safeFetchJson(`${BASE}/random.php`));
  const results = await Promise.all(requests);
  const meals = results.map((r) => r?.meals?.[0]).filter(Boolean);
  // de-dupe by id
  const seen = new Set();
  return meals.filter((m) => (seen.has(m.idMeal) ? false : (seen.add(m.idMeal), true))).map(mapMealDbToRecipe);
}

export async function searchMealsByName(query) {
  const data = await safeFetchJson(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  return (data?.meals || []).map(mapMealDbToRecipe);
}

export async function filterByIngredient(ingredient) {
  const data = await safeFetchJson(`${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`);
  // filter.php returns partial meal objects (id, name, thumb only) — needs a lookup for full detail.
  return data?.meals || [];
}

export async function lookupMealById(id) {
  const data = await safeFetchJson(`${BASE}/lookup.php?i=${id}`);
  return mapMealDbToRecipe(data?.meals?.[0]);
}

export async function fetchMealsByCategory(category) {
  const data = await safeFetchJson(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  return data?.meals || [];
}

// Given a comma-separated ingredient list, find real recipes that use the
// first ingredient, then rank by how many of the other ingredients they share.
export async function findMealsByIngredients(ingredientList) {
  if (!ingredientList.length) return [];
  const partials = await filterByIngredient(ingredientList[0]);
  const top = partials.slice(0, 8);
  const detailed = await Promise.all(top.map((m) => lookupMealById(m.idMeal)));
  const have = ingredientList.map((i) => i.toLowerCase());
  return detailed
    .filter(Boolean)
    .map((r) => {
      const names = r.ingredients.map((i) => i.name.toLowerCase());
      const hits = have.filter((h) => names.some((n) => n.includes(h) || h.includes(n)));
      const pct = Math.round((hits.length / have.length) * 100);
      return { r, pct: Math.min(100, Math.max(pct, 40)) };
    })
    .sort((a, b) => b.pct - a.pct);
}
