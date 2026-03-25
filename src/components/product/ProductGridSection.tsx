import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from './ProductCard';
import type { Product } from '../../types';

interface ProductGridSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onResetFilters?: () => void;
}

export default function ProductGridSection({ products, onSelectProduct, onResetFilters }: ProductGridSectionProps) {
  const productIds = products.map(p => p.id).join(',');
  const stableRotations = useMemo(
    () => products.map(() => ({
      initial: (Math.random() - 0.5) * 5,
      exit: (Math.random() - 0.5) * 10,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productIds]
  );
  if (products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-20 text-center border-4 border-black bg-white p-12 shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
      >
        <h3 className="text-4xl font-black uppercase mb-4">Nessun Prodotto Trovato</h3>
        <p className="text-xl font-mono text-gray-600">
          Prova a cambiare filtro o categoria. Il catalogo mostra solo prodotti con copy e visual coerenti con il contesto.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-8 border-4 border-black bg-yellow-400 px-6 py-3 font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-yellow-400 hover:shadow-none"
          >
            Rimuovi filtri
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 grid-flow-row-dense auto-rows-[minmax(400px,auto)]">
      <AnimatePresence>
        {products.map((product, i) => {
          // Asymmetrical brutalist layout pattern
          const getGridClass = (index: number) => {
            const pattern = [
              "md:col-span-2 md:row-span-2", // 0: Large
              "md:col-span-1 md:row-span-1", // 1: Standard
              "md:col-span-1 md:row-span-1", // 2: Standard
              "md:col-span-1 md:row-span-2", // 3: Tall
              "md:col-span-2 md:row-span-1", // 4: Wide
              "md:col-span-1 md:row-span-1", // 5: Standard
              "md:col-span-1 md:row-span-1", // 6: Standard
              "md:col-span-2 md:row-span-2", // 7: Large
              "md:col-span-1 md:row-span-1", // 8: Standard
            ];
            return pattern[index % pattern.length];
          };

          const getCardColor = (index: number) => {
            const colors = [
              "bg-white",
              "bg-yellow-100",
              "bg-pink-100",
              "bg-cyan-100",
              "bg-lime-100",
              "bg-purple-100"
            ];
            return colors[index % colors.length];
          };

          return (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.9, rotate: stableRotations[i]?.initial ?? 0 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: stableRotations[i]?.exit ?? 0 }}
              transition={{ 
                delay: i * 0.08,
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1] // Smooth bounce
              }}
              className={`${getGridClass(i)} h-full`}
            >
              <ProductCard product={product} onSelect={onSelectProduct} bgColor={getCardColor(i)} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
