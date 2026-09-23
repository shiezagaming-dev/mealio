import React, { useEffect, useRef } from 'react';

export default function AmbientBackground() {
  const rafRef = useRef(null);

  useEffect(() => {
    // Initialiser les propriétés CSS personnalisées au centre
    document.documentElement.style.setProperty('--mouse-x', 50);
    document.documentElement.style.setProperty('--mouse-y', 50);

    // Désactiver sur les appareils tactiles ou si l'utilisateur préfère une réduction du mouvement
    const isTouchDevice = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouchDevice || prefersReducedMotion) return;

    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;

    function updateProperties() {
      document.documentElement.style.setProperty('--mouse-x', currentX);
      document.documentElement.style.setProperty('--mouse-y', currentY);
    }

    function updateLoop() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      updateProperties();

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafRef.current = requestAnimationFrame(updateLoop);
      } else {
        rafRef.current = null;
      }
    }

    function onMouseMove(e) {
      targetX = (e.clientX / window.innerWidth) * 100;
      targetY = (e.clientY / window.innerHeight) * 100;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateLoop);
      }
    }

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes drift1 {
          0% { transform: translate(0, 0); }
          33% { transform: translate(30px, -25px); }
          66% { transform: translate(-15px, 20px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes drift2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 30px) scale(1.08); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes drift3 {
          0% { transform: translate(0, 0); }
          25% { transform: translate(40px, 10px); }
          50% { transform: translate(20px, 40px); }
          75% { transform: translate(-20px, 20px); }
          100% { transform: translate(0, 0); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .blob-1 { animation: drift1 22s ease-in-out infinite; }
          .blob-2 { animation: drift2 28s ease-in-out infinite; }
          .blob-3 { animation: drift3 34s ease-in-out infinite; }
        }
      `}</style>

      <div style={{
        transform: 'translate(calc((var(--mouse-x) - 50) * 0.3px), calc((var(--mouse-y) - 50) * 0.3px))'
      }}>
        <div className="blob-1" style={{
          position: 'absolute', top: '10%', left: '10%',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
          filter: 'blur(80px)', opacity: 0.65
        }} />
      </div>

      <div style={{
        transform: 'translate(calc((var(--mouse-x) - 50) * 0.3px), calc((var(--mouse-y) - 50) * 0.3px))'
      }}>
        <div className="blob-2" style={{
          position: 'absolute', bottom: '15%', right: '10%',
          width: '450px', height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
          filter: 'blur(90px)', opacity: 0.35
        }} />
      </div>

      <div style={{
        transform: 'translate(calc((var(--mouse-x) - 50) * 0.3px), calc((var(--mouse-y) - 50) * 0.3px))'
      }}>
        <div className="blob-3" style={{
          position: 'absolute', top: '40%', right: '20%',
          width: '350px', height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
          filter: 'blur(80px)', opacity: 0.55
        }} />
      </div>
    </div>
  );
}
