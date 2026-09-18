import { useState, useEffect } from 'react';

export function useKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      // Sur Android, si la hauteur du viewport diminue significativement, le clavier est ouvert
      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      
      // Seuil de 150px pour éviter les faux positifs (ex: barres d'outils)
      setIsKeyboardOpen(windowHeight - viewportHeight > 150);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }, []);

  return isKeyboardOpen;
}
