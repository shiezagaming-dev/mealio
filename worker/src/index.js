export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    
    // CORS Security
    if (origin && origin !== env.FRONTEND_ORIGIN) {
      return new Response('Forbidden: Invalid Origin', { status: 403 });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': env.FRONTEND_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/ai/chat') {
        return await handleChat(request, env, corsHeaders);
      } else if (path === '/api/ai/recipe') {
        return await handleRecipe(request, env, corsHeaders);
      } else if (path === '/api/ai/analyze-meal') {
        return await handleAnalyze(request, env, corsHeaders);
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
  }
};

async function callOpenRouter(payload, env) {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error('Server configuration error: OPENROUTER_API_KEY is missing');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://mealio.app', 
      'X-Title': 'Mealio AI',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL,
      ...payload,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error: ${err}`);
  }

  return await response.json();
}

async function handleChat(request, env, corsHeaders) {
  const { messages } = await request.json();
  const result = await callOpenRouter({ messages }, env);
  return new Response(JSON.stringify(result), { 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

async function handleRecipe(request, env, corsHeaders) {
  const { prompt } = await request.json();
  const systemPrompt = `You are a professional chef. Provide a structured recipe in JSON format.
  Required fields: title, description, ingredients (array of {item, amount, unit}), instructions (array), prepTime, cookTime, totalTime, servings, difficulty, cuisine, dietaryInfo, substitutions, tips.`;

  const result = await callOpenRouter({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  }, env);

  return new Response(JSON.stringify(result), { 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

async function handleAnalyze(request, env, corsHeaders) {
  const { image, prompt } = await request.json();
  
  // Vision check: Gemini 2.0 Flash supports vision
  const visionModels = ['google/gemini', 'openai/gpt-4-vision', 'anthropic/claude-3'];
  const isVisionCapable = visionModels.some(m => env.OPENROUTER_MODEL.includes(m));

  if (!isVisionCapable) {
    return new Response(JSON.stringify({ error: 'The current AI model does not support image analysis.' }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  const result = await callOpenRouter({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: image } }
        ]
      }
    ]
  }, env);

  return new Response(JSON.stringify(result), { 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}
