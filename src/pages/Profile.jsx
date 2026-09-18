import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { xpToLevel } from '../data/mockData';
import { Settings, Heart, History, Calendar, ShoppingBag, Trophy, User, ArrowRight } from 'lucide-react';
import AmbientBackground from '../components/AmbientBackground';

export default function Profile() {
  const { state, t } = useApp();
  const navigate = useNavigate();
  const { level, xpNext } = xpToLevel(state.xp);
  const p = state.profile;

  const cuisineCount = new Set(state.cuisinesCooked).size;
  
  // Data for previews
  const uncheckedShopping = state.shoppingList?.filter(i => !i.checked) || [];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayMeal = state.mealPlan?.[today];
  const savedRecipes = state.savedIds?.map(id => {
    const all = state.allRecipes ? state.allRecipes() : []; // Fallback
    return all.find(r => r.id === id);
  }).filter(Boolean) || [];

  return (
    <div className="screen" style={{ position: 'relative', width: '100%' }}>
      <AmbientBackground />
      
      <div style={{ 
        padding: '48px var(--padding-screen) 120px', 
        position: 'relative', 
        zIndex: 1 
      }}>
        {/* PROFILE HEADER */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          textAlign: 'center', marginBottom: 'var(--margin-section)' 
        }}>
          <div style={{ 
            width: '110px', height: '110px', borderRadius: '50%', 
            background: 'var(--bg-card-alt)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: '56px',
            border: '4px solid var(--text-primary)', boxShadow: 'var(--shadow-md)',
            marginBottom: '16px'
          }}>
            {p.avatar || '🧑‍🍳'}
          </div>
          <h1 style={{ fontSize: 'var(--fs-h1)', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {p.username || 'Chef'}
          </h1>
          <div style={{ 
            backgroundColor: 'var(--accent)', color: 'white', 
            padding: '6px 16px', borderRadius: '20px', fontSize: '14px', 
            fontWeight: '700', fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase', letterSpacing: '1px'
          }}>
            Niveau {level}
          </div>
        </div>

        {/* STATS GRID */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', 
          marginBottom: 'var(--margin-section)' 
        }}>
          <StatCard label={t('profile.cooked')} value={state.mealsCooked} />
          <StatCard label="Cuisines" value={cuisineCount} />
          <StatCard label="Série" value={`${state.streak}j`} />
        </div>

        {/* PREVIEW CARDS STACK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--margin-section)' }}>
          
          {/* Shopping List Preview */}
          <PreviewCard 
            title="Liste de Courses" 
            icon={ShoppingBag} 
            onClick={() => navigate('/shopping')}
            delay={0}
          >
            {uncheckedShopping.length > 0 ? (
              <>
                <div style={{ color: 'var(--accent)', fontWeight: '600', marginBottom: '8px' }}>
                  {uncheckedShopping.length} articles à acheter
                </div>
                <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>
                  {uncheckedShopping.slice(0, 3).map(i => i.name).join(', ')}
                  {uncheckedShopping.length > 3 ? '...' : ''}
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>Votre liste est vide</div>
            )}
          </PreviewCard>

          {/* Meal Plan Preview */}
          <PreviewCard 
            title="Planning Repas" 
            icon={Calendar} 
            onClick={() => navigate('/planner')}
            delay={70}
          >
            {todayMeal ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={todayMeal.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{todayMeal.name}</div>
                  <div style={{ fontSize: 'var(--fs-small)', color: 'var(--text-secondary)' }}>Prévu pour aujourd'hui</div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>Aucun repas prévu pour aujourd'hui</div>
            )}
          </PreviewCard>

          {/* Saved Recipes Preview */}
          <PreviewCard 
            title="Recettes Sauvegardées" 
            icon={Heart} 
            onClick={() => navigate('/saved')}
            delay={140}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: 'var(--accent)', fontWeight: '600' }}>
                {savedRecipes.length} recettes sauvegardées
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {savedRecipes.slice(0, 3).map((r, i) => (
                  <img key={i} src={r.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                ))}
                {savedRecipes.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-small)' }}>Aucune sauvegarde</div>}
              </div>
            </div>
          </PreviewCard>

          {/* Achievements Preview */}
          <PreviewCard 
            title="Succès" 
            icon={Trophy} 
            onClick={() => navigate('/achievements')}
            delay={210}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(state.xp % xpNext) / xpNext * 100}%`, 
                    height: '100%', 
                    background: 'var(--accent)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <span style={{ fontSize: 'var(--fs-small)', fontWeight: '600' }}>Niv {level}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0.5, fontSize: '16px'
                  }}>🏆</div>
                ))}
              </div>
            </div>
          </PreviewCard>

          {/* Simple Rows */}
          <MenuRow icon={History} label={t('profile.history')} onClick={() => navigate('/history')} />
          <MenuRow icon={Settings} label={t('profile.settings')} onClick={() => navigate('/settings')} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ 
      padding: '20px 12px', textAlign: 'center', 
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--r-md)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--accent)', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--fs-small)', color: 'var(--text-secondary)', fontWeight: '600', fontFamily: 'var(--font-sans)', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

function PreviewCard({ title, icon: Icon, children, onClick, delay }) {
  return (
    <div 
      onClick={onClick}
      className="recipe-card-premium"
      style={{ 
        padding: '20px', 
        backgroundColor: 'var(--bg-card)', 
        borderRadius: 'var(--r-lg)', 
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        animation: `cardEntrance 300ms ease-out forwards`,
        animationDelay: `${delay}ms`,
        opacity: 0
      }}
    >
      <style>{`
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .preview-card { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '36px', height: '36px', borderRadius: '10px', 
          backgroundColor: 'var(--accent-soft)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)'
        }}>
          <Icon size={20} />
        </div>
        <span style={{ fontWeight: '700', fontSize: 'var(--fs-h2)', color: 'var(--text-primary)' }}>
          {title}
        </span>
      </div>
      
      <div style={{ padding: '0 4px' }}>
        {children}
      </div>

      <div style={{ 
        textAlign: 'right', 
        fontSize: 'var(--fs-small)', 
        color: 'var(--accent)', 
        fontWeight: '600', 
        cursor: 'pointer' 
      }}>
        Voir tout →
      </div>
    </div>
  );
}

function MenuRow({ icon: Icon, label, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', alignItems: 'center', padding: '16px', 
        backgroundColor: 'var(--bg-card)', 
        borderRadius: 'var(--r-md)', 
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-sm)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-card-alt)';
        e.currentTarget.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div style={{ 
        width: '40px', height: '40px', borderRadius: '10px', 
        backgroundColor: 'var(--bg-card-alt)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginRight: '16px', color: 'var(--accent)'
      }}>
        <Icon size={20} />
      </div>
      <span style={{ flex: 1, fontWeight: '500', fontSize: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
        {label}
      </span>
      <ArrowRight size={18} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
    </div>
  );
}
