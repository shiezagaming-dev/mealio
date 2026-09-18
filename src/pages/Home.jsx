import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';
import AmbientBackground from '../components/AmbientBackground';

export default function Home() {
  const { state, allRecipes } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const recipes = allRecipes().slice(0, 6);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="screen" style={{ 
      position: 'relative',
      maxWidth: '800px', 
      margin: '0 auto', 
      width: '100%', 
      backgroundColor: '#171512', 
      color: '#F4EBDD',
      minHeight: '100vh',
      paddingBottom: '100px'
    }}>
      <AmbientBackground />
      
      {/* TOP AREA */}
      <div style={{ padding: '32px 24px 0', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '50%', 
            background: '#3A211C', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: '32px',
            border: '2px solid #F04A32'
          }}>
            {state.profile.avatar || '🧑‍🍳'}
          </div>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontFamily: 'Fraunces, serif', 
              lineHeight: '1.2', 
              margin: 0,
              fontWeight: '700' 
            }}>
              {greeting}, {state.profile.username || 'Chef'} 👋
            </h1>
            <p style={{ color: '#AAA39A', fontSize: '15px', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
              Qu'avez-vous envie de cuisiner aujourd'hui ?
            </p>
          </div>
        </div>

        <div style={{ 
          position: 'relative', 
          backgroundColor: '#211E19', 
          borderRadius: '16px', 
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #3A211C',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <span style={{ color: '#AAA39A', marginRight: '12px', fontSize: '20px' }}>🔍</span>
          <input 
            placeholder="Rechercher une recette, un ingrédient..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${search}`)}
            style={{ 
              backgroundColor: 'transparent', 
              border: 'none', 
              outline: 'none', 
              color: '#F4EBDD', 
              fontSize: '16px', 
              width: '100%',
              fontFamily: 'DM Sans, sans-serif'
            }}
          />
        </div>
      </div>

      {/* SIGNATURE FEATURES */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px', 
        padding: '0 24px',
        marginBottom: '40px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* AI Chef Card */}
        <div 
          onClick={() => navigate('/ai-chef')} 
          style={{ 
            backgroundColor: '#211E19', 
            borderRadius: '24px', 
            padding: '24px', 
            border: '1px solid #3A211C', 
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ 
              color: '#F04A32', 
              fontSize: '12px', 
              fontWeight: '800', 
              textTransform: 'uppercase', 
              marginBottom: '8px', 
              letterSpacing: '1px' 
            }}>✨ Assistant IA</div>
            <h2 style={{ 
              color: '#F4EBDD', 
              fontSize: '22px', 
              fontFamily: 'Fraunces, serif', 
              marginBottom: '12px',
              fontWeight: '700' 
            }}>
              Pas d'idées pour le repas ?
            </h2>
            <p style={{ color: '#AAA39A', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5', fontFamily: 'DM Sans, sans-serif' }}>
              Dites à Mealio ce qu'il reste dans votre frigo et obtenez une recette personnalisée.
            </p>
            <button style={{ 
              backgroundColor: '#F04A32', 
              color: '#F4EBDD', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              fontWeight: '700', 
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif'
            }}>
              Demander au Chef IA →
            </button>
          </div>
          <div style={{ 
            position: 'absolute', right: '-20px', bottom: '-20px', 
            fontSize: '100px', opacity: 0.1, transform: 'rotate(-15deg)', pointerEvents: 'none' 
          }}>🍳</div>
        </div>

        {/* Scan Card */}
        <div 
          onClick={() => navigate('/create?tab=scan')} 
          style={{ 
            backgroundColor: '#211E19', 
            borderRadius: '24px', 
            padding: '24px', 
            border: '1px solid #3A211C', 
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ 
              color: '#F04A32', 
              fontSize: '12px', 
              fontWeight: '800', 
              textTransform: 'uppercase', 
              marginBottom: '8px', 
              letterSpacing: '1px' 
            }}>📸 Vision Intelligente</div>
            <h2 style={{ 
              color: '#F4EBDD', 
              fontSize: '22px', 
              fontFamily: 'Fraunces, serif', 
              marginBottom: '12px',
              fontWeight: '700' 
            }}>
              Identifiez un plat
            </h2>
            <p style={{ color: '#AAA39A', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5', fontFamily: 'DM Sans, sans-serif' }}>
              Prenez une photo d'un plat et Mealio retrouve la recette pour vous.
            </p>
            <button style={{ 
              backgroundColor: 'transparent', 
              color: '#F4EBDD', 
              border: '1px solid #F04A32', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              fontWeight: '700', 
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif'
            }}>
              Ouvrir la caméra →
            </button>
          </div>
          <div style={{ 
            position: 'absolute', right: '-20px', bottom: '-20px', 
            fontSize: '100px', opacity: 0.1, transform: 'rotate(15deg)', pointerEvents: 'none' 
          }}>📷</div>
        </div>
      </div>

      {/* RECIPE SECTIONS */}
      <div style={{ padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ 
              fontSize: '22px', 
              fontFamily: 'Fraunces, serif', 
              fontWeight: 700, 
              color: '#F4EBDD' 
            }}>Recettes Populaires</h3>
            <span 
              onClick={() => navigate('/search')} 
              style={{ color: '#F04A32', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              Voir tout
            </span>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
            gap: '20px' 
          }}>
            {recipes.map((r, i) => (
              <RecipeCard key={r.id || i} recipe={r} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '80px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ 
              fontSize: '22px', 
              fontFamily: 'Fraunces, serif', 
              fontWeight: 700, 
              color: '#F4EBDD' 
            }}>Rapide & Facile</h3>
            <span 
              onClick={() => navigate('/search')} 
              style={{ color: '#F04A32', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              Explorer
            </span>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
            gap: '20px' 
          }}>
            {recipes.slice().reverse().map((r, i) => (
              <RecipeCard key={r.id || i} recipe={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
