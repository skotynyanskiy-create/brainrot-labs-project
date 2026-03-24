import { Component, ErrorInfo, ReactNode } from 'react';
import { Skull, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Uncaught error:', error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-600 text-white flex flex-col items-center justify-center p-8 text-center font-black uppercase">
          <Skull className="w-24 h-24 mb-8 animate-bounce" />
          <h1 className="text-6xl mb-4 tracking-tighter">ERRORE FATALE 💀</h1>
          <p className="text-2xl mb-8 font-mono">Il sistema è andato in brainrot totale.</p>

          <p className="bg-black p-4 border-4 border-white mb-8 font-mono text-sm">
            {import.meta.env.DEV
              ? (this.state.error?.message ?? 'Errore sconosciuto.')
              : 'Si è verificato un errore inaspettato. Riprova.'}
          </p>

          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-4 bg-white text-black px-8 py-4 border-4 border-black text-2xl hover:bg-yellow-400 transition-all shadow-[8px_8px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-2 active:translate-y-2"
          >
            <RefreshCcw className="w-8 h-8" />
            RIPROVA (Sperando bene)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
