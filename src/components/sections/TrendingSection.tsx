import { motion } from 'motion/react';
import type { MemeBase } from '../../types';
import { playBlipSound } from '../../utils/sounds';
import { Wand2 } from 'lucide-react';

interface TrendingSectionProps {
  memeBases: MemeBase[];
  onStartWithMeme: (meme: MemeBase) => void;
  onOpenCustomizer: () => void;
}

const CATEGORY_COLORS: Record<MemeBase['category'], string> = {
  reaction: 'bg-pink-500 text-white',
  format:   'bg-cyan-400 text-black',
  dank:     'bg-yellow-400 text-black',
  italian:  'bg-green-400 text-black',
};

export default function TrendingSection({ memeBases, onStartWithMeme, onOpenCustomizer }: TrendingSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-16 px-6 md:px-12 bg-pink-500 border-b-8 border-black overflow-hidden relative"
    >
      {/* Background watermark */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden whitespace-nowrap">
        <span className="text-[300px] font-black uppercase italic">MEME MEME MEME</span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12">
          <motion.div
            animate={{ skewX: [0, -10, 10, 0], x: [0, -2, 2, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
            className="bg-black text-white px-6 py-3 font-black uppercase text-3xl md:text-5xl transform -rotate-2 cursor-default shadow-[8px_8px_0_0_rgba(255,255,255,1)]"
          >
            BASI PIU USATE
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { playBlipSound(); onOpenCustomizer(); }}
            className="hidden md:flex items-center gap-2 font-black uppercase text-sm bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            <Wand2 className="w-4 h-4" /> CREA LIBERO
          </motion.button>
        </div>

        <div className="flex md:grid md:grid-cols-4 gap-6 md:gap-10 overflow-x-auto md:overflow-visible pb-4 md:pb-0 no-scrollbar snap-x snap-mandatory">
          {memeBases.slice(0, 4).map((meme, i) => (
            <motion.div
              key={meme.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, rotate: (i % 2 === 0 ? 3 : -3), y: -10 }}
              className="min-w-[240px] md:min-w-0 snap-center cursor-pointer bg-white border-8 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[16px_16px_0_0_rgba(0,0,0,1)] transition-all group relative"
              onClick={() => { playBlipSound(); onStartWithMeme(meme); }}
            >
              {/* Meme image */}
              <div className="aspect-square overflow-hidden relative border-b-4 border-black">
                <img
                  src={meme.url}
                  alt={meme.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Usage badge */}
                <div className="absolute top-2 left-2 bg-yellow-400 border-2 border-black text-black text-[10px] font-black px-2 py-1 uppercase">
                  USATO {meme.usageCount.toLocaleString()}x
                </div>

                {/* Category badge */}
                <div className={`absolute top-2 right-2 border-2 border-black text-[10px] font-black px-2 py-1 uppercase ${CATEGORY_COLORS[meme.category]}`}>
                  {meme.category}
                </div>

                {/* Hover overlay CTA */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-cyan-400 text-black border-4 border-black px-4 py-3 font-black uppercase text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" /> USA QUESTA BASE
                  </motion.div>
                </div>
              </div>

              {/* Card footer */}
              <div className="p-3">
                <h4 className="font-black uppercase text-base leading-tight">{meme.name}</h4>
                <p className="font-mono text-xs text-gray-500 mt-1">
                  {meme.tags.slice(0, 2).join(' · ')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile scroll hint */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-4 pb-2">
          <span className="text-sm font-mono font-black uppercase tracking-widest text-white/70 animate-pulse">
            scorri per altri
          </span>
        </div>
      </div>
    </motion.section>
  );
}
