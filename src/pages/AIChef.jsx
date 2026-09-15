import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function craftReply(message, recipes) {
  const lower = message.toLowerCase();

  if (lower.includes('substitute') || lower.includes('instead of') || lower.includes("don't have")) {
    return "If you're missing an ingredient, tell me which one and what the recipe is — I'll suggest something with a similar texture or flavor you likely already have.";
  }
  if (lower.includes('faster') || lower.includes('20 minutes') || lower.includes('quick')) {
    const quick = recipes.filter((r) => r.time <= 20).slice(0, 3);
    return `Here's what you can make fast: ${quick.map((r) => r.name).join(', ')}.`;
  }
  if (lower.includes('easy') || lower.includes('beginner')) {
    const easy = recipes.filter((r) => r.difficulty === 'Easy').slice(0, 3);
    return `These are nice and simple: ${easy.map((r) => r.name).join(', ')}.`;
  }
  if (lower.includes('tonight') || lower.includes('what should i cook') || lower.includes('what can i make')) {
    const pick = recipes[Math.floor(Math.random() * recipes.length)];
    return `How about ${pick.name}? It takes about ${pick.time} minutes and is rated ${pick.difficulty.toLowerCase()}. Want the full recipe?`;
  }

  // Try to match on mentioned ingredients.
  const mentioned = recipes.filter((r) =>
    r.ingredients.some((i) => lower.includes(i.name.toLowerCase().split(' ')[0]))
  );
  if (mentioned.length) {
    return `With what you've mentioned, you could make ${mentioned.slice(0, 3).map((r) => r.name).join(', ')}. Want me to open one?`;
  }

  return "Tell me what ingredients you have, how much time you've got, or what you're craving, and I'll suggest something to cook.";
}

export default function AIChef() {
  const { allRecipes } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey, I'm your AI Chef 👋 Ask me what to cook, for substitutions, or how to adapt a recipe." },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input.trim() };
    const reply = { role: 'ai', text: craftReply(input.trim(), allRecipes()) };
    setMessages((m) => [...m, userMsg, reply]);
    setInput('');
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
        <button className="btn btn-ghost" onClick={send}>Send</button>
      </div>
    </div>
  );
}
