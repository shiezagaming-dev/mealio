import { askOllama } from './ollama';
import { MealioAPI } from '../services/api';

// Modèle par défaut pour OpenRouter (Vision capable)
const DEFAULT_CLOUD_MODEL = 'google/gemini-2.0-flash-001';

/**
 * Service unifié pour les appels AI.
 * Logique de repli : 
 * 1. Texte seul -> Ollama -> OpenRouter -> Fallback
 * 2. Vision -> OpenRouter -> Fallback
 */
export async function askAI(messages, options = {}) {
  const { vision = false, imageBase64 = null } = options;

  // --- CAS 1 : VISION ---
  if (vision) {
    try {
      // La vision ne passe que par le Worker/OpenRouter
      const result = await MealioAPI.analyzeImage(imageBase64, messages[messages.length - 1].content);
      return {
        text: result.choices[0].message.content,
        source: 'openrouter'
      };
    } catch (error) {
      console.error("Vision AI Error:", error);
      return {
        text: "Désolé, je n'arrive pas à analyser cette image pour le moment.",
        source: 'fallback'
      };
    }
  }

  // --- CAS 2 : TEXTE ---
  // Tentative 1 : Ollama (Local)
  try {
    const text = await askOllama(messages);
    if (text) {
      return { text, source: 'ollama' };
    }
  } catch (error) {
    console.warn("Ollama unreachable, falling back to OpenRouter...", error);
  }

  // Tentative 2 : OpenRouter (Cloud via Worker)
  try {
    const result = await MealioAPI.chat(messages);
    return {
      text: result.choices[0].message.content,
      source: 'openrouter'
    };
  } catch (error) {
    console.error("OpenRouter AI Error:", error);
  }

  // Tentative 3 : Fallback ultime
  return {
    text: "Je suis momentanément indisponible. Veuillez réessayer plus tard.",
    source: 'fallback'
  };
}
