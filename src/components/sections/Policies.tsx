import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Policies() {
  const policies = [
    {
      title: "Spedizioni",
      icon: Truck,
      headline: "3-5 giorni lavorativi",
      text: "Spediamo in tutta Italia e in Europa tramite corriere tracciato. Riceverai email di conferma con numero di tracking appena il pacco è in viaggio. Spedizione gratuita sopra €49.",
      fine: "* I tempi indicati sono stime. Cause di forza maggiore (scioperi, maltempo, vibe cosmici) possono causare ritardi.",
      color: "bg-green-400"
    },
    {
      title: "Resi & Rimborsi",
      icon: RotateCcw,
      headline: "14 giorni per ripensarci",
      text: "Hai 14 giorni dalla ricezione per restituire un prodotto non conforme o difettoso, in conformità al D.Lgs. 206/2005 (Codice del Consumo). Il reso è gratuito per difetti di produzione.",
      fine: "* Per prodotti personalizzati (customizer AI) il diritto di recesso è escluso ai sensi dell'art. 59 del Codice del Consumo.",
      color: "bg-orange-400"
    },
    {
      title: "Privacy & Dati",
      icon: ShieldCheck,
      headline: "I tuoi dati restano tuoi",
      text: "Raccogliamo solo i dati necessari all'elaborazione dell'ordine e all'autenticazione (Google OAuth). Non vendiamo, non cediamo, non affittiamo dati a terzi. Puoi richiedere la cancellazione in qualsiasi momento.",
      fine: "* Trattamento dati conforme al GDPR (Reg. UE 2016/679). Informativa completa disponibile nella Privacy Policy.",
      color: "bg-purple-400"
    }
  ];

  return (
    <section className="py-32 px-6 md:px-12 bg-white border-b-8 border-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {policies.map((policy, i) => (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -10, rotate: i % 2 === 0 ? 1 : -1 }}
              className={`${policy.color} border-8 border-black p-10 shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative group`}
            >
              <div className="absolute -top-8 -right-8 bg-white border-4 border-black p-4 rounded-full group-hover:rotate-12 transition-transform">
                <policy.icon className="w-10 h-10" />
              </div>
              <h3 className="text-4xl font-black uppercase mb-2 tracking-tighter">{policy.title}</h3>
              <p className="text-sm font-mono font-black uppercase mb-4 tracking-widest opacity-70">{policy.headline}</p>
              <p className="text-lg font-mono font-semibold leading-relaxed text-gray-900 mb-4">{policy.text}</p>
              <p className="text-xs font-mono text-gray-700 opacity-80 border-t-2 border-black/30 pt-3 leading-relaxed">{policy.fine}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
