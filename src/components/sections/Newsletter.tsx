import { Send } from 'lucide-react';
import { playBlipSound } from '../../utils/sounds';
import { useToast } from '../../context/ToastContext';
import React, { useState } from 'react';
import { motion } from 'motion/react';

export default function Newsletter() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playBlipSound();
    if (email) {
      addToast('Iscrizione completata! Preparati allo spam.');
      setEmail('');
    } else {
      addToast('Inserisci una mail valida, genio.');
    }
  };

  return (
    <section className="py-32 px-6 md:px-12 bg-yellow-400 border-b-8 border-black relative overflow-hidden">
      {/* Background Text */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-5 pointer-events-none select-none">
        <div className="text-[20vw] font-black leading-none transform -rotate-12">NEWSLETTER NEWSLETTER</div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          className="inline-block bg-black text-white px-6 py-2 font-black uppercase text-xl mb-8 transform rotate-3"
        >
          ATTENZIONE: SPAM IN ARRIVO 🛑
        </motion.div>
        
        <h2 className="text-7xl md:text-9xl font-black uppercase mb-8 tracking-tighter leading-[0.9]">
          VUOI ALTRI <br/> 
          <span className="inline-block bg-black text-white px-8 py-2 border-4 border-black shadow-[12px_12px_0_0_rgba(236,72,153,1)] rotate-[-3deg] italic">MEME?</span>
        </h2>
        
        <p className="text-xl md:text-2xl font-sans font-medium text-black mb-16 max-w-2xl mx-auto leading-relaxed border-4 border-black p-6 bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          "Inserisci la tua email per ricevere meme di altissima qualità, sconti discutibili e occasionali crisi esistenziali direttamente nella tua casella di posta."
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto relative">
          {/* Floating Sticker on form */}
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 0.9, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-12 -right-12 z-20 text-8xl hidden md:block select-none pointer-events-none"
          >
            🤑
          </motion.div>
          
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Il tuo indirizzo email"
            required
            className="flex-1 bg-white border-8 border-black px-8 py-6 text-2xl font-black uppercase placeholder:text-gray-400 focus:outline-none focus:ring-8 focus:ring-pink-500/50 shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-all"
          />
          <motion.button 
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-black text-white px-12 py-6 border-8 border-black font-black uppercase text-2xl shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[12px] hover:translate-y-[12px] transition-all flex items-center justify-center gap-4"
          >
            ISCRIVITI <Send className="w-8 h-8" />
          </motion.button>
        </form>
        
        <p className="mt-12 text-sm font-black uppercase opacity-60">
          * Promettiamo di non vendere i tuoi dati. Probabilmente.
        </p>
      </div>
    </section>
  );
}
