import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useMemo } from 'react';
import { useProduct } from '../../context/ProductContext';
import { playBlipSound } from '../../utils/sounds';

interface CombinedCommunityProps {
  onOpenCustomizer?: () => void;
  onOpenCommunity?: () => void;
}

export default function CombinedCommunity({ onOpenCustomizer, onOpenCommunity }: CombinedCommunityProps) {
  const { communityDesigns } = useProduct();

  const featuredDesigns = useMemo(() => {
    return [...communityDesigns]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 3)
      .map((design) => ({
        id: design.id,
        user: design.authorName,
        image: design.image,
        likes: design.likes || 0,
        comments: Math.max(6, Math.round((design.likes || 0) / 11)),
        tag: (design.likes || 0) >= 500 ? 'LEGENDARY' : (design.likes || 0) >= 100 ? 'RARE' : 'HOT',
      }));
  }, [communityDesigns]);

  return (
    <section className="py-32 px-6 md:px-12 bg-black text-white border-y-8 border-black overflow-hidden relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-12">
          <div className="max-w-2xl">
            <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none mb-8">
              Brainrot <br/> <span className="text-yellow-400 italic">Hall of Fame</span>
            </h2>
            <p className="text-xl md:text-2xl font-mono font-semibold text-white/80 leading-relaxed">
              "Ammira le atrocità partorite dalle menti più brillanti (e disturbate) della nostra community."
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playBlipSound(); onOpenCustomizer?.(); }}
              aria-label="Apri il customizer per pubblicare un design"
              className="bg-white text-black px-12 py-6 border-4 border-white font-black uppercase text-2xl shadow-[12px_12px_0_0_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[12px] hover:translate-y-[12px] transition-all"
            >
              Esponi la tua Opera
            </motion.button>
            {onOpenCommunity && (
              <motion.button 
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playBlipSound(); onOpenCommunity(); }}
                className="bg-cyan-500 text-black px-12 py-6 border-4 border-cyan-500 font-black uppercase text-2xl shadow-[12px_12px_0_0_rgba(6,182,212,0.2)] hover:shadow-none hover:translate-x-[12px] hover:translate-y-[12px] transition-all"
              >
                Esplora la Galleria
              </motion.button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {featuredDesigns.map((design, i) => (
            <motion.div 
              key={design.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="group"
            >
              <div className="relative border-8 border-white shadow-[12px_12px_0_0_rgba(255,255,255,0.2)] group-hover:shadow-none group-hover:translate-x-3 group-hover:translate-y-3 transition-all bg-gray-900 overflow-hidden">
                <img src={design.image} alt={`Design community di ${design.user}`} className="w-full aspect-square object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 font-black text-xs uppercase tracking-widest transform -rotate-2">
                  @{design.user}
                </div>
                <div className="absolute bottom-4 right-4 bg-white text-black px-3 py-1 font-black text-xs uppercase border-2 border-black">
                  {design.tag}
                </div>
              </div>
              
              <div className="mt-8 flex justify-between items-center px-2">
                <div className="flex gap-6">
                  <button aria-label={`Mi piace per ${design.user}`} className="flex items-center gap-2 hover:text-pink-500 transition-colors">
                    <Heart className="w-6 h-6" />
                    <span className="font-black">{design.likes}</span>
                  </button>
                  <button aria-label={`Commenti per ${design.user}`} className="flex items-center gap-2 hover:text-cyan-500 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                    <span className="font-black">{design.comments}</span>
                  </button>
                </div>
                <button aria-label={`Condividi il design di ${design.user}`} className="hover:rotate-12 transition-transform">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {featuredDesigns.length === 0 && (
          <div className="mt-12 border-4 border-dashed border-white/40 p-10 text-center">
            <p className="font-mono uppercase tracking-widest text-white/70">
              Nessun design live disponibile. Il fallback community verrà mostrato al prossimo caricamento.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
