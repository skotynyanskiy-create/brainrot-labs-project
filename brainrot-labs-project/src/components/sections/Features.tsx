import { ImageOff, TrendingUp, Trash2, Zap, Skull, Ghost } from 'lucide-react';
import { motion } from 'motion/react';
import { CREATOR_ROYALTY_RATE } from '../../constants';
import { playBlipSound } from '../../utils/sounds';

const FEATURES = [
  {
    icon: ImageOff,
    title: "Basi Curate",
    desc: "Le immagini di partenza non sono riempitivi casuali: ogni base viene scelta per funzionare davvero su prodotto, card e sezione.",
    color: "bg-cyan-400",
    size: "md:col-span-2"
  },
  {
    icon: TrendingUp,
    title: "Workflow Coerente",
    desc: "Customizer, schede prodotto e community raccontano lo stesso processo: scegli, costruisci, controlli la preview, acquisti o pubblichi.",
    color: "bg-pink-400",
    size: "md:col-span-1"
  },
  {
    icon: Skull,
    title: "Preview Reale",
    desc: "L'anteprima 3D e i visual di dettaglio servono a confermare la resa finale, non a coprire buchi di contenuto.",
    color: "bg-purple-500",
    size: "md:col-span-1",
    textColor: "text-white"
  },
  {
    icon: Trash2,
    title: "Produzione On Demand",
    desc: "Ogni prodotto nasce dal design scelto o creato nel laboratorio e passa poi nel flusso di acquisto senza cambiare logica o tono.",
    color: "bg-yellow-400",
    size: "md:col-span-2"
  },
  {
    icon: Ghost,
    title: "Community Credibile",
    desc: "I design community usano seed, copy e metriche costruite per categoria, evitando l'effetto demo improvvisata o gallery piena di placeholder.",
    color: "bg-orange-400",
    size: "md:col-span-1"
  },
  {
    icon: Zap,
    title: "Royalty Chiare",
    desc: `Se pubblichi un design in community, la promessa resta semplice e leggibile: ${CREATOR_ROYALTY_RATE}% di royalty automatiche su ogni vendita.`,
    color: "bg-green-400",
    size: "md:col-span-2"
  }
];

interface FeaturesProps {
  onOpenCustomizer?: () => void;
}

export default function Features({ onOpenCustomizer }: FeaturesProps) {
  return (
    <section id="features" className="py-20 md:py-32 px-6 md:px-12 border-b-8 border-black bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-grid"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 md:mb-20">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block bg-black text-white px-4 md:px-6 py-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6 transform -rotate-2"
          >
            <span className="font-black uppercase text-lg md:text-2xl italic">LA LORE DEL BRAND</span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[1.05] tracking-tighter mb-8">
            PERCHÉ <br/> 
            <span className="inline-block bg-cyan-400 text-black px-6 md:px-8 py-2 md:py-3 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rotate-2 italic">NON SKIPPARCI?</span>
          </h2>
          <p className="text-xl md:text-2xl font-sans font-medium text-black leading-relaxed max-w-2xl">
            "Prendiamo meme, copy e visual di internet e li trasformiamo in un catalogo coerente, con editor AI, preview credibili e community monetizzabile."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", bounce: 0.4 }}
              className={`p-6 md:p-10 border-8 border-black ${feat.color} ${feat.textColor || 'text-black'} shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:-translate-y-4 hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] md:hover:shadow-[24px_24px_0_0_rgba(0,0,0,1)] transition-all group relative overflow-hidden ${feat.size}`}
            >
              <div className="absolute -top-10 -right-10 text-[160px] font-display opacity-10 select-none group-hover:rotate-12 transition-transform">
                {i + 1}
              </div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white border-4 border-black flex items-center justify-center mb-6 md:mb-8 shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:shadow-[8px_8px_0_0_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform">
                  <feat.icon className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-3xl md:text-5xl font-display mb-4 md:mb-6 leading-none uppercase italic">{feat.title}</h3>
                <p className="font-sans font-semibold text-xl leading-relaxed opacity-90">{feat.desc}</p>
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Zap className="w-12 h-12 animate-bounce" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 md:mt-20 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playBlipSound();
              onOpenCustomizer?.();
            }}
            className="border-4 border-black bg-cyan-400 px-8 py-4 text-lg font-black uppercase italic shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-cyan-400 hover:shadow-none"
          >
            Inizia a creare il tuo design →
          </motion.button>
        </div>
      </div>
    </section>
  );
}
