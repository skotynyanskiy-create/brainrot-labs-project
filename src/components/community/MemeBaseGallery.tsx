import { Flame } from 'lucide-react';
import { motion } from 'motion/react';
import type { MemeBase } from '../../types';
import MemeBaseCard from './MemeBaseCard';

interface MemeBaseGalleryProps {
  memeBases: MemeBase[];
  designCountPerBase?: Record<string, number>;
  totalLikesPerBase?: Record<string, number>;
  selectedId: string | null;
  onSelect: (memeBase: MemeBase) => void;
}

export default function MemeBaseGallery({
  memeBases,
  designCountPerBase = {},
  totalLikesPerBase = {},
  selectedId,
  onSelect,
}: MemeBaseGalleryProps) {
  // Sort: by total real likes (desc), fallback to static trendScore
  const sorted = [...memeBases].sort((a, b) => {
    const likesA = totalLikesPerBase[a.id] ?? 0;
    const likesB = totalLikesPerBase[b.id] ?? 0;
    if (likesA !== likesB) return likesB - likesA;
    return (b.trendScore ?? 0) - (a.trendScore ?? 0);
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 border-4 border-black bg-black px-4 py-2 text-white shadow-[4px_4px_0_0_rgba(34,211,238,1)]">
          <Flame className="h-4 w-4 text-cyan-400" />
          <span className="font-mono text-xs font-black uppercase tracking-[0.25em]">Template Vault</span>
        </div>
        <p className="font-mono text-xs text-gray-500">
          {memeBases.length} basi disponibili — clicca per vedere i remix
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.map((memeBase, i) => (
          <motion.div
            key={memeBase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <MemeBaseCard
              memeBase={memeBase}
              designCount={designCountPerBase[memeBase.id] ?? 0}
              totalLikes={totalLikesPerBase[memeBase.id] ?? 0}
              isSelected={selectedId === memeBase.id}
              onClick={() => onSelect(memeBase)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
