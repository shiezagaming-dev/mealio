import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { askAI } from '../data/aiService';

export default function AIChef() {
  const { allRecipes } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey, I'm your AI Chef 👋 Ask me what to cook, for substitutions, or how to adapt a recipe." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const userText = input.trim();
    const userMsg = { role: 'user', text: userText };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const recipeSummary = allRecipes()
        .slice(0, 15)
        .map((r) => `- ${r.name} (${r.time}min, ${r.difficulty}, ${r.cuisine})`)
        .join('\n');

      const systemPrompt = `You are Mealio, a friendly and concise AI chef. 
      Available recipes:
      ${recipeSummary}
      Answer in 1-3 short sentences. Be warm and practical.`;

      const history = messages.map(m => ({ 
        role: m.role === 'ai' ? 'assistant' : 'user', 
        content: m.text 
      }));

      const { text, source } = await askAI([
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userText }
      ]);

      setMessages((m) => [...m, { role: 'ai', text: `${text} (via ${source})` }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'ai', text: "I'm having trouble connecting to my chef brain. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    'I have chicken, rice and two tomatoes.',
    "What can I substitute for butter?",
    'I only have 20 minutes.',
    'What should I cook tonight?',
  ];

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="back-row" style={{ padding: 0, marginBottom: 6 }}>
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <h1 style={{ marginLeft: 12 }}>AI Chef</h1>
      </div>

      <div className="chat-col" style={{ flex: 1, marginTop: 10 }}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
        ))}
        {loading && <div className="chat-bubble ai" style={{ opacity: 0.6 }}>Typing...</div>}
        <div ref={endRef} />
      </div>

      <div className="chip-row" style={{ margin: '12px -18px 0', padding: '0 18px' }}>
        {suggestions.map((s) => (
          <span key={s} className="chip" onClick={() => setInput(s)}>{s}</span>
        ))}
      </div>

      <div className="search-bar" style={{ marginTop: 12 }}>
        <input
          placeholder="Ask Mealio anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="btn btn-ghost" onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  );
}
