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
        }}>Mes Favoris</h1>

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          overflowX: 'auto', 
          paddingBottom: '24px', 
          scrollbarWidth: 'none',
          alignItems: 'center'
        }}>
          {folderNames.map((f) => (
            <span 
              key={f} 
              onClick={() => setActiveFolder(f)}
              style={{ 
                padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', 
                fontSize: '14px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.2s ease',
                backgroundColor: activeFolder === f ? '#F04A32' : '#211E19',
                color: activeFolder === f ? '#F4EBDD' : '#AAA39A',
                border: '1px solid #3A211C',
                whiteSpace: 'nowrap'
              }}
            >
              {f}
            </span>
          ))}
          <span 
            onClick={() => setShowNew((s) => !s)}
            style={{ 
              padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', 
              fontSize: '14px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif',
              backgroundColor: 'transparent', color: '#F04A32',
              border: '1px dashed #F04A32',
              whiteSpace: 'nowrap'
            }}
          >
            + Nouveau dossier
          </span>
        </div>

        {showNew && (
          <div style={{ 
            display: 'flex', gap: '12px', marginBottom: '32px', 
            backgroundColor: '#211E19', padding: '16px', borderRadius: '16px',
            border: '1px solid #3A211C'
          }}>
            <input 
              style={{ 
                flex: 1, padding: '12px', borderRadius: '12px', 
                backgroundColor: '#171512', border: '1px solid #3A211C', 
                color: '#F4EBDD', fontSize: '16px', fontFamily: 'DM Sans, sans-serif' 
              }} 
              placeholder="Nom du dossier..." 
              value={newFolder} 
              onChange={(e) => setNewFolder(e.target.value)} 
            />
            <button 
              onClick={addFolder}
              style={{ 
                padding: '12px 24px', borderRadius: '12px', 
                backgroundColor: '#F04A32', color: '#F4EBDD', 
                border: 'none', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif'
              }}
            >
              Ajouter
            </button>
          </div>
        )}

        <div style={{ padding: '0 0 80px 0' }}>
          {recipes.length === 0 ? (
            <div style={{ 
              textAlign: 'center', padding: '60px 0', color: '#AAA39A',
              fontFamily: 'DM Sans, sans-serif'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>❤️</div>
              <p>Aucune recette sauvegardée ici pour le moment.</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Explorez des recettes et appuyez sur le cœur pour les ajouter.</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
              gap: '20px' 
            }}>
              {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
