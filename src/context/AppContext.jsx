import { createContext, useContext, useEffect, useState } from 'react';
import { recipes as seedRecipes, achievementDefs, defaultFolders, weekDays } from '../data/mockData';
import { fetchRandomMeals, searchMealsByName, fetchAllCategories, fetchMealsByCategory, lookupMealById } from '../data/mealdb';
import { t as translate } from '../i18n';

const AppCtx = createContext(null);

const STORAGE_KEY = 'mealio_state_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not load saved state', e);
  }
  return null;
}

function defaultState() {
  // Détection automatique de la langue
  const browserLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
  
  return {
    theme: 'light',
    language: browserLang,
    hasCompletedOnboarding: false,
    account: { email: '', username: '', loggedIn: false },
    profile: {
      username: '',
      bio: 'Learning one recipe at a time 🍳',
      avatar: '🧑‍🍳',
      cuisines: ['Italian', 'Asian'],
      diet: [],
      skill: 'Beginner',
    },
    userRecipes: [],
    savedIds: [],
    folders: Object.fromEntries(defaultFolders.map((f) => [f, []])),
    shoppingList: [],
    mealPlan: Object.fromEntries(weekDays.map((d) => [d, null])),
    history: [],
    xp: 0,
    mealsCooked: 0,
    streak: 0,
    lastCookDate: null,
    cuisinesCooked: [],
    pastaCooked: 0,
    unlockedAchievements: [],
  };
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = loadState();
    return saved ? { ...defaultState(), ...saved } : defaultState();
  });
  const [toast, setToast] = useState(null);
  const [liveRecipes, setLiveRecipes] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [categories, setCategories] = useState([]);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLiveLoading(true);
    
    async function initLibrary() {
      try {
        const randoms = await fetchRandomMeals(12);
        const cats = await fetchAllCategories();
        const catalogPromises = cats.map(cat => fetchMealsByCategory(cat));
        const catalogResults = await Promise.all(catalogPromises);
        const allPartialMeals = catalogResults.flat();

        if (!cancelled) {
          setLiveRecipes(randoms);
          setCategories(cats);
          setCatalog(allPartialMeals);
          setLiveLoading(false);
        }
      } catch (e) {
        console.error("Failed to initialize library", e);
        if (!cancelled) setLiveLoading(false);
      }
    }

    initLibrary();
    return () => { cancelled = true; };
  }, []);

  async function searchOnline(query) {
    if (!query.trim()) return [];
    return searchMealsByName(query.trim());
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  function setLanguage(lang) {
    setState(s => ({ ...s, language: lang }));
  }

  function completeOnboarding(name) {
    setState(s => ({
      ...s,
      hasCompletedOnboarding: true,
      profile: { ...s.profile, username: name }
    }));
  }

  function registerLiveRecipes(newRecipes) {
    setLiveRecipes(prev => {
      const seen = new Set(prev.map(r => r.id));
      const unique = newRecipes.filter(r => !seen.has(r.id));
      return [...prev, ...unique];
    });
  }

  function allRecipes() {
    const combined = [...liveRecipes, ...state.userRecipes, ...seedRecipes];
    const seen = new Set();
    return combined.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
  }

  function getRecipe(id) {
    return allRecipes().find((r) => r.id === id);
  }

  async function getOrFetchFullRecipe(id) {
    const existing = getRecipe(id);
    if (existing) return existing;

    const partial = catalog.find(m => `mdb_${m.idMeal}` === id);
    if (!partial) return null;

    try {
      const full = await lookupMealById(id);
      if (full) {
        registerLiveRecipes([full]);
        return full;
      }
    } catch (e) {
      console.error("Error fetching full recipe", e);
    }
    return null;
  }

  function toggleTheme() {
    setState((s) => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }));
  }

  function toggleSave(id, folder = 'Favorites') {
    setState((s) => {
      const isSaved = s.savedIds.includes(id);
      const savedIds = isSaved ? s.savedIds.filter((x) => x !== id) : [...s.savedIds, id];
      const folders = { ...s.folders };
      if (!folders[folder]) folders[folder] = [];
      folders[folder] = isSaved
        ? folders[folder].filter((x) => x !== id)
        : [...new Set([...folders[folder], id])];
      return { ...s, savedIds, folders };
    });
    showToast(state.savedIds.includes(id) ? 'Removed from saved' : 'Saved recipe ❤️');
  }

  function createFolder(name) {
    setState((s) => (s.folders[name] ? s : { ...s, folders: { ...s.folders, [name]: [] } }));
  }

  function addToShoppingList(items) {
    setState((s) => {
      const existingNames = new Set(s.shoppingList.map((i) => i.name.toLowerCase()));
      const fresh = items
        .filter((i) => !existingNames.has(i.name.toLowerCase()))
        .map((i, idx) => ({ id: `sl_${Date.now()}_${idx}`, name: i.name, qty: i.qty, unit: i.unit, checked: false }));
      return { ...s, shoppingList: [...s.shoppingList, ...fresh] };
    });
    showToast('Added to shopping list 🛒');
  }

  function toggleShoppingItem(id) {
    setState((s) => ({
      ...s,
      shoppingList: s.shoppingList.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    }));
  }

  function clearCheckedShopping() {
    setState((s) => ({
      ...s,
      shoppingList: s.shoppingList.filter((i) => !i.checked)
    }));
  }

  function logHistory(entry) {
    setState((s) => ({
      ...s,
      history: [{ id: `h_${Date.now()}`, date: new Date().toISOString(), ...entry }, ...s.history].slice(0, 100),
    }));
  }

  function setMealPlanDay(day, recipeId) {
    setState((s) => ({ ...s, mealPlan: { ...s.mealPlan, [day]: recipeId } }));
  }

  function generateWeek() {
    const pool = allRecipes();
    setState((s) => {
      const plan = {};
      weekDays.forEach((d) => {
        plan[d] = pool[Math.floor(Math.random() * pool.length)].id;
      });
      return { ...s, mealPlan: plan };
    });
    showToast('Your week is planned ✨');
  }

  function addUserRecipe(recipe) {
    const id = `u_${Date.now()}`;
    const full = { id, rating: null, nutrition: null, tags: [], color: '#F3E9D2', ...recipe };
    setState((s) => ({ ...s, userRecipes: [...s.userRecipes, full] }));
    return id;
  }

  function checkAchievements(nextStats) {
    const unlocked = [];
    achievementDefs.forEach((a) => {
      if (!nextStats.unlockedAchievements.includes(a.id)) {
        const passState = { ...nextStats, cuisinesCooked: new Set(nextStats.cuisinesCooked) };
        if (a.check(passState)) unlocked.push(a.id);
      }
    });
    return unlocked;
  }

  function markCooked(recipe) {
    setState((s) => {
      const today = new Date().toDateString();
      const wasYesterday = s.lastCookDate && new Date(s.lastCookDate).toDateString() ===
        new Date(Date.now() - 86400000).toDateString();
      const alreadyToday = s.lastCookDate && new Date(s.lastCookDate).toDateString() === today;
      const streak = alreadyToday ? s.streak : wasYesterday ? s.streak + 1 : 1;
      const cuisinesCooked = new Set([...(s.cuisinesCooked || []), recipe.cuisine].filter(Boolean));
      const pastaCooked = s.pastaCooked + (recipe.tags?.includes('pasta') ? 1 : 0);
      const mealsCooked = s.mealsCooked + 1;
      const nextStats = {
        mealsCooked,
        streak,
        cuisinesCooked: [...cuisinesCooked],
        pastaCooked,
        unlockedAchievements: s.unlockedAchievements,
      };
      const newlyUnlocked = checkAchievements(nextStats);
      const xpGain = 20 + newlyUnlocked.length * 50;
      return {
        ...s,
        mealsCooked,
        streak,
        lastCookDate: new Date().toISOString(),
        cuisinesCooked: [...cuisinesCooked],
        pastaCooked,
        xp: s.xp + xpGain,
        unlockedAchievements: [...s.unlockedAchievements, ...newlyUnlocked],
      };
    });
    logHistory({ type: 'cooked', label: `Cooked ${recipe.name}`, icon: '🍳', recipeId: recipe.id });
  }

  function logScan(label, icon = '📸') {
    logHistory({ type: 'scan', label, icon });
  }

  function logSearch(query) {
    logHistory({ type: 'search', label: `Searched "${query}"`, icon: '🔎' });
  }

  // Helper de traduction global injecté dans le contexte
  const t = (key, defaultValue) => translate(state.language, key, defaultValue);

  const value = {
    state,
    setState,
    t,
    setLanguage,
    allRecipes,
    getRecipe,
    getOrFetchFullRecipe,
    registerLiveRecipes,
    catalog,
    categories,
    toggleTheme,
    toggleSave,
    createFolder,
    addToShoppingList,
    toggleShoppingItem,
    clearCheckedShopping,
    logHistory,
    setMealPlanDay,
    generateWeek,
    addUserRecipe,
    markCooked,
    logScan,
    logSearch,
    showToast,
    toast,
    liveLoading,
    searchOnline,
    completeOnboarding,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
