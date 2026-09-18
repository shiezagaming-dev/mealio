import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n';

const items = [
  { path: '/', icon: '🏠', labelKey: 'common.home' },
  { path: '/search', icon: '🔍', labelKey: 'common.search' },
  { path: '/create', icon: '✨', labelKey: 'common.create', primary: true },
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
    <nav className="bottom-nav">
      {items.map((it) => {
        const isActive = pathname === it.path;
        return (
          <button
            key={it.path}
            onClick={() => navigate(it.path)}
            className="nav-item"
            style={{ 
              border: 'none', 
              background: 'transparent', 
              cursor: 'pointer', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '4px',
              flex: 1,
              transition: 'all 0.2s ease',
              position: 'relative',
              color: isActive ? 'var(--mealio-accent)' : 'var(--mealio-text-secondary)',
              opacity: isActive ? 1 : 0.7
            }}
          >
            <span style={{ 
              fontSize: it.primary ? '28px' : '24px', 
              transition: 'all 0.2s ease',
              filter: isActive ? 'none' : 'grayscale(1)'
            }}>
              {it.icon}
            </span>
            {!it.primary && (
              <span style={{ 
                fontSize: '11px', 
                fontWeight: '600', 
                fontFamily: 'var(--font-body)'
              }}>
                {t(it.labelKey)}
              </span>
            )}
            {isActive && (
              <div style={{ 
                position: 'absolute', 
                bottom: '8px', 
                width: '4px', 
                height: '4px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--mealio-accent)' 
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
