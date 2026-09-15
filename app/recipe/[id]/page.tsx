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

  if (!recipe) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  const scaleAmount = (amount: number) => {
    return (amount * servings) / originalServings;
  };

  return (
    <div className="max-w-md mx-auto pb-24">
      <div className="relative h-72 w-full">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        <Link href="/" className="absolute top-6 left-6 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full text-slate-900 dark:text-white">
          <ArrowLeft size={20} />
        </Link>
        <div className="absolute top-6 right-6 flex space-x-2">
          <button className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full text-red-500">
            <Heart size={20} />
          </button>
          <button className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full text-slate-900 dark:text-white">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10">
        <div className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">{recipe.cuisine} • {recipe.category}</span>
              <h1 className="text-2xl font-bold mt-1">{recipe.title}</h1>
            </div>
            <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-lg text-sm font-bold">
              ⭐ {recipe.rating}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 dark:border-slate-700">
            <div className="flex flex-col items-center space-y-1">
              <Clock size={18} className="text-slate-400" />
              <span className="text-xs font-medium">{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <ChefHat size={18} className="text-slate-400" />
              <span className="text-xs font-medium">{recipe.difficulty}</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Users size={18} className="text-slate-400" />
              <div className="flex items-center space-x-1">
                <button onClick={() => setServings(Math.max(1, servings - 1))} className="text-xs font-bold px-1">-</button>
                <span className="text-xs font-medium">{servings}</span>
                <button onClick={() => setServings(servings + 1)} className="text-xs font-bold px-1">+</button>
              </div>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {recipe.description}
          </p>
        </div>

        <div className="mt-8 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ingredients</h2>
              <button className="flex items-center space-x-1 text-sm text-brand-500 font-medium">
                <ShoppingBag size={16} />
                <span>Add to list</span>
              </button>
            </div>
            <div className="space-y-3">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 glass-card">
                  <span className="text-sm">{ing.item}</span>
                  <span className="text-sm font-bold">{scaleAmount(ing.amount)} {ing.unit}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Instructions</h2>
            <div className="space-y-6">
              {recipe.instructions.map((step) => (
                <div key={step.step} className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-6 z-20">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          <button className="py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold shadow-lg flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700">
            <Sparkles size={20} className="text-brand-500" />
            <span>AI Remix</span>
          </button>
          <Link href={`/recipe/${id}/cook`} className="py-4 bg-brand-500 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/30 flex items-center justify-center space-x-2">
            <PlayCircle size={20} />
            <span>Cook Mode</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
