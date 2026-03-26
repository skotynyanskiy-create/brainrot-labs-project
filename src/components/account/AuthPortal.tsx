import { useState } from 'react';
import { ArrowLeft, KeyRound, LogIn, Mail, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

import { useAuth } from '../../context/AuthContext';
import { playBlipSound } from '../../utils/sounds';

interface AuthPortalProps {
  onBack: () => void;
}

type AuthMode = 'login' | 'register' | 'reset';

export default function AuthPortal({ onBack }: AuthPortalProps) {
  const { login, loginAsDemo, loginWithEmail, registerWithEmail, resetPassword, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tabs: Array<{ id: AuthMode; label: string; icon: typeof LogIn }> = [
    { id: 'login', label: 'Accedi', icon: LogIn },
    { id: 'register', label: 'Crea account', icon: UserPlus },
    { id: 'reset', label: 'Recupera accesso', icon: KeyRound },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else if (mode === 'register') {
        await registerWithEmail({ displayName, email, password });
      } else {
        await resetPassword(email);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f0ea] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <button
            onClick={() => { playBlipSound(); onBack(); }}
            className="flex items-center gap-2 border-4 border-black bg-white px-4 py-3 font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <ArrowLeft className="h-5 w-5" />
            Torna al sito
          </button>
          <div className="border-4 border-black bg-cyan-400 px-4 py-2 font-mono text-xs font-black uppercase tracking-[0.2em] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            Account access
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="border-8 border-black bg-black p-8 text-white shadow-[16px_16px_0_0_rgba(0,0,0,1)] md:p-12">
            <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Brainrot Labs account</p>
            <h1 className="mt-6 text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-7xl">
              Accedi per
              <br />
              creare, ordinare
              <br />
              e tracciare
            </h1>
            <p className="mt-8 max-w-xl font-mono text-sm leading-relaxed text-gray-300 md:text-base">
              Un solo account gestisce design draft, pubblicazioni community, ordini, tracking e stato royalty. Il login non e decorativo: serve a collegare tutto allo stesso profilo.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="border-4 border-white/80 bg-white px-4 py-4 text-black">
                <p className="font-black uppercase">Design</p>
                <p className="mt-2 font-mono text-xs uppercase">Bozze e publish collegati al tuo profilo.</p>
              </div>
              <div className="border-4 border-white/80 bg-white px-4 py-4 text-black">
                <p className="font-black uppercase">Ordini</p>
                <p className="mt-2 font-mono text-xs uppercase">Checkout, tracking e storico in una dashboard unica.</p>
              </div>
              <div className="border-4 border-white/80 bg-white px-4 py-4 text-black">
                <p className="font-black uppercase">Royalty</p>
                <p className="mt-2 font-mono text-xs uppercase">Rate, payout email e stato creator senza campi superflui.</p>
              </div>
            </div>
          </section>

          <section className="border-8 border-black bg-white p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)] md:p-10">
            <div className="mb-8 flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { playBlipSound(); setMode(tab.id); }}
                  className={`flex items-center gap-2 border-4 border-black px-4 py-3 font-black uppercase transition-all ${
                    mode === tab.id
                      ? 'translate-x-1 translate-y-1 bg-black text-white shadow-none'
                      : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <label className="block">
                  <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Nome profilo</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
                    required
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Email</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full border-4 border-black bg-white py-3 pl-11 pr-4 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
                    required
                  />
                </div>
              </label>

              {mode !== 'reset' && (
                <label className="block">
                  <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
                    required
                  />
                </label>
              )}

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting || loading}
                className="w-full border-4 border-black bg-cyan-400 px-6 py-4 text-xl font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-2 hover:translate-y-2 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Elaborazione...' : mode === 'login' ? 'Accedi con email' : mode === 'register' ? 'Crea account' : 'Invia reset'}
              </motion.button>
            </form>

            <div className="my-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-black" />
              <span className="font-mono text-xs font-black uppercase tracking-[0.2em]">oppure</span>
              <div className="h-px flex-1 bg-black" />
            </div>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { playBlipSound(); login(); }}
                className="flex w-full items-center justify-center gap-3 border-4 border-black bg-white px-6 py-4 text-lg font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-2 hover:translate-y-2 hover:bg-black hover:text-white hover:shadow-none"
              >
                <LogIn className="h-5 w-5" />
                Continua con Google
              </motion.button>

              {import.meta.env.DEV && (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playBlipSound(); loginAsDemo(); }}
                  className="flex w-full items-center justify-center gap-3 border-4 border-black bg-yellow-400 px-6 py-4 text-lg font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-2 hover:translate-y-2 hover:shadow-none"
                >
                  <UserPlus className="h-5 w-5" />
                  Entra in demo locale
                </motion.button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
