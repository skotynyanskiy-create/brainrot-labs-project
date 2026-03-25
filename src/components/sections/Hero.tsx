import { motion } from 'motion/react';
import { Wand2, Users } from 'lucide-react';
import { playBlipSound } from '../../utils/sounds';
import Product3DPreview from '../customizer/Product3DPreview';

interface HeroProps {
  onOpenCustomizer?: () => void;
  onOpenCommunity?: () => void;
}

export default function Hero({ onOpenCustomizer, onOpenCommunity }: HeroProps) {
  return (
    <section className="pt-24 pb-20 md:pt-32 md:pb-32 px-6 md:px-12 bg-white border-b-8 border-black relative overflow-hidden flex items-center min-h-[90vh]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-grid z-0"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="flex flex-col items-start text-left order-1 z-20">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-block bg-pink-500 text-white px-4 md:px-6 py-2 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:shadow-[6px_6px_0_0_rgba(0,0,0,1)] mb-6 md:mb-8 transform -rotate-2"
            >
              <span className="font-black uppercase text-sm md:text-lg italic tracking-widest">Brainrot Labs v2.0</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[3.5rem] leading-[0.9] md:text-8xl lg:text-[7rem] xl:text-[8rem] font-black uppercase tracking-tighter text-black mb-8"
            >
              IL TUO OUTFIT <br />
              <span className="inline-block bg-yellow-400 text-black px-4 md:px-6 py-2 mt-2 md:mt-4 border-4 md:border-8 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] transform rotate-2">
                È UN MEME
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl xl:text-3xl font-mono font-bold text-gray-800 leading-relaxed max-w-2xl mb-10 md:mb-12 border-l-4 md:border-l-8 border-black pl-4 md:pl-6"
            >
              Smetti di vestirti come un NPC. Genera drip con l'AI o ruba il degrado dalla community.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { playBlipSound(); onOpenCustomizer?.(); }}
                className="flex items-center justify-center gap-3 bg-cyan-400 text-black border-4 md:border-8 border-black px-6 md:px-10 py-4 md:py-6 text-xl md:text-2xl font-black uppercase italic shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all group w-full sm:w-auto"
              >
                <Wand2 className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-12 transition-transform" />
                Crea Drip AI
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { playBlipSound(); onOpenCommunity?.(); }}
                className="flex items-center justify-center gap-3 bg-white text-black border-4 md:border-8 border-black px-6 md:px-10 py-4 md:py-6 text-xl md:text-2xl font-black uppercase italic shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all group w-full sm:w-auto"
              >
                <Users className="w-6 h-6 md:w-8 md:h-8 group-hover:-rotate-12 transition-transform" />
                Community
              </motion.button>
            </motion.div>
          </div>

          {/* Right Column: Big Borderless 3D Product */}
          <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[650px] order-2 z-10 flex flex-col items-center justify-center mt-4 lg:mt-0">
            {/* Animated Spotlight blur effect behind 3D */}
            <motion.div 
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] max-w-[400px] max-h-[400px] bg-yellow-400/40 rounded-full blur-[60px] md:blur-[100px] pointer-events-none z-0"
            />
            
            {/* 3D Model Container */}
            <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10">
              <motion.div 
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full transform scale-110 sm:scale-125 lg:scale-[1.35] lg:translate-x-4"
              >
                <Product3DPreview
                  baseProductId="base-tshirt"
                  baseColor="#ffffff"
                  designTextureUrl="https://api.dicebear.com/9.x/bottts/png?seed=brainrotcat&backgroundColor=transparent"
                  autoRotate={true}
                />
              </motion.div>
            </div>

            {/* Subtle UI Hint */}
            <div className="absolute -bottom-6 lg:-bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 text-black/50">
              <span className="animate-bounce text-sm">👆</span>
              <span className="font-mono font-bold uppercase text-xs tracking-widest">Trascina per ruotare</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}