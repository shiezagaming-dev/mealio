// Connects to Ollama running locally (http://localhost:11434) — no API key needed.
// Only works while Ollama is running on this machine.

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'gemma3:4b'; // change this to match exactly what `ollama list` shows you

export async function askOllama(messages, { model = MODEL, temperature = 0.7 } = {}) {
  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: { temperature },
      }),
    });
    if (!res.ok) throw new Error(`Ollama error ${res.status}`);
    const data = await res.json();
    return data?.message?.content?.trim() || null;
  } catch (e) {
    console.warn('Ollama unreachable (is it running? CORS enabled?):', e);
    return null;
  }
}

export async function askMealioChef(userMessage, recipes, history = []) {
  const recipeSummary = recipes
    .slice(0, 15)
    .map((r) => `- ${r.name} (${r.time}min, ${r.difficulty}, ${r.cuisine})`)
    .join('\n');

  const systemPrompt = `You are Mealio, a friendly and concise AI chef inside a recipe app.
Here is a sample of recipes available in the app:
${recipeSummary}

Always answer in 1 to 3 short sentences, warm and practical in tone.
If you recommend a dish, use a name from the list above when relevant.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
    { role: 'user', content: userMessage },
  ];

  return askOllama(messages);
}
