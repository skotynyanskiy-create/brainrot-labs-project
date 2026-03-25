import { ShoppingCart, Menu, Zap, X, Wand2, Search, User, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { useRef, useState } from 'react';
import { playBlipSound } from '../../utils/sounds';

interface HeaderProps {
  onOpenCustomizer?: () => void;
  onNavigateHome?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onOpenCommunity?: () => void;
  onOpenProfile?: () => void;
}

export default function Header({ onOpenCustomizer, onNavigateHome, searchQuery, setSearchQuery, onOpenCommunity, onOpenProfile }: HeaderProps) {
  const { items, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const [isHidden, setIsHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  const menuItems = [
    { label: 'PRODOTTI', href: '#products' },
    { label: 'PERCHÉ NOI', href: '#features' },
    { label: 'FAQ', href: '#faq' },
    { label: 'RECENSIONI', href: '#testimonials' },
    { label: 'SPAM', href: '#newsletter' },
  ];

  const handleMenuToggle = (state: boolean) => {
    playBlipSound();
    setIsMenuOpen(state);
  };

  const handleCartOpen = () => {
    playBlipSound();
    setIsCartOpen(true);
  };

  const handleSearchToggle = () => {
    playBlipSound();
    mobileSearchRef.current?.focus();
    mobileSearchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      <motion.header 
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="sticky top-0 z-40 border-b-8 border-black p-4 md:p-6 lg:p-8 flex justify-between items-center bg-white shadow-[0_12px_0_0_rgba(0,0,0,1)]"
      >
        <button
          type="button"
          onClick={() => {
            playBlipSound();
            if (onNavigateHome) onNavigateHome();
          }}
          aria-label="Torna alla home di Brainrot Labs"
          className="flex items-center gap-3 cursor-pointer group relative"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.0, ease: "linear" }}
            className="relative"
          >
            <Zap className="w-8 h-8 md:w-10 md:h-10 text-black fill-black" />
          </motion.div>
          
          <div className="flex flex-col items-start">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.0, ease: "linear" }}
              className="text-3xl md:text-5xl font-black tracking-tighter flex leading-none text-black uppercase italic"
            >
              BRAINROT LABS
            </motion.h1>
          </div>
        </button>

        {/* Desktop Search */}
        <div className="hidden xl:flex flex-1 max-w-lg mx-12">
          <div className="relative w-full group">
            <input
              type="text"
              placeholder="CERCA NEL CATALOGO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              aria-label="Cerca prodotti e design community"
              className="w-full p-3 md:p-4 bg-white border-4 md:border-8 border-black font-mono text-base placeholder:text-black/40 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2 transition-all"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <span className="text-[10px] font-mono text-gray-400 hidden group-focus-within:inline animate-pulse">SEARCHING...</span>
              <Search className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 md:gap-6 items-center">
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearchToggle}
            aria-label="Apri ricerca"
            className="xl:hidden p-2 md:p-3 border-4 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-offset-2"
          >
            <Search className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
          
          {onOpenCommunity && (
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playBlipSound(); onOpenCommunity(); }}
              className="hidden md:flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 border-4 border-black bg-cyan-400 text-black font-display uppercase text-sm md:text-lg italic hover:bg-black hover:text-cyan-400 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2"
            >
              COMMUNITY
            </motion.button>
          )}
          
          {onOpenCustomizer && (
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playBlipSound(); onOpenCustomizer(); }}
              className="hidden md:flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 border-4 border-black bg-pink-500 text-black font-display uppercase text-sm md:text-lg italic hover:bg-black hover:text-pink-500 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2"
            >
              <Wand2 className="w-4 h-4 md:w-5 md:h-5" />
              CREA
            </motion.button>
          )}

          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMenuToggle(true)} 
            aria-label="Apri menu di navigazione"
            className="p-2 md:p-3 border-4 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-offset-2"
          >
            <Menu className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
          
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex gap-2">
                {onOpenProfile && (
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playBlipSound(); onOpenProfile(); }}
                    aria-label="Apri profilo"
                    className="flex items-center gap-2 p-2 md:p-3 border-4 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-offset-2"
                    title="Il Mio Profilo"
                  >
                    <User className="w-5 h-5 md:w-6 md:h-6" />
                  </motion.button>
                )}
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { playBlipSound(); logout(); }}
                  aria-label="Esci dall'account"
                  className="flex items-center gap-2 p-2 md:p-3 border-4 border-black bg-red-500 hover:bg-black hover:text-red-500 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-offset-2"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
              </div>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playBlipSound(); onOpenProfile?.(); }}
                aria-label="Accedi all'account"
                className="flex items-center gap-2 p-2 md:p-3 border-4 border-black bg-green-500 hover:bg-black hover:text-green-500 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-offset-2"
                title="Account"
              >
                <User className="w-5 h-5 md:w-6 md:h-6" />
              </motion.button>
            )}
          </div>

          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCartOpen}
            aria-label="Apri carrello"
            className="relative p-2 md:p-3 border-4 border-black bg-yellow-400 hover:bg-black hover:text-yellow-400 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-offset-2"
          >
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            {itemCount > 0 && (
              <motion.span 
                initial={{ scale: 0, rotate: -20 }} 
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] italic uppercase tracking-tighter"
              >
                {itemCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </motion.header>

      <motion.div 
        variants={{ visible: { y: 0 }, hidden: { y: -200 } }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="sticky top-[84px] z-30 border-b-4 border-black bg-yellow-400 px-4 py-3 shadow-[0_8px_0_0_rgba(0,0,0,1)] md:hidden"
      >
        <div className="mx-auto max-w-7xl space-y-3">
          <label htmlFor="mobile-site-search" className="sr-only">
            Cerca prodotti e design community
          </label>
          <div className="relative">
            <input
              id="mobile-site-search"
              ref={mobileSearchRef}
              type="search"
              placeholder="CERCA PRODOTTI, MEME E DESIGN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              aria-label="Cerca prodotti e design community"
              className="w-full border-4 border-black bg-white py-3 pl-4 pr-12 font-mono text-sm shadow-[6px_6px_0_0_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-offset-2"
            />
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
            {onOpenCommunity && (
              <button
                onClick={() => { playBlipSound(); onOpenCommunity(); }}
                aria-label="Apri la community"
                className="shrink-0 border-4 border-black bg-cyan-400 px-4 py-2 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                Community
              </button>
            )}
            {onOpenCustomizer && (
              <button
                onClick={() => { playBlipSound(); onOpenCustomizer(); }}
                aria-label="Apri il customizer"
                className="shrink-0 border-4 border-black bg-pink-500 px-4 py-2 font-black uppercase text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                Crea
              </button>
            )}
            {onOpenProfile && (
              <button
                onClick={() => { playBlipSound(); onOpenProfile(); }}
                aria-label={user ? "Apri il profilo" : "Apri il login account"}
                className="shrink-0 border-4 border-black bg-white px-4 py-2 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                {user ? 'Profilo' : 'Accedi'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black uppercase">DOVE VUOI ANDARE?</h2>
                <button onClick={() => setIsMenuOpen(false)} aria-label="Chiudi menu" className="p-2 border-2 border-black bg-yellow-400 hover:bg-black hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="grid grid-cols-1 gap-3">
                {onOpenCommunity && (
                  <button
                    onClick={() => { setIsMenuOpen(false); onOpenCommunity(); }}
                    className="flex items-center justify-center gap-3 text-lg font-black uppercase border-2 border-black bg-cyan-400 p-4 hover:bg-black hover:text-cyan-400 transition-all"
                  >
                    COMMUNITY
                  </button>
                )}
                {onOpenCustomizer && (
                  <button
                    onClick={() => { setIsMenuOpen(false); onOpenCustomizer(); }}
                    className="flex items-center justify-center gap-3 text-lg font-black uppercase border-2 border-black bg-pink-400 p-4 hover:bg-black hover:text-pink-400 transition-all"
                  >
                    <Wand2 className="w-6 h-6" />
                    CREA IL TUO DESIGN
                  </button>
                )}
                {menuItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(_e) => {
                      setIsMenuOpen(false);
                      if (onNavigateHome) {
                        onNavigateHome();
                        setTimeout(() => {
                          const element = document.querySelector(item.href);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }
                    }}
                    className="text-xl font-black uppercase border-2 border-black bg-white p-4 hover:bg-black hover:text-white transition-all text-center"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
