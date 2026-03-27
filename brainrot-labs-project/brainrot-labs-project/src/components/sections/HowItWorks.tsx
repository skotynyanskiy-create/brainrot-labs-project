import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { ShoppingBag, Wand2, Box, CreditCard, TrendingUp, ArrowRight } from 'lucide-react';
import { CREATOR_ROYALTY_RATE } from '../../constants';

interface HowItWorksProps {
  onOpenCustomizer?: () => void;
}

const steps = [
  {
    number: '01',
    icon: ShoppingBag,
    title: 'Scegli il supporto',
    desc: 'Parti da uno dei prodotti base disponibili nel customizer e definisci subito formato, colore e destinazione del design.',
    color: 'bg-yellow-400',
    textColor: 'text-black',
    accent: 'border-yellow-400',
    tag: 'TUTORIAL STAGE',
  },
  {
    number: '02',
    icon: Wand2,
    title: 'Costruisci il design',
    desc: 'Usa una base meme, genera una variante con AI oppure combina testo, sticker e upload manuali nello stesso editor.',
    color: 'bg-pink-500',
    textColor: 'text-white',
    accent: 'border-pink-500',
    tag: 'AI POWERED',
  },
  {
    number: '03',
    icon: Box,
    title: 'Controlla la preview',
    desc: 'Verifica la resa in 2D e 3D prima di acquistare, cosi il contenuto che vedi resta coerente con il prodotto finale.',
    color: 'bg-cyan-400',
    textColor: 'text-black',
    accent: 'border-cyan-400',
    tag: 'REALITY CHECK',
  },
  {
    number: '04',
    icon: CreditCard,
    title: 'Acquista il prodotto',
    desc: 'Conferma taglia, colore e quantità. Il prodotto entra nel flusso di stampa on-demand e parte con tracking dedicato.',
    color: 'bg-black',
    textColor: 'text-white',
    accent: 'border-black',
    tag: 'PRINT ON DEMAND',
  },
  {
    number: '05',
    icon: TrendingUp,
    title: 'Pubblica e monetizza',
    desc: `Se rendi pubblico il design, può entrare nella community e generare il ${CREATOR_ROYALTY_RATE}% di royalty su ogni vendita successiva.`,
    color: 'bg-green-400',
    textColor: 'text-black',
    accent: 'border-green-400',
    tag: `${CREATOR_ROYALTY_RATE}% ROYALTY`,
    highlight: true,
  },
];

export default function HowItWorks({ onOpenCustomizer }: HowItWorksProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-32 px-6 md:px-12 bg-[#f0f0f0] border-b-8 border-black relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-black" />
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-yellow-400 rounded-full border-8 border-black opacity-20" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-pink-500 rounded-full border-8 border-black opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-20 flex flex-col items-start gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block bg-black text-white font-mono font-black uppercase text-xs tracking-[0.3em] px-4 py-2 mb-6"
            >
              MAIN QUEST
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic"
            >
              COME <br />
              <span className="inline-block bg-pink-500 text-white px-6 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] -rotate-1 mt-2">
                FUNZIONA
              </span>
            </motion.h2>
          </div>

        </div>

        {/* Steps — desktop horizontal timeline */}
        <div className="hidden lg:flex items-stretch gap-0 relative mb-20">
          {/* Connecting line */}
          <div className="absolute top-[4.5rem] left-0 right-0 h-1 bg-black z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 * i }}
              className="flex-1 flex flex-col items-center relative z-10 px-3"
            >
              {/* Icon circle */}
              <div
                className={`w-24 h-24 ${step.color} border-4 border-black flex items-center justify-center shadow-[6px_6px_0_0_rgba(0,0,0,1)] mb-6 relative`}
              >
                <step.icon className={`w-10 h-10 ${step.textColor}`} />
                {step.highlight && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center text-xs font-black animate-bounce">
                    ★
                  </div>
                )}
              </div>

              {/* Card */}
              <div className={`w-full bg-white border-4 border-black p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col gap-3 ${step.highlight ? 'ring-4 ring-green-400' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-3xl opacity-20">{step.number}</span>
                  <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-2 py-1 border-2 border-black ${step.color} ${step.textColor}`}>
                    {step.tag}
                  </span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight leading-tight">{step.title}</h3>
                <p className="font-mono text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>

              {/* Arrow between steps */}
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-[4rem] z-20 w-6 h-6 bg-black flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Steps — mobile vertical list */}
        <div className="flex lg:hidden flex-col gap-6 mb-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className={`flex gap-5 bg-white border-4 border-black p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] ${step.highlight ? 'ring-4 ring-green-400' : ''}`}
            >
              <div className={`w-16 h-16 shrink-0 ${step.color} border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]`}>
                <step.icon className={`w-8 h-8 ${step.textColor}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono font-black text-xl opacity-20">{step.number}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-black ${step.color} ${step.textColor}`}>
                    {step.tag}
                  </span>
                </div>
                <h3 className="text-lg font-black uppercase mb-1">{step.title}</h3>
                <p className="font-mono text-sm text-gray-600">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Royalty highlight banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-green-400 border-8 border-black p-8 md:p-12 shadow-[12px_12px_0_0_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8" />
              <span className="font-mono font-black uppercase tracking-widest text-sm">CREATOR ECONOMY</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight mb-3">
              Ogni vendita del tuo design<br />
              <span className="inline-block bg-black text-green-400 px-4 py-1 mt-1">= {CREATOR_ROYALTY_RATE}% nelle tue tasche</span>
            </h3>
            <p className="font-mono text-lg text-black/70 max-w-xl">
              Pubblica un design solo quando è davvero pronto. Se altri utenti lo acquistano dalla community, il sistema registra automaticamente le tue royalty.
            </p>
          </div>

          {onOpenCustomizer && (
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCustomizer}
              className="shrink-0 bg-black text-white border-4 border-black px-10 py-5 text-xl font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center gap-3 italic"
            >
              <Wand2 className="w-6 h-6" />
              APRI IL CUSTOMIZER
            </motion.button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
