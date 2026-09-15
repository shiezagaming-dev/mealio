'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Timer, 
  Volume2, 
  MessageCircle, 
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { Recipe } from '@/types';

export default function CookModePage() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Simulation de fetch - À remplacer par appel API réel vers Prisma
    const mockRecipe: Recipe = {
      id: id as string,
      title: "Creamy Mushroom Risotto",
      description: "A comforting Italian classic",
      image: "",
      prepTime: 10,
      cookTime: 30,
      difficulty: "Medium",
      servings: 2,
      cuisine: "Italian",
      category: "Main Course",
      rating: 4.8,
      ingredients: [],
      instructions: [
        { step: 1, text: "Sauté the mushrooms in a bit of butter until golden brown." },
        { step: 2, text: "Add the rice and toast for about 2 minutes." },
        { step: 3, text: "Add the broth one ladle at a time, stirring constantly." },
        { step: 4, text: "Stir in the butter and parmesan off the heat for creaminess." },
      ],
      createdAt: new Date(),
    };
    setRecipe(mockRecipe);
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => (s === null ? 0 : s - 1));
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsActive(false);
      // Notification sonore simple
      new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
    }
    return () => clearInterval(interval);
  }, [isActive, timerSeconds]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const startQuickTimer = (mins: number) => {
    setTimerSeconds(mins * 60);
    setIsActive(true);
  };

  if (!recipe) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  const isLastStep = currentStep === recipe.instructions.length - 1;

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg">{recipe.title}</h1>
          <p className="text-xs text-slate-500">Step {currentStep + 1} of {recipe.instructions.length}</p>
        </div>
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <MessageCircle size={24} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-brand-500 h-full transition-all duration-300" 
            style={{ width: `${((currentStep + 1) / recipe.instructions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-6 flex flex-col justify-center items-center text-center space-y-8">
        <div className="space-y-4">
          <div className="text-6xl mb-4">🍳</div>
          <p className="text-2xl font-medium leading-relaxed">
            {recipe.instructions[currentStep].text}
          </p>
        </div>

        {/* Timer Section */}
        <div className="w-full max-w-xs space-y-4">
          {timerSeconds !== null && (
            <div className="text-4xl font-mono font-bold text-brand-500">
              {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
            </div>
          )}
          <div className="flex justify-center gap-2">
            {[1, 3, 5, 10].map(m => (
              <button 
                key={m} 
                onClick={() => startQuickTimer(m)}
                className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700"
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-6 space-y-4">
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={() => speak(recipe.instructions[currentStep].text)}
            className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400"
          >
            <Volume2 size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(s => s - 1)}
            className="py-4 px-6 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ChevronLeft size={20} /> Previous
          </button>
          
          {isLastStep ? (
            <button 
              onClick={() => router.push(`/recipe/${id}`)}
              className="py-4 px-6 rounded-2xl font-bold bg-green-500 text-white flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} /> Finish
            </button>
          ) : (
            <button 
              onClick={() => setCurrentStep(s => s + 1)}
              className="py-4 px-6 rounded-2xl font-bold bg-brand-500 text-white flex items-center justify-center gap-2"
            >
              Next <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
