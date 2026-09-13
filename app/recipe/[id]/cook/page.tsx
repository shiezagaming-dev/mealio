'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Timer, Volume2, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Recipe } from '@/types';

export default function CookModePage() {
  const { id } = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    // Simulation fetch
    setRecipe({
      id: id as string,
      title: "Risotto aux Champignons Crémeux",
      instructions: [
        { step: 1, text: "Faire revenir les champignons dans un peu de beurre jusqu'à ce qu'ils soient dorés." },
        { step: 2, text: "Ajouter le riz et nacrer pendant 2 minutes." },
        { step: 3, text: "Ajouter le bouillon louche après louche en remuant constamment." },
        { step: 4, text: "Incorporer le beurre et le parmesan hors du feu pour l'onctuosité." },
      ],
      ingredients: [],
      // ... reste des champs
    } as Recipe);
  }, [id]);

  if (!recipe) return null;

  const steps = recipe.instructions;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="h-screen w-full bg-white dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg">{recipe.title}</h1>
          <p className="text-xs text-slate-500">Étape {currentStep + 1} sur {steps.length}</p>
        </div>
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <HelpCircle size={24} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
        <div 
          className="h-full bg-brand-500 transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-8">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="text-brand-500 font-bold text-xl">Étape {currentStep + 1}</span>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            {steps[currentStep].text}
          </h2>
        </div>

        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium">
            <Timer size={18} />
            <span>Minuteur</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium">
            <Volume2 size={18} />
            <span>Lire à voix haute</span>
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-8 flex justify-between items-center">
        <button 
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(s => s - 1)}
          className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 disabled:opacity-30"
        >
          <ChevronLeft size={32} />
        </button>

        {currentStep === steps.length - 1 ? (
          <button 
            onClick={() => alert("Félicitations ! Plat terminé !")}
            className="px-8 py-4 bg-green-500 text-white rounded-2xl font-bold flex items-center space-x-2 shadow-lg shadow-green-500/30"
          >
            <CheckCircle2 size={24} />
            <span>Terminer</span>
          </button>
        ) : (
          <button 
            onClick={() => setCurrentStep(s => s + 1)}
            className="px-8 py-4 bg-brand-500 text-white rounded-2xl font-bold flex items-center space-x-2 shadow-lg shadow-brand-500/30"
          >
            <span>Suivant</span>
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
