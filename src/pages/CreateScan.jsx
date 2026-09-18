import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Camera, Refrigerator, ListPlus, PlusCircle, Loader2, AlertCircle } from 'lucide-react';
import { Camera as CapCamera, CameraSource } from '@capacitor/camera';
import AmbientBackground from '../components/AmbientBackground';
import { imageToBase64 } from '../utils/imageHelper';

const MODES = {
  SNAP: { id: 'snap', label: 'Snap a Meal', icon: Camera, color: 'var(--accent)' },
  FRIDGE: { id: 'fridge', label: 'Fridge Scan', icon: Refrigerator, color: '#4CAF50' },
  INGREDIENTS: { id: 'ingredients', label: 'Ingredients', icon: ListPlus, color: '#FFC107' },
  CREATE: { id: 'create', label: 'Create Recipe', icon: PlusCircle, color: '#2196F3' },
};

export default function CreateScan() {
  const { t, analyzeImage, saveRecipe } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('snap');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [currentIng, setCurrentIng] = useState('');

  const handleCapture = async (sourceType = 'camera') => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const options = {
        quality: 90,
        allowEditing: false,
        resultType: 'uri',
        source: sourceType === 'camera' ? CameraSource.Camera : CameraSource.Photos
      };

      const photo = await CapCamera.getPhoto(options);

      if (!photo) return;

      // Conversion critique pour l'APK : webPath -> Base64
      const base64Image = await imageToBase64(photo.webPath);
      
      // Appel au backend AI
      const prompt = mode === 'snap' 
        ? "Identify this meal and provide cooking tips." 
        : "List all ingredients visible in this fridge photo.";
      
      const analysis = await analyzeImage(base64Image, prompt);
      setResult(analysis);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError(err.message || "L'IA n'a pas pu analyser l'image. Essayez une photo plus nette.");
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    if (currentIng.trim()) {
      setIngredients([...ingredients, currentIng.trim()]);
      setCurrentIng('');
    }
  };

  return (
    <div className="screen" style={{ position: 'relative', width: '100%', backgroundColor: 'transparent' }}>
      <AmbientBackground />
      
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 0' }}>
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'var(--fs-h1)', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {MODES[mode.toUpperCase()]?.label}
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', overflowX: 'auto', padding: '0 10px' }}>
            {Object.values(MODES).map((m) => (
              <button 
                key={m.id}
                onClick={() => { setMode(m.id); setResult(null); setError(null); }}
                style={{ 
                  padding: '8px 16px', borderRadius: 'var(--r-pill)', 
                  background: mode === m.id ? 'var(--accent)' : 'var(--bg-card)',
                  color: mode === m.id ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '600', transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </header>

        <main style={{ padding: '0 var(--padding-screen)' }}>
          {mode === 'snap' || mode === 'fridge' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              {!result && !loading && (
                <div style={{ 
                  width: '100%', aspectRatio: '4/3', backgroundColor: 'var(--bg-card)', 
                  borderRadius: 'var(--r-lg)', border: '2px dashed var(--border-color)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', gap: '16px'
                }}>
                  <Camera size={48} />
                  <p>{t('createScan.capturePrompt') || 'Prenez une photo pour commencer'}</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleCapture('camera')} className="btn-premium btn-primary">
                      Appareil Photo
                    </button>
                    <button onClick={() => handleCapture('gallery')} className="btn-premium btn-secondary">
                      Galerie
                    </button>
                  </div>
                </div>
              )}

              {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader2 size={40} className="loader" style={{ color: 'var(--accent)', marginBottom: '16px' }} />
                  <p style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    {mode === 'snap' ? 'Analyse du plat...' : 'Inventaire du frigo...'}
                  </p>
                </div>
              )}

              {error && (
                <div style={{ 
                  backgroundColor: 'rgba(240, 74, 50, 0.1)', border: '1px solid var(--accent)', 
                  color: '#ff8a7a', padding: '16px', borderRadius: 'var(--r-md)', 
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%' 
                }}>
                  <AlertCircle size={20} />
                  <p style={{ fontSize: 'var(--fs-body)' }}>{error}</p>
                </div>
              )}

              {result && (
                <div className="recipe-card-premium" style={{ padding: '24px', width: '100%' }}>
                  <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>Résultats de l'IA :</h3>
                  <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {result}
                  </p>
                  <button 
                    onClick={() => setMode('ingredients')} 
                    className="btn-premium btn-primary" 
                    style={{ marginTop: '20px', width: '100%' }}
                  >
                    Utiliser ces ingrédients
                  </button>
                </div>
              )}
            </div>
          ) : mode === 'ingredients' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  value={currentIng}
                  onChange={(e) => setCurrentIng(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                  placeholder="Ex: Poulet, Riz..."
                  style={{ 
                    flex: 1, padding: '14px', borderRadius: 'var(--r-md)', 
                    border: '1px solid var(--border-color)', background: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button onClick={addIngredient} className="btn-premium btn-primary">
                  <PlusCircle size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ingredients.map((ing, i) => (
                  <span key={i} style={{ 
                    padding: '6px 12px', borderRadius: 'var(--r-pill)', 
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)', fontSize: 'var(--fs-small)',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    {ing}
                    <span onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} style={{ cursor: 'pointer', color: 'var(--accent)' }}>×</span>
                  </span>
                ))}
              </div>
              {ingredients.length > 0 && (
                <button 
                  onClick={() => navigate('/search')} 
                  className="btn-premium btn-primary" 
                  style={{ width: '100%', marginTop: '20px' }}
                >
                  Trouver des recettes
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="auth-field">
                <label>Nom de la recette</label>
                <input placeholder="Ex: Lasagnes Maison" style={{ padding: '14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
              </div>
              <div className="auth-field">
                <label>Ingrédients</label>
                <textarea rows="4" placeholder="1. 500g de viande..." style={{ padding: '14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
              </div>
              <div className="auth-field">
                <label>Instructions</label>
                <textarea rows="6" placeholder="Étape 1 : Préchauffer le four..." style={{ padding: '14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
              </div>
              <button className="btn-premium btn-primary" style={{ width: '100%', padding: '16px' }}>
                Enregistrer la recette
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
