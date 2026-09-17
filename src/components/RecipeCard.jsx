import { useNavigate } from 'react-router-dom';

export default function RecipeCard({ recipe, matchPct, wide, grid }) {
  const navigate = useNavigate();
  if (!recipe) return null;

  return (
    <div 
      className={`recipe-card-premium ${wide ? 'wide' : ''}`} 
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      style={{ 
        display: 'flex', 
        flexDirection: wide ? 'row' : 'column',
        overflow: 'hidden',
        height: 'fit-content'
      }}
    >
      <div className="image-container" style={{ 
        position: 'relative', 
        width: wide ? '120px' : '100%', 
        aspectRatio: wide ? '1/1' : '4/3',
        overflow: 'hidden' 
      }}>
        <img 
          src={recipe.image || 'https://via.placeholder.com/400x300?text=Delicious+Food'} 
          alt={recipe.title || recipe.name} 
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Delicious+Food'; }}
        />
        <button className="save-btn">
          <span style={{ fontSize: '18px' }}>♡</span>
        </button>
      </div>
      <div className="content" style={{ padding: '12px', flex: 1 }}>
        <div className="title" style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '4px', 
          lineHeight: '1.2',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>{recipe.title || recipe.name}</div>
        <div className="meta" style={{ 
          fontSize: '13px', 
          color: 'var(--text-secondary)', 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'center' 
        }}>
          <span>⏱️ {recipe.time || recipe.prepTime || '20'} min</span>
          <span>•</span>
          <span>{recipe.difficulty || 'Medium'}</span>
        </div>
        {matchPct != null && (
          <div style={{ marginTop: 8 }}>
            <span style={{ 
              background: 'var(--accent-soft)', color: 'var(--accent)', 
              fontSize: '11px', fontWeight: '700', padding: '2px 8px', 
              borderRadius: 'var(--r-pill)' 
            }}>{matchPct}% match</span>
          </div>
        )}
      </div>
    </div>
  );
}
