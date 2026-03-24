import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../../context/ToastContext';
import { X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="pointer-events-auto flex items-center justify-between gap-4 bg-green-400 border-4 border-black p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] min-w-[300px]"
          >
            <span className="font-mono font-bold text-black">{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
