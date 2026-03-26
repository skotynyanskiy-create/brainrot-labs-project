import { ShoppingCart, Menu, Zap, X, Wand2, Search, User, LogOut, LayoutGrid, Archive } from 'lucide-react';
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getSiteCtaClasses } from '../../styles/siteCta';
import { playBlipSound } from '../../utils/sounds';

interface HeaderProps {
  onOpenCustomizer?: () => void;
  onNavigateHome?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onOpenCommunity?: () => void;
  onOpenProfile?: () => void;
}

const desktopActionButton = 'hidden md:inline-flex min-w-[13.5rem]';
const mobileActionButton = 'shrink-0';
const mobileSecondaryButton =
  'shrink-0 inline-flex items-center justify-center gap-2 border-4 border-black bg-white px-4 py-2 font-display text-[0.95rem] font-black uppercase leading-[0.92] tracking-[-0.03em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-white hover:shadow-none';
const desktopAccountButton =
  'hidden lg:inline-flex min-w-[13.5rem] items-center justify-center gap-2.5 border-4 border-black bg-black px-5 py-3 text-center font-display text-[0.95rem] font-black uppercase leading-[0.92] tracking-[-0.035em] text-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:bg-white hover:text-black hover:shadow-none focus:outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-2';
const mobileAccountButton =
  'shrink-0 inline-flex items-center justify-center gap-2.5 border-4 border-black bg-black px-4 py-2.5 text-center font-display text-[0.9rem] font-black uppercase leading-[0.92] tracking-[-0.035em] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:bg-white hover:text-black hover:shadow-none focus:outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-2';

export default function Header({
  onOpenCustomizer,
  onNavigateHome,
  searchQuery,
  setSearchQuery,
  onOpenCommunity,
  onOpenProfile,
}: HeaderProps) {
  const { items, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 180) {
      setIsHidden(true);
      return;
    }
    setIsHidden(false);
  });

  const openMenu = () => {
    playBlipSound();
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    playBlipSound();
    setIsMenuOpen(false);
  };

  const openCart = () => {
    playBlipSound();
    setIsCartOpen(true);
  };

  const focusSearch = () => {
    playBlipSound();
    mobileSearchRef.current?.focus();
    mobileSearchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      <motion.header
        variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
        animate={isHidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className="sticky top-0 z-40 border-b-8 border-black bg-white"
      >
        <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
          <button
            type="button"
            onClick={() => {
              playBlipSound();
              onNavigateHome?.();
            }}
            aria-label="Torna alla home di Brainrot Labs"
            className="group flex shrink-0 items-center gap-3 overflow-visible pr-1"
          >
            <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-yellow-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none">
              <Zap className="h-6 w-6 fill-black text-black" />
            </div>
            <h1 className="whitespace-nowrap pr-1 font-display text-[1.9rem] font-black uppercase leading-none tracking-[-0.045em] md:text-[2.85rem]">
              Brainrot Labs
            </h1>
          </button>

          <div className="hidden xl:flex flex-1 max-w-xl px-8">
            <label className="relative block w-full">
              <span className="sr-only">Cerca catalogo e archivio digitale</span>
              <input
                type="search"
                placeholder="CERCA PRODOTTI, CREATOR E DESIGN..."
                value={searchQuery}
                onChange={(event) => setSearchQuery?.(event.target.value)}
                className="w-full border-4 border-black bg-[#f5f1e8] py-3 pl-4 pr-14 font-mono text-sm font-bold uppercase tracking-[0.08em] shadow-[6px_6px_0_0_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-offset-2"
              />
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black" />
            </label>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={focusSearch}
              aria-label="Apri ricerca"
              className="xl:hidden border-4 border-black bg-white p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-white hover:shadow-none"
            >
              <Search className="h-5 w-5" />
            </button>

            {onOpenCommunity && (
              <button
                onClick={() => {
                  playBlipSound();
                  onOpenCommunity();
                }}
                className={getSiteCtaClasses('archive', 'md', desktopActionButton)}
              >
                <Archive className="h-4 w-4" />
                Archivio Digitale
              </button>
            )}

            {onOpenCustomizer && (
              <button
                onClick={() => {
                  playBlipSound();
                  onOpenCustomizer();
                }}
                className={getSiteCtaClasses('create', 'md', desktopActionButton)}
              >
                <Wand2 className="h-4 w-4" />
                Crea il tuo design
              </button>
            )}

            {onOpenProfile && (
              <button
                onClick={() => {
                  playBlipSound();
                  onOpenProfile();
                }}
                aria-label={user ? 'Apri account dashboard' : 'Apri login account'}
                className={desktopAccountButton}
              >
                <User className="h-4 w-4" />
                {user ? 'Account' : 'Accedi'}
              </button>
            )}

            <button
              onClick={openCart}
              aria-label="Apri carrello"
              className="relative border-4 border-black bg-yellow-400 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-yellow-400 hover:shadow-none"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 min-w-7 border-2 border-black bg-red-600 px-1.5 py-0.5 text-center font-mono text-[10px] font-black text-white">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={openMenu}
              aria-label="Apri menu"
              className="border-4 border-black bg-white p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-white hover:shadow-none"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

      </motion.header>

      <motion.div
        variants={{ visible: { y: 0 }, hidden: { y: -120 } }}
        animate={isHidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className="sticky top-[112px] z-30 border-b-4 border-black bg-[#f5f1e8] px-4 py-3 md:hidden"
      >
        <div className="space-y-3">
          <label className="relative block">
            <span className="sr-only">Cerca catalogo e archivio digitale</span>
            <input
              ref={mobileSearchRef}
              type="search"
              placeholder="CERCA PRODOTTI, CREATOR E DESIGN..."
              value={searchQuery}
              onChange={(event) => setSearchQuery?.(event.target.value)}
              className="w-full border-4 border-black bg-white py-3 pl-4 pr-12 font-mono text-sm font-bold uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-offset-2"
            />
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black" />
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => {
                playBlipSound();
                onNavigateHome?.();
              }}
              className={mobileSecondaryButton}
            >
              <LayoutGrid className="h-4 w-4" />
              Shop
            </button>
            {onOpenCommunity && (
              <button
                onClick={() => {
                  playBlipSound();
                  onOpenCommunity();
                }}
                className={getSiteCtaClasses('archive', 'sm', mobileActionButton)}
              >
                Archivio Digitale
              </button>
            )}
            {onOpenCustomizer && (
              <button
                onClick={() => {
                  playBlipSound();
                  onOpenCustomizer();
                }}
                className={getSiteCtaClasses('create', 'sm', mobileActionButton)}
              >
                Crea il tuo design
              </button>
            )}
            {onOpenProfile && (
              <button
                onClick={() => {
                  playBlipSound();
                  onOpenProfile();
                }}
                className={mobileAccountButton}
              >
                {user ? 'Account' : 'Accedi'}
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
            className="fixed inset-0 z-50 bg-black/55"
            onClick={closeMenu}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 border-t-8 border-black bg-white p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Navigation</p>
                  <h2 className="text-3xl font-black uppercase tracking-[-0.06em]">Muoviti nel sistema</h2>
                </div>
                <button
                  onClick={closeMenu}
                  aria-label="Chiudi menu"
                  className="border-4 border-black bg-white p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-white hover:shadow-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  onClick={() => {
                    closeMenu();
                    onNavigateHome?.();
                  }}
                  className="flex items-center justify-between border-4 border-black bg-white px-5 py-4 text-left font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-white hover:shadow-none"
                >
                  <span>Shop</span>
                  <LayoutGrid className="h-4 w-4" />
                </button>

                {onOpenCommunity && (
                  <button
                    onClick={() => {
                      closeMenu();
                      onOpenCommunity();
                    }}
                    className={getSiteCtaClasses('archive', 'md', 'w-full justify-between text-left')}
                  >
                    <span>Archivio Digitale</span>
                    <Archive className="h-4 w-4" />
                  </button>
                )}

                {onOpenCustomizer && (
                  <button
                    onClick={() => {
                      closeMenu();
                      onOpenCustomizer();
                    }}
                    className={getSiteCtaClasses('create', 'md', 'w-full justify-between text-left')}
                  >
                    <span>Crea il tuo design</span>
                    <Wand2 className="h-4 w-4" />
                  </button>
                )}

                {onOpenProfile && (
                  <button
                    onClick={() => {
                      closeMenu();
                      onOpenProfile();
                    }}
                    className="flex items-center justify-between border-4 border-black bg-black px-5 py-4 text-left font-black uppercase text-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  >
                    <span>{user ? 'Dashboard account' : 'Accedi / crea account'}</span>
                    <User className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    closeMenu();
                    setIsCartOpen(true);
                  }}
                  className="flex items-center justify-between border-4 border-black bg-yellow-400 px-5 py-4 text-left font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  <span>Apri carrello</span>
                  <span className="font-mono text-xs">{itemCount} articoli</span>
                </button>
              </div>

              <div className="mt-6 border-4 border-black bg-[#f5f1e8] p-4">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Stato account</p>
                <p className="mt-2 text-lg font-black uppercase">
                  {user ? `Connesso come ${user.email ?? user.displayName ?? 'utente'}` : 'Nessun account attivo'}
                </p>
                {user && (
                  <button
                    onClick={async () => {
                      closeMenu();
                      await logout();
                    }}
                    className="mt-4 flex items-center gap-2 border-4 border-black bg-white px-4 py-3 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-red-500 hover:text-white hover:shadow-none"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
