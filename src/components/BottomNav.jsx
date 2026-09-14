import { useLocation, useNavigate } from 'react-router-dom';

const items = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/search', icon: '🔎', label: 'Search' },
  { path: '/create', icon: '➕', label: 'Create', fab: true },
  { path: '/saved', icon: '❤️', label: 'Saved' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <button
          key={it.path}
          className={`nav-item ${it.fab ? 'fab' : ''} ${pathname === it.path ? 'active' : ''}`}
          onClick={() => navigate(it.path)}
        >
          <span className="nav-icon">{it.icon}</span>
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
