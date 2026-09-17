import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';

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
const CATEGORIES_LIST = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Drinks', 'Appetizers'];

export default function Search() {
  const { allRecipes, logSearch, state, searchOnline, registerLiveRecipes, catalog } = useApp();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [activeFilters, setActiveFilters] = useState(params.get('tag') ? [params.get('tag')] : []);
  const [recent, setRecent] = useState(
    state.history.filter((h) => h.type === 'search').slice(0, 5)
  );
  const [liveResults, setLiveResults] = useState([]);
  const [liveSearching, setLiveSearching] = useState(false);

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
    setRecent((r) => [{ label: `Searched "${query.trim()}"` }, ...r].slice(0, 5));
  }

  const getCategoryImage = (cat) => {
    const match = catalog.find(m => 
      m.strMeal.toLowerCase().includes(cat.toLowerCase()) || 
      (m.strCategory && m.strCategory.toLowerCase() === cat.toLowerCase())
    );
    return match ? match.strMealThumb : null;
  };

  return (
    <div className="screen">
      <h1 style={{ fontSize: '32px', marginBottom: 'var(--space-lg)' }}>Recherche</h1>
      <form onSubmit={submitSearch} style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="search-bar-premium">
          <span style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input
            placeholder="Essayez “pâtes au poulet” ou “poulet, tomate, fromage”"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>

      <div className="section" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="section-header-premium">
          <h3 style={{ fontWeight: '700' }}>Par ingrédient</h3>
          <span className="see-all">VOIR TOUT</span>
        </div>
        <div style={{ 
          display: 'flex', gap: 'var(--space-lg)', overflowX: 'auto', 
          paddingBottom: 'var(--space-md)', scrollbarWidth: 'none' 
        }}>
          {COMMON_INGREDIENTS.map((ing) => (
            <div 
              key={ing.name} 
              onClick={() => setQuery(ing.name)} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '80px' }}
            >
              <div style={{ 
                width: '72px', height: '72px', borderRadius: '50%', 
                overflow: 'hidden', border: '2px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)'
              }}>
                <img 
                  src={`https://www.themealdb.com/images/ingredients/${ing.img}.png`} 
                  alt={ing.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/72?text=🥘'; }}
                />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', marginTop: '8px', textAlign: 'center', color: 'var(--text-main)' }}>{ing.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="section-header-premium">
          <h3 style={{ fontWeight: '700' }}>Par type de repas</h3>
        </div>
        <div className="recipe-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {CATEGORIES_LIST.map((cat) => {
            const img = getCategoryImage(cat);
            return (
              <div 
                key={cat} 
                onClick={() => setQuery(cat)}
                style={{ 
                  height: '150px', borderRadius: 'var(--r-lg)', 
                  position: 'relative', overflow: 'hidden', cursor: 'pointer',
                  backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)'
                }}
              >
                {img ? (
                  <img src={img} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--accent-soft)' }} />
                )}
                <div style={{ 
                  position: 'absolute', bottom: 0, left: 0, right: 0, 
                  padding: '12px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  color: 'white', fontWeight: '600', fontSize: '15px'
                }}>
                  {cat}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="chip-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {FILTERS.map((f) => (
            <span 
              key={f} 
              className="chip" 
              style={{ 
                padding: '8px 16px', borderRadius: 'var(--r-pill)', 
                background: activeFilters.includes(f) ? 'var(--accent)' : 'var(--bg-card)', 
                color: activeFilters.includes(f) ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '13px'
              }} 
              onClick={() => toggleFilter(f)}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {query.trim() === '' && recent.length > 0 && (
        <div className="section" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="section-header-premium"><h3 style={{ fontWeight: '700' }}>Recherches récentes</h3></div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recent.map((r, i) => (
              <li key={i} style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
                background: 'var(--bg-card)', borderRadius: 'var(--r-md)', 
                border: '1px solid var(--border-color)', cursor: 'pointer' 
              }} onClick={() => setQuery(r.label.replace('Searched "', '').replace('"', ''))}>
                <span style={{ fontSize: '18px' }}>🕐</span>
                <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="section">
        <div className="section-header-premium">
          <h3 style={{ fontWeight: '700' }}>{results.length} résultats</h3>
          {liveSearching && <span className="see-all" style={{ color: 'var(--text-muted)' }}>Recherche en cours…</span>}
        </div>
        {results.length === 0 ? (
          <div className="empty-state">
            <div className="glyph">🍽️</div>
            <p>Aucun résultat — essayez d'autres ingrédients ou moins de filtres.</p>
          </div>
        ) : (
          <div className="recipe-grid">
            {results.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
