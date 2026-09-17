import { useLocation, useNavigate } from 'react-router-dom';

const items = [
  { path: '/', icon: '🏠', label: 'Accueil' },
  { path: '/search', icon: '🔍', label: 'Recherche' },
  { path: '/create', icon: '✨', label: 'Créer', fab: true },
  { path: '/saved', icon: '❤️', label: 'Sauvegardés' },
  { path: '/profile', icon: '👤', label: 'Profil' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav-premium">
      {items.map((it) => (
        <button
          key={it.path}
          className={`nav-item-premium ${it.fab ? 'fab' : ''} ${pathname === it.path ? 'active' : ''}`}
          onClick={() => navigate(it.path)}
        >
          <span className="icon">{it.icon}</span>
          {!it.fab && <span>{it.label}</span>}
        </button>
      ))}
    </nav>
  );
}
