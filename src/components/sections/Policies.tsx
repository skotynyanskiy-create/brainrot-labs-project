import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Policies() {
  const policies = [
    {
      title: "Speedrun Spedizioni",
      icon: Truck,
      headline: "3-5 giorni lavorativi IRL",
      text: "Spediamo in tutta Europa con tracking live. Appena il corriere spawna nel tuo quartiere ti pinghiamo. Spedizione FREE se superi i 49€ (letteralmente un glitch nei soldi).",
      fine: "* I tempi sono stime. Bug del server di Matrix, scioperi o invasioni aliene potrebbero causare lag nella consegna.",
      color: "bg-green-400"
    },
    {
      title: "Rage Quit (Resi)",
      icon: RotateCcw,
      headline: "14 giorni per ripensarci",
      text: "Se il loot arriva buggato o con difetti di stampa, hai 14 giorni per fare Rage Quit senza sbatti. Ci prendiamo noi la L. Reso 100% gratuito per difetti.",
      fine: "* Attenzione: i drop generati col Customizer AI non sono rimborsabili se ti accorgi che il meme faceva schifo (Art. 59 del Codice del Consumo). Abbi fede nelle tue scelte.",
      color: "bg-orange-400"
    },
    {
      title: "No Doxxing (Privacy)",
      icon: ShieldCheck,
      headline: "Dati al sicuro dagli NPC",
      text: "Non siamo Mark Zuckerberg. Usiamo i tuoi dati solo per farti arrivare il merch e farti loggare in pace. Zero rivendita ai broker, la tua cronologia cringe è al sicuro con noi.",
      fine: "* Pienamente conformi al boss finale: il GDPR (Reg. UE 2016/679). Puoi nuclearizzare e deletare il tuo account quando vuoi.",
      color: "bg-purple-400"
    }
  ];

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-white border-b-8 border-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {policies.map((policy, i) => (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -10, rotate: i % 2 === 0 ? 1 : -1 }}
              className={`${policy.color} border-8 border-black p-8 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative group`}
            >
              <div className="absolute -top-8 -right-8 bg-white border-4 border-black p-4 rounded-full group-hover:rotate-12 transition-transform">
                <policy.icon className="w-10 h-10" />
              </div>
              <h3 className="text-3xl md:text-4xl font-black uppercase mb-2 tracking-tighter">{policy.title}</h3>
              <p className="text-sm font-mono font-black uppercase mb-4 tracking-widest opacity-90">{policy.headline}</p>
              <p className="text-lg font-mono font-semibold leading-relaxed text-gray-900 mb-4">{policy.text}</p>
              <p className="text-xs font-mono text-gray-800 opacity-90 border-t-2 border-black/30 pt-3 leading-relaxed">{policy.fine}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
