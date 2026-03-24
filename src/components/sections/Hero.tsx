import { motion } from 'motion/react';
import { ArrowRight, Wand2 } from 'lucide-react';
import { playBlipSound } from '../../utils/sounds';
import { useRef, useState } from 'react';
import { useScroll, useTransform } from 'motion/react';

import Hero3D from './Hero3D';

interface HeroProps {
  onOpenCustomizer?: () => void;
}

export default function Hero({ onOpenCustomizer }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hero3DReady, setHero3DReady] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Highlight keywords on scroll
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.5]);
  const highlightProgress = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const highlightColor = useTransform(highlightProgress, [0, 1], ['rgba(252,211,77,0)', 'rgba(252,211,77,1)']);

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col md:flex-row bg-white text-black overflow-hidden border-b-8 border-black">
      {/* Left Pane - Content */}
      <div className="w-full md:w-[55%] flex flex-col justify-between p-8 md:p-16 relative z-20 bg-yellow-400 border-r-0 md:border-r-8 border-black">
        {/* Top Meta Info */}
        <div className="flex justify-between items-start">
          {/* Removed Collection Info and Live Badge */}
        </div>

        {/* Main Headline */}
        <div className="my-12 md:my-0">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[1.05] tracking-tighter italic transform -skew-x-6">
              THE ART OF <br />
              <motion.span
                style={{ opacity: titleOpacity }}
                className="glitch inline-block bg-white text-black px-4 md:px-6 py-2 md:py-3 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg] mt-4 relative"
                data-text="NONSENSE"
              >
                <motion.span
                  style={{ backgroundColor: highlightColor }}
                  className="absolute inset-0 transition-colors"
                />
                <span className="relative z-10">NONSENSE</span>
              </motion.span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 text-xl md:text-2xl font-sans font-medium text-black max-w-xl leading-relaxed"
          >
            Non è semplice merchandising, è un manifesto culturale. Indossa l'ironia, confondi i boomer e abbraccia il caos digitale con stile.
          </motion.p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-4 md:gap-6 mt-8 w-full md:w-auto">
          {onOpenCustomizer && (
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { playBlipSound(); onOpenCustomizer(); }}
              className="flex-1 bg-pink-500 text-black border-4 border-black px-6 md:px-8 py-4 md:py-6 text-lg md:text-2xl font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 group italic focus:outline-none focus:ring-4 focus:ring-offset-2"
            >
              <Wand2 className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
              CREA MEME
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { playBlipSound(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex-1 bg-black text-white border-4 border-black px-6 md:px-8 py-4 md:py-6 text-lg md:text-2xl font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 group italic focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white"
          >
            SHOP ORA
            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </div>
      </div>

      {/* Right Pane - Visual */}
      <div className="w-full md:w-[45%] bg-[#1a1a1a] relative flex flex-col min-h-[50vh] md:min-h-screen">
        {/* 3D Background */}
        <div className="absolute inset-0 z-10">
          <Hero3D onReadyChange={setHero3DReady} />
        </div>

        <div className="absolute left-6 bottom-6 z-20 max-w-xs border-4 border-black bg-white/95 p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-black">
            {hero3DReady ? '3D reactor online' : 'Fallback poster active'}
          </p>
          <p className="mt-2 text-sm font-bold uppercase text-black">
            La hero resta leggibile anche se WebGL tarda o non parte.
          </p>
        </div>

        {/* Floating Badges */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-8 md:top-12 right-8 md:right-12 z-20 bg-pink-500 text-black border-4 border-black px-4 md:px-6 py-2 md:py-3 font-black uppercase text-sm md:text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-6"
        >
          100% POST-IRONICO
        </motion.div>

        <motion.div
          animate={{ rotate: [0, -5, 5, 0], y: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-16 md:bottom-24 left-8 md:left-12 z-20 bg-cyan-400 text-black border-4 border-black px-4 md:px-6 py-2 md:py-3 font-black uppercase text-sm md:text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-3"
        >
          QUALITÀ SHITPOST
        </motion.div>
      </div>
    </section>
  );
}
