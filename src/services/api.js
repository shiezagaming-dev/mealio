const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://mealio-ai-backend.your-subdomain.workers.dev';

async function request(endpoint, body) {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request failed [${endpoint}]:`, error);
    throw error;
  }
}

export const MealioAPI = {
  async chat(messages) {
    return request('/api/ai/chat', { messages });
  },
  async generateRecipe(prompt) {
    return request('/api/ai/recipe', { prompt });
  },
  async analyzeImage(image, prompt) {
    return request('/api/ai/analyze-meal', { image, prompt });
  }
};
