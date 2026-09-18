import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { xpToLevel } from '../data/mockData';
import { Settings, Heart, History, Calendar, ShoppingBag, Trophy, User, ArrowRight } from 'lucide-react';

export default function Profile() {
  const { state, setState, toggleTheme, showToast, t } = useApp();
  const navigate = useNavigate();
  const { level } = xpToLevel(state.xp);
  const p = state.profile;

  const cuisineCount = new Set(state.cuisinesCooked).size;
  const totalMinutes = state.mealsCooked * 22;

  return (
    <div className="app-container" style={{ padding: '48px 24px 120px' }}>
      {/* PROFILE HEADER */}
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        textAlign: 'center', marginBottom: '40px' 
      }}>
        <div style={{ 
          width: '110px', height: '110px', borderRadius: '50%', 
          background: 'var(--mealio-surface-warm)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', fontSize: '56px',
          border: '4px solid white', boxShadow: 'var(--shadow-medium)',
          marginBottom: '16px'
        }}>
          {p.avatar || '🧑‍🍳'}
        </div>
        <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', color: 'var(--mealio-text-primary)' }}>
          {p.username || 'Chef'}
        </h1>
        <div style={{ 
          backgroundColor: 'var(--mealio-accent)', color: 'white', 
          padding: '6px 16px', borderRadius: '20px', fontSize: '14px', 
          fontWeight: '700', fontFamily: 'var(--font-body)',
          textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          Niveau {level}
        </div>
      </div>

      {/* STATS GRID */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', 
        marginBottom: '40px' 
      }}>
        <StatCard label={t('profile.cooked')} value={state.mealsCooked} />
        <StatCard label="Cuisines" value={cuisineCount} />
        <StatCard label="Série" value={`${state.streak}j`} />
      </div>

      {/* NAVIGATION MENU */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <MenuRow icon={Heart} label={t('profile.saved')} onClick={() => navigate('/saved')} />
        <MenuRow icon={History} label={t('profile.history')} onClick={() => navigate('/history')} />
        <MenuRow icon={Calendar} label={t('profile.mealPlan')} onClick={() => navigate('/mealplan')} />
        <MenuRow icon={ShoppingBag} label={t('profile.shoppingList')} onClick={() => navigate('/shopping')} />
        <MenuRow icon={Trophy} label={t('profile.achievements')} onClick={() => {}} />
        
        <div style={{ height: '1px', background: 'var(--mealio-border)', margin: '24px 0' }} />
        
        <MenuRow icon={Settings} label={t('profile.settings')} onClick={() => navigate('/settings')} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ 
      padding: '20px 12px', textAlign: 'center', 
      backgroundColor: 'var(--mealio-surface)',
      border: '1px solid var(--mealio-border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-subtle)'
    }}>
      <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--mealio-accent)', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--mealio-text-secondary)', fontWeight: '600', fontFamily: 'var(--font-body)', textTransform: 'uppercase' }}>
        {label}
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
        backgroundColor: 'var(--mealio-surface)', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid var(--mealio-border)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-subtle)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--mealio-surface-warm)';
        e.currentTarget.style.borderColor = 'var(--mealio-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--mealio-surface)';
        e.currentTarget.style.borderColor = 'var(--mealio-border)';
      }}
    >
      <div style={{ 
        width: '40px', height: '40px', borderRadius: '10px', 
        backgroundColor: 'var(--mealio-surface-warm)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginRight: '16px', color: 'var(--mealio-accent)'
      }}>
        <Icon size={20} />
      </div>
      <span style={{ flex: 1, fontWeight: '500', fontSize: '16px', color: 'var(--mealio-text-primary)', fontFamily: 'var(--font-body)' }}>
        {label}
      </span>
      <ArrowRight size={18} style={{ color: 'var(--mealio-text-secondary)', opacity: 0.5 }} />
    </div>
  );
}
