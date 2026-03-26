import { motion } from 'motion/react';
import { Wand2, Archive } from 'lucide-react';
import { playBlipSound } from '../../utils/sounds';
import { getSiteCtaClasses } from '../../styles/siteCta';
import Product3DViewer from '../product/Product3DViewer';
import { TSHIRT_MODEL_PATH } from '../product/Tshirt3DModel';

interface HeroProps {
  onOpenCustomizer?: () => void;
  onOpenCommunity?: () => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

export default function Hero({ onOpenCustomizer, onOpenCommunity }: HeroProps) {
  return (
    <section className="relative flex min-h-[calc(100vh-88px)] items-center overflow-hidden border-b-4 border-black bg-white px-6 pb-14 pt-10 md:px-12 md:pb-16 md:pt-14">
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

            <motion.div variants={item} className="mb-8 max-w-[42rem] border-l-4 border-black pl-5">
              <p className="text-lg font-semibold leading-relaxed text-gray-800 sm:text-xl md:text-[1.42rem]">
                Prendi un'idea assurda, costruiscila bene e falla uscire dal feed:
                qui i meme diventano design, prodotti fisici e drop che puoi davvero far girare.
              </p>
            </motion.div>

            <motion.div variants={item} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { playBlipSound(); onOpenCustomizer?.(); }}
                className={getSiteCtaClasses('create', 'lg', 'group w-full sm:w-auto')}
              >
                <Wand2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
                Crea il tuo design
              </motion.button>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { playBlipSound(); onOpenCommunity?.(); }}
                className={getSiteCtaClasses('archive', 'lg', 'group w-full sm:w-auto')}
              >
                <Archive className="h-5 w-5 transition-transform group-hover:-rotate-6" />
                Archivio Digitale
              </motion.button>
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
                modelPath={TSHIRT_MODEL_PATH}
                autoRotate={false}
              />
            </motion.div>

            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-black/35">
              <span className="animate-bounce text-sm">.</span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest">Trascina per ruotare</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
