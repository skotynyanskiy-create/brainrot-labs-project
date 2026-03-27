import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playBlipSound } from '../../utils/sounds';
import { CREATOR_ROYALTY_RATE } from '../../constants';

const faqs = [
  {
    id: 'faq-start',
    q: "DA DOVE INIZIO?",
    a: "Semplice. Scegli un prodotto base nel customizer, poi scatena la creatività. La preview 3D ti mostra in tempo reale se la tua idea è un capolavoro o un disastro. WYSIWYG, zero sorprese."
  },
  {
    id: 'faq-template',
    q: "DEVO PARTIRE DA ZERO?",
    a: "No. Abbiamo un vault di meme già pronti per l'uso. Parti da una base solida per creare qualcosa di leggendario, invece di cercare per ore un'immagine sgranata."
  },
  {
    id: 'faq-ai',
    q: "L'AI FA TUTTO IL LAVORO?",
    a: "L'AI è il tuo copilota, non il pilota. Usala per generare idee, suggerire testi o creare immagini. Ma alla fine, il controllo è tuo. Modifica, sposta, cancella: il design finale lo decidi tu."
  },
  {
    id: 'faq-community',
    q: "POSSO DIVENTARE FAMOSO (E RICCO)?",
    a: "Certo. Pubblica il tuo design nella Community. Se piace, altri potranno comprarlo e tu diventi un creator ufficiale di Brainrot Labs. La gloria (e i soldi) ti aspettano."
  },
  {
    id: 'faq-royalties',
    q: "OK, PARLIAMO DI SOLDI.",
    a: `Ogni volta che qualcuno compra un prodotto con il tuo design, tu guadagni il ${CREATOR_ROYALTY_RATE}%. Senza se e senza ma. Trovi tutto nel tuo dashboard, trasparente e diretto.`
  },
  {
    id: 'faq-support',
    q: "IL MIO ORDINE È UN DISASTRO. E ORA?",
    a: "Niente panico. Se c'è un problema di stampa o il prodotto è danneggiato, contattaci subito. Mandaci una foto del disastro e ci pensiamo noi a sistemare tutto. La tua soddisfazione è la nostra priorità, non è una frase fatta."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
            <div key={faq.id}>
              <motion.div
                initial={{ x: i % 2 === 0 ? -50 : 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white border-8 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden"
              >
                <button
                  id={`${faq.id}-button`}
                  aria-expanded={openIndex === i}
                  aria-controls={`${faq.id}-panel`}
                  onClick={() => {
                    playBlipSound();
                    setOpenIndex(openIndex === i ? null : i);
                  }}
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
                      id={`${faq.id}-panel`}
                      role="region"
                      aria-labelledby={`${faq.id}-button`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8">
                        <p className="text-lg md:text-2xl font-mono font-semibold text-gray-700 leading-relaxed border-t-4 border-black pt-4 md:pt-6">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
