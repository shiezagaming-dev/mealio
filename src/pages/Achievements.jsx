import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { achievementDefs, xpToLevel } from '../data/mockData';

export default function Achievements() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { level, into, needed } = xpToLevel(state.xp);

  return (
    <div className="screen">
      <div className="back-row" style={{ padding: 0, marginBottom: 6 }}>
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <h1 style={{ marginLeft: 12 }}>Achievements</h1>
      </div>

      <div className="card section" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3>Level {level} — Home Chef</h3>
          <span className="xp-pill">⭐ {state.xp} XP</span>
        </div>
        <div className="progress-track" style={{ marginTop: 10 }}>
          <div className="progress-fill" style={{ width: `${(into / needed) * 100}%` }} />
        </div>
        <p className="sub" style={{ marginTop: 8 }}>{needed - into} XP to level {level + 1}</p>
      </div>

      <div className="section">
        <div className="section-head"><h3>Badges</h3></div>
        <div className="grid-2">
          {achievementDefs.map((a) => {
            const unlocked = state.unlockedAchievements.includes(a.id);
            return (
              <div key={a.id} className={`badge-tile ${unlocked ? '' : 'locked'}`}>
                <div className="glyph">{a.glyph}</div>
                <div className="name">{a.name}</div>
                <div className="desc">{a.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
