import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playBlipSound } from '../../utils/sounds';
import { CREATOR_ROYALTY_RATE } from '../../constants';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "Come scelgo il prodotto giusto?", a: "Nel customizer parti dai prodotti base disponibili, poi definisci colore, taglia e design. La preview serve proprio a verificare se il contenuto funziona davvero su quel supporto." },
    { q: "Posso partire da una base meme invece che da zero?", a: "Sì. La sezione delle basi curate ti permette di iniziare da template già selezionati, così eviti immagini casuali o poco leggibili sul prodotto finale." },
    { q: "Il customizer usa davvero l'AI?", a: "Sì. Puoi usare prompt, suggerimenti testuali e composizione manuale nello stesso workflow. Il design resta comunque modificabile prima del checkout." },
    { q: "Come funziona la preview 3D?", a: "La preview mostra come il design si adatta al prodotto scelto prima dell'acquisto. Serve a ridurre incoerenze tra editor, scheda prodotto e resa percepita." },
    { q: "Posso pubblicare il mio design nella community?", a: "Sì. Dopo aver creato e finalizzato il design puoi renderlo pubblico, così entra nella community vault ed è acquistabile anche da altri utenti." },
    { q: "Come funzionano le royalty?", a: `Per ogni vendita di un design pubblicato in community il creator riceve il ${CREATOR_ROYALTY_RATE}% di royalty. La percentuale e gestita in modo coerente tra customizer, community e dashboard account.` },
    { q: "Se il prodotto arriva con un difetto?", a: "In caso di problemi di stampa o produzione puoi fare riferimento alle policy di spedizione e reso. I dettagli operativi sono riepilogati nelle sezioni del sito e nelle pagine legali." }
  ];

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-indigo-400 border-b-8 border-black relative overflow-hidden">
      {/* Decorative Elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-20 -left-20 w-64 h-64 border-[16px] border-black/10 rounded-full"
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.h2
          initial={{ rotate: -5, scale: 0.9 }}
          whileInView={{ rotate: 0, scale: 1 }}
          className="text-5xl md:text-9xl font-black uppercase mb-16 md:mb-20 text-center tracking-tighter leading-[0.85]"
        >
          Domande <br/>
          <span className="inline-block bg-white text-black px-6 md:px-8 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] rotate-2 italic">Esistenziali</span>
        </motion.h2>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ x: i % 2 === 0 ? -50 : 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white border-8 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden"
            >
              <button
                onClick={() => { playBlipSound(); setOpenIndex(openIndex === i ? null : i); }}
                className="w-full p-6 md:p-8 text-left flex justify-between items-center group"
              >
                <span className="text-xl md:text-3xl font-black uppercase leading-none group-hover:text-indigo-600 transition-colors">
                  {faq.q}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  className="text-4xl font-black"
                >
                  {openIndex === i ? '−' : '+'}
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 md:px-8 pb-6 md:pb-8"
                  >
                    <p className="text-lg md:text-2xl font-mono font-semibold text-gray-700 leading-relaxed border-t-4 border-black pt-4 md:pt-6">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
