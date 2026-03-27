import { Heart, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import type { BaseProduct } from '../../types';
import Product3DPreview from '../customizer/Product3DPreview';
import { cn } from '../../utils/cn';

interface ProductBaseCardProps {
  product: BaseProduct;
  designCount?: number;
  totalLikes?: number;
  isSelected?: boolean;
  onClick: () => void;
}

export default function ProductBaseCard({ product, designCount = 0, totalLikes = 0, isSelected = false, onClick }: ProductBaseCardProps) {
  const baseProductId = product.id === 'base-phonecase'
    ? 'base-phonecase'
    : product.id === 'base-poster'
      ? 'base-poster'
      : 'base-tshirt';

  const baseColor = product.id === 'base-phonecase'
    ? '#1f1f1f'
    : product.id === 'base-poster'
      ? '#f8f6f0'
      : '#ffffff';

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
      <div className="relative h-64 overflow-hidden border-b-4 border-black bg-[#f6f3ec]">
        <Product3DPreview
          baseProductId={baseProductId}
          designTextureUrl={null}
          baseColor={baseColor}
          autoRotate={true}
          lightingMode="neutral"
        />

        <div className="absolute left-3 top-3 border-2 border-black bg-yellow-400 px-2 py-0.5 font-mono text-[10px] font-black uppercase">
          {product.category}
        </div>

        <div className="absolute right-3 top-3 border-2 border-black bg-black px-2 py-0.5 font-mono text-[10px] font-black uppercase text-white">
          da EUR {product.price.toFixed(0)}
        </div>

        <div className="pointer-events-none absolute bottom-3 right-3 border-2 border-black bg-black px-2 py-0.5 font-mono text-[9px] font-black uppercase text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Apri supporto
        </div>

        {isSelected && (
          <div className="absolute inset-0 border-4 border-cyan-400 bg-cyan-400/10" />
        )}
      </div>

      <div className={cn('flex flex-col gap-3 p-4', isSelected && 'bg-black text-white')}>
        <div>
          <p className={cn('line-clamp-1 text-base font-black uppercase leading-tight tracking-tight', isSelected ? 'text-white' : 'text-black')}>
            {product.name}
          </p>
          {product.colors && (
            <div className="mt-2 flex gap-1.5">
              {product.colors.slice(0, 5).map((c) => (
                <div
                  key={c.hex}
                  title={c.name}
                  className="h-3 w-3 border border-black"
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          )}
        </div>

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
