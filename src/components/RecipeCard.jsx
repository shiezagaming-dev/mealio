import { useNavigate } from 'react-router-dom';

export default function RecipeCard({ recipe, matchPct, wide }) {
  const navigate = useNavigate();
  if (!recipe) return null;

  return (
    <div 
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      style={{ 
        display: 'flex', 
        flexDirection: wide ? 'row' : 'column',
        backgroundColor: '#211E19',
        borderRadius: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: '1px solid #3A211C',
        height: 'fit-content',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
      }}
    >
      <div style={{ 
        position: 'relative', 
        width: wide ? '140px' : '100%', 
        aspectRatio: wide ? '1/1' : '4/3',
        overflow: 'hidden' 
      }}>
        <img 
          src={recipe.image || 'https://via.placeholder.com/400x300?text=Delicious+Food'} 
          alt={recipe.title || recipe.name} 
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {matchPct != null && (
          <div style={{ 
            position: 'absolute', top: '12px', left: '12px', 
            backgroundColor: '#F04A32', color: '#F4EBDD', 
            fontSize: '10px', fontWeight: '800', padding: '4px 8px', 
            borderRadius: '8px', textTransform: 'uppercase' 
          }}>
            {matchPct}% Match
          </div>
        )}
      </div>
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: '#F4EBDD',
          marginBottom: '6px', 
          lineHeight: '1.3',
          fontFamily: 'Fraunces, serif',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {recipe.title || recipe.name}
        </div>
        <div style={{ 
          fontSize: '13px', 
          color: '#AAA39A', 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          fontFamily: 'DM Sans, sans-serif'
        }}>
          <span>⏱️ {recipe.time || recipe.prepTime || '20'} min</span>
          <span>•</span>
          <span>{recipe.difficulty || 'Medium'}</span>
        </div>
      </div>
    </div>
  );
}
