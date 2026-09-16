import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';
import { findMealsByIngredients } from '../data/mealdb';
import { askAI } from '../data/aiService';
import { Camera } from '@capacitor/camera';

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
      <h1 style={{ marginBottom: 10 }}>Créer & Scanner</h1>
      <div className="section">
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
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
      if (error?.message && error.message.includes('cancelled')) {
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
      <div className="card" style={{ padding: 22, textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>📸</div>
        <h3 style={{ marginTop: 10 }}>Prendre un plat en photo</h3>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 6 }}>
          Prenez une photo d'un plat et Mealio l'identifiera pour vous.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
          <button className="btn btn-primary" onClick={() => captureImage('camera')}>
            📷 Caméra
          </button>
          <button className="btn btn-secondary" onClick={() => captureImage('gallery')}>
            🖼️ Galerie
          </button>
        </div>
      </div>

      {loading && <div className="empty-state"><div className="glyph">🔍</div><p>Identification du plat en cours…</p></div>}

      {result && (
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)' }}>“Ceci ressemble à {result.name}.”</p>
            {aiSource && <span className="sub" style={{ fontSize: 10, opacity: 0.6 }}>via {aiSource}</span>}
          </div>
          <div style={{ marginTop: 12 }}>
            <RecipeCard recipe={result} />
          </div>
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
      <div className="card" style={{ padding: 22, textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🧊</div>
        <h3 style={{ marginTop: 10 }}>Qu'y a-t-il dans mon frigo ?</h3>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 6 }}>
          Photographiez votre frigo et nous trouverons quoi cuisiner.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
          <button className="btn btn-primary" onClick={() => captureImage('camera')}>
            📷 Caméra
          </button>
          <button className="btn btn-secondary" onClick={() => captureImage('gallery')}>
            🖼️ Galerie
          </button>
        </div>
      </div>

      {loading && <div className="empty-state"><div className="glyph">🔍</div><p>Analyse du frigo…</p></div>}

      {found && (
        <>
          <div className="section">
            <div className="section-head">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Ingrédients trouvés {aiSource && <span className="sub" style={{ fontSize: 12, opacity: 0.6 }}>via {aiSource}</span>}
              </h3>
            </div>
            <div className="chip-row">
              {found.items.map((i) => <span key={i} className="chip">{i}</span>)}
            </div>
          </div>
          <div className="section">
            <div className="section-head"><h3>Plats suggérés</h3></div>
            {found.matches.length > 0 ? (
              found.matches.map(({ r, pct }) => (
                <div key={r.id} style={{ marginBottom: 10 }}>
                  <RecipeCard recipe={r} matchPct={pct} wide />
                </div>
              ))
            ) : (
              <p className="sub">Aucun match exact trouvé, essayez une recherche manuelle !</p>
            )}
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
      <p style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>Listez vos ingrédients, séparés par des virgules.</p>
      <div style={{ marginTop: 10 }}>
        <input
          className="input"
          placeholder="Poulet, riz, tomates, fromage"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={findMatches}>
        Trouver des plats
      </button>

      {loading && <div className="empty-state"><div className="glyph">🔍</div><p>Recherche de recettes réelles…</p></div>}

      {matches && !loading && (
        <div className="section">
          <div className="section-head"><h3>Suggestions</h3></div>
          {matches.map(({ r, pct }) => (
            <div key={r.id} style={{ marginBottom: 10 }}>
              <RecipeCard recipe={r} matchPct={pct} wide />
            </div>
          ))}
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
      <label className="sub">Nom de la recette</label>
      <input className="input" style={{ marginTop: 6 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Les pâtes de Grand-mère" />

      <div className="grid-2" style={{ marginTop: 12 }}>
        <div>
          <label className="sub">Temps (min)</label>
          <input className="input" style={{ marginTop: 6 }} type="number" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div>
          <label className="sub">Portions</label>
          <input className="input" style={{ marginTop: 6 }} type="number" value={servings} onChange={(e) => setServings(e.target.value)} />
        </div>
      </div>

      <label className="sub" style={{ display: 'block', marginTop: 12 }}>Difficulté</label>
      <div className="chip-row" style={{ marginTop: 6 }}>
        {['Easy', 'Medium', 'Hard'].map((d) => (
          <span key={d} className={`chip ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</span>
        ))}
      </div>

      <div className="divider" />

      <label className="sub">Notes brutes (Mealio va les organiser)</label>
      <textarea
        className="input"
        style={{ marginTop: 6 }}
        placeholder="Poulet, ail, poêle, cuire, ajouter tomate, pâtes…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={cleanUpWithAI} disabled={loading}>
        {loading ? 'Organisation...' : '✨ Organiser avec Mealio'}
      </button>

      {structured && (
        <div className="section">
          <div className="section-head"><h3>Aperçu</h3></div>
          <div className="card" style={{ padding: 14 }}>
            <strong>Ingrédients</strong>
            <ul style={{ marginTop: 6 }}>
              {structured.ingredients.map((i, idx) => <li key={idx} className="sub">• {i.name}</li>)}
            </ul>
            <strong style={{ display: 'block', marginTop: 10 }}>Étapes</strong>
            <ol style={{ marginTop: 6, paddingLeft: 18 }}>
              {structured.steps.map((s, idx) => <li key={idx} className="sub" style={{ marginBottom: 4 }}>{s}</li>)}
            </ol>
          </div>
        </div>
      )}

      <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={saveRecipe}>
        Enregistrer la recette
      </button>
    </div>
  );
}
