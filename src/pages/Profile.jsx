import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { xpToLevel } from '../data/mockData';

const KITCHEN_LINKS = [
  { to: '/saved', icon: '❤️', label: 'Saved Recipes' },
  { to: '/history', icon: '🕐', label: 'History' },
  { to: '/planner', icon: '📅', label: 'Meal Plan' },
  { to: '/shopping', icon: '🛒', label: 'Shopping List' },
  { to: '/achievements', icon: '🏆', label: 'Achievements' },
  { to: '/ai-chef', icon: '🗣️', label: 'AI Chef' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Profile() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { level } = xpToLevel(state.xp);
  const p = state.profile;

  const cuisineCount = new Set(state.cuisinesCooked).size;
  const totalMinutes = state.mealsCooked * 22; // rough estimate for the stats tile

  return (
    <div className="screen">
      <h1>My Kitchen</h1>

      <div className="card section" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
        <div className="avatar">{p.avatar}</div>
        <div className="grow">
          <div style={{ fontWeight: 700, fontSize: 17 }}>{p.username}</div>
          <div className="sub">{p.bio}</div>
          <div className="xp-pill" style={{ marginTop: 6 }}>Level {level} — Home Chef</div>
        </div>
      </div>

      <div className="section">
        <div className="section-head"><h3>📊 Cooking Stats</h3></div>
        <div className="grid-2">
          <div className="stat-tile"><div className="num">{state.mealsCooked}</div><div className="label">Meals Cooked</div></div>
          <div className="stat-tile"><div className="num">{cuisineCount}</div><div className="label">Cuisines</div></div>
          <div className="stat-tile"><div className="num">{Math.round(totalMinutes / 60)}h</div><div className="label">Cooking Time</div></div>
          <div className="stat-tile"><div className="num">🔥 {state.streak}</div><div className="label">Day Streak</div></div>
        </div>
      </div>

      <div className="section">
        <div className="card" style={{ padding: '4px 16px' }}>
          {KITCHEN_LINKS.map((l) => (
            <div key={l.to} className="list-row" style={{ cursor: 'pointer' }} onClick={() => navigate(l.to)}>
              <span className="icon">{l.icon}</span>
              <span className="grow title" style={{ fontSize: 14.5 }}>{l.label}</span>
              <span>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
