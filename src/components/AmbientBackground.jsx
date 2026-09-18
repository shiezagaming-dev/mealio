import React from 'react';

export default function AmbientBackground() {
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
      
      <div className="blob-1" style={{ 
        position: 'absolute', top: '10%', left: '10%', 
        width: '350px', height: '350px', 
        borderRadius: '50%', 
        background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)', 
        filter: 'blur(80px)', opacity: 0.55 
      }} />
      
      <div className="blob-2" style={{ 
        position: 'absolute', bottom: '15%', right: '10%', 
        width: '400px', height: '400px', 
        borderRadius: '50%', 
        background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', 
        filter: 'blur(90px)', opacity: 0.25 
      }} />
      
      <div className="blob-3" style={{ 
        position: 'absolute', top: '40%', right: '20%', 
        width: '300px', height: '300px', 
        borderRadius: '50%', 
        background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)', 
        filter: 'blur(80px)', opacity: 0.45 
      }} />
    </div>
  );
}
