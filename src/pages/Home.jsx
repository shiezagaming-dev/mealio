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
      <div className="greeting-eyebrow">Ravi de vous revoir</div>
      <h1>{state.profile.username.split(' ')[0]}, on cuisine quoi ?</h1>

      {/* AI CHEF PROMINENT CARD */}
      <div className="card section" style={{ 
        background: 'linear-gradient(135deg, var(--brand-color), #ff6b6b)', 
        color: 'white', 
        padding: '24px', 
        cursor: 'pointer',
        border: 'none',
        boxShadow: '0 8px 20px rgba(255, 107, 107, 0.3)'
      }} onClick={() => navigate('/ai-chef')}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✨ AI Chef</div>
        <h2 style={{ color: 'white', marginBottom: '8px' }}>Besoin d'inspiration ?</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '16px' }}>
          Demandez au Chef IA des idées, des substitutions ou des recettes personnalisées.
        </p>
        <div className="btn btn-primary" style={{ 
          background: 'white', 
          color: 'var(--brand-color)', 
          width: 'fit-content', 
          padding: '8px 16px',
          fontSize: '14px'
        }}>
          Interroger le Chef →
        </div>
      </div>

      <div className="hero-card section" onClick={() => navigate('/create')}>
        <h2 style={{ marginBottom: '8px' }}>📸 Scanner un plat</h2>
        <p>Prenez une photo d'un plat et Mealio identifiera la recette pour vous.</p>
        <button className="btn btn-secondary" style={{ marginTop: 14, background: 'white', color: 'var(--chili)' }}>
          Ouvrir la caméra
        </button>
      </div>

      <div className="grid-2 section">
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => navigate('/create?tab=ingredients')}>
          <div style={{ fontSize: 26 }}>🥕</div>
          <div style={{ fontWeight: 700, marginTop: 8 }}>Par ingrédients</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>Dites-nous ce que vous avez</div>
        </div>
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => navigate('/create?tab=fridge')}>
          <div style={{ fontSize: 26 }}>🧊</div>
          <div style={{ fontWeight: 700, marginTop: 8 }}>Scan Frigo</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>Photographiez votre frigo</div>
        </div>
      </div>

      {liveLoading && (
        <div className="section" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-soft)', fontSize: 13 }}>
          <span>🔄</span> Chargement des recettes réelles…
        </div>
      )}
      {!liveLoading && livePhotoCount > 0 && (
        <div className="section" style={{ color: 'var(--ink-soft)', fontSize: 12.5 }}>
          {livePhotoCount} recettes réelles disponibles via TheMealDB.
        </div>
      )}

      <Section title="🔥 Tendances" recipes={trending} />
      <Section title="⭐ Les plus populaires" recipes={popular} />
      {recommended.length > 0 && <Section title="🎯 Pour vous" recipes={recommended} />}
      <Section title="⚡ Rapide (moins de 20 min)" recipes={quick} />

      <div className="section">
        <div className="section-head"><h3 style={{ marginBottom: 10 }}>🌱 Régimes</div></h3>
        <div className="chip-row">
          {['Vegetarian', 'Vegan', 'Gluten-free', 'Budget'].map((d) => (
            <span key={d} className="chip" onClick={() => navigate(`/search?tag=${d.toLowerCase()}`)}>{d}</span>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head"><h3 style={{ marginBottom: 10 }}>🍰 Catégories</h3></div>
        <div className="chip-row">
          {['Breakfast', 'Pasta', 'Pizza', 'Salads', 'Desserts', 'Dinner'].map((c) => (
            <span key={c} className="chip" onClick={() => navigate(`/search?tag=${c.toLowerCase()}`)}>{c}</span>
          ))}
        </div>
      </div>

      <div className="section" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <button className="btn btn-basil" onClick={surpriseMe}>🎲 Surprise-moi !</button>
      </div>
    </div>
  );
}

function Section({ title, recipes }) {
  if (!recipes.length) return null;
  return (
    <div className="section">
      <div className="section-head"><h3 style={{ marginBottom: 10 }}>{title}</h3></div>
      <div className="h-scroll">
        {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
      </div>
    </div>
  );
}
