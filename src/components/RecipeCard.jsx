import { useNavigate } from 'react-router-dom';

export default function RecipeCard({ recipe, matchPct, wide, grid }) {
  const navigate = useNavigate();
  if (!recipe) return null;

  const style = grid ? { minWidth: 'auto', maxWidth: 'none' } : undefined;

  return (
    <div className={`recipe-card ${wide ? 'wide' : ''}`} style={style} onClick={() => navigate(`/recipe/${recipe.id}`)}>
      <div className="thumb" style={{ background: recipe.color }}>
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.name} loading="lazy" />
        ) : recipe.emoji}
      </div>
      <div className="body">
        <div className="name">{recipe.name}</div>
        <div className="meta">
          <span>⏱️ {recipe.time}m</span>
          <span>👨‍🍳 {recipe.difficulty}</span>
        </div>
        {matchPct != null && (
          <div style={{ marginTop: 8 }}>
            <span className="match-badge">{matchPct}% match</span>
          </div>
        )}
      </div>
    </div>
  );
}
