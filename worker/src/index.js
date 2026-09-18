export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    
    // CORS Security
    if (origin && origin !== env.FRONTEND_ORIGIN && env.FRONTEND_ORIGIN !== '*') {
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

function base64ToUint8Array(base64) {
  const cleaned = base64.replace(/^data:image\/\w+;base64,/, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function callOpenRouter(payload, env) {
  if (!env.OPENROUTER_MODELS) {
    throw new Error('Server configuration error: OPENROUTER_MODELS is missing');
  }

  const models = env.OPENROUTER_MODELS.split(',');
  const errors = [];

  for (const model of models) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://mealio.app', 
          'X-Title': 'Mealio AI',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model.trim(),
          ...payload,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      data._servedBy = `openrouter:${model.trim()}`;
      return data;

    } catch (e) {
      console.error(`Model ${model} failed: ${e.message}`);
      errors.push(`${model.trim()} (${e.message})`);
    }
  }

  throw new Error(`All AI models failed. Tried: ${errors.join('; ')}`);
}

async function handleChat(request, env, corsHeaders) {
  const { messages } = await request.json();
  
  try {
    // PRIMARY: Cloudflare Workers AI
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: messages
    });
    
    const result = {
      choices: [{
        message: {
          content: aiResponse.response
        }
      }],
      _servedBy: 'workers-ai'
    };
    
    return new Response(JSON.stringify(result), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (e) {
    console.error("Workers AI Chat failed, falling back to OpenRouter:", e.message);
    const result = await callOpenRouter({ messages }, env);
    return new Response(JSON.stringify(result), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
}

async function handleRecipe(request, env, corsHeaders) {
  const { prompt } = await request.json();
  const systemPrompt = `You are a professional chef. Provide a structured recipe in JSON format.
  Required fields: title, description, ingredients (array of {item, amount, unit}), instructions (array), prepTime, cookTime, totalTime, servings, difficulty, cuisine, dietaryInfo, substitutions, tips.`;

  try {
    // PRIMARY: Cloudflare Workers AI
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    });
    
    const result = {
      choices: [{
        message: {
          content: aiResponse.response
        }
      }],
      _servedBy: 'workers-ai'
    };
    
    return new Response(JSON.stringify(result), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (e) {
    console.error("Workers AI Recipe failed, falling back to OpenRouter:", e.message);
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
}

async function handleAnalyze(request, env, corsHeaders) {
  const { image, prompt } = await request.json();
  
  try {
    // PRIMARY: Cloudflare Workers AI Vision
    const aiResponse = await env.AI.run('@cf/llava-hf/llava-1.5-7b-hf', {
      image: Array.from(base64ToUint8Array(image)),
      prompt: prompt,
      max_tokens: 512
    });
    
    const result = {
      choices: [{
        message: {
          content: aiResponse.response
        }
      }],
      _servedBy: 'workers-ai'
    };
    
    return new Response(JSON.stringify(result), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (e) {
    console.error("Workers AI Vision failed, falling back to OpenRouter:", e.message);
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
}
