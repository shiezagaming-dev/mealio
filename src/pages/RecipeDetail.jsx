import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { askAI } from '../data/aiService';

const REMIX_OPTIONS = [
  'Make it vegetarian', 'Make it vegan', 'Make it cheaper', 'Make it faster',
  'Make it easier', 'Make it spicier', 'Make it less spicy', 'Use only ingredients I have',
];

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrFetchFullRecipe, toggleSave, state, addToShoppingList } = useApp();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(2);
  const [remixResult, setRemixResult] = useState(null);
  const [customAsk, setCustomAsk] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const r = await getOrFetchFullRecipe(id);
      if (r) {
        setRecipe(r);
        setServings(r.servings || 2);
      }
      setLoading(false);
    }
    load();
  }, [id, getOrFetchFullRecipe]);

  const scale = recipe ? servings / recipe.servings : 1;

  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];
    return recipe.ingredients.map((i) => ({ ...i, qty: Math.round(i.qty * scale * 100) / 100 }));
  }, [recipe, scale]);

  if (loading) {
    return (
      <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="loading-spinner">Chargement de la recette... 🍳</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="screen">
        <div className="empty-state">
          <div className="glyph">🤷</div>
          <p>Recette non trouvée.</p>
          <button className="btn-premium btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/')}>Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  const isSaved = state.savedIds.includes(recipe.id);

  async function runRemix(option) {
    setLoadingAI(true);
    try {
      const prompt = `Recipe: ${recipe.name}. Ingredients: ${recipe.ingredients.map(i => i.name).join(', ')}. 
      Request: ${option}. Provide a concise rewritten suggestion (2-4 sentences) on how to adapt this recipe.`;
      
      const { text } = await askAI([{ role: 'user', content: prompt }]);
      setRemixResult(text);
    } catch (e) {
      setRemixResult("Je n'ai pas pu réécrire la recette pour le moment, mais essayez de remplacer la protéine principale par une alternative similaire !");
    } finally {
      setLoadingAI(false);
    }
  }

  async function askCustom() {
    if (!customAsk.trim()) return;
    setLoadingAI(true);
    try {
      const prompt = `Recipe: ${recipe.name}. User question: ${customAsk}. 
      Provide a concise, helpful answer (2-4 sentences).`;
      
      const { text } = await askAI([{ role: 'user', content: prompt }]);
      setRemixResult(text);
    } catch (e) {
      setRemixResult("J'ai du mal à répondre à cela. Essayez de vérifier la liste des ingrédients !");
    } finally {
      setLoadingAI(false);
      setCustomAsk('');
    }
  }

  return (
    <div style={{ background: 'var(--bg-warm)', minHeight: '100vh' }}>
      {/* HERO SECTION */}
      <div style={{ position: 'relative', height: '40vh', width: '100%', overflow: 'hidden' }}>
        <img 
          src={recipe.image || 'https://via.placeholder.com/800x600?text=Delicious+Food'} 
          alt={recipe.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'linear-gradient(to top, var(--bg-warm), transparent)' 
        }} />
        <div style={{ position: 'absolute', top: 'var(--space-md)', left: 'var(--space-md)' }}>
          <button 
            className="btn-premium btn-secondary" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }} 
            onClick={() => navigate(-1)}
          >
            ←
          </button>
        </div>
        <button 
          className="btn-premium btn-secondary" 
          style={{ 
            position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)', 
            width: '40px', height: '40px', borderRadius: '50%', padding: 0 
          }} 
          onClick={() => toggleSave(recipe.id)}
        >
          {isSaved ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h1 style={{ fontSize: '32px', marginBottom: 'var(--space-sm)' }}>{recipe.name}</h1>
          <div style={{ display: 'flex', gap: 'var(--space-md)', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
            <span>⏱️ {recipe.time} min</span>
            <span>•</span>
            <span>👨‍🍳 {recipe.difficulty}</span>
            <span>•</span>
            <span>🍽️ {servings} portions</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <button className="btn-premium btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/cook/${recipe.id}`)}>
            👨‍🍳 Commencer la cuisine
          </button>
          <button className="btn-premium btn-secondary" onClick={() => toggleSave(recipe.id)}>
            {isSaved ? 'Enregistré' : 'Enregistrer'}
          </button>
        </div>

        <div className="section" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="section-header-premium">
            <h3>Ingrédients</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', background: 'var(--bg-card)', padding: '4px 12px', borderRadius: 'var(--r-pill)', border: '1px solid var(--border-color)' }}>
              <button className="btn-premium" style={{ padding: '2px 8px', fontSize: '16px' }} onClick={() => setServings((s) => Math.max(1, s - 1))}>−</button>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{servings} portions</span>
              <button className="btn-premium" style={{ padding: '2px 8px', fontSize: '16px' }} onClick={() => setServings((s) => s + 1)}>+</button>
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', padding: 'var(--space-md)', boxShadow: 'var(--shadow-sm)' }}>
            {scaledIngredients.map((i, idx) => (
              <div key={idx} style={{ 
                display: 'flex', justifyContent: 'space-between', 
                padding: idx === 0 ? 0 : 'var(--space-sm) 0 var(--space-sm)', 
                borderTop: idx === 0 ? 'none' : '1px solid var(--border-color)',
                fontSize: '15px'
              }}>
                <span>{i.name}</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{i.qty} {i.unit}</span>
              </div>
            ))}
          </div>
          <button
            className="btn-premium btn-secondary btn-block"
            style={{ marginTop: 'var(--space-md)', width: '100%' }}
            onClick={() => addToShoppingList(scaledIngredients)}
          >
            🛒 Ajouter à la liste de courses
          </button>
        </div>

        <div className="section" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="section-header-premium">
            <h3>Instructions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {recipe.steps.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <span style={{ 
                  flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', 
                  background: 'var(--accent)', color: 'white', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' 
                }}>{idx + 1}</span>
                <p style={{ fontSize: '16px', color: 'var(--text-main)', lineHeight: '1.6' }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="section-header-premium">
            <h3>✨ Remix avec l'IA</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            {REMIX_OPTIONS.map((o) => (
              <span 
                key={o} 
                className="chip" 
                style={{ 
                  padding: '8px 16px', borderRadius: 'var(--r-pill)', 
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
                  fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' 
                }} 
                onClick={() => runRemix(o)}
              >
                {o}
              </span>
            ))}
          </div>
          <div className="search-bar-premium" style={{ marginBottom: 'var(--space-md)' }}>
            <input
              placeholder="Ex: Je n'ai pas de lait, par quoi le remplacer ?"
              value={customAsk}
              onChange={(e) => setCustomAsk(e.target.value)}
            />
            <button className="btn-premium btn-primary" style={{ padding: '8px 16px' }} onClick={askCustom} disabled={loadingAI}>
              {loadingAI ? '...' : 'Demander'}
            </button>
          </div>
          {remixResult && (
            <div style={{ 
              padding: 'var(--space-md)', borderRadius: 'var(--r-lg)', 
              background: 'var(--accent-soft)', borderLeft: '4px solid var(--accent)',
              fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.6'
            }}>
              {remixResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
