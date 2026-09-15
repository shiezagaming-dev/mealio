import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const CUISINES = ['Italian', 'Asian', 'Mexican', 'Indian', 'American', 'Mediterranean'];
const DIETS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free'];
const SKILLS = ['Beginner', 'Intermediate', 'Advanced'];

export default function Settings() {
  const { state, setState, toggleTheme, showToast } = useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(state.profile);

  function saveProfile() {
    setState((s) => ({ ...s, profile }));
    showToast('Profile updated');
  }

  function toggleList(list, value) {
    return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
  }

  return (
    <div className="screen">
      <div className="back-row" style={{ padding: 0, marginBottom: 6 }}>
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <h1 style={{ marginLeft: 12 }}>Settings</h1>
      </div>

      <div className="section">
        <div className="section-head"><h3>Profile</h3></div>
        <label className="sub">Username</label>
        <input className="input" style={{ marginTop: 6 }} value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />

        <label className="sub" style={{ display: 'block', marginTop: 12 }}>Bio</label>
        <textarea className="input" style={{ marginTop: 6, minHeight: 60 }} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />

        <label className="sub" style={{ display: 'block', marginTop: 12 }}>Avatar</label>
        <div className="chip-row" style={{ marginTop: 6 }}>
          {['🧑‍🍳', '👩‍🍳', '👨‍🍳', '🧑‍🌾', '🐱'].map((a) => (
            <span key={a} className={`chip ${profile.avatar === a ? 'active' : ''}`} style={{ fontSize: 18 }} onClick={() => setProfile({ ...profile, avatar: a })}>{a}</span>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head"><h3>Favorite Cuisines</h3></div>
        <div className="chip-row">
          {CUISINES.map((c) => (
            <span key={c} className={`chip ${profile.cuisines.includes(c) ? 'active' : ''}`} onClick={() => setProfile({ ...profile, cuisines: toggleList(profile.cuisines, c) })}>{c}</span>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head"><h3>Dietary Preferences</h3></div>
        <div className="chip-row">
          {DIETS.map((d) => (
            <span key={d} className={`chip ${profile.diet.includes(d) ? 'active' : ''}`} onClick={() => setProfile({ ...profile, diet: toggleList(profile.diet, d) })}>{d}</span>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head"><h3>Cooking Skill</h3></div>
        <div className="chip-row">
          {SKILLS.map((s) => (
            <span key={s} className={`chip ${profile.skill === s ? 'active' : ''}`} onClick={() => setProfile({ ...profile, skill: s })}>{s}</span>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={saveProfile}>Save profile</button>

      <div className="divider" />

      <div className="list-row">
        <span className="icon">{state.theme === 'dark' ? '🌙' : '🌞'}</span>
        <span className="grow title" style={{ fontSize: 14.5 }}>Dark mode</span>
        <input type="checkbox" checked={state.theme === 'dark'} onChange={toggleTheme} />
      </div>
      <div className="list-row">
        <span className="icon">🌐</span>
        <span className="grow title" style={{ fontSize: 14.5 }}>Language</span>
        <span className="sub">English</span>
      </div>
      <div className="list-row">
        <span className="icon">🔔</span>
        <span className="grow title" style={{ fontSize: 14.5 }}>Cooking reminders</span>
        <input type="checkbox" defaultChecked />
      </div>
      <div className="list-row">
        <span className="icon">📶</span>
        <span className="grow title" style={{ fontSize: 14.5 }}>Offline access for saved recipes</span>
        <input type="checkbox" defaultChecked />
      </div>
    </div>
  );
}
