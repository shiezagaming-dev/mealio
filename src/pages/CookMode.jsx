import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const HOW_TO_KEYWORDS = {
  saute: 'Sauté means cooking food quickly in a small amount of fat over fairly high heat, stirring often.',
  simmer: 'Simmer means keeping a liquid just below boiling, with small gentle bubbles.',
  fold: 'Folding means gently combining ingredients with a spatula to keep air in the mixture.',
  dice: 'Dicing means cutting food into small, even cubes.',
  mince: 'Mincing means chopping food into very fine pieces, usually for garlic or herbs.',
  whisk: 'Whisking means beating ingredients briskly to mix them or add air.',
  knead: 'Kneading means working dough with your hands to build gluten structure.',
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
  const intervalRef = useRef(null);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    // Keep the screen awake while cooking, when supported.
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
            showToast('⏰ Timer done!');
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
        <div className="empty-state"><div className="glyph">🤷</div><p>Recipe not found.</p></div>
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
      showToast('Nice work — meal logged! 🎉');
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

  function askMealio() {
    if (!question.trim()) return;
    const lower = question.toLowerCase();
    const hit = Object.keys(HOW_TO_KEYWORDS).find((k) => lower.includes(k));
    const reply = hit ? HOW_TO_KEYWORDS[hit] : `For "${question.trim()}" — check the ingredient list above, or ask something like "what does sauté mean?"`;
    setAnswer(reply);
    setQuestion('');
  }

  return (
    <div className="screen">
      <div className="back-row" style={{ padding: 0, marginBottom: 8 }}>
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <h3 style={{ margin: '0 auto 0 12px' }}>{recipe.name}</h3>
      </div>

      <div className="progress-track" style={{ marginTop: 6 }}>
        <div className="progress-fill" style={{ width: `${((stepIdx + 1) / total) * 100}%` }} />
      </div>

      <div className="step-panel section">
        <div className="step-count">STEP {stepIdx + 1} / {total}</div>
        <div className="step-text">{step}</div>
        <button className="btn btn-ghost" onClick={() => speak(step)}>🔊 Read aloud</button>

        {timerSec == null ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 6, flexWrap: 'wrap' }}>
            {[1, 3, 5, 10].map((m) => (
              <span key={m} className="chip" onClick={() => startTimer(m)}>{m} min timer</span>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 28, fontFamily: 'var(--display)', fontWeight: 700 }}>
              {String(Math.floor(timerSec / 60)).padStart(2, '0')}:{String(timerSec % 60).padStart(2, '0')}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 6 }} onClick={() => setRunning((r) => !r)}>
              {running ? 'Pause' : 'Resume'}
            </button>
          </div>
        )}

        <div className="step-nav">
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={prev} disabled={stepIdx === 0}>← Previous</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={next}>{isLast ? 'Finish 🎉' : 'Next →'}</button>
        </div>
      </div>

      <div className="section">
        <div className="section-head"><h3>Ask Mealio</h3></div>
        <div className="search-bar">
          <input
            placeholder="“Mealio, what does sauté mean?”"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askMealio()}
          />
          <button className="btn btn-ghost" onClick={askMealio}>Ask</button>
        </div>
        {answer && (
          <div className="card" style={{ padding: 14, marginTop: 10, background: 'var(--basil-light)', border: 'none' }}>
            <p style={{ fontSize: 14 }}>{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
