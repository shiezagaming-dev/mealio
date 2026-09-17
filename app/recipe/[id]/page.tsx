'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Share2, 
  ShoppingBag, 
  PlayCircle, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Recipe } from '@/types';

export default function RecipePage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(2);
  const [originalServings, setOriginalServings] = useState(2);

  useEffect(() => {
    // Simulation de fetch de données - À remplacer par un appel API réel
    const mockRecipe: Recipe = {
      id: id as string,
      title: "Creamy Mushroom Risotto",
      description: "A comforting Italian classic with wild mushrooms and freshly grated parmesan.",
      image: "https://images.unsplash.com/photo-1454946478264-17336233333d?q=80&w=800",
      prepTime: 10,
      cookTime: 30,
      difficulty: "Medium",
      servings: 2,
      cuisine: "Italian",
      category: "Main Course",
      rating: 4.8,
      ingredients: [
        { item: "Arborio Rice", amount: 200, unit: "g" },
        { item: "Mushrooms", amount: 300, unit: "g" },
        { item: "Vegetable Broth", amount: 700, unit: "ml" },
        { item: "Butter", amount: 30, unit: "g" },
        { item: "Parmesan", amount: 50, unit: "g" },
      ],
      instructions: [
        { step: 1, text: "Sauté the mushrooms in a bit of butter until golden brown." },
        { step: 2, text: "Add the rice and toast for about 2 minutes." },
        { step: 3, text: "Add the broth one ladle at a time, stirring constantly." },
        { step: 4, text: "Stir in the butter and parmesan off the heat for creaminess." },
      ],
      createdAt: new Date(),
    };
    setRecipe(mockRecipe);
    setServings(mockRecipe.servings);
    setOriginalServings(mockRecipe.servings);
  }, [id]);

  if (!recipe) return <div className="flex justify-center items-center h-screen bg-[#171512] text-[#F4EBDD]">Loading...</div>;

  const scaleAmount = (amount: number) => {
    return (amount * servings) / originalServings;
  };

  return (
    <div className="max-w-[800px] mx-auto min-h-screen bg-[#171512] text-[#F4EBDD] pb-32">
      <div className="relative h-[40vh] w-full">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171512] to-transparent" />
        
        <Link href="/" className="absolute top-6 left-6 p-3 bg-[#211E19]/80 backdrop-blur-md rounded-full text-[#F4EBDD] border border-[#3A211C]">
          <ArrowLeft size={20} />
        </Link>
        
        <div className="absolute top-6 right-6 flex space-x-3">
          <button className="p-3 bg-[#211E19]/80 backdrop-blur-md rounded-full text-[#F04A32] border border-[#3A211C]">
            <Heart size={20} />
          </button>
          <button className="p-3 bg-[#211E19]/80 backdrop-blur-md rounded-full text-[#F4EBDD] border border-[#3A211C]">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-10">
        <div className="bg-[#211E19] p-8 rounded-[32px] border border-[#3A211C] shadow-2xl space-y-6">
          <div className="flex justify-between items-start">
            <div className="max-w-[70%]">
              <span className="text-xs font-bold text-[#F04A32] uppercase tracking-widest font-sans">{recipe.cuisine} • {recipe.category}</span>
              <h1 className="text-4xl font-bold mt-2 leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>{recipe.title}</h1>
            </div>
            <div className="flex items-center bg-[#3A211C] text-[#F4EBDD] px-3 py-1 rounded-full text-sm font-bold">
              ⭐ {recipe.rating}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-6 border-y border-[#3A211C]">
            <div className="flex flex-col items-center space-y-2">
              <Clock size={20} className="text-[#AAA39A]" />
              <span className="text-xs font-medium text-[#F4EBDD]">{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <ChefHat size={20} className="text-[#AAA39A]" />
              <span className="text-xs font-medium text-[#F4EBDD]">{recipe.difficulty}</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Users size={20} className="text-[#AAA39A]" />
              <div className="flex items-center space-x-2">
                <button onClick={() => setServings(Math.max(1, servings - 1))} className="text-xs font-bold w-5 h-5 flex items-center justify-center bg-[#3A211C] rounded-full">-</button>
                <span className="text-xs font-medium text-[#F4EBDD]">{servings}</span>
                <button onClick={() => setServings(servings + 1)} className="text-xs font-bold w-5 h-5 flex items-center justify-center bg-[#3A211C] rounded-full">+</button>
              </div>
            </div>
          </div>

          <p className="text-[#AAA39A] text-base leading-relaxed font-sans">
            {recipe.description}
          </p>
        </div>

        <div className="mt-12 space-y-12">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>Ingrédients</h2>
              <button className="flex items-center space-x-2 text-sm text-[#F04A32] font-bold hover:underline">
                <ShoppingBag size={18} />
                <span>Ajouter à la liste</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-[#211E19] border border-[#3A211C] rounded-2xl">
                  <span className="text-sm text-[#F4EBDD] font-sans">{ing.item}</span>
                  <span className="text-sm font-bold text-[#F04A32] font-sans">{scaleAmount(ing.amount)} {ing.unit}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="pb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Fraunces, serif' }}>Instructions</h2>
            <div className="space-y-8">
              {recipe.instructions.map((step) => (
                <div key={step.step} className="flex space-x-6">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#F04A32] text-[#F4EBDD] rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-[#F04A32]/20">
                    {step.step}
                  </div>
                  <p className="text-base text-[#AAA39A] leading-relaxed font-sans pt-2">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-8 left-0 right-0 px-6 z-20">
        <div className="max-w-[800px] mx-auto grid grid-cols-2 gap-4">
          <button className="py-4 bg-[#211E19] text-[#F4EBDD] rounded-2xl font-bold shadow-xl flex items-center justify-center space-x-2 border border-[#3A211C] hover:bg-[#27231D] transition-colors">
            <Sparkles size={20} className="text-[#F04A32]" />
            <span className="font-sans">AI Remix</span>
          </button>
          <Link href={`/recipe/${id}/cook`} className="py-4 bg-[#F04A32] text-[#F4EBDD] rounded-2xl font-bold shadow-xl shadow-[#F04A32]/30 flex items-center justify-center space-x-2 hover:bg-[#d93d28] transition-colors">
            <PlayCircle size={20} />
            <span className="font-sans">Mode Cuisine</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
