import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { getSiteCtaClasses } from '../../styles/siteCta';
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
            className={getSiteCtaClasses('create', 'lg')}
          >
            Crea il tuo design
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
