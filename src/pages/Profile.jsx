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
    <div className="screen">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <div style={{ 
          width: '100px', height: '100px', borderRadius: '50%', 
          background: 'var(--accent-soft)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', fontSize: '48px', 
          margin: '0 auto var(--space-sm)', boxShadow: 'var(--shadow-md)',
          border: '4px solid var(--bg-card)'
        }}>
          {p.avatar}
        </div>
        <h1 style={{ fontSize: '28px' }}>{p.username}</h1>
        <div style={{ 
          display: 'inline-block', padding: '4px 12px', borderRadius: 'var(--r-pill)', 
          background: 'var(--accent)', color: 'white', fontSize: '12px', fontWeight: '700' 
        }}>
          Niveau {level} — Home Chef
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)', fontSize: '14px' }}>{p.bio}</p>
      </div>

      <div className="section">
        <div className="section-header-premium">
          <h3>Mes Statistiques</h3>
        </div>
        <div className="recipe-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="recipe-card-premium" style={{ padding: 'var(--space-md)', textAlign: 'center', cursor: 'default' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>{state.mealsCooked}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Repas Cuisinés</div>
          </div>
          <div className="recipe-card-premium" style={{ padding: 'var(--space-md)', textAlign: 'center', cursor: 'default' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>{cuisineCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Cuisines</div>
          </div>
          <div className="recipe-card-premium" style={{ padding: 'var(--space-md)', textAlign: 'center', cursor: 'default' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>{Math.round(totalMinutes / 60)}h</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Temps Total</div>
          </div>
          <div className="recipe-card-premium" style={{ padding: 'var(--space-md)', textAlign: 'center', cursor: 'default' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>🔥 {state.streak}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Série Actuelle</div>
          </div>
        </div>
      </div>

      <div className="section" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="section-header-premium">
          <h3>Ma Cuisine</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {KITCHEN_LINKS.map((l) => (
            <div 
              key={l.to} 
              className="recipe-card-premium" 
              style={{ 
                padding: 'var(--space-md)', display: 'flex', alignItems: 'center', 
                gap: 'var(--space-md)', cursor: 'pointer' 
              }} 
              onClick={() => navigate(l.to)}
            >
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px', 
                background: 'var(--bg-warm)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', fontSize: '20px' 
              }}>
                {l.icon}
              </div>
              <span style={{ flex: 1, fontWeight: '600', fontSize: '15px' }}>{l.label}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
