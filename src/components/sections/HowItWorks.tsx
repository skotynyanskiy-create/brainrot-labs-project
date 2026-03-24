import { motion } from 'motion/react';
import { Zap, Wand2, Truck } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { icon: Wand2, title: "Scegli", desc: "Seleziona il meme che meglio rappresenta il tuo vuoto esistenziale." },
    { icon: Zap, title: "Deturpa", desc: "Personalizzalo nel nostro customizer finché non diventa irriconoscibile." },
    { icon: Truck, title: "Ricevi", desc: "Attendi con ansia (e disperazione) l'arrivo del tuo pacco." }
  ];

  return (
    <section className="py-24 px-6 md:px-12 bg-white border-b-8 border-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-16 text-center">
          Come <span className="text-pink-500 italic">funziona</span> il disagio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 bg-yellow-400 border-4 border-black flex items-center justify-center mb-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform">
                <step.icon className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black uppercase mb-4">{step.title}</h3>
              <p className="font-mono text-lg text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
