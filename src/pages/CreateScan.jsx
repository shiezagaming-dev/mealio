import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';
import { findMealsByIngredients } from '../data/mealdb';

const TABS = [
  { id: 'scan', label: '📸 Snap' },
  { id: 'fridge', label: '🧊 Fridge' },
  { id: 'ingredients', label: '🥕 Ingredients' },
  { id: 'own', label: '🧑‍🍳 Create' },
];

export default function CreateScan() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'scan');

  return (
    <div className="screen">
      <h1>Create &amp; Scan</h1>
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
  const fileRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    // Simulated recognition — swap this for a real vision model call (see README).
    setTimeout(() => {
      const pool = allRecipes();
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setResult(pick);
      logScan(`Scanned ${pick.name}`);
      setLoading(false);
    }, 1100);
  }

  return (
    <div className="section">
      <div className="card" style={{ padding: 22, textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>📸</div>
        <h3 style={{ marginTop: 10 }}>Snap a Meal</h3>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 6 }}>
          Take or upload a photo of any dish and Mealio will identify it.
        </p>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => fileRef.current?.click()}>
          Take / upload photo
        </button>
      </div>

      {loading && <div className="empty-state"><div className="glyph">🔍</div><p>Identifying your dish…</p></div>}

      {result && (
        <div className="section">
          <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)' }}>“This looks like {result.name}.”</p>
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
  const fileRef = useRef(null);
  const [found, setFound] = useState(null);
  const [loading, setLoading] = useState(false);

  const sampleSets = [
    ['🥚 Eggs', '🧀 Cheese', '🍅 Tomatoes', '🍗 Chicken', '🥬 Lettuce'],
    ['🍚 Rice', '🍗 Chicken', '🧅 Onion', '🍅 Tomatoes'],
    ['🍝 Pasta', '🧄 Garlic', '🍅 Canned tomatoes', '🧀 Parmesan'],
  ];

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setFound(null);
    setTimeout(() => {
      const items = sampleSets[Math.floor(Math.random() * sampleSets.length)];
      const pool = allRecipes()
        .map((r) => ({ r, match: Math.floor(60 + Math.random() * 40) }))
        .sort((a, b) => b.match - a.match)
        .slice(0, 3);
      setFound({ items, matches: pool });
      logScan('Scanned the fridge', '🧊');
      setLoading(false);
    }, 1100);
  }

  return (
    <div className="section">
      <div className="card" style={{ padding: 22, textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🧊</div>
        <h3 style={{ marginTop: 10 }}>What's In My Fridge?</h3>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 6 }}>
          Photograph your fridge or pantry and we'll find what you can cook.
        </p>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => fileRef.current?.click()}>
          Take / upload photo
        </button>
      </div>

      {loading && <div className="empty-state"><div className="glyph">🔍</div><p>Looking through your fridge…</p></div>}

      {found && (
        <>
          <div className="section">
            <div className="section-head"><h3>We found</h3></div>
            <div className="chip-row">
              {found.items.map((i) => <span key={i} className="chip">{i}</span>)}
            </div>
          </div>
          <div className="section">
            <div className="section-head"><h3>Meals you can make</h3></div>
            {found.matches.map(({ r, match }) => (
              <div key={r.id} style={{ marginBottom: 10 }}>
                <RecipeCard recipe={r} matchPct={match} wide />
              </div>
            ))}
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

    // Local mock-data match (always available, works offline).
    const localScored = allRecipes().map((r) => {
      const ingredientNames = r.ingredients.map((i) => i.name.toLowerCase());
      const hits = have.filter((h) => ingredientNames.some((n) => n.includes(h) || h.includes(n)));
      const pct = Math.round((hits.length / Math.max(have.length, 1)) * 100);
      return { r, pct: Math.min(100, Math.max(pct, hits.length ? 45 : 10)) };
    }).filter((m) => m.pct > 0);

    // Real recipes with real photos, matched by first ingredient via TheMealDB.
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
      <p style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>List what you have, separated by commas.</p>
      <div style={{ marginTop: 10 }}>
        <input
          className="input"
          placeholder="Chicken, rice, tomatoes, cheese"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={findMatches}>
        Find meals
      </button>

      {loading && <div className="empty-state"><div className="glyph">🔍</div><p>Matching real recipes to your ingredients…</p></div>}

      {matches && !loading && (
        <div className="section">
          <div className="section-head"><h3>Suggested meals</h3></div>
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

  function cleanUpWithAI() {
    if (!notes.trim()) return;
    // Simulated "messy notes -> structured recipe" transform.
    // Swap for a real LLM call (Ollama / OpenRouter) — see README.
    const parts = notes.split(',').map((p) => p.trim()).filter(Boolean);
    const ingredients = parts.slice(0, Math.ceil(parts.length / 2)).map((p) => ({ name: p, qty: 1, unit: '' }));
    const steps = parts.slice(Math.ceil(parts.length / 2)).map((p) => `${p.charAt(0).toUpperCase()}${p.slice(1)}.`);
    setStructured({
      ingredients: ingredients.length ? ingredients : [{ name: 'Main ingredient', qty: 1, unit: '' }],
      steps: steps.length ? steps : ['Combine everything and cook until done.'],
    });
  }

  function saveRecipe() {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      emoji: '🍽️',
      time: Number(time),
      difficulty,
      servings: Number(servings),
      cuisine: 'My Recipe',
      ingredients: structured?.ingredients || [],
      steps: structured?.steps?.length ? structured.steps : ['Add your cooking steps.'],
    };
    const id = addUserRecipe(payload);
    navigate(`/recipe/${id}`);
  }

  return (
    <div className="section">
      <label className="sub">Recipe name</label>
      <input className="input" style={{ marginTop: 6 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Grandma's chicken pasta" />

      <div className="grid-2" style={{ marginTop: 12 }}>
        <div>
          <label className="sub">Time (min)</label>
          <input className="input" style={{ marginTop: 6 }} type="number" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div>
          <label className="sub">Servings</label>
          <input className="input" style={{ marginTop: 6 }} type="number" value={servings} onChange={(e) => setServings(e.target.value)} />
        </div>
      </div>

      <label className="sub" style={{ display: 'block', marginTop: 12 }}>Difficulty</label>
      <div className="chip-row" style={{ marginTop: 6 }}>
        {['Easy', 'Medium', 'Hard'].map((d) => (
          <span key={d} className={`chip ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</span>
        ))}
      </div>

      <div className="divider" />

      <label className="sub">Rough notes (Mealio will tidy them up)</label>
      <textarea
        className="input"
        style={{ marginTop: 6 }}
        placeholder="Chicken, garlic, put pan, cook, add tomato, pasta…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={cleanUpWithAI}>
        ✨ Tidy up with Mealio
      </button>

      {structured && (
        <div className="section">
          <div className="section-head"><h3>Preview</h3></div>
          <div className="card" style={{ padding: 14 }}>
            <strong>Ingredients</strong>
            <ul style={{ marginTop: 6 }}>
              {structured.ingredients.map((i, idx) => <li key={idx} className="sub">• {i.name}</li>)}
            </ul>
            <strong style={{ display: 'block', marginTop: 10 }}>Steps</strong>
            <ol style={{ marginTop: 6, paddingLeft: 18 }}>
              {structured.steps.map((s, idx) => <li key={idx} className="sub" style={{ marginBottom: 4 }}>{s}</li>)}
            </ol>
          </div>
        </div>
      )}

      <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={saveRecipe}>
        Save recipe
      </button>
    </div>
  );
}
