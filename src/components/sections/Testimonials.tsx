import { motion, useInView } from 'motion/react';
import { Star, MessageSquare, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState, type ComponentType } from 'react';

interface CounterProps {
  target: number;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const AnimatedCounter = ({ target, label, icon: Icon }: CounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

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
        setCount(Math.floor(current));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ scale: inView ? 1 : 0.8, rotate: inView ? 5 : 0 }}
        className="bg-black text-white p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
      >
        <Icon className="w-8 h-8" />
      </motion.div>
      <motion.div
        animate={{ scale: inView ? 1 : 0.5 }}
        className="text-5xl md:text-6xl font-black text-black"
      >
        {count.toLocaleString('it-IT')}+
      </motion.div>
      <p className="text-sm md:text-base font-black uppercase text-gray-700 text-center tracking-wide">{label}</p>
    </div>
  );
};

export default function Testimonials() {
  const reviews = [
    {
      name: 'Marco R.',
      role: 'Collezionista di meme',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=MarcoR',
      text: 'La qualità di stampa è notevolmente sopra la media del meme merch. La maglietta è già stata rubata da due amici diversi — lo prendo come segnale positivo.',
      rating: 5,
      color: 'bg-pink-100',
    },
    {
      name: 'Giulia S.',
      role: 'Designer freelance',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=GiuliaS',
      text: 'Il customizer AI è sorprendentemente usabile. Ho generato un design in 5 minuti, ho ordinato, e il risultato fisico corrisponde esattamente al preview. Raro.',
      rating: 5,
      color: 'bg-cyan-100',
    },
    {
      name: 'Luca T.',
      role: 'Dev Frontend (e cliente abituale)',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=LucaT',
      text: 'Spedizione in 4 giorni, packaging solido, e il design ha una resa cromatica che non mi aspettavo. Zero sensazione di mockup fatto in fretta. Tornerò.',
      rating: 5,
      color: 'bg-yellow-100',
    },
  ];

  return (
    <section id="testimonials" className="py-32 px-6 md:px-12 bg-white border-b-8 border-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            className="inline-block bg-black text-white px-6 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] mb-6 transform rotate-2"
          >
            <span className="font-black uppercase text-2xl italic">Cosa Dicono Di Noi</span>
          </motion.div>
          <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            FEEDBACK <br />
            <span className="inline-block bg-pink-500 text-white px-8 py-2 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] rotate-[-2deg] italic">VERIFICATI</span>
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
              className={`${review.color} border-4 border-black p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform`}
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

        <div className="mt-32 grid grid-cols-3 gap-8 md:gap-16">
          <AnimatedCounter target={12400} label="Meme Generati con AI" icon={MessageSquare} />
          <AnimatedCounter target={3200} label="Ordini Completati" icon={Star} />
          <AnimatedCounter target={98} label="Clienti Soddisfatti %" icon={ShieldCheck} />
        </div>
      </div>
    </section>
  );
}
