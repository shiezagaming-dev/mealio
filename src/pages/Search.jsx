import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';
import { translations } from '../i18n';
import AmbientBackground from '../components/AmbientBackground';

const FILTERS = ['Under 15 min', 'Under 30 min', 'Easy', 'Vegetarian', 'Vegan', 'Gluten-free', 'Budget'];
const CATEGORIES_LIST = [
  { id: 'Breakfast', img: 'https://images.unsplash.com/photo-1482049016688-2bcf81e51d0e?q=80&w=400' },
  { id: 'Lunch', img: 'https://images.unsplash.com/photo-1546069901-ba959//q=80&w=400' },
  { id: 'Dinner', img: 'https://images.unsplash.com/photo-1504674900247-a688eacf7c6a?q=80&w=400' },
  { id: 'Dessert', img: 'https://images.unsplash.com/photo-1551024601-bec78aea7eea?q=80&w=400' },
  { id: 'Drinks', img: 'https://images.unsplash.com/photo-1513558161293-e776f397f88f?q=80&w=400' },
  { id: 'Appetizers', img: 'https://images.unsplash.com/photo-1541529086526-6755f67f377c?q=80&w=400' },
];

export default function Search() {
  const { allRecipes, logSearch, state, searchOnline, registerLiveRecipes, catalog } = useApp();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [activeFilters, setActiveFilters] = useState(params.get('tag') ? [params.get('tag')] : []);
  const [liveResults, setLiveResults] = useState([]);
  const [liveSearching, setLiveSearching] = useState(false);

  const lang = state.language || 'fr';
  const t = (key) => {
    const keys = key.split('.');
    let result = translations[lang];
    for (const k of keys) {
      result = result?.[k];
    }
    return result || key;
  };

  useEffect(() => {
    if (query.trim().length < 3) {
      setLiveResults([]);
      return;
    }
    let cancelled = false;
    setLiveSearching(true);
    const timer = setTimeout(() => {
      searchOnline(query).then((r) => {
        if (!cancelled) {
          setLiveResults(r || []);
          registerLiveRecipes(r || []);
          setLiveSearching(false);
        }
      });
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, searchOnline, registerLiveRecipes]);

  const results = useMemo(() => {
    const recipesList = allRecipes();
    const seen = new Set();
    const combined = [
      ...liveResults, 
      ...recipesList, 
      ...catalog.map(m => ({
        id: `mdb_${m.idMeal}`,
        name: m.strMeal,
        image: m.strMealThumb,
        time: 30,
        difficulty: 'Medium',
        tags: [],
        cuisine: ''
      }))
    ];
    const unique = combined.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
    return unique.filter((r) => {
      const text = `${r.name} ${r.tags?.join(' ') || ''} ${r.cuisine || ''}`.toLowerCase();
      const matchesQuery = query.trim() === '' || text.includes(query.toLowerCase());
      const matchesFilters = activeFilters.every((f) => {
        const fl = f.toLowerCase();
        if (fl === 'under 15 min') return r.time <= 15;
        if (fl === 'under 30 min') return r.time <= 30;
        if (fl === 'easy') return r.difficulty === 'Easy';
        return text.includes(fl);
      });
      return matchesQuery && matchesFilters;
    });
  }, [query, activeFilters, allRecipes, liveResults, catalog]);

  function toggleFilter(f) {
    setActiveFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  }

  function submitSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    logSearch(query.trim());
  }

  return (
    <div className="screen" style={{ position: 'relative', width: '100%' }}>
      <AmbientBackground />
      <div style={{ padding: '40px var(--padding-screen) 0', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'var(--fs-h1)', marginBottom: '24px', color: 'var(--text-primary)' }}>
          {t('search.title')}
        </h1>

        <form onSubmit={submitSearch} style={{ marginBottom: '40px' }}>
          <div style={{ 
            position: 'relative', 
            backgroundColor: 'var(--bg-card)', 
            borderRadius: 'var(--r-lg)', 
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ color: 'var(--text-secondary)', marginRight: '12px', fontSize: '22px' }}>🔍</span>
            <input
              placeholder={t('search.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ 
                backgroundColor: 'transparent', 
                border: 'none', 
                outline: 'none', 
                color: 'var(--text-primary)', 
                fontSize: '18px', 
                width: '100%',
                fontFamily: 'var(--font-sans)'
              }}
            />
          </div>
        </form>

        {/* MEAL CATEGORIES SECTION */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: 'var(--fs-h2)', color: 'var(--text-primary)', marginBottom: '20px' }}>
            {t('search.byMeal')}
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px' 
          }}>
            {CATEGORIES_LIST.map((cat) => (
              <div 
                key={cat.id} 
                onClick={() => setQuery(cat.id)}
                className="recipe-card-premium"
                style={{ 
                  height: '110px', borderRadius: 'var(--r-md)', 
                  position: 'relative', overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  padding: 0
                }}
              >
                <img src={cat.img} alt={cat.id} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                <div style={{ 
                  position: 'absolute', inset: 0, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(to top, rgba(23,18,15,0.9), transparent)',
                  color: 'var(--text-primary)', fontWeight: '700', fontSize: '18px', 
                  fontFamily: 'var(--font-serif)'
                }}>
                  {cat.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FILTERS */}
        <div style={{ marginBottom: '32px' }}>
          <div className="horizontal-scroll" style={{ gap: '8px' }}>
            {FILTERS.map((f) => (
              <span 
                key={f} 
                style={{ 
                  padding: '8px 16px', borderRadius: 'var(--r-sm)', 
                  background: activeFilters.includes(f) ? 'var(--accent)' : 'var(--bg-card)', 
                  color: activeFilters.includes(f) ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s ease'
                }} 
                onClick={() => toggleFilter(f)}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* RESULTS */}
        <div style={{ marginBottom: '120px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'baseline', 
            marginBottom: '24px' 
          }}>
            <h3 style={{ fontSize: 'var(--fs-h2)', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
              {results.length} {t('search.results')}
            </h3>
            {liveSearching && <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Recherche...</span>}
          </div>
          
          {results.length === 0 ? (
            <div style={{ 
              textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
              <p>{t('search.noResults')}</p>
            </div>
          ) : (
            <div className="recipe-grid">
              {results.map((r) => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
