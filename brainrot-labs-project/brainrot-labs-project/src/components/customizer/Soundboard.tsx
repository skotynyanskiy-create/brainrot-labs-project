import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { playBlipSound, playCoinSound, playWowSound, playAirhornSound } from '../../utils/sounds';

export default function Soundboard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed left-4 bottom-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            className="absolute bottom-16 left-0 bg-white border-4 border-black p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-2 min-w-[150px]"
          >
            <div className="text-xs font-black uppercase mb-2 border-b-2 border-black pb-1">Soundboard 🔊</div>
            <button 
              onClick={() => playBlipSound()}
              aria-label="Riproduci suono Blip"
              className="text-left px-3 py-2 hover:bg-yellow-400 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-2"
            >
              <span>🔘</span> Blip
            </button>
            <button 
              onClick={() => playCoinSound()}
              aria-label="Riproduci suono Moneta"
              className="text-left px-3 py-2 hover:bg-yellow-400 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-2"
            >
              <span>💰</span> Coin
            </button>
            <button 
              onClick={() => playWowSound()}
              aria-label="Riproduci suono Wow"
              className="text-left px-3 py-2 hover:bg-yellow-400 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-2"
            >
              <span>😲</span> Wow
            </button>
            <button 
              onClick={() => playAirhornSound()}
              aria-label="Riproduci suono Tromba da stadio"
              className="text-left px-3 py-2 hover:bg-yellow-400 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-2"
            >
              <span>📢</span> Airhorn
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { playBlipSound(); setIsOpen(!isOpen); }}
        className={`p-4 border-4 border-black rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all ${isOpen ? 'bg-black text-white' : 'bg-white text-black'}`}
        aria-label="Toggle Soundboard"
      >
        {isOpen ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
