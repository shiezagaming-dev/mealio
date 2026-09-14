import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function groupByDay(history) {
  const groups = {};
  history.forEach((h) => {
    const d = new Date(h.date);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (d.toDateString() === today) label = 'Today';
    else if (d.toDateString() === yesterday) label = 'Yesterday';
    groups[label] = groups[label] || [];
    groups[label].push(h);
  });
  return groups;
}

export default function History() {
  const { state } = useApp();
  const navigate = useNavigate();
  const groups = groupByDay(state.history);

  return (
    <div className="screen">
      <div className="back-row" style={{ padding: 0, marginBottom: 6 }}>
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <h1 style={{ marginLeft: 12 }}>History</h1>
      </div>

      {Object.keys(groups).length === 0 ? (
        <div className="empty-state">
          <div className="glyph">🕐</div>
          <p>Nothing here yet — your scans, searches, and cooked meals will show up here.</p>
        </div>
      ) : (
        Object.entries(groups).map(([label, items]) => (
          <div key={label} className="section">
            <div className="section-head"><h3>{label}</h3></div>
            <div className="card" style={{ padding: '4px 16px' }}>
              {items.map((h) => (
                <div key={h.id} className="list-row" style={{ cursor: h.recipeId ? 'pointer' : 'default' }} onClick={() => h.recipeId && navigate(`/recipe/${h.recipeId}`)}>
                  <span className="icon">{h.icon}</span>
                  <span className="grow sub" style={{ color: 'var(--ink)' }}>{h.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
