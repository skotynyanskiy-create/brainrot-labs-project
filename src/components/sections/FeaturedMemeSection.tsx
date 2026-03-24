import { motion } from 'motion/react';
import { playBlipSound } from '../../utils/sounds';

interface FeaturedMemeSectionProps {
  product: any;
  onSelectProduct: (product: any) => void;
  onOpenCustomizer: () => void;
}

export default function FeaturedMemeSection({ product, onSelectProduct, onOpenCustomizer }: FeaturedMemeSectionProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="mb-32 bg-cyan-400 border-[12px] border-black p-8 md:p-16 shadow-[24px_24px_0_0_rgba(0,0,0,1)] relative overflow-hidden group"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, black, black 2px, transparent 2px, transparent 20px)' }}></div>
      
      <div className="flex flex-col lg:flex-row gap-16 items-center relative z-10">
        <div className="w-full lg:w-1/2 relative">
          <motion.div 
            whileHover={{ rotate: 0, scale: 1.02 }}
            className="aspect-square bg-white border-8 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] overflow-hidden transform -rotate-2 transition-all flex items-center justify-center p-4"
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-multiply"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          {/* Badge */}
          <div className="absolute -bottom-6 -left-6 bg-red-500 text-white border-4 border-black px-6 py-2 font-black uppercase text-xl transform rotate-12 shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-20">
            EDIZIONE LIMITATA (FORSE)
          </div>
        </div>

        <div className="w-full lg:w-1/2 text-left flex flex-col items-start">
          <motion.div 
            animate={{ rotate: [2, -2, 2], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="bg-yellow-400 border-4 border-black px-6 py-2 font-black uppercase text-2xl md:text-3xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] mb-8 inline-block"
          >
            SELEZIONE DEL CURATORE 🏆
          </motion.div>

          <motion.h3 
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black uppercase mb-8 leading-none tracking-tight text-white"
            style={{ WebkitTextStroke: '2px black', textShadow: '6px 6px 0 #000' }}
          >
            {product.name}
          </motion.h3>
          <p className="text-xl md:text-2xl font-mono font-bold mb-12 italic leading-relaxed bg-white p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            "{product.memeDescription}"
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full">
            <motion.button 
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectProduct(product)}
              className="flex-1 bg-black text-white px-8 py-5 border-4 border-black font-black uppercase text-xl md:text-2xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-3"
            >
              ANALIZZA 🧐
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playBlipSound(); onOpenCustomizer(); }}
              className="flex-1 bg-pink-500 text-white px-8 py-5 border-4 border-black font-black uppercase text-xl md:text-2xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-3"
            >
              DETURPA ✨
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Decorative Text */}
      <div className="absolute -bottom-16 -right-16 text-[300px] opacity-5 font-black select-none pointer-events-none transform rotate-12 leading-none">
        BRAINROT
      </div>
    </motion.div>
  );
}
