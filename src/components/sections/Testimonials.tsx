import { motion, useInView } from 'motion/react';
import { Star, MessageSquare, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { CREATOR_ROYALTY_RATE } from '../../constants';
import { playBlipSound } from '../../utils/sounds';

interface CounterProps {
  target: number;
  label: string;
  icon: ComponentType<{ className?: string }>;
  suffix?: string;
}

const AnimatedCounter = ({ target, label, icon: Icon, suffix = '' }: CounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const hasDecimals = target % 1 !== 0;

  useEffect(() => {
    if (!inView) return;

    const duration = 2;
    const increment = target / (duration * 60);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(hasDecimals ? Number(current.toFixed(1)) : Math.floor(current));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [hasDecimals, inView, target]);

  const formattedCount = hasDecimals
    ? count.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : count.toLocaleString('it-IT');

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ scale: inView ? 1 : 0.8, rotate: inView ? 5 : 0 }}
        className="bg-black text-white p-4 md:p-6 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
      >
        <Icon className="w-8 h-8" />
      </motion.div>
      <motion.div
        animate={{ scale: inView ? 1 : 0.5 }}
        className="text-5xl md:text-6xl font-black text-black"
      >
        {formattedCount}{suffix}
      </motion.div>
      <p className="text-sm md:text-base font-black uppercase text-gray-700 text-center tracking-wide">{label}</p>
    </div>
  );
};

interface TestimonialsProps {
  onOpenCommunity?: () => void;
}

export default function Testimonials({ onOpenCommunity }: TestimonialsProps) {
  const reviews = [
    {
      name: 'Marco R.',
      role: 'Creator early adopter',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Marco',
      text: 'Ho usato una base già curata, ho sistemato il copy nel customizer e il risultato finale è rimasto coerente dalla preview al prodotto consegnato.',
      rating: 5,
      color: 'bg-pink-100',
    },
    {
      name: 'Giulia P., Milano',
      role: 'Cliente repeat',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Giulia',
      text: 'La parte migliore è che il sito non usa immagini riempitive: quello che scegli in editor è quello che percepisci anche nella scheda prodotto.',
      rating: 5,
      color: 'bg-cyan-100',
    },
    {
      name: 'Luca F., Torino',
      role: 'Creator community',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Luca',
      text: 'Per la community il salto di qualità si vede: seed credibili, visual pertinenti e promessa royalty finalmente spiegata in modo semplice.',
      rating: 5,
      color: 'bg-yellow-100',
    },
  ];

  return (
    <section id="testimonials" className="py-20 md:py-32 px-6 md:px-12 bg-white border-b-8 border-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            className="inline-block bg-black text-white px-4 md:px-6 py-2 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:shadow-[8px_8px_0_0_rgba(0,0,0,1)] mb-6 transform rotate-2"
          >
            <span className="font-black uppercase text-2xl italic">Cosa Dicono Di Noi</span>
          </motion.div>
          <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            FEEDBACK <br />
            <span className="inline-block bg-pink-500 text-white px-6 md:px-8 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] rotate-[-2deg] italic">VERIFICATI</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <motion.article
              key={review.name}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`${review.color} border-4 border-black p-6 md:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform`}
            >
              <div className="flex gap-1 mb-6" aria-label={`${review.rating} stelle su 5`}>
                {[...Array(review.rating)].map((_, index) => (
                  <Star key={index} className="w-5 h-5 fill-black text-black" />
                ))}
              </div>
              <p className="text-xl font-bold mb-8 leading-tight italic">"{review.text}"</p>
              <div className="flex items-center gap-4 border-t-2 border-black pt-6">
                <img
                  src={review.avatar}
                  alt={`Avatar di ${review.name}`}
                  className="h-14 w-14 border-4 border-black bg-white"
                  loading="lazy"
                />
                <div>
                  <span className="block font-mono font-black text-lg">{review.name}</span>
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-700">{review.role}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-20 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <AnimatedCounter target={2} label="Prodotti Base nel Customizer" icon={MessageSquare} />
          <AnimatedCounter target={8} label="Basi Curate da Cui Partire" icon={Star} />
          <AnimatedCounter target={CREATOR_ROYALTY_RATE} label="Royalty Creator per Vendita" icon={ShieldCheck} suffix="%" />
        </div>

        <div className="mt-16 md:mt-20 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playBlipSound();
              onOpenCommunity?.();
            }}
            className="border-4 border-black bg-yellow-400 px-8 py-4 text-lg font-black uppercase italic shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-yellow-400 hover:shadow-none"
          >
            Unisciti alla community →
          </motion.button>
        </div>
      </div>
    </section>
  );
}
