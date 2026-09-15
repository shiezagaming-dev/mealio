import { MealioAPI } from '../services/api';

export async function askOllama(messages) {
  try {
    const response = await MealioAPI.chat(messages);
    return response.choices[0].message.content;
  } catch (e) {
    console.error('AI Backend Error:', e);
    throw e;
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

  try {
    return await askOllama(messages);
  } catch (e) {
    return "I'm having trouble connecting to my chef brain. Please try again in a moment!";
  }
}
