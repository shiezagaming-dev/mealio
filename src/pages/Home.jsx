import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';

export default function Home() {
  const navigate = useNavigate();
  const { allRecipes, state, liveLoading } = useApp();
  const recipes = allRecipes();
  const livePhotoCount = recipes.filter((r) => r.image).length;

  const trending = recipes.slice(0, 5);
  const popular = [...recipes].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
  const quick = recipes.filter((r) => r.time <= 20);
  const recommended = recipes.filter((r) => state.profile.cuisines.includes(r.cuisine)).slice(0, 5);

  function surpriseMe() {
    const pick = recipes[Math.floor(Math.random() * recipes.length)];
    navigate(`/recipe/${pick.id}`);
  }

  return (
    <div className="screen">
      <div className="greeting-eyebrow">Good to see you</div>
      <h1>{state.profile.username.split(' ')[0]}, what are we cooking?</h1>

      <div className="hero-card section" onClick={() => navigate('/create')}>
        <h2>📸 Snap a Meal</h2>
        <p>Photograph any dish — Mealio will identify it and hand you the recipe.</p>
        <button className="btn btn-secondary" style={{ marginTop: 14, background: 'white', color: 'var(--chili)' }}>
          Open camera
        </button>
      </div>

      <div className="grid-2 section">
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => navigate('/create?tab=ingredients')}>
          <div style={{ fontSize: 26 }}>🥕</div>
          <div style={{ fontWeight: 700, marginTop: 8 }}>Cook From Ingredients</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>Tell us what you have</div>
        </div>
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => navigate('/create?tab=fridge')}>
          <div style={{ fontSize: 26 }}>🧊</div>
          <div style={{ fontWeight: 700, marginTop: 8 }}>Fridge Scan</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>Photograph your fridge</div>
        </div>
      </div>

      {liveLoading && (
        <div className="section" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-soft)', fontSize: 13 }}>
          <span>🔄</span> Fetching real recipes and photos…
        </div>
      )}
      {!liveLoading && livePhotoCount > 0 && (
        <div className="section" style={{ color: 'var(--ink-soft)', fontSize: 12.5 }}>
          Showing {livePhotoCount} real recipes with photos, live from TheMealDB.
        </div>
      )}

      <Section title="🔥 Trending Recipes" recipes={trending} />
      <Section title="⭐ Popular This Week" recipes={popular} />
      {recommended.length > 0 && <Section title="🎯 Recommended For You" recipes={recommended} />}
      <Section title="⚡ Quick Meals (under 20 min)" recipes={quick} />

      <div className="section">
        <div className="section-head"><h3>🌱 Browse by Diet</h3></div>
        <div className="chip-row">
          {['Vegetarian', 'Vegan', 'Gluten-free', 'Budget'].map((d) => (
            <span key={d} className="chip" onClick={() => navigate(`/search?tag=${d.toLowerCase()}`)}>{d}</span>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head"><h3>🍰 Categories</h3></div>
        <div className="chip-row">
          {['Breakfast', 'Pasta', 'Pizza', 'Salads', 'Desserts', 'Dinner'].map((c) => (
            <span key={c} className="chip" onClick={() => navigate(`/search?tag=${c.toLowerCase()}`)}>{c}</span>
          ))}
        </div>
      </div>

      <div className="section" style={{ textAlign: 'center' }}>
        <button className="btn btn-basil" onClick={surpriseMe}>🎲 Surprise Me</button>
      </div>
    </div>
  );
}

function Section({ title, recipes }) {
  if (!recipes.length) return null;
  return (
    <div className="section">
      <div className="section-head"><h3>{title}</h3></div>
      <div className="h-scroll">
        {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
      </div>
    </div>
  );
}
