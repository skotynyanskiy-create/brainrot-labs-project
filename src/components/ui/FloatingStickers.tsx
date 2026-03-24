import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

const STICKERS = [
  { emoji: "🗿", size: "text-6xl" },
  { emoji: "🤌", size: "text-5xl" },
  { emoji: "💀", size: "text-4xl" },
  { emoji: "🔥", size: "text-6xl" },
  { emoji: "🤡", size: "text-5xl" },
  { emoji: "🤑", size: "text-4xl" },
  { emoji: "🧢", size: "text-5xl" },
  { emoji: "🧠", size: "text-6xl" },
];

export default function FloatingStickers() {
  const [stickers, setStickers] = useState<any[]>([]);

  useEffect(() => {
    const newStickers = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      ...STICKERS[Math.floor(Math.random() * STICKERS.length)],
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 20,
    }));
    setStickers(newStickers);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {stickers.map((sticker) => (
        <motion.div
          key={sticker.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.4, 0],
            scale: [0.5, 1, 0.5],
            y: [0, -100, 0],
            rotate: [sticker.rotate, sticker.rotate + 360],
          }}
          transition={{
            duration: sticker.duration,
            repeat: Infinity,
            delay: sticker.delay,
            ease: "linear"
          }}
          className={`absolute ${sticker.size} select-none`}
          style={{ top: sticker.top, left: sticker.left }}
        >
          {sticker.emoji}
        </motion.div>
      ))}
    </div>
  );
}
