import { ImageOff, TrendingUp, Trash2, Zap, Skull, Ghost } from 'lucide-react';
import { motion } from 'motion/react';

const FEATURES = [
  {
    icon: ImageOff,
    title: "Cura Editoriale",
    desc: "Selezioniamo meticolosamente i migliori meme dal web e li stampiamo con cura. È appropriazione culturale, ma fatta bene.",
    color: "bg-cyan-400",
    size: "md:col-span-2"
  },
  {
    icon: TrendingUp,
    title: "Pricing Onesto",
    desc: "Niente costi nascosti, solo il prezzo giusto per un capo che ti farà distinguere dalla massa.",
    color: "bg-pink-400",
    size: "md:col-span-1"
  },
  {
    icon: Skull,
    title: "Design Immortali",
    desc: "I nostri prodotti sono progettati per durare nel tempo, proprio come i meme che hanno fatto la storia.",
    color: "bg-purple-500",
    size: "md:col-span-1",
    textColor: "text-white"
  },
  {
    icon: Trash2,
    title: "Qualità Premium",
    desc: "Materiali selezionati per garantirti il massimo comfort e una durata eccezionale.",
    color: "bg-yellow-400",
    size: "md:col-span-2"
  },
  {
    icon: Ghost,
    title: "Supporto Dedicato",
    desc: "Siamo qui per aiutarti in ogni fase del tuo ordine. Niente bot, solo umani (forse).",
    color: "bg-orange-400",
    size: "md:col-span-1"
  },
  {
    icon: Zap,
    title: "Spedizioni Rapide",
    desc: "Il tuo ordine arriverà a casa tua in tempi record. Perché sappiamo che non vedi l'ora di indossarlo.",
    color: "bg-green-400",
    size: "md:col-span-2"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-32 px-6 md:px-12 border-b-8 border-black bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-grid"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-20">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block bg-black text-white px-4 md:px-6 py-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6 transform -rotate-2"
          >
            <span className="font-black uppercase text-lg md:text-2xl italic">I NOSTRI VALORI</span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[1.05] tracking-tighter mb-8">
            PERCHÉ <br/> 
            <span className="inline-block bg-cyan-400 text-black px-6 md:px-8 py-2 md:py-3 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rotate-2 italic">SCEGLIERCI?</span>
          </h2>
          <p className="text-xl md:text-2xl font-sans font-medium text-black leading-relaxed max-w-2xl">
            "Uniamo l'estetica del web alla qualità del merchandising fisico. Ecco perché siamo la scelta numero uno per chi vive online."
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
              className={`p-10 border-8 border-black ${feat.color} ${feat.textColor || 'text-black'} shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:-translate-y-4 hover:shadow-[24px_24px_0_0_rgba(0,0,0,1)] transition-all group relative overflow-hidden ${feat.size}`}
            >
              <div className="absolute -top-10 -right-10 text-[160px] font-display opacity-10 select-none group-hover:rotate-12 transition-transform">
                {i + 1}
              </div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center mb-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform">
                  <feat.icon className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-4xl md:text-5xl font-display mb-6 leading-none uppercase italic">{feat.title}</h3>
                <p className="font-sans font-semibold text-xl leading-relaxed opacity-90">{feat.desc}</p>
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Zap className="w-12 h-12 animate-bounce" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
