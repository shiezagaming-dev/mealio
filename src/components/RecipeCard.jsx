import { useNavigate } from 'react-router-dom';

export default function RecipeCard({ recipe, matchPct, wide, grid }) {
  const navigate = useNavigate();
  if (!recipe) return null;

  const style = grid ? { minWidth: 'auto', maxWidth: 'none' } : undefined;
  const title = recipe.title || recipe.name;
  const time = recipe.prepTime + recipe.cookTime || recipe.time;

  return (
    <div className={`recipe-card ${wide ? 'wide' : ''}`} style={style} onClick={() => navigate(`/recipe/${recipe.id}`)}>
      <div className="thumb" style={{ background: recipe.color }}>
        {recipe.image ? (
          <img src={recipe.image} alt={title} loading="lazy" />
        ) : recipe.emoji}
      </div>
      <div className="body">
        <div className="name">{title}</div>
        <div className="meta">
          <span>⏱️ {time}m</span>
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
