import { motion, AnimatePresence } from 'motion/react';
import ProductCard from './ProductCard';

interface ProductGridSectionProps {
  products: any[];
  onSelectProduct: (product: any) => void;
}

export default function ProductGridSection({ products, onSelectProduct }: ProductGridSectionProps) {
  if (products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-20 text-center border-4 border-black bg-white p-12 shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
      >
        <h3 className="text-4xl font-black uppercase mb-4">ERRORE 404: MEME NON TROVATO 🤡</h3>
        <p className="text-xl font-mono text-gray-600">
          La tua ricerca è troppo 'normie' per i nostri standard. Prova con qualcosa di più degenerato.
        </p>
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
              initial={{ opacity: 0, y: 40, scale: 0.9, rotate: (Math.random() - 0.5) * 5 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: (Math.random() - 0.5) * 10 }}
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
