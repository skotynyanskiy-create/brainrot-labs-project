import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { getSiteCtaClasses } from '../../styles/siteCta';
import { playBlipSound } from '../../utils/sounds';

interface TestimonialsProps {
  onOpenCommunity?: () => void;
}

export default function Testimonials({ onOpenCommunity }: TestimonialsProps) {
  const reviews = [
    {
      name: 'Elon Musk',
      role: 'Chaos beta tester',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Elon',
      text: 'Ho aperto il customizer per perdere 2 minuti e ne sono uscito con una t-shirt che sembra progettata da un meme mandato nello spazio. Preview solida. Caos controllato. Approvato.',
      rating: 5,
      color: 'bg-pink-100',
    },
    {
      name: 'Jeff Bezos',
      role: 'Logistica mentale',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Bezos',
      text: 'La cosa inquietante e che il flusso ha troppo senso: scegli il supporto, sistemi il design, controlli la preview e compri. Zero attrito, zero scuse, solo conversione pura.',
      rating: 5,
      color: 'bg-cyan-100',
    },
    {
      name: 'Warren Buffett',
      role: 'Value investor del brainrot',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Warren',
      text: 'Di solito non inseguo hype, ma qui il valore c e: catalogo coerente, preview credibile e community monetizzabile. Per una volta il meme ha anche fondamentali.',
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

        <div className="mt-16 md:mt-20 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playBlipSound();
              onOpenCommunity?.();
            }}
            className={getSiteCtaClasses('archive', 'lg')}
          >
            Archivio Digitale
          </motion.button>
        </div>
      </div>
    </section>
  );
}
