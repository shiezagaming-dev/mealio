import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { xpToLevel } from '../data/mockData';

const KITCHEN_LINKS = [
  { to: '/saved', icon: '❤️', label: 'Recettes Sauvegardées' },
  { to: '/history', icon: '🕐', label: 'Historique' },
  { to: '/planner', icon: '📅', label: 'Planificateur' },
  { to: '/shopping', icon: '🛒', label: 'Liste de Courses' },
  { to: '/achievements', icon: '🏆', label: 'Succès' },
  { to: '/ai-chef', icon: '✨', label: 'Chef IA' },
  { to: '/settings', icon: '⚙️', label: 'Paramètres' },
];

export default function Profile() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { level } = xpToLevel(state.xp);
  const p = state.profile;

  const cuisineCount = new Set(state.cuisinesCooked).size;
  const totalMinutes = state.mealsCooked * 22;

  return (
    <div className="screen" style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      width: '100%', 
      backgroundColor: '#171512', 
      color: '#F4EBDD',
      minHeight: '100vh',
      paddingBottom: '100px'
    }}>
      {/* PROFILE HEADER */}
      <div style={{ textAlign: 'center', padding: '40px 24px 0', marginBottom: '32px' }}>
        <div style={{ 
          width: '110px', height: '110px', borderRadius: '50%', 
          background: '#211E19', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', fontSize: '56px', 
          margin: '0 auto 16px', border: '3px solid #F04A32',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
        }}>
          {p.avatar}
        </div>
        <h1 style={{ 
          fontSize: '32px', 
          fontFamily: 'Fraunces, serif', 
          fontWeight: '700', 
          margin: '0 0 8px 0' 
        }}>
          {p.username}
        </h1>
        <div style={{ 
          display: 'inline-block', padding: '6px 16px', borderRadius: '20px', 
          background: '#F04A32', color: '#F4EBDD', fontSize: '13px', fontWeight: '700',
          fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          Niveau {level} — Home Chef
        </div>
        <p style={{ 
          color: '#AAA39A', 
          marginTop: '16px', 
          fontSize: '16px', 
          fontFamily: 'DM Sans, sans-serif',
          maxWidth: '400px',
          marginInline: 'auto',
          lineHeight: '1.5'
        }}>
          {p.bio}
        </p>
      </div>

      {/* STATS GRID */}
      <div style={{ padding: '0 24px', marginBottom: '40px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontFamily: 'Fraunces, serif', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#F4EBDD'
        }}>Mes Statistiques</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '16px' 
        }}>
          {[
            { label: 'Repas Cuisinés', value: state.mealsCooked, icon: '🍳' },
            { label: 'Cuisines', value: cuisineCount, icon: '🌎' },
            { label: 'Temps Total', value: `${Math.round(totalMinutes / 60)}h`, icon: '⏱️' },
            { label: 'Série Actuelle', value: `🔥 ${state.streak}`, icon: '🔥' },
          ].map((stat, i) => (
            <div key={i} style={{ 
              backgroundColor: '#211E19', 
              borderRadius: '20px', 
              padding: '20px', 
              textAlign: 'center', 
              border: '1px solid #3A211C',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#F04A32', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: '#AAA39A', fontWeight: '600', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KITCHEN NAVIGATION */}
      <div style={{ padding: '0 24px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontFamily: 'Fraunces, serif', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#F4EBDD'
        }}>Ma Cuisine</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {KITCHEN_LINKS.map((l) => (
            <div 
              key={l.to} 
              onClick={() => navigate(l.to)}
              style={{ 
                backgroundColor: '#211E19', 
                padding: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                cursor: 'pointer',
                borderRadius: '16px',
                border: '1px solid #3A211C',
                transition: 'all 0.2s ease',
                fontFamily: 'DM Sans, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#27231D';
                e.currentTarget.style.borderColor = '#F04A32';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#211E19';
                e.currentTarget.style.borderColor = '#3A211C';
              }}
            >
              <div style={{ 
                width: '44px', height: '44px', borderRadius: '12px', 
                background: '#171512', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                border: '1px solid #3A211C'
              }}>
                {l.icon}
              </div>
              <span style={{ flex: 1, fontWeight: '600', fontSize: '16px', color: '#F4EBDD' }}>{l.label}</span>
              <span style={{ color: '#AAA39A', fontSize: '20px' }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
