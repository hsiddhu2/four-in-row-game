import { useState, useEffect } from 'react'
import type { JSX } from 'react'

export const WinnerEffect = () => {
    const [confetti, setConfetti] = useState<JSX.Element[]>([]);
  
    useEffect(() => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      const pieces = [];
  
      // Increase the number of pieces for better coverage
      for (let i = 0; i < 100; i++) {
        // Create multiple starting points across the screen width
        const startX = Math.random() * 100; // random position across screen width
        const startY = -5; // start slightly above the screen
        
        const style = {
          position: 'fixed', // Change to fixed positioning
          left: `${startX}vw`, // Use viewport width units
          top: `${startY}vh`, // Use viewport height units
          '--tx': `${(Math.random() - 0.5) * 400}px`, // Increase spread
          '--ty': `${Math.random() * 600}px`, // Make pieces fall downward
          '--color': colors[Math.floor(Math.random() * colors.length)],
          transform: `rotate(${Math.random() * 360}deg)`,
          width: `${Math.random() * 8 + 4}px`, // Random sizes
          height: `${Math.random() * 8 + 4}px`, // Random sizes
        } as React.CSSProperties;
  
        pieces.push(
          <div
            key={i}
            className="confetti-piece"
            style={style}
          />
        );
      }
  
      setConfetti(pieces);
    }, []);
  
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {confetti}
      </div>
    );
  };
