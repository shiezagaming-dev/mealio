import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';
import { findMealsByIngredients } from '../data/mealdb';
import { askAI } from '../data/aiService';
import { Camera, CameraRoll } from '@capacitor/camera';
import { IonicException } from '@capacitor/core';

const TABS = [
  { id: 'scan', label: '📸 Snap' },
  { id: 'fridge', label: '🧊 Fridge' },
  { id: 'ingredients', label: '🥕 Ingredients' },
  { id: 'own', label: '🧑‍🍳 Create' },
];

async function compressImage(base64Data, maxWidth = 800) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Data;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
}

export default function CreateScan() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'scan');

  return (
    <div className="screen">
      <h1 style={{ fontSize: '32px', marginBottom: 'var(--space-lg)' }}>Créer & Scanner</h1>
      <div className="section" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="tabs" style={{ 
          background: 'var(--bg-card)', padding: '6px', borderRadius: 'var(--r-pill)', 
          border: '1px solid var(--border-color)', display: 'flex', gap: '4px' 
        }}>
          {TABS.map((t) => (
            <button 
              key={t.id} 
              className="btn-premium" 
              style={{ 
                flex: 1, border: 'none', background: tab === t.id ? 'var(--accent)' : 'transparent', 
                color: tab === t.id ? 'white' : 'var(--text-secondary)', 
                borderRadius: 'var(--r-pill)', fontSize: '13px', padding: '8px 0' 
              }} 
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {tab === 'scan' && <SnapMeal />}
      {tab === 'fridge' && <FridgeScan />}
      {tab === 'ingredients' && <FromIngredients />}
      {tab === 'own' && <CreateOwnRecipe />}
    </div>
  );
}

function SnapMeal() {
  const { allRecipes, logScan } = useApp();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiSource, setAiSource] = useState(null);

  async function captureImage(source = 'camera') {
    setLoading(true);
    setResult(null);
    setAiSource(null);

    try {
      let photo;
      if (source === 'camera') {
        photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: 'base64',
          source: 'CAMERA'
        });
      } else {
        photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: 'base64',
          source: 'PHOTOS'
        });
      }

      const base64 = `data:image/jpeg;base64,${photo.base64String}`;
      const compressed = await compressImage(base64);
      
      const { text, source: src } = await askAI(
        [{ role: 'user', content: 'Identify this food dish. Return ONLY the short name of the dish (e.g. "Creamy Tomato Pasta"), nothing else.' }],
        { vision: true, imageBase64: compressed }
      );
      
      setAiSource(src);
      const dishName = text.trim();
      const pool = allRecipes();
      
      const match = pool.find(r => dishName.toLowerCase().includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(dishName.toLowerCase()));
      
      if (match) {
        setResult(match);
      } else {
        setResult({ name: dishName, emoji: '🍽️', color: '#F3E9D2', ingredients: [], steps: [], time: '?', difficulty: '?', servings: '?' });
      }
      
      logScan(`Scanned ${dishName}`);
    } catch (error) {
      if (error instanceof IonicException && error.message === 'User cancelled photos app') {
        console.log('User cancelled');
      } else {
        console.error("Camera Error:", error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section">
      <div className="recipe-card-premium" style={{ padding: 'var(--space-xl)', textAlign: 'center', cursor: 'default' }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--space-md)' }}>📸</div>
        <h3 style={{ fontSize: '22px', marginBottom: 'var(--space-sm)' }}>Prendre un plat en photo</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: 'var(--space-lg)', lineHeight: '1.6' }}>
          Prenez une photo d'un plat et Mealio l'identifiera pour vous grâce à l'IA.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
          <button className="btn-premium btn-primary" onClick={() => captureImage('camera')}>
            📷 Caméra
          </button>
          <button className="btn-premium btn-secondary" onClick={() => captureImage('gallery')}>
            🖼️ Galerie
          </button>
        </div>
      </div>

      {loading && <div className="empty-state"><div className="glyph">🔍</div><p>Identification du plat en cours…</p></div>}

      {result && (
        <div className="section" style={{ marginTop: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>“Ceci ressemble à {result.name}.”</p>
            {aiSource && <span style={{ fontSize: '10px', opacity: 0.6, fontWeight: '700' }}>via {aiSource}</span>}
          </div>
          <RecipeCard recipe={result} />
        </div>
      )}
    </div>
  );
}

function FridgeScan() {
  const { allRecipes, logScan } = useApp();
  const [found, setFound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiSource, setAiSource] = useState(null);

  async function captureImage(source = 'camera') {
    setLoading(true);
    setFound(null);
    setAiSource(null);

    try {
      let photo;
      if (source === 'camera') {
        photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: 'base64',
          source: 'CAMERA'
        });
      } else {
        photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: 'base64',
          source: 'PHOTOS'
        });
      }

      const base64 = `data:image/jpeg;base64,${photo.base64String}`;
      const compressed = await compressImage(base64);

      const { text, source: src } = await askAI(
        [{ role: 'user', content: 'List the visible food ingredients in this photo as a short comma-separated list. Return ONLY the list.' }],
        { vision: true, imageBase64: compressed }
      );
      
      setAiSource(src);
      const ingredients = text.split(',').map(i => i.trim()).filter(Boolean);
      const matches = await findMealsByIngredients(ingredients);
      
      setFound({ items: ingredients, matches });
      logScan('Scanned the fridge', '🧊');
    } catch (error) {
      console.error("Camera Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section">
      <div className="recipe-card-premium" style={{ padding: 'var(--space-xl)', textAlign: 'center', cursor: 'default' }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--space-md)' }}>🧊</div>
        <h3 style={{ fontSize: '22px', marginBottom: 'var(--space-sm)' }}>Qu'y a-t-il dans mon frigo ?</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: 'var(--space-lg)', lineHeight: '1.6' }}>
          Photographiez votre frigo et nous trouverons quoi cuisiner avec vos restes.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
          <button className="btn-premium btn-primary" onClick={() => captureImage('camera')}>
            📷 Caméra
          </button>
          <button className="btn-premium btn-secondary" onClick={() => captureImage('gallery')}>
            🖼️ Galerie
          </button>
        </div>
      </div>

      {loading && <div className="empty-state"><div className="glyph">🔍</div><p>Analyse du frigo…</p></div>}

      {found && (
        <>
          <div className="section" style={{ marginTop: 'var(--space-xl)' }}>
            <div className="section-header-premium">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Ingrédients trouvés {aiSource && <span style={{ fontSize: '12px', opacity: 0.6, fontWeight: '400' }}>via {aiSource}</span>}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', overflowX: 'auto', paddingBottom: 'var(--space-sm)' }}>
              {found.items.map((i) => (
                <span key={i} style={{ 
                  padding: '6px 14px', borderRadius: 'var(--r-pill)', 
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
                  fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' 
                }}>{i}</span>
              ))}
            </div>
          </div>
          <div className="section" style={{ marginTop: 'var(--space-md)' }}>
            <div className="section-header-premium">
              <h3>Plats suggérés</h3>
            </div>
            <div className="recipe-grid" style={{ gridTemplateColumns: '1fr' }}>
              {found.matches.length > 0 ? (
                found.matches.map(({ r, pct }) => (
                  <div key={r.id} style={{ marginBottom: 'var(--space-md)' }}>
                    <RecipeCard recipe={r} wide />
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Aucun match exact trouvé, essayez une recherche manuelle !</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FromIngredients() {
  const { allRecipes } = useApp();
  const [text, setText] = useState('');
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);

  async function findMatches() {
    const have = text.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
    if (!have.length) return;
    setLoading(true);

    const localScored = allRecipes().map((r) => {
      const ingredientNames = r.ingredients.map((i) => i.name.toLowerCase());
      const hits = have.filter((h) => ingredientNames.some((n) => n.includes(h) || h.includes(n)));
      const pct = Math.round((hits.length / Math.max(have.length, 1)) * 100);
      return { r, pct: Math.min(100, Math.max(pct, hits.length ? 45 : 10)) };
    }).filter((m) => m.pct > 0);

    const liveScored = await findMealsByIngredients(have);

    const combined = [...liveScored, ...localScored]
      .sort((a, b) => b.pct - a.pct)
      .filter((m, idx, arr) => arr.findIndex((x) => x.r.id === m.r.id) === idx)
      .slice(0, 8);

    setMatches(combined);
    setLoading(false);
  }

  return (
    <div className="section">
      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>Listez vos ingrédients, séparés par des virgules.</p>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <div className="search-bar-premium">
          <input
            placeholder="Poulet, riz, tomates, fromage..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
      <button className="btn-premium btn-primary btn-block" style={{ width: '100%', marginBottom: 'var(--space-xl)' }} onClick={findMatches}>
        Trouver des plats
      </button>

      {loading && <div className="empty-state"><div className="glyph">🔍</div><p>Recherche de recettes réelles…</p></div>}

      {matches && !loading && (
        <div className="section">
          <div className="section-header-premium">
            <h3>Suggestions</h3>
          </div>
          <div className="recipe-grid" style={{ gridTemplateColumns: '1fr' }}>
            {matches.map(({ r, pct }) => (
              <div key={r.id} style={{ marginBottom: 'var(--space-md)' }}>
                <RecipeCard recipe={r} wide />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateOwnRecipe() {
  const { addUserRecipe } = useApp();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [time, setTime] = useState(30);
  const [difficulty, setDifficulty] = useState('Easy');
  const [servings, setServings] = useState(2);
  const [structured, setStructured] = useState(null);
  const [loading, setLoading] = useState(false);

  async function cleanUpWithAI() {
    if (!notes.trim()) return;
    setLoading(true);
    try {
      const { text } = await askAI(
        [{ role: 'system', content: 'You are a recipe assistant. Convert rough notes into a structured JSON recipe. Return ONLY JSON.' },
         { role: 'user', content: `Convert these notes into JSON with "ingredients" (array of {name, qty, unit}) and "steps" (array of strings): ${notes}` }],
        { response_format: { type: 'json_object' } }
      );
      
      const parsed = JSON.parse(text);
      setStructured({
        ingredients: parsed.ingredients || [],
        steps: parsed.steps || [],
      });
    } catch (error) {
      console.error(error);
      const parts = notes.split(',').map((p) => p.trim()).filter(Boolean);
      const ingredients = parts.slice(0, Math.ceil(parts.length / 2)).map((p) => ({ name: p, qty: 1, unit: '' }));
      const steps = parts.slice(Math.ceil(parts.length / 2)).map((p) => `${p.charAt(0).toUpperCase()}${p.slice(1)}.`);
      setStructured({
        ingredients: ingredients.length ? ingredients : [{ name: 'Ingrédient principal', qty: 1, unit: '' }],
        steps: steps.length ? steps : ['Mélangez tout et faites cuire.'],
      });
    } finally {
      setLoading(false);
    }
  }

  function saveRecipe() {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      emoji: '🍽️',
      time: Number(time),
      difficulty,
      servings: Number(servings),
      cuisine: 'Ma Recette',
      ingredients: structured?.ingredients || [],
      steps: structured?.steps?.length ? structured.steps : ['Ajoutez vos étapes de cuisson.'],
    };
    const id = addUserRecipe(payload);
    navigate(`/recipe/${id}`);
  }

  return (
    <div className="section">
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Nom de la recette</label>
        <div className="search-bar-premium" style={{ marginTop: 'var(--space-xs)' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Les pâtes de Grand-mère" />
        </div>
      </div>

      <div className="recipe-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 'var(--space-md)' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Temps (min)</label>
          <div className="search-bar-premium" style={{ marginTop: 'var(--space-xs)' }}>
            <input type="number" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Portions</label>
          <div className="search-bar-premium" style={{ marginTop: 'var(--space-xs)' }}>
            <input type="number" value={servings} onChange={(e) => setServings(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-md)' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-xs)' }}>Difficulté</label>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {['Easy', 'Medium', 'Hard'].map((d) => (
            <span 
              key={d} 
              className="chip" 
              style={{ 
                padding: '8px 16px', borderRadius: 'var(--r-pill)', 
                background: difficulty === d ? 'var(--accent)' : 'var(--bg-card)', 
                color: difficulty === d ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '13px'
              }} 
              onClick={() => setDifficulty(d)}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border-color)', margin: 'var(--space-lg) 0' }} />

      <div style={{ marginBottom: 'var(--space-md)' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Notes brutes (Mealio va les organiser)</label>
        <div className="search-bar-premium" style={{ marginTop: 'var(--space-xs)', padding: 'var(--space-sm)' }}>
          <textarea
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontFamily: 'inherit', fontSize: '15px', minHeight: '100px', resize: 'none' }}
            placeholder="Poulet, ail, poêle, cuire, ajouter tomate, pâtes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
      <button className="btn-premium btn-secondary btn-block" style={{ width: '100%', marginBottom: 'var(--space-xl)' }} onClick={cleanUpWithAI} disabled={loading}>
        {loading ? 'Organisation...' : '✨ Organiser avec Mealio'}
      </button>

      {structured && (
        <div className="section" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="section-header-premium">
            <h3>Aperçu</h3>
          </div>
          <div className="recipe-card-premium" style={{ padding: 'var(--space-md)', cursor: 'default' }}>
            <strong style={{ fontSize: '15px', marginBottom: 'var(--space-sm)', display: 'block' }}>Ingrédients</strong>
            <ul style={{ paddingLeft: 'var(--space-md)', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
              {structured.ingredients.map((i, idx) => <li key={idx} style={{ marginBottom: '4px' }}>• {i.name}</li>)}
            </ul>
            <strong style={{ fontSize: '15px', marginBottom: 'var(--space-sm)', display: 'block' }}>Étapes</strong>
            <ol style={{ paddingLeft: 'var(--space-md)', fontSize: '14px', color: 'var(--text-secondary)' }}>
              {structured.steps.map((s, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{s}</li>)}
            </ol>
          </div>
        </div>
      )}

      <button className="btn-premium btn-primary btn-block" style={{ width: '100%', marginBottom: 'var(--space-xl)' }} onClick={saveRecipe}>
        Enregistrer la recette
      </button>
    </div>
  );
}
