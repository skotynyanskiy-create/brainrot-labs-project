import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playBlipSound } from '../../utils/sounds';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "Come vestono i vostri capi?", a: "Le nostre taglie seguono la geometria non euclidea. Una L potrebbe starti come un crop top o come un paracadute. È il brivido dell'acquisto al buio." },
    { q: "Siete un brand eco-sostenibile?", a: "I nostri capi sono realizzati al 100% con meme riciclati, sogni infranti e promesse non mantenute. (E forse un po' di poliestere)." },
    { q: "Perché i prezzi sono così alti?", a: "Perché l'inflazione è un costrutto sociale, il capitalismo è una menzogna, e noi abbiamo bisogno di liquidità per comprare shitcoin." },
    { q: "Accettate pagamenti in Crypto?", a: "Accettiamo solo Dogecoin, bonifici in Lire italiane, o scambi alla pari con carte Charizard olografiche prima edizione." },
    { q: "Sono un Influencer, mi fate lo sconto?", a: "Solo se hai più di 1 milione di follower veri e sei disposto a tatuarti il nostro logo in fronte in diretta streaming. Altrimenti paga il prezzo pieno, mortale." },
    { q: "E per quanto riguarda il Copyright?", a: "Noi non abbiamo visto niente. Tu non hai visto niente. Se gli avvocati della Disney bussano alla porta, tu non hai mai sentito parlare di noi." },
    { q: "Come devo lavare questi capolavori?", a: "Lavare a freddo, al rovescio. O meglio ancora, non lavarli mai. Abbraccia il vero stile di vita da gamer e lascia che la natura faccia il suo corso." }
  ];

  return (
    <section className="py-32 px-6 md:px-12 bg-indigo-400 border-b-8 border-black relative overflow-hidden">
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
          className="text-6xl md:text-9xl font-black uppercase mb-20 text-center tracking-tighter leading-[0.85]"
        >
          Domande <br/>
          <span className="inline-block bg-white text-black px-8 py-2 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] rotate-2 italic">Esistenziali</span>
        </motion.h2>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ x: i % 2 === 0 ? -50 : 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden"
            >
              <button
                onClick={() => { playBlipSound(); setOpenIndex(openIndex === i ? null : i); }}
                className="w-full p-8 text-left flex justify-between items-center group"
              >
                <span className="text-2xl md:text-3xl font-black uppercase leading-none group-hover:text-indigo-600 transition-colors">
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
                    className="px-8 pb-8"
                  >
                    <p className="text-xl md:text-2xl font-mono font-semibold text-gray-700 leading-relaxed border-t-4 border-black pt-6">
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
