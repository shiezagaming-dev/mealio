import { MealioAPI } from '../src/services/api';

export class AIService {
  /**
   * Analyse l'image via le backend Cloudflare Worker -> OpenRouter
   */
  static async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
    try {
      const result = await MealioAPI.analyzeImage(imageBase64, prompt);
      // OpenRouter retourne un format chat completion
      return result.choices[0].message.content;
    } catch (error: any) {
      console.error("AI Service Vision Error:", error);
      throw new Error(error.message || "L'analyse d'image a échoué.");
    }
  }

  /**
   * Génère ou remixe une recette via le backend Cloudflare Worker -> OpenRouter
   */
  static async generateRecipe(prompt: string): Promise<any> {
    try {
      const result = await MealioAPI.generateRecipe(prompt);
      // Le Worker retourne déjà le JSON parsé du contenu de la réponse
      const recipeJson = JSON.parse(result.choices[0].message.content);
      return recipeJson;
    } catch (error: any) {
      console.error("AI Service LLM Error:", error);
      throw new Error(error.message || "La génération de la recette a échoué.");
    }
  }
}
