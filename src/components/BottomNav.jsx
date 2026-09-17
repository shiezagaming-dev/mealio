import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n';

const items = [
  { path: '/', icon: '🏠', labelKey: 'common.home' },
  { path: '/search', icon: '🔍', labelKey: 'common.search' },
  { path: '/create', icon: '✨', labelKey: 'common.create', fab: true },
  { path: '/saved', icon: '❤️', labelKey: 'common.saved' },
  { path: '/profile', icon: '👤', labelKey: 'common.profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useApp();
  
  const lang = state.language || 'fr';
  const t = (key) => {
    const keys = key.split('.');
    let result = translations[lang];
    for (const k of keys) {
      result = result?.[k];
    }
    return result || key;
  };

  return (
    <nav className="bottom-nav-premium" style={{ 
      position: 'fixed', 
      bottom: 0, 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: '100%', 
      maxWidth: '600px', 
      zIndex: 1000,
      backgroundColor: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 0',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
    }}>
      {items.map((it) => (
        <button
          key={it.path}
          className={`nav-item-premium ${it.fab ? 'fab' : ''} ${pathname === it.path ? 'active' : ''}`}
          onClick={() => navigate(it.path)}
          style={{ 
            border: 'none', 
            background: 'transparent', 
            cursor: 'pointer', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '4px',
            flex: 1
          }}
        >
          <span className="icon" style={{ fontSize: '20px' }}>{it.icon}</span>
          {!it.fab && <span style={{ fontSize: '10px', fontWeight: '500', color: pathname === it.path ? 'var(--accent)' : 'var(--text-secondary)' }}>{t(it.labelKey)}</span>}
        </button>
      ))}
    </nav>
  );
}
