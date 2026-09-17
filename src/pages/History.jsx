import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function groupByDay(history) {
  const groups = {};
  history.forEach((h) => {
    const d = new Date(h.date);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (d.toDateString() === today) label = 'Aujourd\'hui';
    else if (d.toDateString() === yesterday) label = 'Hier';
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
    <div className="screen" style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      width: '100%', 
      backgroundColor: '#171512', 
      color: '#F4EBDD',
      minHeight: '100vh',
      paddingBottom: '100px'
    }}>
      <div style={{ padding: '32px 24px 0', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              background: '#211E19', border: '1px solid #3A211C', color: '#F4EBDD', 
              width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            ←
          </button>
          <h1 style={{ 
            fontSize: '32px', 
            fontFamily: 'Fraunces, serif', 
            fontWeight: '700', 
            margin: 0 
          }}>Historique</h1>
        </div>

        {Object.keys(groups).length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: '60px 0', color: '#AAA39A',
            fontFamily: 'DM Sans, sans-serif'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🕐</div>
            <p>Votre historique est vide.</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Vos scans, recherches et repas cuisinés apparaîtront ici.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {Object.entries(groups).map(([label, items]) => (
              <div key={label}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontFamily: 'Fraunces, serif', 
                  fontWeight: '600', 
                  marginBottom: '12px', 
                  color: '#AAA39A',
                  borderBottom: '1px solid #3A211C',
                  paddingBottom: '8px'
                }}>
                  {label}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((h) => (
                    <div 
                      key={h.id} 
                      onClick={() => h.recipeId && navigate(`/recipe/${h.recipeId}`)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', 
                        backgroundColor: '#211E19', borderRadius: '16px', 
                        border: '1px solid #3A211C', cursor: h.recipeId ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        fontFamily: 'DM Sans, sans-serif'
                      }}
                      onMouseEnter={(e) => h.recipeId && (e.currentTarget.style.backgroundColor = '#27231D')}
                      onMouseLeave={(e) => h.recipeId && (e.currentTarget.style.backgroundColor = '#211E19')}
                    >
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', 
                        background: '#171512', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                        border: '1px solid #3A211C'
                      }}>
                        {h.icon}
                      </div>
                      <span style={{ flex: 1, fontSize: '15px', color: '#F4EBDD', fontWeight: '500' }}>{h.label}</span>
                      {h.recipeId && <span style={{ color: '#AAA39A', fontSize: '18px' }}>›</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
