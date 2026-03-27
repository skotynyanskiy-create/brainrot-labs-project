import { motion } from 'motion/react';
import { DollarSign, Heart, ShoppingBag, Tag } from 'lucide-react';
import type { Product } from '../../types';
import { playBlipSound } from '../../utils/sounds';

interface CommunityProductCardProps {
  product: Product;
  tags?: string[];
  sales: number;
  earnings: number;
  royaltyRate: number;
  productTypeLabel: string;
  featured?: boolean;
  badge?: string;
  onSelect: (product: Product) => void;
}

export default function CommunityProductCard({
  product,
  tags = [],
  sales,
  earnings,
  royaltyRate,
  productTypeLabel,
  featured = false,
  badge,
  onSelect,
}: CommunityProductCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={`group flex h-full flex-col overflow-hidden border-4 border-black bg-white shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] ${featured ? 'lg:flex-row' : ''}`}
    >
      <div className={`relative overflow-hidden border-b-4 border-black bg-[#f5f5f5] ${featured ? 'lg:w-[48%] lg:border-b-0 lg:border-r-4' : ''}`}>
        {badge && (
          <div className="absolute left-4 top-4 z-20 rotate-[-2deg] border-2 border-black bg-yellow-400 px-3 py-1 text-xs font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            {badge}
          </div>
        )}
        <img
          src={product.image}
          alt={product.name}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${featured ? 'min-h-[420px]' : 'aspect-square'}`}
        />
      </div>

      <div className={`flex flex-1 flex-col p-5 md:p-6 ${featured ? 'lg:w-[52%]' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">{productTypeLabel}</p>
            <h3 className="mt-2 text-2xl font-black uppercase tracking-tighter">{product.name}</h3>
            {product.authorName && (
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-gray-700">by @{product.authorName}</p>
            )}
          </div>
          <div className="border-2 border-black bg-black px-3 py-1 font-mono text-xs font-black uppercase text-white">
            EUR {product.price.toFixed(2)}
          </div>
        </div>

        <p className={`mt-5 border-l-4 border-black pl-4 font-mono text-sm leading-relaxed text-gray-700 ${featured ? 'line-clamp-5' : 'line-clamp-4'}`}>
          {product.memeDescription}
        </p>

        {tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.slice(0, featured ? 4 : 3).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 border-2 border-black bg-[#f0f0f0] px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em]">
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 border-y-4 border-black py-4">
          <div className="border-2 border-black bg-pink-100 px-3 py-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="font-black">{product.likes || 0}</span>
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em]">Like</p>
          </div>
          <div className="border-2 border-black bg-yellow-100 px-3 py-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="font-black">{sales}</span>
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em]">Vendite</p>
          </div>
          <div className="border-2 border-black bg-green-100 px-3 py-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="font-black">EUR {earnings.toFixed(2)}</span>
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em]">Royalty</p>
          </div>
          <div className="border-2 border-black bg-cyan-100 px-3 py-3">
            <div className="flex items-center gap-2">
              <span className="font-black">{royaltyRate.toFixed(1)}%</span>
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em]">Rate</p>
          </div>
        </div>

        <div className="mt-auto pt-5">
          <button
            onClick={() => { playBlipSound(); onSelect(product); }}
            className="w-full border-4 border-black bg-black px-5 py-4 text-lg font-black uppercase text-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-cyan-400 hover:text-black hover:shadow-none"
          >
            Apri scheda remix
          </button>
        </div>
      </div>
    </motion.article>
  );
}
