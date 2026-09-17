import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';

export default function Home() {
  const { state, allRecipes } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const recipes = allRecipes().slice(0, 6);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="screen" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* TOP AREA */}
      <div style={{ marginBottom: 'var(--space-xl)', padding: '0 var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '50%', 
            background: 'var(--accent-soft)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: '24px' 
          }}>
            {state.profile.avatar || '🧑‍🍳'}
          </div>
          <div>
            <h1 style={{ fontSize: '24px', lineHeight: '1.2', margin: 0 }}>{greeting}, {state.profile.username || 'Chef'} 👋</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Qu'avez-vous envie de cuisiner aujourd'hui ?</p>
          </div>
        </div>

        <div className="search-bar-premium">
          <span style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input 
            placeholder="Rechercher une recette, un ingrédient..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${search}`)}
          />
        </div>
      </div>

      {/* AI CHEF HERO */}
      <div className="ai-chef-hero" onClick={() => navigate('/ai-chef')} style={{ margin: '0 var(--space-md)', borderRadius: 'var(--r-lg)' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.9 }}>✨ Rencontrez votre Chef IA</div>
          <h2 style={{ color: 'white', fontSize: '22px', marginBottom: '8px' }}>Pas d'idées pour le repas ?</h2>
          <p style={{ color: 'white', opacity: 0.9, fontSize: '14px', marginBottom: '16px' }}>Dites à Mealio ce qu'il reste dans votre frigo et obtenez une recette personnalisée instantanément.</p>
          <button className="btn-premium btn-white">Demander au Chef IA →</button>
        </div>
        <div style={{ 
          position: 'absolute', right: '-20px', bottom: '-20px', 
          fontSize: '120px', opacity: 0.2, transform: 'rotate(-15deg)', pointerEvents: 'none' 
        }}>🍳</div>
      </div>

      {/* RECIPE DISCOVERY */}
      <div className="section" style={{ marginTop: 'var(--space-xl)', padding: '0 var(--space-md)' }}>
        <div className="section-header-premium">
          <h3 style={{ fontSize: '18px' }}>Recettes Populaires</h3>
          <span className="see-all" onClick={() => navigate('/search')}>Voir tout</span>
        </div>
        <div className="recipe-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
          gap: '16px' 
        }}>
          {recipes.map((r, i) => (
            <RecipeCard key={r.id || i} recipe={r} />
          ))}
        </div>
      </div>

      <div className="section" style={{ marginTop: 'var(--space-xl)', padding: '0 var(--space-md)', marginBottom: '80px' }}>
        <div className="section-header-premium">
          <h3 style={{ fontSize: '18px' }}>Rapide & Facile</h3>
          <span className="see-all" onClick={() => navigate('/search')}>Explorer</span>
        </div>
        <div className="recipe-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
          gap: '16px' 
        }}>
          {recipes.slice().reverse().map((r, i) => (
            <RecipeCard key={r.id || i} recipe={r} />
          ))}
        </div>
      </div>
    </div>
  );
}
