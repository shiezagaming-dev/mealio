import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';
import { translations } from '../i18n';

const FILTERS = ['Under 15 min', 'Under 30 min', 'Easy', 'Vegetarian', 'Vegan', 'Gluten-free', 'Budget'];
const COMMON_INGREDIENTS = [
  { name: 'Chicken', img: 'Chicken' },
  { name: 'Egg', img: 'Egg' },
  { name: 'Pasta', img: 'Pasta' },
  { name: 'Apple', img: 'Apple' },
  { name: 'Tomato', img: 'Tomato' },
  { name: 'Beef', img: 'Beef' },
  { name: 'Rice', img: 'Rice' },
  { name: 'Cheese', img: 'Cheese' },
];
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
    const t = setTimeout(() => {
      searchOnline(query).then((r) => {
        if (!cancelled) {
          setLiveResults(r);
          registerLiveRecipes(r);
          setLiveSearching(false);
        }
      });
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  const results = useMemo(() => {
    const seen = new Set();
    const combined = [
      ...liveResults, 
      ...allRecipes(), 
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
    <div className="app-container">
      <div style={{ padding: '40px 24px 0' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '24px', color: 'var(--mealio-text)' }}>
          {t('search.title')}
        </h1>

        <form onSubmit={submitSearch} style={{ marginBottom: '40px' }}>
          <div style={{ 
            position: 'relative', 
            backgroundColor: 'var(--mealio-surface)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--mealio-border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <span style={{ color: 'var(--mealio-text-secondary)', marginRight: '12px', fontSize: '22px' }}>🔍</span>
            <input
              placeholder={t('search.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ 
                backgroundColor: 'transparent', 
                border: 'none', 
                outline: 'none', 
                color: 'var(--mealio-text)', 
                fontSize: '18px', 
                width: '100%',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>
        </form>

        {/* INGREDIENTS SECTION */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'baseline', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ fontSize: '22px', color: 'var(--mealio-text)', margin: 0 }}>
              {t('search.byIngredients')}
            </h3>
            <span style={{ color: 'var(--mealio-accent)', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              {t('common.viewAll')}
            </span>
          </div>
          <div className="horizontal-scroll">
            {COMMON_INGREDIENTS.map((ing) => (
              <div 
                key={ing.name} 
                onClick={() => setQuery(ing.name)} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  cursor: 'pointer', 
                  width: '84px', 
                  flexShrink: 0 
                }}
              >
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '50%', 
                  overflow: 'hidden', 
                  backgroundColor: 'var(--mealio-surface-2)',
                  border: '2px solid var(--mealio-border)',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={`https://www.themealdb.com/images/ingredients/${ing.img}.png`} 
                    alt={ing.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  marginTop: '10px', 
                  color: 'var(--mealio-text-secondary)',
                  fontFamily: 'var(--font-body)'
                }}>{ing.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MEAL CATEGORIES SECTION */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '22px', color: 'var(--mealio-text)', marginBottom: '20px' }}>
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
                className="card"
                style={{ 
                  height: '110px', borderRadius: 'var(--radius-md)', 
                  position: 'relative', overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid var(--mealio-border)',
                  padding: 0
                }}
              >
                <img src={cat.img} alt={cat.id} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                <div style={{ 
                  position: 'absolute', inset: 0, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(to top, rgba(23,18,15,0.9), transparent)',
                  color: 'var(--mealio-text)', fontWeight: '700', fontSize: '18px', 
                  fontFamily: 'var(--font-heading)'
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
                  padding: '8px 16px', borderRadius: 'var(--radius-sm)', 
                  background: activeFilters.includes(f) ? 'var(--mealio-accent)' : 'var(--mealio-surface)', 
                  color: activeFilters.includes(f) ? 'var(--mealio-text)' : 'var(--mealio-text-secondary)',
                  border: '1px solid var(--mealio-border)', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-body)',
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
            <h3 style={{ fontSize: '22px', color: 'var(--mealio-text)', fontFamily: 'var(--font-heading)' }}>
              {results.length} {t('search.results')}
            </h3>
            {liveSearching && <span style={{ color: 'var(--mealio-text-secondary)', fontSize: '13px' }}>Recherche...</span>}
          </div>
          
          {results.length === 0 ? (
            <div style={{ 
              textAlign: 'center', padding: '60px 0', color: 'var(--mealio-text-secondary)' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
              <p>{t('search.noResults')}</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
              gap: '20px' 
            }}>
              {results.map((r) => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
