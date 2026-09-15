import { MealioAPI } from '../services/api';

/**
 * Service AI unifié pour Mealio.
 * Architecture de production : Cloudflare Worker -> OpenRouter -> Gemini.
 * Aucun fallback vers Ollama en production.
 */
export async function askAI(messages, options = {}) {
  const { vision = false, imageBase64 = null } = options;

  try {
    if (vision) {
      // Analyse d'image via le Worker
      const result = await MealioAPI.analyzeImage(imageBase64, messages[messages.length - 1].content);
      return {
        text: result.choices[0].message.content,
        source: 'openrouter'
      };
    } else {
      // Chat texte via le Worker
      const result = await MealioAPI.chat(messages);
      return {
        text: result.choices[0].message.content,
        source: 'openrouter'
      };
    }
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      text: "Je suis momentanément indisponible. Veuillez réessayer plus tard.",
      source: 'fallback'
    };
  }
}
