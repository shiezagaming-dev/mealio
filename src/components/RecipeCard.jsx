import { useNavigate } from 'react-router-dom';

export default function RecipeCard({ recipe, matchPct, wide, grid }) {
  const navigate = useNavigate();
  if (!recipe) return null;

  return (
    <div 
      className={`recipe-card-premium ${wide ? 'wide' : ''}`} 
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    >
      <div className="image-container">
        <img 
          src={recipe.image || 'https://via.placeholder.com/400x300?text=Delicious+Food'} 
          alt={recipe.title || recipe.name} 
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Delicious+Food'; }}
        />
        <button className="save-btn">
          <span style={{ fontSize: '18px' }}>♡</span>
        </button>
      </div>
      <div className="content">
        <div className="title">{recipe.title || recipe.name}</div>
        <div className="meta">
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
