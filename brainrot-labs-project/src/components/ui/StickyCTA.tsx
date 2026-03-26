import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { playBlipSound } from '../../utils/sounds';

interface StickyCTAProps {
  onOpenCustomizer: () => void;
}

export default function StickyCTA({ onOpenCustomizer }: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past 800px
      setIsVisible(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <motion.button
            whileHover={{ scale: 1.1, rotate: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { playBlipSound(); onOpenCustomizer(); }}
            className="bg-pink-500 text-white font-black uppercase text-xl px-8 py-4 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
          >
            Crea il tuo design
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
