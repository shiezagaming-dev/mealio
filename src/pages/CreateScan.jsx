import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Camera, Refrigerator, ListPlus, PlusCircle, ArrowLeft } from 'lucide-react';
import AmbientBackground from '../components/AmbientBackground';

export default function CreateScan() {
  const { t, addUserRecipe } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const modeParam = params.get('mode');

  const validModes = ['snap', 'fridge', 'ingredients', 'create'];
  const [activeMode, setActiveMode] = useState(validModes.includes(modeParam) ? modeParam : 'snap');

  const [form, setForm] = useState({ name: '', description: '', ingredients: '', instructions: '', time: '30' });
  const [saved, setSaved] = useState(false);

  const options = [
    { id: 'snap', title: t('createScan.snapTitle'), desc: t('createScan.snapDesc'), icon: Camera, color: 'var(--accent)', path: '/create/snap' },
    { id: 'fridge', title: t('createScan.fridgeTitle'), desc: t('createScan.fridgeDesc'), icon: Refrigerator, color: '#4CAF50', path: '/create/fridge' },
    { id: 'ingredients', title: t('createScan.ingredientsTitle'), desc: t('createScan.ingredientsDesc'), icon: ListPlus, color: '#FFC107', path: '/create/ingredients' },
    { id: 'create', title: t('createScan.recipeTitle'), desc: t('createScan.recipeDesc'), icon: PlusCircle, color: '#2196F3', path: '/create/recipe' },
  ];

  function handleModeSelect(mode) {
    setActiveMode(mode);
    setSaved(false);
    setForm({ name: '', description: '', ingredients: '', instructions: '', time: '30' });
  }

  function handleSaveRecipe(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const ingredients = form.ingredients.split('\n').filter(i => i.trim()).map(i => {
      const parts = i.split(',').map(p => p.trim());
      return { name: parts[0] || i.trim(), qty: parts[1] || '', unit: parts[2] || '' };
    });
    const id = addUserRecipe({
      name: form.name.trim(),
      description: form.description.trim(),
      ingredients,
      instructions: form.instructions.split('\n').filter(s => s.trim()),
      time: parseInt(form.time) || 30,
      difficulty: 'Easy',
      tags: [],
      cuisine: '',
      rating: null,
      nutrition: null,
    });
    setSaved(true);
    setTimeout(() => {
      navigate(`/recipe/${id}`);
    }, 1200);
  }

  if (activeMode === 'create') {
    return (
      <div className="screen" style={{ position: 'relative', width: '100%', backgroundColor: 'transparent' }}>
        <AmbientBackground />
        <div style={{ position: 'relative', zIndex: 1, padding: '20px 0' }}>
          <div style={{ padding: '0 var(--padding-screen)', marginBottom: '24px' }}>
            <button
              onClick={() => handleModeSelect('snap')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '14px' }}
            >
              <ArrowLeft size={18} /> {t('createScan.back') || 'Retour'}
            </button>
          </div>
          <div style={{ padding: '0 var(--padding-screen)' }}>
            <h1 style={{ fontSize: 'var(--fs-h1)', color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'var(--font-serif)' }}>
              {t('createScan.createTitle') || 'Créer une recette'}
            </h1>
            {saved ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <p style={{ color: 'var(--text-primary)', fontSize: '18px', fontFamily: 'var(--font-sans)' }}>
                  {t('createScan.saved') || 'Recette enregistrée !'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveRecipe} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px', fontFamily: 'var(--font-sans)' }}>
                    {t('createScan.nameLabel') || 'Nom de la recette'} *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t('createScan.namePlaceholder') || 'Ex: Pancakes aux bananes'}
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '15px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px', fontFamily: 'var(--font-sans)' }}>
                    {t('createScan.descLabel') || 'Description'}
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder={t('createScan.descPlaceholder') || 'Brève description...'}
                    rows={3}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '15px', resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px', fontFamily: 'var(--font-sans)' }}>
                    {t('createScan.ingredientsLabel') || 'Ingrédients (un par ligne: nom, quantité, unité)'}
                  </label>
                  <textarea
                    value={form.ingredients}
                    onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                    placeholder={t('createScan.ingredientsPlaceholder') || 'Farine, 200, g\nŒufs, 2, unit\nLait, 100, ml'}
                    rows={4}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '15px', resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px', fontFamily: 'var(--font-sans)' }}>
                    {t('createScan.instructionsLabel') || 'Instructions (un par ligne)'}
                  </label>
                  <textarea
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    placeholder={t('createScan.instructionsPlaceholder') || 'Étape 1...\nÉtape 2...'}
                    rows={4}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '15px', resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px', fontFamily: 'var(--font-sans)' }}>
                    {t('createScan.timeLabel') || 'Temps (min)'}
                  </label>
                  <input
                    type="number"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    min="1"
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: '15px' }}
                  />
                </div>
                <button type="submit" className="btn-premium btn-primary" style={{ padding: '14px', fontSize: '16px' }}>
                  {t('createScan.saveBtn') || 'Enregistrer la recette'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ position: 'relative', width: '100%', backgroundColor: 'transparent' }}>
      <AmbientBackground />

      <div style={{ position: 'relative', zIndex: 1, padding: '20px 0' }}>
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'var(--fs-h1)', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {t('createScan.hubTitle')}
          </h1>
        </header>

        <main style={{ padding: '0 var(--padding-screen)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isActive = activeMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleModeSelect(opt.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '24px 16px', borderRadius: 'var(--r-lg)',
                  background: isActive ? 'var(--accent-soft)' : 'var(--bg-card)',
                  border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  gap: '12px', textAlign: 'center'
                }}
                className="hub-card"
              >
                <div style={{
                  padding: '12px', borderRadius: '50%',
                  background: `${opt.color}20`, color: opt.color
                }}>
                  <Icon size={32} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>
                    {opt.title}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.2' }}>
                    {opt.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </main>
      </div>
    </div>
  );
}
