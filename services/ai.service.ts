export class AIService {
  private static OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api';

  /**
   * Analyse l'image via un modèle de vision (ex: llava)
   */
  static async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.OLLAMA_URL}/generate`, {
        method: 'POST',
        body: JSON.stringify({
          model: 'llava', // Modèle de vision requis
          prompt: prompt,
          images: [imageBase64],
          stream: false,
        }),
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Ollama Vision Error:", error);
      throw new Error("L'analyse d'image a échoué. Assurez-vous qu'Ollama et le modèle llava sont installés.");
    }
  }

  /**
   * Génère ou remixe une recette via Gemma 4
   */
  static async generateRecipe(prompt: string): Promise<any> {
    try {
      const response = await fetch(`${this.OLLAMA_URL}/generate`, {
        method: 'POST',
        body: JSON.stringify({
          model: 'gemma4:31b-cloud',
          prompt: `You are a professional chef. Please provide a structured recipe in JSON format. ${prompt}`,
          format: 'json',
          stream: false,
        }),
      });

      const data = await response.json();
      return JSON.parse(data.response);
    } catch (error) {
      console.error("Ollama LLM Error:", error);
      throw new Error("La génération de la recette a échoué.");
    }
  }
}
