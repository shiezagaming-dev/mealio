import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { askAI } from '../data/aiService';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';

export default function AIChef() {
  const { allRecipes, t } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'ai', text: t('aiChef.greeting') || "Bonjour ! Je suis votre Chef IA 👋 Je peux vous aider à trouver des idées de repas, suggérer des substitutions ou adapter vos recettes. Que voulez-vous cuisiner ?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, error]);

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
      setError(textToSend);
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
      backgroundColor: 'var(--mealio-bg)',
      padding: '0'
    }}>
      {/* HEADER */}
      <header style={{ 
        padding: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        backgroundColor: 'var(--mealio-surface)',
        borderBottom: '1px solid var(--mealio-border)',
        zIndex: 10
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            width: '40px', height: '40px', borderRadius: '50%', 
            border: '1px solid var(--mealio-border)', background: 'var(--mealio-surface-warm)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--mealio-text-primary)'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="var(--mealio-accent)" /> {t('aiChef.title')}
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
        paddingBottom: '120px'
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            width: '100%'
          }}>
            <div style={{ 
              maxWidth: '80%', 
              padding: '12px 16px', 
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              backgroundColor: m.role === 'user' ? 'var(--mealio-accent)' : 'var(--mealio-surface)',
              color: m.role === 'user' ? 'white' : 'var(--mealio-text-primary)',
              border: m.role === 'ai' ? '1px solid var(--mealio-border)' : 'none',
              boxShadow: 'var(--shadow-subtle)',
              fontSize: '15px',
              lineHeight: '1.5',
              fontFamily: 'var(--font-body)'
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
              backgroundColor: 'var(--mealio-surface)',
              color: 'var(--mealio-text-secondary)',
              border: '1px solid var(--mealio-border)',
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              {t('common.loading')}...
            </div>
          </div>
        )}
        
        {error && (
          <div style={{ 
            display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '16px' 
          }}>
            <div style={{ 
              maxWidth: '80%', padding: '16px', borderRadius: '16px', 
              backgroundColor: 'var(--mealio-accent-soft)', 
              border: '1px solid var(--mealio-accent)',
              textAlign: 'center'
            }}>
              <p style={{ color: 'var(--mealio-accent-dark)', fontWeight: '600', marginBottom: '12px', fontSize: '14px' }}>
                {t('aiChef.error')}
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => send(error)}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                {t('common.tryAgain')}
              </button>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* INPUT AREA */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 'var(--app-max-width)',
        backgroundColor: 'var(--mealio-surface)',
        borderTop: '1px solid var(--mealio-border)',
        padding: '20px 24px calc(80px + env(safe-area-inset-bottom))',
        boxSizing: 'border-box'
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
                background: 'var(--mealio-surface-warm)', border: '1px solid var(--mealio-border)', 
                fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
                color: 'var(--mealio-text-primary)', fontFamily: 'var(--font-body)',
                transition: 'all 0.2s ease'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ 
          display: 'flex', gap: '12px', alignItems: 'center',
          backgroundColor: 'var(--mealio-bg)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '8px 8px 8px 16px',
          border: '1px solid var(--mealio-border)'
        }}>
          <input
            placeholder={t('aiChef.placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            style={{ 
              backgroundColor: 'transparent', border: 'none', outline: 'none', 
              color: 'var(--mealio-text-primary)', fontSize: '16px', flex: 1,
              fontFamily: 'var(--font-body)', padding: '8px 0'
            }}
          />
          <button 
            className="btn btn-primary" 
            onClick={() => send()} 
            disabled={loading} 
            style={{ padding: '10px', borderRadius: 'var(--radius-md)' }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
