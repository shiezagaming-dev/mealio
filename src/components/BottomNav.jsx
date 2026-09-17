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
    <nav style={{ 
      position: 'fixed', 
      bottom: 0, 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: '100%', 
      maxWidth: '800px', // Contrainte tablette
      zIndex: 1000,
      backgroundColor: '#211E19',
      borderTop: '1px solid #3A211C',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '12px 0',
      paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.4)'
    }}>
      {items.map((it) => {
        const isActive = pathname === it.path;
        return (
          <button
            key={it.path}
            onClick={() => navigate(it.path)}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              cursor: 'pointer', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '4px',
              flex: 1,
              transition: 'all 0.2s ease',
              position: 'relative',
              padding: '8px 0'
            }}
          >
            <span style={{ 
              fontSize: it.primary ? '28px' : '24px', 
              filter: isActive ? 'none' : 'grayscale(1)',
              opacity: isActive ? 1 : 0.6,
              transition: 'all 0.2s ease'
            }}>
              {it.icon}
            </span>
            {!it.primary && (
              <span style={{ 
                fontSize: '11px', 
                fontWeight: '600', 
                color: isActive ? '#F04A32' : '#AAA39A',
                transition: 'all 0.2s ease'
              }}>
                {t(it.labelKey)}
              </span>
            )}
            {isActive && (
              <div style={{ 
                position: 'absolute', 
                bottom: -8, 
                width: '4px', 
                height: '4px', 
                borderRadius: '50%', 
                backgroundColor: '#F04A32' 
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
