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

  const tabs: Array<{ id: AuthMode; label: string; icon: typeof LogIn }> = [
    { id: 'login', label: 'Accedi', icon: LogIn },
    { id: 'register', label: 'Registrati', icon: UserPlus },
    { id: 'reset', label: 'Reset Password', icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f0] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <button
            onClick={() => { playBlipSound(); onBack(); }}
            className="flex items-center gap-2 border-4 border-black bg-white px-4 py-3 font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Torna al sito
          </button>
          <div className="border-4 border-black bg-yellow-400 px-4 py-2 font-mono text-xs font-black uppercase tracking-[0.2em] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            Account hub
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="border-8 border-black bg-white p-8 shadow-[14px_14px_0_0_rgba(0,0,0,1)] md:p-12">
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-[0.9] md:text-7xl">
              Account
              <br />
              <span className="inline-block rotate-[-2deg] border-4 border-black bg-pink-500 px-4 py-2 text-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                Creator
              </span>
            </h1>
            <p className="mt-8 max-w-xl border-l-8 border-black pl-5 text-lg font-medium leading-relaxed text-gray-800">
              Accedi per salvare opere, controllare ordini, aggiornare i dati del tuo account e seguire royalty e pubblicazioni da una dashboard unica.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="border-4 border-black bg-cyan-400 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="font-black uppercase">Dashboard unica</p>
                <p className="mt-2 text-sm font-mono">Overview, opere create, ordini, payout e impostazioni nello stesso posto.</p>
              </div>
              <div className="border-4 border-black bg-green-400 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="font-black uppercase">Royalty tracciate</p>
                <p className="mt-2 text-sm font-mono">Ogni design pubblicato mostra vendite, like, payout email e tasso royalty applicato.</p>
              </div>
              <div className="border-4 border-black bg-yellow-400 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="font-black uppercase">Login completo</p>
                <p className="mt-2 text-sm font-mono">Google veloce oppure email e password con recupero accesso integrato.</p>
              </div>
            </div>
          </section>

          <section className="border-8 border-black bg-white p-8 shadow-[14px_14px_0_0_rgba(0,0,0,1)] md:p-10">
            <div className="mb-8 flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { playBlipSound(); setMode(tab.id); }}
                  className={`flex items-center gap-2 border-4 border-black px-4 py-3 font-black uppercase transition-all ${
                    mode === tab.id
                      ? 'bg-black text-white shadow-none translate-x-1 translate-y-1'
                      : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
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
                    placeholder="Nome visualizzato"
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
                    placeholder="nome@dominio.it"
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
                    className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
                    placeholder="Minimo 6 caratteri"
                    minLength={6}
                    required
                  />
                </label>
              )}

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting || loading}
                className="w-full border-4 border-black bg-cyan-400 px-6 py-4 text-xl font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Elaborazione...' : mode === 'login' ? 'Accedi con email' : mode === 'register' ? 'Crea account' : 'Invia reset'}
              </motion.button>
            </form>

            <div className="my-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-black" />
              <span className="font-mono text-xs font-black uppercase tracking-[0.2em]">oppure</span>
              <div className="h-px flex-1 bg-black" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { playBlipSound(); login(); }}
              className="flex w-full items-center justify-center gap-3 border-4 border-black bg-white px-6 py-4 text-lg font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
            >
              <LogIn className="h-5 w-5" />
              Continua con Google
            </motion.button>

            {import.meta.env.DEV && (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { playBlipSound(); loginAsDemo(); }}
                className="mt-4 flex w-full items-center justify-center gap-3 border-4 border-black bg-yellow-400 px-6 py-4 text-lg font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:bg-cyan-400 hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
              >
                <UserPlus className="h-5 w-5" />
                Entra in demo locale
              </motion.button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
