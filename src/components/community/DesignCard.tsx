import { Brain, Heart, Layers, ShoppingBag, TrendingUp, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import type { CommunityDesign } from '../../types';
import { cn } from '../../utils/cn';
import { useLikedDesigns } from '../../hooks/useLikedDesigns';

interface DesignCardProps {
  design: CommunityDesign;
  viewMode: 'meme-base' | 'product';
  featured?: boolean;
  onSelect: (design: CommunityDesign) => void;
  onLike?: (designId: string, delta: 1 | -1) => void;
  onSelectAuthor?: (authorId: string, authorName: string) => void;
}

const buildRarity = (likes: number, sales: number) => {
  if (likes > 700 || sales > 70) return { label: 'Legendary', color: 'bg-yellow-400' };
  if (likes > 400 || sales > 35) return { label: 'Epic', color: 'bg-purple-400' };
  if (likes > 180 || sales > 12) return { label: 'Rare', color: 'bg-cyan-400' };
  return { label: 'Common', color: 'bg-white' };
};

export default function DesignCard({ design, viewMode, featured = false, onSelect, onLike, onSelectAuthor }: DesignCardProps) {
  const rarity = buildRarity(design.likes, design.totalSales ?? 0);
  const subtitle = viewMode === 'meme-base'
    ? design.baseProductName ?? 'Prodotto'
    : design.memeBaseName ?? 'Custom Design';

  const { toggle, isLiked } = useLikedDesigns();
  const liked = isLiked(design.id);
  const [burst, setBurst] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const action = toggle(design.id);
    const delta = action === 'liked' ? 1 : -1;
    onLike?.(design.id, delta);
    if (action === 'liked') {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, rotate: featured ? 0 : 0.5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        'group cursor-pointer border-4 border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)]',
        'hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-shadow duration-150',
        featured && 'border-[6px] shadow-[10px_10px_0_0_rgba(0,0,0,1)]'
      )}
      onClick={() => onSelect(design)}
    >
      {/* Image */}
      <div className={cn('relative overflow-hidden border-b-4 border-black bg-gray-100', featured ? 'h-64' : 'h-44')}>
        <img
          src={design.image}
          alt={design.memeDescription}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className={cn('absolute left-3 top-3 border-2 border-black px-2 py-0.5 font-mono text-[10px] font-black uppercase', rarity.color)}>
          {rarity.label}
        </div>
        {featured && (
          <div className="absolute right-3 top-3 border-2 border-black bg-yellow-400 px-2 py-0.5 font-mono text-[10px] font-black uppercase">
            Featured
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-widest text-gray-500">
          {subtitle}
        </p>
        <p className="mb-3 line-clamp-2 text-sm font-bold leading-tight text-black">
          {design.memeDescription}
        </p>
        {onSelectAuthor ? (
          <button
            onClick={(e) => { e.stopPropagation(); onSelectAuthor(design.authorId, design.authorName); }}
            className="mb-3 font-mono text-xs text-gray-500 hover:text-black hover:underline transition-colors"
          >
            @{design.authorName}
          </button>
        ) : (
          <p className="mb-3 font-mono text-xs text-gray-500">@{design.authorName}</p>
        )}

        {/* Metadata badges */}
        {(design.hasAILayer || (design.layerCount ?? 0) >= 4 || design.hasCustomText) && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {design.hasAILayer && (
              <span className="flex items-center gap-1 border-2 border-black bg-purple-400 px-1.5 py-0.5 font-mono text-[9px] font-black uppercase">
                <Brain className="h-2.5 w-2.5" />
                AI
              </span>
            )}
            {(design.layerCount ?? 0) >= 4 && (
              <span className="flex items-center gap-1 border-2 border-black bg-cyan-300 px-1.5 py-0.5 font-mono text-[9px] font-black uppercase">
                <Layers className="h-2.5 w-2.5" />
                {design.layerCount} layer
              </span>
            )}
            {design.hasCustomText && (
              <span className="flex items-center gap-1 border-2 border-black bg-yellow-200 px-1.5 py-0.5 font-mono text-[9px] font-black uppercase">
                <Type className="h-2.5 w-2.5" />
                Testo
              </span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between border-t-2 border-black pt-3">
          <div className="flex items-center gap-3">
            {/* Like button */}
            <button
              onClick={handleLike}
              className={cn(
                'relative flex items-center gap-1.5 font-mono text-xs font-bold transition-colors',
                liked ? 'text-red-500' : 'text-gray-600 hover:text-red-400'
              )}
            >
              <span className="relative">
                <Heart
                  className={cn('h-3.5 w-3.5 transition-transform', liked && 'scale-110')}
                  fill={liked ? 'currentColor' : 'none'}
                />
                {/* Burst animation */}
                <AnimatePresence>
                  {burst && (
                    <motion.span
                      key="burst"
                      initial={{ scale: 0.5, opacity: 1 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="pointer-events-none absolute inset-0 rounded-full bg-red-400"
                    />
                  )}
                </AnimatePresence>
              </span>
              {design.likes.toLocaleString('it-IT')}
            </button>

            {(design.totalSales ?? 0) > 0 && (
              <span className="flex items-center gap-1 font-mono text-xs font-bold text-green-700">
                <ShoppingBag className="h-3.5 w-3.5" />
                {design.totalSales}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 border-2 border-black bg-cyan-400 px-2 py-0.5 font-mono text-[10px] font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <TrendingUp className="h-3 w-3" />
            Acquista
          </div>
        </div>
      </div>
    </motion.div>
  );
}
