import { motion, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Wand2, Users, Sparkles, Shirt, ShoppingBag } from 'lucide-react';
import { playBlipSound } from '../../utils/sounds';
import Product3DViewer from '../product/Product3DViewer';
import { CREATOR_ROYALTY_RATE } from '../../constants';

interface HeroProps {
  onOpenCustomizer?: () => void;
  onOpenCommunity?: () => void;
}

function useCountUp(target: number, duration = 1000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(progress * target);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [duration, start, target]);

  return count;
}

const STATS: { target: number; suffix: string; label: string }[] = [
  { target: 2, suffix: '', label: 'prodotti base' },
  { target: 8, suffix: '', label: 'basi curate' },
  { target: CREATOR_ROYALTY_RATE, suffix: '%', label: 'royalty creator' },
];

const STEPS = [
  { Icon: Sparkles, label: 'Genera AI' },
  { Icon: Shirt, label: 'Personalizza' },
  { Icon: ShoppingBag, label: 'Ordina' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

function StatItem({ target, suffix, label, animate }: { target: number; suffix: string; label: string; animate: boolean }) {
  const raw = useCountUp(target, 950, animate);
  const display = target % 1 !== 0
    ? `${raw.toFixed(1)}${suffix}`
    : `${Math.floor(raw)}${suffix}`;

  return (
    <div className="flex flex-col">
      <span className="text-xl font-black text-black leading-none tabular-nums">{animate ? display : '-'}</span>
      <span className="mt-0.5 text-[10px] font-mono uppercase tracking-wider text-gray-500">{label}</span>
    </div>
  );
}

export default function Hero({ onOpenCustomizer, onOpenCommunity }: HeroProps) {
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' });

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden border-b-4 border-black bg-white px-6 pb-16 pt-24 md:px-12 md:pb-20 md:pt-32">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #00000012 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="order-2 flex flex-col items-start text-left lg:order-1"
          >
            <motion.h1
              variants={item}
              className="mb-5 text-5xl font-black uppercase leading-[0.92] tracking-tighter text-black sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem]"
            >
              IL TUO OUTFIT
              <br />
              <span className="mt-3 inline-block rotate-1 border-4 border-black bg-yellow-400 px-4 py-1 text-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                E UN MEME
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mb-7 max-w-md border-l-4 border-black pl-4 text-base font-semibold leading-relaxed text-gray-700 sm:text-lg md:text-xl"
            >
              Crea un design con AI o basi curate, controllalo in anteprima 3D e trasformalo in un prodotto fisico pronto per il checkout o per la community.
            </motion.p>

            <motion.div variants={item} className="mb-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { playBlipSound(); onOpenCustomizer?.(); }}
                className="group flex items-center justify-center gap-2.5 border-4 border-black bg-cyan-400 px-7 py-4 text-lg font-black uppercase italic text-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              >
                <Wand2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
                Apri Customizer
              </motion.button>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { playBlipSound(); onOpenCommunity?.(); }}
                className="group flex items-center justify-center gap-2.5 border-4 border-black bg-white px-7 py-4 text-lg font-black uppercase italic text-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-black hover:text-white hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              >
                <Users className="h-5 w-5 transition-transform group-hover:-rotate-12" />
                Esplora Community
              </motion.button>
            </motion.div>

            <motion.div variants={item} className="mb-8 flex w-full max-w-xs items-center">
              {STEPS.map(({ Icon, label }, index) => (
                <div key={label} className="flex flex-1 items-center">
                  <div className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-9 w-9 items-center justify-center bg-black text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-center text-[9px] font-mono font-bold uppercase leading-tight tracking-wide text-gray-500">{label}</span>
                  </div>
                  {index < STEPS.length - 1 && <div className="mb-4 h-px w-5 shrink-0 bg-black/40" />}
                </div>
              ))}
            </motion.div>

            <motion.div variants={item} ref={statsRef} className="flex items-center gap-5">
              {STATS.map((stat, index) => (
                <div key={stat.label} className="flex items-center gap-5">
                  <StatItem {...stat} animate={statsInView} />
                  {index < STATS.length - 1 && <div className="h-7 w-px bg-black/20" />}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
            className="relative order-1 flex items-center justify-center lg:order-2"
          >
            <motion.div
              animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.08, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute h-[65%] w-[65%] rounded-full bg-yellow-400/40 blur-[80px] pointer-events-none"
            />

            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-[320px] w-full cursor-grab active:cursor-grabbing sm:h-[420px] lg:h-[560px]"
            >
              <Product3DViewer
                modelPath="/models/tshirt-ecommerce-ready.glb"
              />
            </motion.div>

            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-black/35">
              <span className="animate-bounce text-sm">•</span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest">Trascina per ruotare</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
