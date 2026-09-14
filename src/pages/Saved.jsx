import { useState } from 'react';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';

export default function Saved() {
  const { state, getRecipe, createFolder } = useApp();
  const [activeFolder, setActiveFolder] = useState('All');
  const [newFolder, setNewFolder] = useState('');
  const [showNew, setShowNew] = useState(false);

  const folderNames = ['All', ...Object.keys(state.folders)];
  const ids = activeFolder === 'All' ? state.savedIds : state.folders[activeFolder] || [];
  const recipes = ids.map(getRecipe).filter(Boolean);

  function addFolder() {
    if (!newFolder.trim()) return;
    createFolder(newFolder.trim());
    setActiveFolder(newFolder.trim());
    setNewFolder('');
    setShowNew(false);
  }

  return (
    <div className="screen">
      <h1>Saved</h1>

      <div className="section">
        <div className="chip-row">
          {folderNames.map((f) => (
            <span key={f} className={`chip ${activeFolder === f ? 'active' : ''}`} onClick={() => setActiveFolder(f)}>
              {f}
            </span>
          ))}
          <span className="chip" onClick={() => setShowNew((s) => !s)}>+ New folder</span>
        </div>
      </div>

      {showNew && (
        <div className="section" style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Recipes I want to try" value={newFolder} onChange={(e) => setNewFolder(e.target.value)} />
          <button className="btn btn-primary" onClick={addFolder}>Add</button>
        </div>
      )}

      <div className="section">
        {recipes.length === 0 ? (
          <div className="empty-state">
            <div className="glyph">❤️</div>
            <p>Nothing saved here yet. Tap the heart on any recipe to add it.</p>
          </div>
        ) : (
          <div className="grid-2">
            {recipes.map((r) => <RecipeCard key={r.id} recipe={r} grid />)}
          </div>
        )}
      </div>
    </div>
  );
}
