import { motion } from 'motion/react';
import { useMemo } from 'react';

interface FloatingSticker {
  id: number;
  emoji: string;
  size: string;
  top: string;
  left: string;
  rotate: number;
  delay: number;
  duration: number;
}

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

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const buildStickers = (): FloatingSticker[] =>
  Array.from({ length: 12 }, (_, i) => {
    const stickerIndex = Math.floor(pseudoRandom(i + 1) * STICKERS.length);
    return {
      id: i,
      ...STICKERS[stickerIndex],
      top: `${pseudoRandom(i + 11) * 100}%`,
      left: `${pseudoRandom(i + 21) * 100}%`,
      rotate: pseudoRandom(i + 31) * 360,
      delay: pseudoRandom(i + 41) * 5,
      duration: 10 + pseudoRandom(i + 51) * 20,
    };
  });

export default function FloatingStickers() {
  const stickers = useMemo(() => buildStickers(), []);

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
