import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const AVATARS = ['🧑‍🍳', '👩‍🍳', '👨‍🍳', '🧑‍🌾', '🐱', '🐶', '🦊', '🐼', '🦁', '🦄'];

export default function Auth() {
  const { setState } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [step, setStep] = useState(1); // 1: details, 2: avatar
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [selectedAvatar, setSelectedAvatar] = useState('🧑‍🍳');

  function handleAuth() {
    if (mode === 'signup') {
      setState(s => ({ 
        ...s, 
        account: { email: form.email, username: form.username, loggedIn: true },
        profile: { ...s.profile, username: form.username, avatar: selectedAvatar }
      }));
    } else {
      setState(s => ({ 
        ...s, 
        account: { email: form.email, username: 'Chef', loggedIn: true } 
      }));
    }
    navigate('/');
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img 
          src="/logo.png" 
          alt="Mealio Logo" 
          style={{ width: '120px', height: 'auto', marginBottom: '16px' }} 
        />
        <h1 style={{ marginTop: 16 }}>{mode === 'login' ? 'Welcome Back' : 'Join Mealio'}</h1>
        <p className="sub">Your personal AI sous-chef</p>
      </div>

      {mode === 'login' ? (
        <div className="section">
          <label className="sub">Email</label>
          <input className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <label className="sub" style={{ display: 'block', marginTop: 12 }}>Password</label>
          <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <button className="btn btn-primary btn-block" style={{ marginTop: 24 }} onClick={handleAuth}>Log In</button>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 12 }} onClick={() => setMode('signup')}>Create an account</button>
          <button className="btn btn-ghost btn-block" style={{ fontSize: 12, opacity: 0.6 }} onClick={() => alert('Password reset link sent to your email!')}>Forgot password?</button>
        </div>
      ) : (
        <div className="section">
          {step === 1 ? (
            <>
              <label className="sub">Username</label>
              <input className="input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
              <label className="sub" style={{ display: 'block', marginTop: 12 }}>Email</label>
              <input className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <label className="sub" style={{ display: 'block', marginTop: 12 }}>Password</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              <button className="btn btn-primary btn-block" style={{ marginTop: 24 }} onClick={() => setStep(2)}>Next: Pick Avatar</button>
              <button className="btn btn-ghost btn-block" style={{ marginTop: 12 }} onClick={() => setMode('login')}>Already have an account? Log in</button>
            </>
          ) : (
            <>
              <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Choose your avatar</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
                {AVATARS.map(a => (
                  <div 
                    key={a} 
                    onClick={() => setSelectedAvatar(a)}
                    style={{ 
                      fontSize: 32, 
                      padding: 12, 
                      textAlign: 'center', 
                      borderRadius: '50%', 
                      cursor: 'pointer',
                      background: selectedAvatar === a ? 'var(--chili-light)' : 'var(--bg-soft)',
                      border: selectedAvatar === a ? '2px solid var(--chili)' : '2px solid transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    {a}
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-block" onClick={handleAuth}>Complete Sign Up</button>
              <button className="btn btn-ghost btn-block" style={{ marginTop: 12 }} onClick={() => setStep(1)}>Back</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
