import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './styles/auth.css';

export default function Auth() {
  const { state, t, login, signup } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <header className="auth-header">
          <img 
            src="/logo.png" 
            alt="Mealio Logo" 
            className="auth-logo" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="auth-title">{isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}</h1>
          <p className="auth-subtitle">{t('auth.subtitle')}</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">{t('auth.email')}</label>
            <input 
              id="email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="exemple@mail.com"
              required 
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">{t('auth.password')}</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
              autoComplete="current-password"
            />
          </div>

          <div className="auth-forgot">
            <button type="button" onClick={() => navigate('/forgot-password')}>
              {t('auth.forgotPassword')}
            </button>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <span className="loader"></span>
            ) : (
              isLogin ? t('auth.login') : t('auth.signup')
            )}
          </button>
        </form>

        <footer className="auth-footer">
          <span>{isLogin ? t('auth.noAccount') : t('auth.haveAccount')}</span>
          <button 
            className="auth-switch" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? t('auth.createAccountLink') : t('auth.loginLink')}
          </button>
        </footer>
      </div>
    </div>
  );
}
