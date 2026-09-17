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
  { id: 'Breakfast', img: 'https://images.unsplash.com/photo-1482049016688-2bcf81e51d0e?q=80&w=200' },
  { id: 'Lunch', img: 'https://images.unsplash.com/photo-1546069901-ba959//q=80&w=200' },
  { id: 'Dinner', img: 'https://images.unsplash.com/photo-1504674900247-a688eacf7c6a?q=80&w=200' },
  { id: 'Dessert', img: 'https://images.unsplash.com/photo-1551024601-bec78aea7eea?q=80&w=200' },
  { id: 'Drinks', img: 'https://images.unsplash.com/photo-1513558161293-e776f397f88f?q=80&w=200' },
  { id: 'Appetizers', img: 'https://images.unsplash.com/photo-1541529086526-6755f67f377c?q=80&w=200' },
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
    <div className="screen" style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      width: '100%', 
      backgroundColor: '#171512', 
      color: '#F4EBDD',
      minHeight: '100vh',
      paddingBottom: '100px'
    }}>
      <div style={{ padding: '32px 24px 0' }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontFamily: 'Fraunces, serif', 
          marginBottom: '24px',
          fontWeight: '700'
        }}>
          {t('search.title')}
        </h1>

        <form onSubmit={submitSearch} style={{ marginBottom: '40px' }}>
          <div style={{ 
            position: 'relative', 
            backgroundColor: '#211E19', 
            borderRadius: '16px', 
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #3A211C',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}>
            <span style={{ color: '#AAA39A', marginRight: '12px', fontSize: '20px' }}>🔍</span>
            <input
              placeholder={t('search.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ 
                backgroundColor: 'transparent', 
                border: 'none', 
                outline: 'none', 
                color: '#F4EBDD', 
                fontSize: '16px', 
                width: '100%',
                fontFamily: 'DM Sans, sans-serif'
              }}
            />
          </div>
        </form>

        <div className="section" style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontFamily: 'Fraunces, serif', 
              fontWeight: '600' 
            }}>
              {t('search.byIngredients')}
            </h3>
            <span style={{ color: '#F04A32', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              {t('common.viewAll')}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            overflowX: 'auto', 
            paddingBottom: '12px', 
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            {COMMON_INGREDIENTS.map((ing) => (
              <div 
                key={ing.name} 
                onClick={() => setQuery(ing.name)} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  cursor: 'pointer', 
                  width: '80px', 
                  flexShrink: 0 
                }}
              >
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '50%', 
                  overflow: 'hidden', 
                  backgroundColor: '#27231D',
                  border: '2px solid #3A211C',
                  transition: 'border-color 0.2s ease',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>
                  <img 
                    src={`https://www.themealdb.com/images/ingredients/${ing.img}.png`} 
                    alt={ing.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  marginTop: '8px', 
                  color: '#AAA39A',
                  fontFamily: 'DM Sans, sans-serif'
                }}>{ing.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section" style={{ marginBottom: '40px' }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontFamily: 'Fraunces, serif', 
            fontWeight: '600', 
            marginBottom: '16px' 
          }}>
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
                style={{ 
                  height: '100px', borderRadius: '20px', 
                  position: 'relative', overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid #3A211C'
                }}
              >
                <img src={cat.img} alt={cat.id} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                <div style={{ 
                  position: 'absolute', inset: 0, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(to top, rgba(23,18,15,0.8), transparent)',
                  color: '#F4EBDD', fontWeight: '700', fontSize: '16px', 
                  fontFamily: 'Fraunces, serif'
                }}>
                  {cat.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
            {FILTERS.map((f) => (
              <span 
                key={f} 
                style={{ 
                  padding: '8px 16px', borderRadius: '20px', 
                  background: activeFilters.includes(f) ? '#F04A32' : '#211E19', 
                  color: activeFilters.includes(f) ? '#F4EBDD' : '#AAA39A',
                  border: '1px solid #3A211C', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.2s ease'
                }} 
                onClick={() => toggleFilter(f)}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '80px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ fontSize: '20px', fontFamily: 'Fraunces, serif', fontWeight: '600' }}>
              {results.length} {t('search.results')}
            </h3>
            {liveSearching && <span style={{ color: '#AAA39A', fontSize: '13px' }}>Recherche...</span>}
          </div>
          
          {results.length === 0 ? (
            <div style={{ 
              textAlign: 'center', padding: '60px 0', color: '#AAA39A' 
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
