import { MealioAPI, BACKEND_URL } from '../services/api';

/**
 * Service AI unifié pour Mealio.
 * Architecture de production : Cloudflare Worker -> OpenRouter -> Gemini.
 */
export async function askAI(messages, options = {}) {
  const { vision = false, imageBase64 = null, response_format = null } = options;

  try {
    if (vision) {
      // Analyse d'image via le Worker avec URL absolue
      const response = await fetch(`${BACKEND_URL}/api/ai/analyze-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, prompt: messages[messages.length - 1].content }),
      });

      if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
      const result = await response.json();

      return {
        text: result.choices?.[0]?.message?.content || result.text || result.analysis,
        source: 'openrouter',
        model: result._servedBy
      };
    } else {
      // Chat texte via le Worker avec URL absolue
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
      const result = await response.json();

      return {
        text: result.choices?.[0]?.message?.content || result.text || result.response,
        source: 'openrouter',
        model: result._servedBy
      };
    }
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}
