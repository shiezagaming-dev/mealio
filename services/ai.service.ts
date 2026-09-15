import { MealioAPI } from '../src/services/api';

export class AIService {
  /**
   * Real image analysis via Cloudflare Worker -> OpenRouter
   */
  static async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
    try {
      const result = await MealioAPI.analyzeImage(imageBase64, prompt);
      return result.choices[0].message.content;
    } catch (error: any) {
      console.error("AI Service Vision Error:", error);
      throw new Error(error.message || "Image analysis failed.");
    }
  }

  /**
   * Real recipe generation via Cloudflare Worker -> OpenRouter
   */
  static async generateRecipe(prompt: string): Promise<any> {
    try {
      const result = await MealioAPI.generateRecipe(prompt);
      const content = result.choices[0].message.content;
      return JSON.parse(content);
    } catch (error: any) {
      console.error("AI Service LLM Error:", error);
      throw new Error(error.message || "Recipe generation failed.");
    }
  }
}
