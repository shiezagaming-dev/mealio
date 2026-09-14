import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const REMIX_OPTIONS = [
  'Make it vegetarian', 'Make it vegan', 'Make it cheaper', 'Make it faster',
  'Make it easier', 'Make it spicier', 'Make it less spicy', 'Use only ingredients I have',
];

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipe, toggleSave, state, addToShoppingList } = useApp();
  const recipe = getRecipe(id);
  const [servings, setServings] = useState(recipe?.servings || 2);
  const [remixNote, setRemixNote] = useState('');
  const [remixResult, setRemixResult] = useState(null);
  const [customAsk, setCustomAsk] = useState('');

  const scale = recipe ? servings / recipe.servings : 1;

  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];
    return recipe.ingredients.map((i) => ({ ...i, qty: Math.round(i.qty * scale * 100) / 100 }));
  }, [recipe, scale]);

  if (!recipe) {
    return (
      <div className="screen">
        <div className="empty-state">
          <div className="glyph">🤷</div>
          <p>Recipe not found.</p>
          <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/')}>Go home</button>
        </div>
      </div>
    );
  }

  const isSaved = state.savedIds.includes(recipe.id);

  function runRemix(option) {
    let note = '';
    switch (option) {
      case 'Make it vegetarian':
        note = 'Swap any meat for a plant-based protein like tofu, chickpeas, or mushrooms.';
        break;
      case 'Make it vegan':
        note = 'Replace dairy with plant-based milk/cheese and any meat with a plant protein.';
        break;
      case 'Make it cheaper':
        note = 'Use budget staples: swap parmesan for a cheaper hard cheese and reduce meat by a third.';
        break;
      case 'Make it faster':
        note = `Pre-chop everything first and use a smaller cut of protein — should shave about ${Math.round(recipe.time * 0.3)} minutes off.`;
        break;
      case 'Make it easier':
        note = 'Skip optional garnishes and use pre-minced garlic and canned/pre-chopped vegetables.';
        break;
      case 'Make it spicier':
        note = 'Add extra chili flakes, a diced fresh chili, or a dash of hot sauce.';
        break;
      case 'Make it less spicy':
        note = 'Cut any chili in half and add a spoon of cream or yogurt to mellow the heat.';
        break;
      case 'Use only ingredients I have':
        note = 'Tell Mealio which ingredients you\'re missing and it will suggest a swap for each.';
        break;
      default:
        note = 'Here\'s a suggestion for that request.';
    }
    setRemixResult(note);
  }

  function askCustom() {
    if (!customAsk.trim()) return;
    setRemixResult(`For "${customAsk.trim()}" — try substituting with something similar in texture and moisture (e.g. plain yogurt or a neutral oil), adjusting quantity to taste.`);
    setCustomAsk('');
  }

  return (
    <div>
      <div className="back-row">
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={() => toggleSave(recipe.id)}>
          {isSaved ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="screen" style={{ paddingTop: 12 }}>
        <div className="thumb" style={{ background: recipe.color, height: 200, borderRadius: 'var(--r-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, overflow: 'hidden' }}>
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : recipe.emoji}
        </div>

        <h1 style={{ marginTop: 16 }}>{recipe.name}</h1>
        {recipe.source && (
          <a href={recipe.source} target="_blank" rel="noreferrer" className="sub" style={{ color: 'var(--chili)' }}>
            View original source ↗
          </a>
        )}
        <div className="meta" style={{ display: 'flex', gap: 14, marginTop: 6, color: 'var(--ink-soft)', fontSize: 13.5 }}>
          <span>⏱️ {recipe.time} min</span>
          <span>👨‍🍳 {recipe.difficulty}</span>
          <span>🍽️ {servings} servings</span>
          {recipe.rating && <span>⭐ {recipe.rating}</span>}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/cook/${recipe.id}`)}>
            👨‍🍳 Start Cooking
          </button>
          <button className="btn btn-secondary" onClick={() => toggleSave(recipe.id)}>
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className="section">
          <div className="section-head">
            <h3>Ingredients</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => setServings((s) => Math.max(1, s - 1))}>−</button>
              <span style={{ fontSize: 13 }}>{servings} servings</span>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => setServings((s) => s + 1)}>+</button>
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            {scaledIngredients.map((i, idx) => (
              <div key={idx} className="ingredient-row">
                <span>{i.name}</span>
                <span className="sub">{i.qty} {i.unit}</span>
              </div>
            ))}
          </div>
          <button
            className="btn btn-secondary btn-block"
            style={{ marginTop: 10 }}
            onClick={() => addToShoppingList(scaledIngredients)}
          >
            🛒 Add ingredients to shopping list
          </button>
        </div>

        <div className="section">
          <div className="section-head"><h3>Instructions</h3></div>
          <ol style={{ paddingLeft: 20 }}>
            {recipe.steps.map((s, idx) => (
              <li key={idx} className="sub" style={{ color: 'var(--ink)', marginBottom: 10, lineHeight: 1.5 }}>{s}</li>
            ))}
          </ol>
        </div>

        {recipe.nutrition && (
          <div className="section">
            <div className="section-head"><h3>Nutrition</h3></div>
            <div className="grid-2">
              <NutTile label="Calories" value={recipe.nutrition.calories} />
              <NutTile label="Protein" value={`${recipe.nutrition.protein}g`} />
              <NutTile label="Carbs" value={`${recipe.nutrition.carbs}g`} />
              <NutTile label="Fat" value={`${recipe.nutrition.fat}g`} />
            </div>
          </div>
        )}

        <div className="section">
          <div className="section-head"><h3>🔄 Remix This Recipe</h3></div>
          <div className="remix-grid">
            {REMIX_OPTIONS.map((o) => (
              <span key={o} className="chip" onClick={() => runRemix(o)}>{o}</span>
            ))}
          </div>
          <textarea
            className="input"
            style={{ marginTop: 12, minHeight: 60 }}
            placeholder={'"I don\'t have milk. What can I use instead?"'}
            value={customAsk}
            onChange={(e) => setCustomAsk(e.target.value)}
          />
          <button className="btn btn-secondary btn-block" style={{ marginTop: 8 }} onClick={askCustom}>
            Ask Mealio
          </button>
          {remixResult && (
            <div className="card" style={{ padding: 14, marginTop: 12, background: 'var(--basil-light)', border: 'none' }}>
              <p style={{ fontSize: 14 }}>{remixResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NutTile({ label, value }) {
  return (
    <div className="stat-tile">
      <div className="num" style={{ fontSize: 20 }}>{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}
