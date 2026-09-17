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
    <nav className="bottom-nav-premium">
      {items.map((it) => (
        <button
          key={it.path}
          className={`nav-item-premium ${it.fab ? 'fab' : ''} ${pathname === it.path ? 'active' : ''}`}
          onClick={() => navigate(it.path)}
        >
          <span className="icon">{it.icon}</span>
          {!it.fab && <span style={{ fontSize: '10px' }}>{t(it.labelKey)}</span>}
        </button>
      ))}
    </nav>
  );
}
