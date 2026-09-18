import React, { useEffect, useState } from 'react';

export default function AchievementBurst() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['var(--accent)', 'var(--accent-soft)', '#FFD700'];
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      size: Math.random() * 6 + 4,
      delay: Math.random() * 100
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'absolute', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div 
          key={p.id}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: p.color,
            animation: `burst ${0.6 + Math.random() * 0.2}s ease-out forwards`,
            animationDelay: `${p.delay}ms`,
            left: 0,
            top: 0,
            '--tx': `${p.x}px`,
            '--ty': `${p.y}px`
          }}
        />
      ))}
      <style>{`
        @keyframes burst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
