import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const CUISINES = ['Italian', 'Asian', 'Mexican', 'Indian', 'American', 'Mediterranean'];
const DIETS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free'];
const SKILLS = ['Beginner', 'Intermediate', 'Advanced'];
const AVATARS = ['🧑‍🍳', '👩‍🍳', '👨‍🍳', '🧑‍🌾', '🐱', '🐶', '🦊', '🐼', '🦁', '🦄'];

export default function Settings() {
  const { state, setState, toggleTheme, showToast } = useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(state.profile);

  function saveProfile() {
    setState((s) => ({ ...s, profile }));
    showToast('Profil mis à jour');
  }

  function handleLogout() {
    setState(s => ({ ...s, account: { ...s.account, loggedIn: false } }));
    navigate('/auth');
  }

  function toggleList(list, value) {
    return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
  }

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
              width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer' 
            }}
          >
            ←
          </button>
          <h1 style={{ 
            fontSize: '32px', 
            fontFamily: 'Fraunces, serif', 
            fontWeight: '700', 
            margin: 0 
          }}>Paramètres</h1>
        </div>

        {/* PROFILE SECTION */}
        <div style={{ 
          backgroundColor: '#211E19', 
          borderRadius: '24px', 
          padding: '24px', 
          border: '1px solid #3A211C', 
          marginBottom: '32px' 
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontFamily: 'Fraunces, serif', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: '#F4EBDD'
          }}>Profil</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#AAA39A', marginBottom: '8px', fontFamily: 'DM Sans, sans-serif' }}>Nom d'utilisateur</label>
            <input 
              style={{ 
                width: '100%', padding: '12px', borderRadius: '12px', 
                backgroundColor: '#171512', border: '1px solid #3A211C', 
                color: '#F4EBDD', fontSize: '16px', fontFamily: 'DM Sans, sans-serif' 
              }} 
              value={profile.username} 
              onChange={(e) => setProfile({ ...profile, username: e.target.value })} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#AAA39A', marginBottom: '8px', fontFamily: 'DM Sans, sans-serif' }}>Bio</label>
            <textarea 
              style={{ 
                width: '100%', padding: '12px', borderRadius: '12px', 
                backgroundColor: '#171512', border: '1px solid #3A211C', 
                color: '#F4EBDD', fontSize: '16px', fontFamily: 'DM Sans, sans-serif',
                minHeight: '80px', resize: 'none' 
              }} 
              value={profile.bio} 
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })} 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#AAA39A', marginBottom: '12px', fontFamily: 'DM Sans, sans-serif' }}>Avatar</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {AVATARS.map((a) => (
                <div 
                  key={a} 
                  onClick={() => setProfile({ ...profile, avatar: a })}
                  style={{ 
                    fontSize: '24px', padding: '12px', textAlign: 'center', 
                    borderRadius: '16px', cursor: 'pointer',
                    background: profile.avatar === a ? '#F04A32' : '#171512',
                    border: profile.avatar === a ? '2px solid #F4EBDD' : '2px solid #3A211C',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {a}
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={saveProfile}
            style={{ 
              width: '100%', padding: '14px', borderRadius: '16px', 
              backgroundColor: '#F04A32', color: '#F4EBDD', 
              border: 'none', fontWeight: '700', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '16px'
            }}
          >
            Enregistrer le profil
          </button>
        </div>

        {/* PREFERENCES SECTION */}
        <div style={{ 
          backgroundColor: '#211E19', 
          borderRadius: '24px', 
          padding: '24px', 
          border: '1px solid #3A211C', 
          marginBottom: '32px' 
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontFamily: 'Fraunces, serif', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: '#F4EBDD'
          }}>Préférences</h3>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#AAA39A', marginBottom: '12px', fontFamily: 'DM Sans, sans-serif' }}>Cuisines favorites</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CUISINES.map((c) => (
                <span 
                  key={c} 
                  onClick={() => setProfile({ ...profile, cuisines: toggleList(profile.cuisines, c) })}
                  style={{ 
                    padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px',
                    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s ease',
                    backgroundColor: profile.cuisines.includes(c) ? '#F04A32' : '#171512',
                    color: profile.cuisines.includes(c) ? '#F4EBDD' : '#AAA39A',
                    border: '1px solid #3A211C'
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#AAA39A', marginBottom: '12px', fontFamily: 'DM Sans, sans-serif' }}>Régimes alimentaires</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {DIETS.map((d) => (
                <span 
                  key={d} 
                  onClick={() => setProfile({ ...profile, diet: toggleList(profile.diet, d) })}
                  style={{ 
                    padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px',
                    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s ease',
                    backgroundColor: profile.diet.includes(d) ? '#F04A32' : '#171512',
                    color: profile.diet.includes(d) ? '#F4EBDD' : '#AAA39A',
                    border: '1px solid #3A211C'
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '0' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#AAA39A', marginBottom: '12px', fontFamily: 'DM Sans, sans-serif' }}>Niveau de cuisine</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {SKILLS.map((s) => (
                <span 
                  key={s} 
                  onClick={() => setProfile({ ...profile, skill: s })}
                  style={{ 
                    flex: 1, textAlign: 'center', padding: '10px', borderRadius: '12px', cursor: 'pointer', 
                    fontSize: '13px', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s ease',
                    backgroundColor: profile.skill === s ? '#F04A32' : '#171512',
                    color: profile.skill === s ? '#F4EBDD' : '#AAA39A',
                    border: '1px solid #3A211C'
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* SYSTEM SETTINGS */}
        <div style={{ 
          backgroundColor: '#211E19', 
          borderRadius: '24px', 
          padding: '12px', 
          border: '1px solid #3A211C', 
          marginBottom: '32px' 
        }}>
          {[
            { label: 'Mode Sombre', icon: '🌙', value: state.theme === 'dark', action: toggleTheme },
            { label: 'Langue', icon: '🌐', value: 'Français', action: null },
            { label: 'Rappels de cuisine', icon: '🔔', value: true, action: null },
            { label: 'Accès hors-ligne', icon: '📶', value: true, action: null },
          ].map((item, i) => (
            <div key={i} style={{ 
              display: 'flex', alignItems: 'center', padding: '12px', 
              borderBottom: i === 3 ? 'none' : '1px solid #3A211C',
              fontFamily: 'DM Sans, sans-serif'
            }}>
              <span style={{ fontSize: '20px', marginRight: '16px' }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: '15px', color: '#F4EBDD' }}>{item.label}</span>
              {typeof item.value === 'boolean' ? (
                <input 
                  type="checkbox" 
                  checked={item.value} 
                  onChange={item.action} 
                  style={{ accentColor: '#F04A32', width: '18px', height: '18px' }} 
                />
              ) : (
                <span style={{ fontSize: '13px', color: '#AAA39A' }}>{item.value}</span>
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', padding: '14px', borderRadius: '16px', 
            backgroundColor: 'transparent', color: '#F04A32', 
            border: '1px solid #F04A32', fontWeight: '700', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: '16px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(240, 74, 50, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
