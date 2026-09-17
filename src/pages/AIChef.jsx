import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { askAI } from '../data/aiService';

export default function AIChef() {
  const { allRecipes } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Bonjour ! Je suis votre Chef IA 👋 Je peux vous aider à trouver des idées de repas, suggérer des substitutions ou adapter vos recettes. Que voulez-vous cuisiner ?" },
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
    'Idée de dîner rapide',
    'Remplacer le beurre',
    'Recette avec poulet et riz',
    'Recette végétarienne',
  ];

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="back-row" style={{ padding: 0, marginBottom: 6 }}>
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <h1 style={{ marginLeft: 12 }}>AI Chef</h1>
      </div>

      <div className="chat-col" style={{ flex: 1, marginTop: 10, overflowY: 'auto', paddingBottom: '20px' }}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
        ))}
        {loading && <div className="chat-bubble ai" style={{ opacity: 0.6 }}>Le Chef réfléchit...</div>}
        
        {error && (
          <div className="chat-bubble ai" style={{ border: '1px solid var(--danger)', backgroundColor: 'var(--basil-light)' }}>
            <p style={{ color: 'var(--danger)', fontWeight: '600', marginBottom: '8px' }}>
              Mealio's AI is having trouble right now — try again?
            </p>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => send(error)}
              style={{ padding: '4px 12px', fontSize: '12px' }}
            >
              Retry
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chip-row" style={{ margin: '12px -18px 0', padding: '0 18px' }}>
        {suggestions.map((s) => (
          <span key={s} className="chip" onClick={() => setInput(s)}>{s}</span>
        ))}
      </div>

      <div className="search-bar" style={{ marginTop: 12, marginBottom: 'env(safe-area-inset-bottom)' }}>
        <input
          placeholder="Posez-moi une question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="btn btn-ghost" onClick={() => send()} disabled={loading}>Envoyer</button>
      </div>
    </div>
  );
}
