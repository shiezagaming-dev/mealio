import { NextResponse } from 'next/server';
import { AIService } from '@/services/ai.service';

export async function POST(req: Request) {
  try {
    const { image } = await req.json(); // image en base64
    
    if (!image) {
      return NextResponse.json({ error: 'Image manquante' }, { status: 400 });
    }

    // Utilisation du nouveau AIService qui passe par le Worker
    const identification = await AIService.analyzeImage(
      image.split(',')[1] || image, 
      "Identify this food dish. Tell me the name of the dish and the main ingredients you see. Be concise."
    );

    const recipe = await AIService.generateRecipe(
      `Create a professional recipe for: ${identification}. Include title, description, prepTime, cookTime, difficulty, servings, ingredients (array of {item, amount, unit}), and instructions (array of {step, text}).`
    );

    return NextResponse.json(recipe);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
