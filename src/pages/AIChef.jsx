import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { askAI } from '../data/aiService';
import { ArrowLeft, Send, Sparkles, AlertCircle } from 'lucide-react';
import AmbientBackground from '../components/AmbientBackground';
import { useKeyboard } from '../hooks/useKeyboard';

export default function AIChef() {
  const { allRecipes, t } = useApp();
  const navigate = useNavigate();
  const isKeyboardOpen = useKeyboard();
  const [messages, setMessages] = useState([
    { role: 'ai', text: t('aiChef.greeting') || "Bonjour ! Je suis votre Chef IA 👋 Je peux vous aider à trouver des idées de repas, suggérer des substitutions ou adapter vos recettes. Que voulez-vous cuisiner ?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, error, isKeyboardOpen]);

  async function send(textOverride = null) {
    const textToSend = textOverride || input.trim();
    if (!textToSend) return;

    if (!textOverride) {
      const userMsg = { role: 'user', text: textToSend };
      setMessages((m) => [...m, userMsg]);
      setInput('');
    }
    
    setError(null);
    setLoading(true);

    try {
      const recipeSummary = allRecipes()
        .slice(0, 15)
        .map((r) => `- ${r.name} (${r.time}min, ${r.difficulty}, ${r.cuisine})`)
        .join('\n');

      const systemPrompt = `You are Mealio, a friendly and concise AI chef. 
      Available recipes in the app:
      ${recipeSummary}
      Answer in 1-3 short sentences. Be warm, practical, and helpful. 
      If the user asks for a recipe, suggest one from the list if it fits.`;

      const history = messages.map(m => ({ 
        role: m.role === 'ai' ? 'assistant' : 'user', 
        content: m.text 
      }));

      const { text } = await askAI([
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: textToSend }
      ]);

      setMessages((m) => [...m, { role: 'ai', text }]);
    } catch (e) {
      console.error("AI Chef Request Failed:", e);
      setError("Mealio couldn't reach the AI right now.");
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    t('aiChef.suggestion1') || 'Idée de dîner rapide',
    t('aiChef.suggestion2') || 'Remplacer le beurre',
    t('aiChef.suggestion3') || 'Recette avec poulet et riz',
    t('aiChef.suggestion4') || 'Recette végétarienne',
  ];

  return (
    <div className="app-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: 'var(--bg-main)',
      padding: '0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <AmbientBackground />

      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        backgroundColor: 'transparent'
      }}>
        {/* HEADER */}
        <header style={{ 
          padding: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          position: 'relative',
          zIndex: 10
        }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              border: '1px solid var(--border-color)', background: 'var(--bg-card-alt)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-serif)' }}>
            <Sparkles size={20} color="var(--accent)" /> {t('aiChef.title')}
          </h1>
        </header>

        {/* CHAT AREA */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          paddingBottom: '120px',
          zIndex: 1
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              width: '100%'
            }}>
              <div style={{ 
                maxWidth: '85%', 
                padding: '12px 16px', 
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                backgroundColor: m.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                border: m.role === 'ai' ? '1px solid var(--border-color)' : 'none',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '15px',
                lineHeight: '1.5',
                fontFamily: 'var(--font-sans)'
              }}>
                {m.text}
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{ 
              display: 'flex', justifyContent: 'flex-start', width: '100%' 
            }}>
              <div style={{ 
                padding: '12px 16px', borderRadius: '16px 16px 16px 4px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                fontStyle: 'italic',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <div className="loader" style={{ width: '12px', height: '12px', borderWidth: '2px', borderTopColor: 'var(--accent)' }} />
                Mealio is thinking...
              </div>
            </div>
          )}
          
          {error && (
            <div style={{ 
              display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '16px' 
            }}>
              <div style={{ 
                maxWidth: '80%', padding: '16px', borderRadius: '16px', 
                backgroundColor: 'rgba(240, 74, 50, 0.1)', 
                border: '1px solid var(--accent)',
                textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff8a7a', fontWeight: '600' }}>
                  <AlertCircle size={18} />
                  {error}
                </div>
                <button 
                  className="btn-premium btn-primary" 
                  onClick={() => send()}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Try again
                </button>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* INPUT AREA - Keyboard Aware */}
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '100%', 
          maxWidth: 'var(--app-max-width)',
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          padding: '20px 24px calc(80px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
          zIndex: 10,
          transition: 'bottom 0.2s ease'
        }}>
          <div style={{ 
            display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', 
            scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' 
          }}>
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => setInput(s)}
                style={{ 
                  padding: '8px 16px', borderRadius: '20px', 
                  background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)', 
                  fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s ease'
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ 
            display: 'flex', gap: '12px', alignItems: 'center',
            backgroundColor: 'var(--bg-main)', 
            borderRadius: 'var(--r-lg)', 
            padding: '8px 8px 8px 16px',
            border: '1px solid var(--border-color)'
          }}>
            <input
              placeholder={t('aiChef.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              style={{ 
                backgroundColor: 'transparent', border: 'none', outline: 'none', 
                color: 'var(--text-primary)', fontSize: '16px', flex: 1,
                fontFamily: 'var(--font-sans)', padding: '8px 0'
              }}
            />
            <button 
              className="btn-premium btn-primary" 
              onClick={() => send()} 
              disabled={loading} 
              style={{ padding: '10px', borderRadius: 'var(--r-md)' }}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
