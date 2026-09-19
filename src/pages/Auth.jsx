import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AmbientBackground from '../components/AmbientBackground';
import '../styles/auth.css';

export default function Auth() {
  const { state, t, login, signup, setState } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '1068978731743-e25jqlpude9a354u21m2bnl1jhq6sqk4.apps.googleusercontent.com',
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: '100%', shape: 'pill' }
      );
    }
  }, []);

  function handleGoogleResponse(response) {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const { email: gEmail, name: gName, picture } = payload;
      
      setState(s => ({
        ...s,
        account: { email: gEmail, username: gName, loggedIn: true },
        profile: { ...s.profile, username: gName, avatar: picture || '🧑‍🍳' }
      }));
      
      navigate('/');
    } catch (err) {
      setError('Erreur lors de la connexion Google');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (view === 'login') {
        await login(email, password);
        navigate('/');
      } else if (view === 'signup') {
        if (!name.trim()) {
          setError(t('auth.nameRequired'));
          setLoading(false);
          return;
        }
        await signup(email, password);
        setState(s => ({
          ...s,
          account: { email, username: name, loggedIn: true },
          profile: { ...s.profile, username: name }
        }));
        navigate('/');
      } else if (view === 'forgot') {
        // Mock forgot password flow
        if (!email.trim()) {
          setError(t('auth.email')); // Reuse email label as simple error or add specific key
          setLoading(false);
          return;
        }
        setForgotSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      <AmbientBackground />
      
      <div className="auth-container">
        <div className="auth-card">
          <header className="auth-header">
            <div className="chef-hat-animation">
              <svg 
                viewBox="0 0 100 100" 
                className="chef-hat-svg"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M20,60 Q20,40 40,40 Q40,20 60,20 Q80,20 80,40 Q80,50 70,55 Q60,60 50,55 Q40,60 30,55 Q20,50 20,60 Z" 
                  fill="var(--accent)" 
                />
                <rect x="20" y="60" width="60" height="15" rx="5" fill="var(--accent)" />
              </svg>
            </div>
            <h1 className="auth-title">
              {view === 'login' ? t('auth.welcomeBack') : 
               view === 'signup' ? t('auth.createAccount') : 
               t('auth.forgotTitle')}
            </h1>
            <p className="auth-subtitle">
              {view === 'forgot' ? t('auth.forgotSubtitle') : t('auth.subtitle')}
            </p>
          </header>

          {view !== 'forgot' && (
            <div className="google-auth-section">
              <div id="google-signin-btn"></div>
              <div className="auth-divider">
                <span>{t('common.search') === 'Search' ? 'or' : 'ou'}</span>
              </div>
            </div>
          )}

          {forgotSuccess ? (
            <div className="auth-success-view">
              <div className="auth-error" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', color: '#28a745' }}>
                {t('auth.forgotSuccess')}
              </div>
              <button className="auth-submit-btn" onClick={() => { setForgotSuccess(false); setView('login'); }}>
                {t('auth.backToLogin')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              {view === 'signup' && (
                <div className="auth-field">
                  <label htmlFor="name">{t('auth.name')}</label>
                  <input 
                    id="name"
                    type="text" 
                    className="auth-input"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder={t('auth.namePlaceholder')}
                    required 
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email">{t('auth.email')}</label>
                <input 
                  id="email"
                  type="email" 
                  className="auth-input"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="exemple@mail.com"
                  required 
                  autoComplete="email"
                />
              </div>

              {view !== 'forgot' && (
                <div className="auth-field">
                  <label htmlFor="password">{t('auth.password')}</label>
                  <input 
                    id="password"
                    type="password" 
                    className="auth-input"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    required 
                    autoComplete="current-password"
                  />
                </div>
              )}

              {view === 'login' && (
                <div className="auth-forgot">
                  <button type="button" className="auth-link-btn" onClick={() => setView('forgot')}>
                    {t('auth.forgotPassword')}
                  </button>
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="loader"></span>
                ) : (
                  view === 'login' ? t('auth.login') : 
                  view === 'signup' ? t('auth.signup') : 
                  t('auth.forgotSubmit')
                )}
              </button>
            </form>
          )}

          {view !== 'forgot' && (
            <footer className="auth-footer">
              <span className="auth-footer-text">
                {view === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}
              </span>
              <button 
                className="auth-switch-btn" 
                onClick={() => setView(view === 'login' ? 'signup' : 'login')}
              >
                {view === 'login' ? t('auth.createAccountLink') : t('auth.loginLink')}
              </button>
            </footer>
          )}

          {view === 'forgot' && !forgotSuccess && (
            <footer className="auth-footer">
              <button className="auth-switch-btn" onClick={() => setView('login')}>
                {t('auth.backToLogin')}
              </button>
            </footer>
          )}

      <style>{`
        .auth-page-wrapper {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-main);
          overflow: hidden;
        }
        .auth-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 20px;
        }
        .auth-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 32px;
          padding: 40px 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
        }
        .auth-header {
          margin-bottom: 32px;
        }
        .chef-hat-animation {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
        }
        .chef-hat-svg {
          width: 100%;
          height: 100%;
        }
        @media (prefers-reduced-motion: no-preference) {
          .chef-hat-svg {
            animation: hat-bounce 3s ease-in-out infinite;
          }
        }
        @keyframes hat-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        .auth-title {
          font-family: 'Fraunces', serif;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text-main);
        }
        .auth-subtitle {
          font-family: 'DM Sans', sans-serif;
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        .google-auth-section {
          margin-bottom: 24px;
        }
        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color);
        }
        .auth-divider span {
          padding: 0 12px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .auth-field {
          display: flex;
          flex-direction: column;
          text-align: left;
          gap: 8px;
        }
        .auth-field label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
          margin-left: 4px;
        }
        .auth-input {
          padding: 14px 18px;
          border-radius: 16px;
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          color: var(--text-main);
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .auth-input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .auth-forgot {
          text-align: right;
        }
        .auth-link-btn {
          background: none;
          border: none;
          color: var(--accent);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }
        .auth-submit-btn {
          padding: 16px;
          border-radius: 16px;
          border: none;
          background: var(--accent);
          color: white;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .auth-submit-btn:disabled {
          opacity: 0.6;
        }
        .auth-footer {
          margin-top: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .auth-switch-btn {
          background: none;
          border: none;
          color: var(--accent);
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }
        .auth-error {
          padding: 12px;
          background: rgba(240, 74, 50, 0.1);
          color: #F04A32;
          border-radius: 12px;
          font-size: 0.85rem;
          text-align: center;
        }
        .auth-success-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
      `}</style>
    </div>
  );
}
