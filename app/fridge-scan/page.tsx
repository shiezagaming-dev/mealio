'use client';

import React, { useState } from 'react';
import { Camera, Refrigerator, Loader2, X, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { AIService } from '@/services/ai.service';

export default function FridgeScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const prompt = "List only the food ingredients you see in this fridge. Return them as a comma-separated list. Be concise.";
      const result = await AIService.analyzeImage(image, prompt);
      
      // Nettoyage simple de la réponse pour obtenir un tableau
      const ingredients = result.split(',').map(i => i.trim()).filter(i => i.length > 0);
      setDetectedIngredients(ingredients);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  const handleGenerateIdeas = async () => {
    if (selectedIngredients.length === 0) return;
    setLoading(true);
    try {
      const prompt = `I have these ingredients: ${selectedIngredients.join(', ')}. Suggest 3 meal ideas.`;
      const result = await AIService.generateRecipe(prompt);
      alert(`Suggestions: ${result.title || 'Voir les idées générées'}`);
      // Ici on pourrait rediriger vers une page de résultats
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Scan Frigo 🧊</h1>
        <p className="text-slate-500 dark:text-slate-400">Qu'avez-vous dans vos placards ?</p>
      </header>

      {!detectedIngredients.length ? (
        <div className="space-y-6">
          <div className="aspect-square glass-card relative overflow-hidden flex items-center justify-center border-dashed border-2 border-slate-300 dark:border-slate-600">
            {image ? (
              <>
                <img src={image} alt="Fridge" className="w-full h-full object-cover" />
                <button onClick={() => setImage(null)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full"><X size={20} /></button>
              </>
            ) : (
              <div className="text-center space-y-4 p-8">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center"><Refrigerator size={32} /></div>
                <p className="text-sm text-slate-500">Prenez une photo de votre frigo</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center justify-center space-x-2 p-4 glass-card cursor-pointer">
              <Camera size={20} />
              <span className="font-medium">Photo</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
            </label>
            <label className="flex items-center justify-center space-x-2 p-4 glass-card cursor-pointer">
              <Plus size={20} />
              <span className="font-medium">Manuel</span>
              <input type="file" className="hidden" />
            </label>
          </div>

          <button 
            disabled={!image || loading}
            onClick={handleScan}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? <><Loader2 className="animate-spin" /><span>Analyse...</span></> : <span>Détecter les ingrédients</span>}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Ingrédients détectés</h2>
            <button onClick={() => setDetectedIngredients([])} className="text-sm text-slate-500">Recommencer</button>
          </div>

          <div className="flex flex-wrap gap-2">
            {detectedIngredients.map(ing => (
              <button 
                key={ing}
                onClick={() => toggleIngredient(ing)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedIngredients.includes(ing) 
                  ? "bg-brand-500 text-white shadow-md scale-105" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {ing}
              </button>
            ))}
          </div>

          <div className="p-6 glass-card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 space-y-4">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 font-bold">
              <Search size={20} />
              <span>Trouver des recettes</span>
            </div>
            <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
              L'IA va vous proposer des plats utilisant vos {selectedIngredients.length} ingrédients sélectionnés.
            </p>
            <button 
              onClick={handleGenerateIdeas}
              disabled={loading || selectedIngredients.length === 0}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Générer des idées"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
