import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';
import AmbientBackground from '../components/AmbientBackground';
import { Camera, Refrigerator, ListPlus, PlusCircle, Sparkles } from 'lucide-react';

export default function Home() {
  const { state, allRecipes } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const recipes = allRecipes().slice(0, 6);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const quickActions = [
    { id: 'snap', label: 'Snap a Meal', icon: Camera, path: '/create?mode=snap', color: 'var(--accent)' },
    { id: 'fridge', label: 'Fridge Scan', icon: Refrigerator, path: '/create?mode=fridge', color: '#4CAF50' },
    { id: 'ingredients', label: 'Ingredients', icon: ListPlus, path: '/create?mode=ingredients', color: '#FFC107' },
    { id: 'create', label: 'Create Recipe', icon: PlusCircle, path: '/create?mode=create', color: '#2196F3' },
  ];

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
              overflow: 'hidden',
              border: '2px solid var(--accent)',
              flexShrink: 0,
              backgroundColor: '#3A211C'
            }}>
              {state.profile.avatar ? (
                <img 
                  src={state.profile.avatar} 
                  alt="Profile photo" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '100%', 
                  height: '100%', 
                  fontSize: '24px'
                }}>
                  🧑‍🍳
                </span>
              )}
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

        {/* CREATE & SCAN QUICK ACTIONS */}
        <div style={{ padding: '0 var(--padding-screen)', marginBottom: '40px' }}>
          <h3 style={{ 
            fontSize: 'var(--fs-h2)', 
            fontFamily: 'var(--font-serif)', 
            marginBottom: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <Sparkles size={20} color="var(--accent)" /> Créer &amp; Scanner
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px' 
          }}>
            {quickActions.map((action) => (
              <button 
                key={action.id}
                onClick={() => navigate(action.path)}
                className="recipe-card-premium"
                style={{ 
                  padding: '20px', 
                  textAlign: 'left', 
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  minHeight: '100px'
                }}
              >
                <action.icon size={24} style={{ color: action.color }} />
                <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AI CHEF ENTRY */}
        <div style={{ padding: '0 var(--padding-screen)', marginBottom: '40px' }}>
          <div 
            onClick={() => navigate('/ai-chef')}
            className="recipe-card-premium"
            style={{ 
              padding: '24px', 
              backgroundColor: 'linear-gradient(135deg, var(--bg-card) 0%, #2D2924 100%)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}
          >
            <div>
              <h2 style={{ fontSize: 'var(--fs-h2)', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                Chef IA
              </h2>
              <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-secondary)', margin: 0 }}>
                Votre sous-chef personnel intelligent
              </p>
            </div>
            <Sparkles size={32} color="var(--accent)" />
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
              }}>Rapide &amp; Facile</h3>
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
