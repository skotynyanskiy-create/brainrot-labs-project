import { Flame, Heart, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import type { MemeBase } from '../../types';
import { cn } from '../../utils/cn';

interface MemeBaseCardProps {
  memeBase: MemeBase;
  designCount?: number;
  totalLikes?: number;
  isSelected?: boolean;
  onClick: () => void;
}

const CATEGORY_COLORS: Record<MemeBase['category'], string> = {
  reaction: 'bg-cyan-400',
  format: 'bg-yellow-400',
  dank: 'bg-pink-500 text-white',
  italian: 'bg-green-400',
};

export default function MemeBaseCard({ memeBase, designCount = 0, totalLikes = 0, isSelected = false, onClick }: MemeBaseCardProps) {
  const categoryColor = CATEGORY_COLORS[memeBase.category];
  // Hot = real data threshold OR static trendScore fallback
  const isHot = totalLikes >= 200 || (memeBase.trendScore ?? 0) > 80;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
      className={cn(
        'group cursor-pointer border-4 border-black bg-white transition-shadow duration-150',
        isSelected
          ? 'shadow-[8px_8px_0_0_rgba(34,211,238,1)]'
          : 'shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)]'
      )}
    >
      {/* Visual area — same h-48 across all card types */}
      <div className="relative h-48 overflow-hidden border-b-4 border-black bg-gray-100">
        <img
          src={memeBase.url}
          alt={memeBase.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Category badge — TL */}
        <div className={cn('absolute left-3 top-3 border-2 border-black px-2 py-0.5 font-mono text-[10px] font-black uppercase', categoryColor)}>
          {memeBase.category}
        </div>

        {/* Hot badge — TR */}
        {isHot && (
          <div className="absolute right-3 top-3 flex items-center gap-1 border-2 border-black bg-orange-400 px-2 py-0.5 font-mono text-[10px] font-black uppercase">
            <Flame className="h-2.5 w-2.5" />
            Hot
          </div>
        )}

        {/* Selected overlay */}
        {isSelected && (
          <div className="absolute inset-0 border-4 border-cyan-400 bg-cyan-400/10" />
        )}
      </div>

      {/* Info area */}
      <div className={cn('flex flex-col gap-3 p-4', isSelected && 'bg-black text-white')}>
        <p className={cn('line-clamp-1 text-base font-black uppercase leading-tight tracking-tight', isSelected ? 'text-white' : 'text-black')}>
          {memeBase.name}
        </p>

        {/* Stats chips */}
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex items-center gap-1 border-2 border-black px-2 py-0.5 font-mono text-[10px] font-black',
            isSelected ? 'border-cyan-400 bg-cyan-400 text-black' : 'bg-[#f3f1ec]'
          )}>
            <Layers className="h-2.5 w-2.5" />
            {designCount} design
          </div>
          <div className={cn(
            'flex items-center gap-1 border-2 border-black px-2 py-0.5 font-mono text-[10px] font-black',
            isSelected ? 'border-white/30 bg-white/10 text-white' : 'bg-white'
          )}>
            <Heart className="h-2.5 w-2.5" />
            {totalLikes.toLocaleString('it-IT')}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
