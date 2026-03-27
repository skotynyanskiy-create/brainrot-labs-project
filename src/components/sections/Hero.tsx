import { motion } from 'motion/react';
import { Archive, Wand2 } from 'lucide-react';
import { playBlipSound } from '../../utils/sounds';
import { getSiteCtaClasses } from '../../styles/siteCta';
import Product3DPreview from '../customizer/Product3DPreview';

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
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const TRUST_ITEMS = ['Nessun minimo', 'Produzione on demand', 'Preview 3D live'];

export default function Hero({ onOpenCustomizer, onOpenCommunity }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b-8 border-black bg-white px-6 pb-14 pt-10 md:px-12 md:pb-18 md:pt-14"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(circle, #00000010 1px, transparent 1px)', backgroundSize: '26px 26px' }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(250,204,21,0.16),transparent)]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="order-2 flex max-w-3xl flex-col items-start lg:order-1"
          >
            <motion.h1
              id="hero-title"
              variants={item}
              className="max-w-[10.5ch] text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] text-black sm:text-6xl md:text-7xl lg:text-[5.15rem] xl:text-[6rem]"
            >
              DAL MEME AL
              <br />
              TUO DROP
              <br />
              <span className="mt-3 inline-block -rotate-[1.2deg] border-4 border-black bg-yellow-400 px-3 py-1.5 text-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] sm:px-4 sm:py-2">
                PRONTO DA LANCIARE
              </span>
            </motion.h1>

            <motion.div variants={item} className="mt-6 max-w-[40rem] border-l-4 border-black pl-5">
              <p className="text-base font-semibold leading-[1.55] text-black/80 sm:text-lg md:text-[1.22rem]">
                Parti da un&apos;idea, trasformala in un design e applicala subito a un prodotto reale.
                Brainrot Labs ti da un flusso semplice per creare, visualizzare e pubblicare senza passaggi inutili.
              </p>
            </motion.div>

            <motion.div variants={item} className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  playBlipSound();
                  onOpenCommunity?.();
                }}
                className={getSiteCtaClasses(
                  'archive',
                  'lg',
                  'group w-full sm:w-auto sm:min-w-[18rem] shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:shadow-[14px_14px_0_0_rgba(0,0,0,1)]'
                )}
              >
                <Archive className="h-5 w-5 transition-transform duration-200 group-hover:-rotate-6" />
                ARCHIVIO DIGITALE
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  playBlipSound();
                  onOpenCustomizer?.();
                }}
                className={getSiteCtaClasses(
                  'create',
                  'lg',
                  'group w-full sm:w-auto sm:min-w-[18rem] shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:shadow-[14px_14px_0_0_rgba(0,0,0,1)]'
                )}
              >
                <Wand2 className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
                CREA IL TUO DESIGN
              </motion.button>
            </motion.div>

            <motion.div variants={item} className="mt-5 flex flex-wrap gap-2.5">
              {TRUST_ITEMS.map((trustItem) => (
                <span
                  key={trustItem}
                  className="inline-flex items-center border-2 border-black bg-white px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-black/65 shadow-[3px_3px_0_0_rgba(0,0,0,1)] sm:text-[11px]"
                >
                  {trustItem}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24, y: 16 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
            className="order-1 flex justify-center lg:order-2 lg:justify-end"
          >
            <div className="relative w-full max-w-[34rem]">
              <div className="pointer-events-none absolute inset-x-[10%] top-[10%] h-[56%] rounded-full bg-white/80 blur-[60px]" />

              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative border-4 border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)]"
              >
                <div className="border-b-4 border-black bg-black px-4 py-3">
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-yellow-300">
                      Preview prodotto
                    </p>
                  </div>
                </div>

                <div className="relative bg-[linear-gradient(180deg,#f7f3ea_0%,#ffffff_100%)] px-4 pb-6 pt-4 sm:px-6 sm:pb-8">
                  <div className="pointer-events-none absolute inset-0 opacity-35" style={{ backgroundImage: 'radial-gradient(circle, #0000000f 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div className="relative h-[320px] sm:h-[400px] lg:h-[500px]">
                    <Product3DPreview
                      baseProductId="base-tshirt"
                      designTextureUrl={null}
                      baseColor="#ffffff"
                      autoRotate={true}
                      lightingMode="neutral"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
