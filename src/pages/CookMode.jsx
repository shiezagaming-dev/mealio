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
      <div className="screen" style={{ backgroundColor: '#171512', color: '#F4EBDD', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤷</div>
          <p style={{ fontFamily: 'DM Sans, sans-serif' }}>Recette non trouvée.</p>
        </div>
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
    <div className="screen" style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      width: '100%', 
      backgroundColor: '#171512', 
      color: '#F4EBDD',
      minHeight: '100vh',
      padding: '32px 24px 120px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            background: '#211E19', border: '1px solid #3A211C', color: '#F4EBDD', 
            width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer',
            fontSize: '20px'
          }}
        >
          ←
        </button>
        <h3 style={{ fontSize: '22px', fontFamily: 'Fraunces, serif', fontWeight: '700', margin: 0 }}>{recipe.name}</h3>
      </div>

      <div style={{ height: '6px', background: '#3A211C', borderRadius: 'var(--r-pill)', overflow: 'hidden', marginBottom: '40px' }}>
        <div style={{ height: '100%', background: '#F04A32', width: `${((stepIdx + 1) / total) * 100}%`, transition: 'width 0.3s ease' }} />
      </div>

      <div style={{ 
        backgroundColor: '#211E19', borderRadius: '32px', padding: '40px 24px', 
        border: '1px solid #3A211C', textAlign: 'center', marginBottom: '40px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
      }}>
        <div style={{ color: '#F04A32', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px', fontFamily: 'DM Sans, sans-serif' }}>
          Étape {stepIdx + 1} sur {total}
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: '1.4', marginBottom: '32px', color: '#F4EBDD', fontFamily: 'Fraunces, serif' }}>
          {step}
        </div>
        
        <button 
          style={{ 
            backgroundColor: 'transparent', color: '#F4EBDD', border: '1px solid #3A211C', 
            padding: '12px 24px', borderRadius: '16px', cursor: 'pointer', 
            fontSize: '15px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif',
            marginBottom: '32px', width: '100%', transition: 'all 0.2s ease'
          }} 
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27231D'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => speak(step)}
        >
          🔊 Lire à haute voix
        </button>

        {timerSec == null ? (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[1, 3, 5, 10].map((m) => (
              <button 
                key={m} 
                onClick={() => startTimer(m)}
                style={{ 
                  backgroundColor: '#171512', color: '#F4EBDD', border: '1px solid #3A211C', 
                  padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', 
                  fontSize: '14px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif' 
                }}
              >
                {m} min
              </button>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '64px', fontFamily: 'DM Sans, sans-serif', fontWeight: '800', color: '#F04A32', marginBottom: '16px' }}>
              {String(Math.floor(timerSec / 60)).padStart(2, '0')}:{String(timerSec % 60).padStart(2, '0')}
            </div>
            <button 
              onClick={() => setRunning((r) => !r)}
              style={{ 
                backgroundColor: '#F04A32', color: '#F4EBDD', border: 'none', 
                padding: '12px 32px', borderRadius: '16px', cursor: 'pointer', 
                fontSize: '16px', fontWeight: '700', fontFamily: 'DM Sans, sans-serif' 
              }}
            >
              {running ? 'Pause' : 'Reprendre'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          <button 
            onClick={prev} 
            disabled={stepIdx === 0}
            style={{ 
              flex: 1, padding: '16px', borderRadius: '16px', cursor: 'pointer',
              backgroundColor: '#171512', color: stepIdx === 0 ? '#555' : '#F4EBDD', 
              border: '1px solid #3A211C', fontWeight: '700', fontFamily: 'DM Sans, sans-serif'
            }}
          >
            Précédent
          </button>
          <button 
            onClick={next}
            style={{ 
              flex: 1, padding: '16px', borderRadius: '16px', cursor: 'pointer',
              backgroundColor: '#F04A32', color: '#F4EBDD', 
              border: 'none', fontWeight: '700', fontFamily: 'DM Sans, sans-serif'
            }}
          >
            {isLast ? 'Terminer 🎉' : 'Suivant →'}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        <h3 style={{ fontSize: '20px', fontFamily: 'Fraunces, serif', fontWeight: '600', marginBottom: '16px', color: '#F4EBDD' }}>Besoin d'aide ?</h3>
        <div style={{ 
          display: 'flex', gap: '12px', 
          backgroundColor: '#211E19', padding: '8px', borderRadius: '16px', 
          border: '1px solid #3A211C' 
        }}>
          <input
            placeholder="Ex: Que signifie 'Sauter' ?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askMealio()}
            style={{ 
              flex: 1, backgroundColor: 'transparent', border: 'none', 
              outline: 'none', color: '#F4EBDD', padding: '8px 12px', 
              fontSize: '15px', fontFamily: 'DM Sans, sans-serif' 
            }}
          />
          <button 
            onClick={askMealio} 
            disabled={loadingAI}
            style={{ 
              backgroundColor: '#F04A32', color: '#F4EBDD', border: 'none', 
              padding: '8px 20px', borderRadius: '12px', cursor: 'pointer', 
              fontWeight: '700', fontFamily: 'DM Sans, sans-serif' 
            }}
          >
            {loadingAI ? '...' : 'Demander'}
          </button>
        </div>
        {answer && (
          <div style={{ 
            padding: '20px', borderRadius: '16px', 
            backgroundColor: '#27231D', borderLeft: '4px solid #F04A32', 
            marginTop: '16px', fontSize: '15px', color: '#F4EBDD',
            fontFamily: 'DM Sans, sans-serif', lineHeight: '1.5'
          }}>
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}
