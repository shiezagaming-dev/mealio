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
      maxWidth: 'var(--app-max-width)', 
      margin: '0 auto', 
      width: '100%', 
      backgroundColor: 'var(--bg-main)', 
      color: 'var(--text-primary)',
      minHeight: '100vh',
      paddingBottom: '100px'
    }}>
      <AmbientBackground />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* TOP AREA */}
        <div style={{ padding: '32px var(--padding-screen) 0', marginBottom: 'var(--margin-section)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '50%', 
              background: '#3A211C', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', fontSize: '32px',
              border: '2px solid var(--accent)'
            }}>
              {state.profile.avatar || '🧑‍🍳'}
            </div>
            <div>
              <h1 style={{ 
                fontSize: 'var(--fs-h1)', 
                fontFamily: 'var(--font-serif)', 
                lineHeight: '1.2', 
                margin: 0,
                fontWeight: '700' 
              }}>
                {greeting}, {state.profile.username || 'Chef'} 👋
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-body)', margin: 0, fontFamily: 'var(--font-sans)' }}>
                Qu'avez-vous envie de cuisiner aujourd'hui ?
              </p>
            </div>
          </div>

          <div style={{ 
            position: 'relative', 
            backgroundColor: 'var(--bg-card)', 
            borderRadius: '16px', 
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--border-color)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}>
            <span style={{ color: 'var(--text-secondary)', marginRight: '12px', fontSize: '20px' }}>🔍</span>
            <input 
              placeholder="Rechercher une recette, un ingrédient..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${search}`)}
              style={{ 
                backgroundColor: 'transparent', 
                border: 'none', 
                outline: 'none', 
                color: 'var(--text-primary)', 
                fontSize: '16px', 
                width: '100%',
                fontFamily: 'var(--font-sans)'
              }}
            />
          </div>
        </div>

        {/* SIGNATURE FEATURES */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px', 
          padding: '0 var(--padding-screen)',
          marginBottom: '40px'
        }}>
          {/* AI Chef Card */}
          <div 
            onClick={() => navigate('/ai-chef')} 
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '24px', 
              padding: '24px', 
              border: '1px solid var(--border-color)', 
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
                color: 'var(--accent)', 
                fontSize: '12px', 
                fontWeight: '800', 
                textTransform: 'uppercase', 
                marginBottom: '8px', 
                letterSpacing: '1px' 
              }}>✨ Assistant IA</div>
              <h2 style={{ 
                color: 'var(--text-primary)', 
                fontSize: 'var(--fs-h2)', 
                fontFamily: 'var(--font-serif)', 
                marginBottom: '12px',
                fontWeight: '700' 
              }}>
                Pas d'idées pour le repas ?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-body)', marginBottom: '20px', lineHeight: '1.5', fontFamily: 'var(--font-sans)' }}>
                Dites à Mealio ce qu'il reste dans votre frigo et obtenez une recette personnalisée.
              </p>
              <button style={{ 
                backgroundColor: 'var(--accent)', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '12px', 
                fontWeight: '700', 
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)'
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
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '24px', 
              padding: '24px', 
              border: '1px solid var(--border-color)', 
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
                color: 'var(--accent)', 
                fontSize: '12px', 
                fontWeight: '800', 
                textTransform: 'uppercase', 
                marginBottom: '8px', 
                letterSpacing: '1px' 
              }}>📸 Vision Intelligente</div>
              <h2 style={{ 
                color: 'var(--text-primary)', 
                fontSize: 'var(--fs-h2)', 
                fontFamily: 'var(--font-serif)', 
                marginBottom: '12px',
                fontWeight: '700' 
              }}>
                Identifiez un plat
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-body)', marginBottom: '20px', lineHeight: '1.5', fontFamily: 'var(--font-sans)' }}>
                Prenez une photo d'un plat et Mealio retrouve la recette pour vous.
              </p>
              <button style={{ 
                backgroundColor: 'transparent', 
                color: 'var(--text-primary)', 
                border: '1px solid var(--accent)', 
                padding: '10px 20px', 
                borderRadius: '12px', 
                fontWeight: '700', 
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)'
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
        <div style={{ padding: '0 var(--padding-screen)' }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h3 style={{ 
                fontSize: 'var(--fs-h2)', 
                fontFamily: 'var(--font-serif)', 
                fontWeight: 700, 
                color: 'var(--text-primary)' 
              }}>Recettes Populaires</h3>
              <span 
                onClick={() => navigate('/search')} 
                style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
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
                fontSize: 'var(--fs-h2)', 
                fontFamily: 'var(--font-serif)', 
                fontWeight: 700, 
                color: 'var(--text-primary)' 
              }}>Rapide & Facile</h3>
              <span 
                onClick={() => navigate('/search')} 
                style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
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
    </div>
  );
}
