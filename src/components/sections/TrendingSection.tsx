import { motion } from 'motion/react';
import { Product } from '../../types';
import { playBlipSound, playCoinSound } from '../../utils/sounds';
import { useCart } from '../../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface TrendingSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export default function TrendingSection({ products, onSelectProduct }: TrendingSectionProps) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    playCoinSound();
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]?.name);
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-16 px-6 md:px-12 bg-pink-500 border-b-8 border-black overflow-hidden relative"
    >
      {/* Background Text */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden whitespace-nowrap">
        <span className="text-[300px] font-black uppercase italic">VIRALE VIRALE VIRALE</span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12">
          <motion.div 
            animate={{ skewX: [0, -10, 10, 0], x: [0, -2, 2, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
            className="bg-black text-white px-6 py-3 font-black uppercase text-3xl md:text-5xl transform -rotate-2 cursor-default shadow-[8px_8px_0_0_rgba(255,255,255,1)]"
          >
            SULLA CRESTA DELL'HYPE 🔥
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => playBlipSound()}
            className="hidden md:block font-black uppercase text-sm bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            ESPLORA TUTTO
          </motion.button>
        </div>
        
        <div className="flex md:grid md:grid-cols-4 gap-6 md:gap-10 overflow-x-auto md:overflow-visible pb-8 md:pb-0 no-scrollbar snap-x snap-mandatory">
          {products.slice(0, 4).map((product, i) => (
            <motion.div 
              key={`trending-${product.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, rotate: (i % 2 === 0 ? 3 : -3), y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playBlipSound(); onSelectProduct(product); }}
              className="min-w-[240px] md:min-w-0 snap-center cursor-pointer bg-white border-8 border-black p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[16px_16px_0_0_rgba(0,0,0,1)] transition-all group relative"
            >
              <div className={`aspect-square ${product.color} border-4 border-black mb-4 overflow-hidden relative`}>
                <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-black text-white text-[10px] font-black px-2 py-1 uppercase">HOT</div>
                
                {/* Quick Add Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleQuickAdd(e, product)}
                    className="bg-white text-black p-4 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    <ShoppingCart className="w-8 h-8" />
                  </motion.button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="font-black uppercase text-lg md:text-xl leading-none">{product.name}</h4>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm font-black bg-black text-white px-2 py-1">€{product.price}</span>
                  <span className="text-xs font-black uppercase opacity-40">Limited</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
