import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { askAI } from '../data/aiService';

const HOW_TO_KEYWORDS = {
  saute: 'Sauté signifie cuire les aliments rapidement dans un peu de matière grasse à feu vif, en remuant souvent.',
  simmer: 'Mijoter signifie maintenir un liquide juste en dessous du point d\'ébullition, avec de petites bulles douces.',
  fold: 'Incorporer délicatement signifie mélanger les ingrédients avec une spatule pour garder l\'air dans le mélange.',
  dice: 'Couper en dés signifie couper les aliments en petits cubes réguliers.',
  mince: 'Hacher finement signifie couper les aliments en morceaux très fins, généralement pour l\'ail ou les herbes.',
  whisk: 'Fouetter signifie battre les ingrédients vigoureusement pour les mélanger ou incorporer de l\'air.',
  knead: 'Pétrir signifie travailler la pâte avec les mains pour développer la structure du gluten.',
};

export default function CookMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipe, markCooked, showToast } = useApp();
  const recipe = getRecipe(id);
  const [stepIdx, setStepIdx] = useState(0);
  const [timerSec, setTimerSec] = useState(null);
  const [running, setRunning] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const intervalRef = useRef(null);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((wl) => (wakeLockRef.current = wl)).catch(() => {});
    }
    return () => {
      wakeLockRef.current?.release?.();
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (running && timerSec > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSec((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            showToast('⏰ Minuteur terminé !');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  if (!recipe) {
    return (
      <div className="screen">
        <div className="empty-state"><div className="glyph">🤷</div><p>Recette non trouvée.</p></div>
      </div>
    );
  }

  const total = recipe.steps.length;
  const step = recipe.steps[stepIdx];
  const isLast = stepIdx === total - 1;

  function speak(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
    }
  }

  function startTimer(minutes) {
    setTimerSec(minutes * 60);
    setRunning(true);
  }

  function next() {
    if (isLast) {
      markCooked(recipe);
      showToast('Bravo — repas enregistré ! 🎉');
      navigate(`/recipe/${recipe.id}`);
      return;
    }
    setStepIdx((s) => Math.min(total - 1, s + 1));
    setTimerSec(null);
    setRunning(false);
  }

  function prev() {
    setStepIdx((s) => Math.max(0, s - 1));
    setTimerSec(null);
    setRunning(false);
  }

  async function askMealio() {
    if (!question.trim()) return;
    const lower = question.toLowerCase();
    
    const hit = Object.keys(HOW_TO_KEYWORDS).find((k) => lower.includes(k));
    if (hit) {
      setAnswer(HOW_TO_KEYWORDS[hit]);
      setQuestion('');
      return;
    }

    setLoadingAI(true);
    try {
      const prompt = `You are a cooking assistant. The user is currently on step ${stepIdx + 1} of the recipe "${recipe.name}": "${step}". 
      The user asks: "${question}". Provide a concise, practical answer.`;
      
      const { text } = await askAI([{ role: 'user', content: prompt }]);
      setAnswer(text);
    } catch (e) {
      setAnswer(`Je ne suis pas sûr de cela, mais essayez de vérifier la liste des ingrédients ou un guide de cuisine !`);
    } finally {
      setLoadingAI(false);
      setQuestion('');
    }
  }

  return (
    <div className="screen" style={{ padding: 'var(--space-lg) var(--space-lg) 120px' }}>
      <div className="back-row" style={{ marginBottom: 'var(--space-md)' }}>
        <button className="btn-premium btn-secondary" style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }} onClick={() => navigate(-1)}>←</button>
        <h3 style={{ marginLeft: 'var(--space-md)' }}>{recipe.name}</h3>
      </div>

      <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: 'var(--r-pill)', overflow: 'hidden', marginBottom: 'var(--space-xl)' }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: `${((stepIdx + 1) / total) * 100}%`, transition: 'width 0.3s ease' }} />
      </div>

      <div style={{ 
        background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', padding: 'var(--space-xl)', 
        boxShadow: 'var(--shadow-md)', textAlign: 'center', marginBottom: 'var(--space-xl)' 
      }}>
        <div style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', marginBottom: 'var(--space-md)' }}>
          Étape {stepIdx + 1} sur {total}
        </div>
        <div style={{ fontSize: '24px', fontWeight: '600', lineHeight: '1.4', marginBottom: 'var(--space-xl)', color: 'var(--text-main)' }}>
          {step}
        </div>
        
        <button className="btn-premium btn-secondary" style={{ marginBottom: 'var(--space-xl)', width: '100%', justifyContent: 'center' }} onClick={() => speak(step)}>
          🔊 Lire à haute voix
        </button>

        {timerSec == null ? (
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[1, 3, 5, 10].map((m) => (
              <button key={m} className="btn-premium btn-secondary" style={{ fontSize: '13px' }} onClick={() => startTimer(m)}>{m} min</button>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <div style={{ fontSize: '48px', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--text-main)' }}>
              {String(Math.floor(timerSec / 60)).padStart(2, '0')}:{String(timerSec % 60).padStart(2, '0')}
            </div>
            <button className="btn-premium btn-primary" style={{ marginTop: 'var(--space-sm)' }} onClick={() => setRunning((r) => !r)}>
              {running ? 'Pause' : 'Reprendre'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
          <button className="btn-premium btn-secondary" style={{ flex: 1 }} onClick={prev} disabled={stepIdx === 0}>Précédent</button>
          <button className="btn-premium btn-primary" style={{ flex: 1 }} onClick={next}>{isLast ? 'Terminer 🎉' : 'Suivant →'}</button>
        </div>
      </div>

      <div className="section">
        <div className="section-header-premium">
          <h3>Besoin d'aide ?</h3>
        </div>
        <div className="search-bar-premium">
          <input
            placeholder="Ex: Que signifie 'Sauter' ?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askMealio()}
          />
          <button className="btn-premium btn-primary" style={{ padding: '8px 16px' }} onClick={askMealio} disabled={loadingAI}>
            {loadingAI ? '...' : 'Demander'}
          </button>
        </div>
        {answer && (
          <div style={{ 
            padding: 'var(--space-md)', borderRadius: 'var(--r-lg)', 
            background: 'var(--accent-soft)', borderLeft: '4px solid var(--accent)', 
            marginTop: 'var(--space-md)', fontSize: '15px', color: 'var(--text-main)' 
          }}>
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}
