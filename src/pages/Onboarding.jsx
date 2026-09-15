import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Onboarding() {
  const [name, setName] = useState('');
  const { completeOnboarding } = useApp();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (name.trim()) {
      completeOnboarding(name.trim());
      navigate('/');
    }
  };

  return (
    <div className="screen" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '2rem', 
      textAlign: 'center',
      height: '100vh',
      boxSizing: 'border-box'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👋</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Welcome to Mealio
      </h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: '2rem', fontSize: '1.1rem' }}>
        Your personal AI chef and recipe companion.
      </p>
      
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', textAlign: 'left' }}>
          What should we call you?
        </label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          className="input"
          style={{ 
            width: '100%', 
            padding: '1rem', 
            borderRadius: '12px', 
            fontSize: '1rem',
            marginBottom: '1.5rem',
            boxSizing: 'border-box'
          }}
          autoFocus
        />
        <button 
          onClick={handleContinue}
          disabled={!name.trim()}
          className="btn btn-primary btn-block"
          style={{ 
            width: '100%', 
            padding: '1rem', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            opacity: name.trim() ? 1 : 0.6,
            cursor: 'pointer',
            border: 'none'
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
