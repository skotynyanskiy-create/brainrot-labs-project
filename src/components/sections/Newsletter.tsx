import { Send } from 'lucide-react';
import { playBlipSound } from '../../utils/sounds';
import { useToast } from '../../context/ToastContext';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { logger } from '../../utils/logger';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Newsletter() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      addToast('Inserisci una mail valida per continuare.', 'warning');
      return;
    }
    playBlipSound();
    setIsSubmitting(true);
    try {
      const fns = getFunctions();
      const subscribeNewsletter = httpsCallable<{ email: string }, { success: boolean }>(fns, 'subscribeNewsletter');
      await subscribeNewsletter({ email });
      addToast('Iscrizione completata. Ti aggiorneremo su drop, basi e novita del laboratorio.', 'success');
      setEmail('');
    } catch (error) {
      logger.error('Newsletter subscription failed:', error);
      addToast("Errore durante l'iscrizione. Riprova tra poco.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden border-b-8 border-black bg-red-500 px-6 py-32 md:px-12">
      <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full select-none items-center justify-center opacity-5">
        <div className="text-[20vw] font-black leading-none transform -rotate-12">NEWSLETTER NEWSLETTER</div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          className="mb-8 inline-block rotate-3 bg-black px-6 py-2 text-xl font-black uppercase text-white"
        >
          Aggiornamenti dal Lab
        </motion.div>

        <h2 className="mb-8 text-7xl font-black uppercase tracking-tighter leading-[0.9] md:text-9xl">
          VUOI ALTRI <br />
          <span className="inline-block rotate-[-3deg] border-4 border-black bg-black px-8 py-2 italic text-white shadow-[12px_12px_0_0_rgba(236,72,153,1)]">MEME?</span>
        </h2>

        <p className="mx-auto mb-16 max-w-2xl border-4 border-black bg-white p-6 text-xl font-medium leading-relaxed text-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:text-2xl">
          "Iscriviti per ricevere nuovi drop, basi curate, aggiornamenti sul customizer e novita dalla community creator."
        </p>

        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl flex-col gap-6 md:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Il tuo indirizzo email"
            required
            className="flex-1 border-8 border-black bg-white px-8 py-6 text-2xl font-black uppercase placeholder:text-gray-400 shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-all focus:outline-none focus:ring-8 focus:ring-pink-500/50"
          />
          <motion.button
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-4 border-8 border-black bg-black px-12 py-6 text-2xl font-black uppercase text-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[12px] hover:translate-y-[12px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'INVIO...' : <> ISCRIVITI <Send className="h-8 w-8" /> </>}
          </motion.button>
        </form>

        <p className="mt-12 text-sm font-black uppercase opacity-60">
          * Useremo la tua email solo per comunicazioni coerenti con il laboratorio e le sue novita.
        </p>
      </div>
    </section>
  );
}
