import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
}

const COLORS = ['#ef4444', '#f97316', '#facc15', '#4ade80', '#06b6d4', '#ec4899', '#a855f7'];

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleConfetti = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: Date.now() + i,
          x: Math.random() * 100, // percentage string later
          y: -10,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: Math.random() * 10 + 5,
          angle: Math.random() * 360,
          velocity: Math.random() * 20 + 10,
        });
      }
      setParticles(prev => [...prev, ...newParticles]);

      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 3000);
    };

    window.addEventListener('app:confetti', handleConfetti);
    return () => window.removeEventListener('app:confetti', handleConfetti);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ 
              x: `${p.x}vw`, 
              y: '-10vh', 
              rotate: 0, 
              opacity: 1 
            }}
            animate={{ 
              y: '110vh', 
              rotate: p.angle + 360 * 2,
              opacity: [1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: Math.random() * 1 + 1.5,
              ease: "linear"
            }}
            className="absolute rounded-sm border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
