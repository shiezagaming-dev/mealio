import { MealioAPI } from '../services/api';

/**
 * Service AI unifié pour Mealio.
 * Architecture de production : Cloudflare Worker -> OpenRouter -> Gemini.
 */
export async function askAI(messages, options = {}) {
  const { vision = false, imageBase64 = null, response_format = null } = options;

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
    throw new Error("L'IA est momentanément indisponible. Veuillez réessayer.");
  }
}
