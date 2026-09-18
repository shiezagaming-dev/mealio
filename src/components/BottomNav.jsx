import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Home, Search, Plus, Heart, User } from 'lucide-react';

const items = [
  { path: '/', icon: Home, labelKey: 'common.home' },
  { path: '/search', icon: Search, labelKey: 'common.search' },
  { path: '/create', icon: Plus, labelKey: 'common.create', primary: true },
  { path: '/saved', icon: Heart, labelKey: 'common.saved' },
  { path: '/profile', icon: User, labelKey: 'common.profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useApp();
  
  return (
    <nav className="bottom-nav-premium">
      {items.map((it) => {
        const isActive = pathname === it.path;
        const Icon = it.icon;
        return (
          <button
            key={it.path}
            onClick={() => navigate(it.path)}
            className={`nav-item-premium ${it.primary ? 'fab' : ''} ${isActive ? 'active' : ''}`}
            style={{ 
              border: 'none', 
              background: it.primary ? 'var(--accent)' : 'transparent', 
              cursor: 'pointer', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '4px',
              flex: 1,
              transition: 'all 0.2s ease',
              color: isActive && !it.primary ? 'var(--mealio-accent)' : (it.primary ? 'white' : 'var(--text-secondary)'),
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
            }}>
              <Icon size={it.primary ? 26 : 22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            {!it.primary && (
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '500', 
                fontFamily: 'var(--font-sans)'
              }}>
                {t(it.labelKey)}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
