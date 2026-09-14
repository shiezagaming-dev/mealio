// Connexion à Ollama en local (http://localhost:11434) — aucune clé API nécessaire.
// Marche uniquement pendant que Ollama tourne sur cette machine.

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'qwen2.5:3b'; // change si tu utilises un autre modèle (voir `ollama list`)

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

  const systemPrompt = `Tu es Mealio, un chef cuisinier IA amical et concis dans une application de recettes.
Voici un extrait des recettes disponibles dans l'application :
${recipeSummary}

Réponds toujours en 1 à 3 phrases courtes, dans un ton chaleureux et pratique.
Si tu recommandes un plat, utilise un nom de la liste ci-dessus quand c'est pertinent.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
    { role: 'user', content: userMessage },
  ];

  return askOllama(messages);
}
