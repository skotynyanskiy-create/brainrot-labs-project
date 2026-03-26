import { Shirt } from 'lucide-react';
import { motion } from 'motion/react';
import type { BaseProduct } from '../../types';
import ProductBaseCard from './ProductBaseCard';

interface ProductBaseGalleryProps {
  products: BaseProduct[];
  designCountPerProduct?: Record<string, number>;
  totalLikesPerProduct?: Record<string, number>;
  selectedId: string | null;
  onSelect: (product: BaseProduct) => void;
}

export default function ProductBaseGallery({
  products,
  designCountPerProduct = {},
  totalLikesPerProduct = {},
  selectedId,
  onSelect,
}: ProductBaseGalleryProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 border-4 border-black bg-black px-4 py-2 text-white shadow-[4px_4px_0_0_rgba(250,204,21,1)]">
          <Shirt className="h-4 w-4 text-yellow-400" />
          <span className="font-mono text-xs font-black uppercase tracking-[0.25em]">Prodotti Base</span>
        </div>
        <p className="font-mono text-xs text-gray-500">
          {products.length} supporti reali disponibili nel catalogo base
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <ProductBaseCard
              product={product}
              designCount={designCountPerProduct[product.id] ?? 0}
              totalLikes={totalLikesPerProduct[product.id] ?? 0}
              isSelected={selectedId === product.id}
              onClick={() => onSelect(product)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
