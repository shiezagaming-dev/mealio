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
          fontWeight: '700', 
          marginBottom: '32px' 
        }}>Créer & Scanner</h1>
        
        <div className="section" style={{ marginBottom: '40px' }}>
          <div style={{ 
            background: '#211E19', padding: '6px', borderRadius: '20px', 
            border: '1px solid #3A211C', display: 'flex', gap: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            {TABS.map((t) => (
              <button 
                key={t.id} 
                style={{ 
                  flex: 1, border: 'none', background: tab === t.id ? '#F04A32' : 'transparent', 
                  color: tab === t.id ? 'white' : '#AAA39A', 
                  borderRadius: '16px', fontSize: '13px', padding: '10px 0',
                  fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.2s ease'
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
    <div className="section" style={{ padding: '0 24px' }}>
      <div style={{ 
        backgroundColor: '#211E19', padding: '40px 24px', textAlign: 'center', 
        borderRadius: '32px', border: '1px solid #3A211C', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' 
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>📸</div>
        <h3 style={{ fontSize: '24px', fontFamily: 'Fraunces, serif', fontWeight: '700', marginBottom: '12px', color: '#F4EBDD' }}>Prendre un plat en photo</h3>
        <p style={{ color: '#AAA39A', fontSize: '16px', marginBottom: '32px', lineHeight: '1.6', fontFamily: 'DM Sans, sans-serif' }}>
          Prenez une photo d'un plat et Mealio l'identifiera pour vous grâce à l'IA.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={() => captureImage('camera')}
            style={{ 
              backgroundColor: '#F04A32', color: '#F4EBDD', border: 'none', 
              padding: '12px 24px', borderRadius: '16px', fontWeight: '700', 
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' 
            }}
          >
            📷 Caméra
          </button>
          <button 
            onClick={() => captureImage('gallery')}
            style={{ 
              backgroundColor: 'transparent', color: '#F4EBDD', border: '1px solid #3A211C', 
              padding: '12px 24px', borderRadius: '16px', fontWeight: '700', 
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' 
            }}
          >
            🖼️ Galerie
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#AAA39A', fontFamily: 'DM Sans, sans-serif' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p>Identification du plat en cours…</p>
        </div>
      )}

      {result && (
        <div className="section" style={{ marginTop: '40px', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ fontStyle: 'italic', color: '#AAA39A', fontFamily: 'DM Sans, sans-serif' }}>“Ceci ressemble à {result.name}.”</p>
            {aiSource && <span style={{ fontSize: '10px', opacity: 0.6, fontWeight: '700', color: '#AAA39A' }}>via {aiSource}</span>}
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
    <div className="section" style={{ padding: '0 24px' }}>
      <div style={{ 
        backgroundColor: '#211E19', padding: '40px 24px', textAlign: 'center', 
        borderRadius: '32px', border: '1px solid #3A211C', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' 
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🧊</div>
        <h3 style={{ fontSize: '24px', fontFamily: 'Fraunces, serif', fontWeight: '700', marginBottom: '12px', color: '#F4EBDD' }}>Qu'y a-t-il dans mon frigo ?</h3>
        <p style={{ color: '#AAA39A', fontSize: '16px', marginBottom: '32px', lineHeight: '1.6', fontFamily: 'DM Sans, sans-serif' }}>
          Photographiez votre frigo et nous trouverons quoi cuisiner avec vos restes.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={() => captureImage('camera')}
            style={{ 
              backgroundColor: '#F04A32', color: '#F4EBDD', border: 'none', 
              padding: '12px 24px', borderRadius: '16px', fontWeight: '700', 
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' 
            }}
          >
            📷 Caméra
          </button>
          <button 
            onClick={() => captureImage('gallery')}
            style={{ 
              backgroundColor: 'transparent', color: '#F4EBDD', border: '1px solid #3A211C', 
              padding: '12px 24px', borderRadius: '16px', fontWeight: '700', 
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' 
            }}
          >
            🖼️ Galerie
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#AAA39A', fontFamily: 'DM Sans, sans-serif' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p>Analyse du frigo…</p>
        </div>
      )}

      {found && (
        <>
          <div className="section" style={{ marginTop: '40px', padding: '0 24px' }}>
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' 
            }}>
              <h3 style={{ fontSize: '20px', fontFamily: 'Fraunces, serif', fontWeight: '600', color: '#F4EBDD' }}>
                Ingrédients trouvés {aiSource && <span style={{ fontSize: '12px', opacity: 0.6, fontWeight: '400', color: '#AAA39A' }}>via {aiSource}</span>}
              </h3>
            </div>
            <div style={{ 
              display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', 
              scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' 
            }}>
              {found.items.map((i) => (
                <span key={i} style={{ 
                  padding: '8px 16px', borderRadius: '20px', 
                  background: '#211E19', border: '1px solid #3A211C', 
                  fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
                  color: '#F4EBDD', fontFamily: 'DM Sans, sans-serif'
                }}>{i}</span>
              ))}
            </div>
          </div>
          <div className="section" style={{ marginTop: '32px', padding: '0 24px' }}>
            <h3 style={{ fontSize: '20px', fontFamily: 'Fraunces, serif', fontWeight: '600', marginBottom: '20px', color: '#F4EBDD' }}>Plats suggérés</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
              gap: '20px' 
            }}>
              {found.matches.length > 0 ? (
                found.matches.map(({ r, pct }) => (
                  <RecipeCard key={r.id} recipe={r} matchPct={pct} />
                ))
              ) : (
                <p style={{ color: '#AAA39A', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }}>Aucun match exact trouvé, essayez une recherche manuelle !</p>
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
    <div className="section" style={{ padding: '0 24px' }}>
      <p style={{ fontSize: '15px', color: '#AAA39A', marginBottom: '24px', fontFamily: 'DM Sans, sans-serif' }}>Listez vos ingrédients, séparés par des virgules.</p>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          position: 'relative', backgroundColor: '#211E19', borderRadius: '16px', 
          padding: '12px 20px', display: 'flex', alignItems: 'center',
          border: '1px solid #3A211C', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <span style={{ color: '#AAA39A', marginRight: '12px', fontSize: '20px' }}>🥕</span>
          <input
            placeholder="Poulet, riz, tomates, fromage..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ 
              backgroundColor: 'transparent', border: 'none', outline: 'none', 
              color: '#F4EBDD', fontSize: '16px', width: '100%',
              fontFamily: 'DM Sans, sans-serif'
            }}
          />
        </div>
      </div>
      <button 
        onClick={findMatches}
        style={{ 
          width: '100%', padding: '14px', borderRadius: '16px', 
          backgroundColor: '#F04A32', color: '#F4EBDD', border: 'none', 
          fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          marginBottom: '40px', transition: 'all 0.2s ease'
        }}
      >
        Trouver des plats
      </button>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#AAA39A', fontFamily: 'DM Sans, sans-serif' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p>Recherche de recettes réelles…</p>
        </div>
      )}

      {matches && !loading && (
        <div className="section">
          <h3 style={{ fontSize: '20px', fontFamily: 'Fraunces, serif', fontWeight: '600', marginBottom: '20px', color: '#F4EBDD' }}>Suggestions</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
            gap: '20px' 
          }}>
            {matches.map(({ r, pct }) => (
              <RecipeCard key={r.id} recipe={r} matchPct={pct} />
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
    <div className="section" style={{ padding: '0 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#AAA39A', display: 'block', marginBottom: '8px', fontFamily: 'DM Sans, sans-serif' }}>Nom de la recette</label>
        <div style={{ 
          position: 'relative', backgroundColor: '#211E19', borderRadius: '16px', 
          padding: '12px 20px', display: 'flex', alignItems: 'center',
          border: '1px solid #3A211C', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Les pâtes de Grand-mère" 
            style={{ 
              backgroundColor: 'transparent', border: 'none', outline: 'none', 
              color: '#F4EBDD', fontSize: '16px', width: '100%',
              fontFamily: 'DM Sans, sans-serif'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#AAA39A', display: 'block', marginBottom: '8px', fontFamily: 'DM Sans, sans-serif' }}>Temps (min)</label>
          <div style={{ 
            position: 'relative', backgroundColor: '#211E19', borderRadius: '16px', 
            padding: '12px 20px', border: '1px solid #3A211C'
          }}>
            <input type="number" value={time} onChange={(e) => setTime(e.target.value)} style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#F4EBDD', width: '100%', fontFamily: 'DM Sans, sans-serif' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#AAA39A', display: 'block', marginBottom: '8px', fontFamily: 'DM Sans, sans-serif' }}>Portions</label>
          <div style={{ 
            position: 'relative', backgroundColor: '#211E19', borderRadius: '16px', 
            padding: '12px 20px', border: '1px solid #3A211C'
          }}>
            <input type="number" value={servings} onChange={(e) => setServings(e.target.value)} style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#F4EBDD', width: '100%', fontFamily: 'DM Sans, sans-serif' }} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#AAA39A', display: 'block', marginBottom: '12px', fontFamily: 'DM Sans, sans-serif' }}>Difficulté</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Easy', 'Medium', 'Hard'].map((d) => (
            <span 
              key={d} 
              style={{ 
                flex: 1, textAlign: 'center', padding: '10px', borderRadius: '12px', cursor: 'pointer', 
                fontSize: '13px', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s ease',
                backgroundColor: difficulty === d ? '#F04A32' : '#211E19',
                color: difficulty === d ? '#F4EBDD' : '#AAA39A',
                border: '1px solid #3A211C'
              }} 
              onClick={() => setDifficulty(d)}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: '#3A211C', margin: '32px 0' }} />

      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#AAA39A', display: 'block', marginBottom: '12px', fontFamily: 'DM Sans, sans-serif' }}>Notes brutes (Mealio va les organiser)</label>
        <div style={{ 
          position: 'relative', backgroundColor: '#211E19', borderRadius: '16px', 
          padding: '16px', border: '1px solid #3A211C', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <textarea
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: '15px', minHeight: '120px', resize: 'none', color: '#F4EBDD' }}
            placeholder="Poulet, ail, poêle, cuire, ajouter tomate, pâtes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
      <button 
        className="btn-premium btn-secondary btn-block" 
        style={{ 
          width: '100%', padding: '14px', borderRadius: '16px', 
          backgroundColor: 'transparent', color: '#F4EBDD', border: '1px solid #3A211C', 
          fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          marginBottom: '40px', transition: 'all 0.2s ease'
        }} 
        onClick={cleanUpWithAI} disabled={loading}
      >
        {loading ? 'Organisation...' : '✨ Organiser avec Mealio'}
      </button>

      {structured && (
        <div className="section" style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '20px', fontFamily: 'Fraunces, serif', fontWeight: '600', marginBottom: '16px', color: '#F4EBDD' }}>Aperçu</h3>
          <div style={{ 
            backgroundColor: '#211E19', padding: '24px', borderRadius: '24px', 
            border: '1px solid #3A211C', color: '#F4EBDD' 
          }}>
            <strong style={{ fontSize: '15px', marginBottom: '12px', display: 'block', color: '#F04A32', fontFamily: 'DM Sans, sans-serif' }}>Ingrédients</strong>
            <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#AAA39A', marginBottom: '24px', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.6' }}>
              {structured.ingredients.map((i, idx) => <li key={idx} style={{ marginBottom: '4px' }}>• {i.name} {i.qty && `${i.qty}${i.unit}`}</li>)}
            </ul>
            <strong style={{ fontSize: '15px', marginBottom: '12px', display: 'block', color: '#F04A32', fontFamily: 'DM Sans, sans-serif' }}>Étapes</strong>
            <ol style={{ paddingLeft: '20px', fontSize: '14px', color: '#AAA39A', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.6' }}>
              {structured.steps.map((s, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{s}</li>)}
            </ol>
          </div>
        </div>
      )}

      <button 
        style={{ 
          width: '100%', padding: '16px', borderRadius: '16px', 
          backgroundColor: '#F04A32', color: '#F4EBDD', border: 'none', 
          fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          fontSize: '16px', marginBottom: '40px', transition: 'all 0.2s ease'
        }} 
        onClick={saveRecipe}
      >
        Enregistrer la recette
      </button>
    </div>
  );
}
