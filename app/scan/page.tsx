'use client';

import React, { useState } from 'react';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AIService } from '@/services/ai.service';

export default function ScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    
    try {
      // 1. Identification visuelle via le service AI (Worker)
      const identification = await AIService.analyzeImage(
        image, 
        "Identify this food dish. Tell me the name of the dish and the main ingredients you see. Be concise."
      );

      // 2. Génération de la recette complète
      const recipeData = await AIService.generateRecipe(
        `Create a professional recipe for: ${identification}. Include title, description, prepTime, cookTime, difficulty, servings, ingredients (array of {item, amount, unit}), and instructions (array of {step, text}).`
      );
      
      router.push(`/recipe/${recipeData.id || 'ai-generated'}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Scanner un plat</h1>
        <p className="text-slate-500 dark:text-slate-400">Prenez une photo pour obtenir la recette instantanément.</p>
      </header>

      <div className="aspect-square glass-card relative overflow-hidden flex items-center justify-center border-dashed border-2 border-slate-300 dark:border-slate-600">
        {image ? (
          <>
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => setImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <div className="text-center space-y-4 p-8">
            <div className="mx-auto w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full flex items-center justify-center">
              <Camera size={32} />
            </div>
            <p className="text-sm text-slate-500">Aucune image sélectionnée</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center justify-center space-x-2 p-4 glass-card cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Camera size={20} />
          <span className="font-medium">Photo</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
        </label>
        
        <label className="flex items-center justify-center space-x-2 p-4 glass-card cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Upload size={20} />
          <span className="font-medium">Galerie</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <button 
        disabled={!image || loading}
        onClick={handleAnalyze}
        className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            <span>Analyse IA en cours...</span>
          </>
        ) : (
          <span>Identifier le plat</span>
        )}
      </button>
    </div>
  );
}
