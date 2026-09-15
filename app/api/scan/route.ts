import { NextResponse } from 'next/server';
import { AIService } from '@/services/ai.service';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    
    if (!image) {
      return NextResponse.json({ error: 'Image missing' }, { status: 400 });
    }

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
