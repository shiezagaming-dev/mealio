import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';

const FILTERS = ['Under 15 min', 'Under 30 min', 'Easy', 'Vegetarian', 'Vegan', 'Gluten-free', 'Budget'];

export default function Search() {
  const { allRecipes, logSearch, state, searchOnline, registerLiveRecipes, catalog, categories } = useApp();
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
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
          registerLiveRecipes(r); // FIX ISSUE 2: Register results globally
          setLiveSearching(false);
        }
      });
    }, 400); // debounce
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  const results = useMemo(() => {
    const seen = new Set();
    // Combine live search results, the global list, and the lightweight catalog
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

  return (
    <div className="screen">
      <h1>Search recipes</h1>
      <form onSubmit={submitSearch} style={{ marginTop: 14 }}>
        <div className="search-bar">
          <span>🔎</span>
          <input
            placeholder="Try “chicken pasta” or “chicken, tomato, cheese”"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>

      <div className="section">
        <div className="chip-row">
          {FILTERS.map((f) => (
            <span key={f} className={`chip ${activeFilters.includes(f) ? 'active' : ''}`} onClick={() => toggleFilter(f)}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="section">
          <div className="section-head"><h3>Categories</h3></div>
          <div className="chip-row">
            {categories.map((cat) => (
              <span key={cat} className="chip" onClick={() => setQuery(cat)}>{cat}</span>
            ))}
          </div>
        </div>
      )}

      {query.trim() === '' && recent.length > 0 && (
        <div className="section">
          <div className="section-head"><h3>Recent searches</h3></div>
          <ul>
            {recent.map((r, i) => (
              <li key={i} className="list-row">
                <span className="icon">🕐</span>
                <span className="grow sub">{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="section">
        <div className="section-head">
          <h3>{results.length} results</h3>
          {liveSearching && <span className="see-all" style={{ color: 'var(--ink-soft)' }}>Searching live…</span>}
        </div>
        {results.length === 0 ? (
          <div className="empty-state">
            <div className="glyph">🍽️</div>
            <p>No matches yet — try different ingredients or fewer filters.</p>
          </div>
        ) : (
          <div className="grid-2">
            {results.map((r) => <RecipeCard key={r.id} recipe={r} grid />)}
          </div>
        )}
      </div>
    </div>
  );
}
