import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Policies() {
  const policies = [
    {
      title: "Speedrun Spedizioni",
      icon: Truck,
      headline: "3-5 giorni lavorativi IRL",
      text: "Spediamo con tracking e aggiornamenti chiari durante produzione e consegna. La logica del sito resta allineata: prima confermi il design, poi parte il flusso operativo.",
      fine: "* I tempi indicati sono stime operative e possono variare in base a produzione, destinazione e disponibilita del corriere.",
      color: "bg-green-400"
    },
    {
      title: "Rage Quit (Resi)",
      icon: RotateCcw,
      headline: "14 giorni per ripensarci",
      text: "Se il prodotto arriva con difetti o problemi di stampa, puoi avviare la procedura di assistenza e reso seguendo i termini indicati nel sito.",
      fine: "* Per i prodotti personalizzati valgono le limitazioni previste dalla normativa applicabile, salvo difetti di produzione o non conformita.",
      color: "bg-orange-400"
    },
    {
      title: "No Doxxing (Privacy)",
      icon: ShieldCheck,
      headline: "Dati al sicuro dagli NPC",
      text: "I dati vengono usati per account, ordini, logistica e funzioni essenziali del servizio. Il tono del brand puo essere ironico, ma il trattamento resta serio e circoscritto.",
      fine: "* I dettagli completi sul trattamento dei dati sono disponibili nella Privacy Policy e seguono il quadro GDPR applicabile.",
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
              id={policy.title.includes('Spedizioni') ? 'shipping-policy' : policy.title.includes('Resi') ? 'returns-policy' : policy.title.includes('Privacy') ? 'privacy-policy-summary' : undefined}
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
