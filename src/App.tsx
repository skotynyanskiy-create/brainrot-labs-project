/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, lazy, Suspense } from 'react';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider, useProduct } from './context/ProductContext';
import { UIProvider, useUI } from './context/UIContext';
import Header from './components/layout/Header';
import Hero from './components/sections/Hero';
import Marquee from './components/ui/Marquee';
import Features from './components/sections/Features';
import FeaturedMemeSection from './components/sections/FeaturedMemeSection';
import ProductGridSection from './components/product/ProductGridSection';
import ProductCard from './components/product/ProductCard';
import FAQ from './components/sections/FAQ';
import Policies from './components/sections/Policies';
import Newsletter from './components/sections/Newsletter';
import CartDrawer from './components/layout/CartDrawer';
import Testimonials from './components/sections/Testimonials';
import Footer from './components/layout/Footer';
import ToastContainer from './components/ui/ToastContainer';
import Confetti from './components/ui/Confetti';
import Soundboard from './components/customizer/Soundboard';
import TrendingSection from './components/sections/TrendingSection';
import HowItWorks from './components/sections/HowItWorks';
import CombinedCommunity from './components/sections/CombinedCommunity';
import StickyCTA from './components/ui/StickyCTA';

import { useDynamicCursor } from './hooks/useDynamicCursor';
import { PRODUCTS } from './constants';
import { Product, CommunityDesign } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { playBlipSound } from './utils/sounds';
import { ArrowRight } from 'lucide-react';

const ProductView = lazy(() => import('./components/product/ProductView'));
const ProductCustomizer = lazy(() => import('./components/customizer/ProductCustomizer'));
const CommunityPage = lazy(() => import('./components/sections/CommunityPage'));
const ProfileDashboard = lazy(() => import('./components/sections/ProfileDashboard'));
const PrivacyPolicyPage = lazy(() => import('./components/sections/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./components/sections/TermsPage'));



function AppContent() {
  useDynamicCursor();

  const {
    communityDesigns,
    filteredProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    setSelectedProduct
  } = useProduct();

  const {
    isCustomizerOpen,
    setIsCustomizerOpen,
    isCommunityOpen,
    setIsCommunityOpen,
    isProfileOpen,
    setIsProfileOpen,
    isPrivacyOpen,
    setIsPrivacyOpen,
    isTermsOpen,
    setIsTermsOpen,
  } = useUI();

  const categories = [
    { id: 'all', label: 'Tutto il Cringe', color: 'bg-white' },
    { id: 'community', label: '🔥 Community Picks', color: 'bg-yellow-400' },
    { id: 'wearable', label: 'Prêt-à-Porter', color: 'bg-orange-400' },
    { id: 'useless', label: 'Oggetti Inutili', color: 'bg-cyan-400' },
    { id: 'decor', label: 'Design d\'Interni', color: 'bg-pink-400' },
  ];

  const unifiedCollection = useMemo(() => {
    // Map community designs to product shape
    const communityAsProducts: Product[] = communityDesigns.map((design: CommunityDesign) => ({
      id: design.id,
      name: `Design by @${design.authorName}`,
      price: 29.99,
      image: design.image,
      category: 'community' as const,
      memeDescription: design.memeDescription,
      rarity: 'Epic' as const,
      color: 'white',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }],
      likes: design.likes,
      authorName: design.authorName
    }));

    let base: Product[] = [...filteredProducts];

    if (selectedCategory === 'all') {
      // In 'all', we mix in the top 4 community designs
      const topCommunity = [...communityAsProducts]
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 4);
      base = [...base, ...topCommunity];
    } else if (selectedCategory === 'community') {
      // In 'community', we show all community designs sorted by likes
      base = [...communityAsProducts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    return base;
  }, [filteredProducts, communityDesigns, selectedCategory]);

  const handleCategoryClick = (id: string) => {
    playBlipSound();
    if (id === 'community') {
      setIsCommunityOpen(true);
    } else {
      setSelectedCategory(id);
    }
  };

  const handleNavigateHome = () => {
    setIsCustomizerOpen(false);
    setIsCommunityOpen(false);
    setIsProfileOpen(false);
    setIsPrivacyOpen(false);
    setIsTermsOpen(false);
    setSelectedProduct(null);
  };

  const handleOpenCommunity = () => {
    playBlipSound();
    setIsCustomizerOpen(false);
    setIsProfileOpen(false);
    setSelectedProduct(null);
    setIsCommunityOpen(true);
  };

  const handleOpenProfile = () => {
    playBlipSound();
    setIsCustomizerOpen(false);
    setIsCommunityOpen(false);
    setSelectedProduct(null);
    setIsProfileOpen(true);
  };

  return (
    <div className="min-h-screen text-black font-sans selection:bg-pink-400 selection:text-black">
      <Marquee />
      <Header
        onOpenCustomizer={() => { setIsCustomizerOpen(true); setSelectedProduct(null); }}
        onNavigateHome={handleNavigateHome}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCommunity={handleOpenCommunity}
        onOpenProfile={handleOpenProfile}
      />

      {selectedProduct && (
        <div className="fixed top-0 left-0 w-full bg-yellow-400 text-black font-black p-2 z-[100] text-center uppercase">
          Prodotto Selezionato: {selectedProduct.name}
        </div>
      )}

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center font-black uppercase">
            <div className="text-6xl mb-4 animate-bounce">💀</div>
            <p className="text-2xl tracking-tighter">CARICAMENTO...</p>
          </div>
        </div>
      }>
      <AnimatePresence mode="wait">
        {isPrivacyOpen ? (
          <motion.div
            key="privacy-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <PrivacyPolicyPage onBack={handleNavigateHome} />
          </motion.div>
        ) : isTermsOpen ? (
          <motion.div
            key="terms-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <TermsPage onBack={handleNavigateHome} />
          </motion.div>
        ) : isProfileOpen ? (
          <motion.div
            key="profile-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ProfileDashboard
              onBack={() => setIsProfileOpen(false)}
            />
          </motion.div>
        ) : isCustomizerOpen ? (
          <motion.div
            key="customizer-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ProductCustomizer
              onBack={() => setIsCustomizerOpen(false)}
            />
          </motion.div>
        ) : isCommunityOpen ? (
          <motion.div
            key="community-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CommunityPage
              onBack={() => setIsCommunityOpen(false)}
              onSelectProduct={setSelectedProduct}
            />
          </motion.div>
        ) : selectedProduct ? (
          <motion.div
            key="product-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ProductView
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="home-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Hero onOpenCustomizer={() => setIsCustomizerOpen(true)} />

          <TrendingSection products={PRODUCTS} onSelectProduct={setSelectedProduct} />

          <main
            id="products"
            className="py-32 px-6 md:px-12 max-w-7xl mx-auto"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
              <div className="relative">
                <motion.h2
                  initial={{ rotate: -5, scale: 0.9 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  className="text-5xl md:text-8xl font-black uppercase tracking-tighter bg-white inline-block px-6 py-4 border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] transform -rotate-2 italic"
                >
                  THE <span className="text-pink-500">BRAINROT</span> <br/> VAULT
                </motion.h2>
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-400 border-4 border-black rounded-full flex items-center justify-center font-black text-xs uppercase text-center rotate-12 animate-pulse z-10">
                  Top <br/> Picks
                </div>
              </div>

              <div className="flex flex-col gap-6 w-full md:w-auto">
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      whileHover={{ scale: 1.05, rotate: (Math.random() - 0.5) * 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-3 border-4 border-black font-black uppercase italic text-sm md:text-lg transition-all ${
                        selectedCategory === cat.id
                          ? `${cat.color} shadow-none translate-x-[4px] translate-y-[4px]`
                          : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
                      }`}
                    >
                      {cat.label}
                    </motion.button>
                  ))}
                  <motion.button
                    onClick={() => {
                      playBlipSound();
                      const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
                      setSelectedProduct(randomProduct);
                    }}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 border-4 border-black bg-purple-500 text-white font-black uppercase italic text-sm md:text-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-2"
                  >
                    <span>🎲</span> Scegli a Caso
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Featured Community Row when in 'all' mode */}
            {selectedCategory === 'all' && (
              <div className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-1 flex-1 bg-black" />
                  <h3 className="text-2xl md:text-4xl font-black uppercase italic bg-yellow-400 px-6 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] transform -rotate-1">
                    🔥 COMMUNITY TRENDS
                  </h3>
                  <div className="h-1 flex-1 bg-black" />
                </div>

                {communityDesigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {unifiedCollection
                      .filter(p => p.category === 'community')
                      .slice(0, 4)
                      .map((product, i) => (
                        <motion.div
                          key={`featured-${product.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <ProductCard product={product} onSelect={setSelectedProduct} bgColor="bg-yellow-50" />
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border-4 border-black border-dashed bg-gray-50">
                    <p className="font-mono text-xl animate-pulse">CARICAMENTO CAPOLAVORI DEL DISAGIO...</p>
                  </div>
                )}

                <div className="mt-8 flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCommunityOpen(true)}
                    className="group flex items-center gap-2 text-xl font-black uppercase underline decoration-8 underline-offset-8 decoration-pink-500 hover:text-pink-500 transition-all"
                  >
                    Vedi tutti i design della community <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </motion.button>
                </div>
              </div>
            )}

            <ProductGridSection
              products={unifiedCollection}
              onSelectProduct={setSelectedProduct}
            />
          </main>

          <FeaturedMemeSection
            product={PRODUCTS[0]}
            onSelectProduct={setSelectedProduct}
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
          />

          <HowItWorks />

          <div id="features">
            <Features />
          </div>

          <div id="testimonials">
            <Testimonials />
          </div>

          <CombinedCommunity
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onOpenCommunity={handleOpenCommunity}
          />

          <div id="faq">
            <FAQ />
          </div>

          <Policies />

          <div id="newsletter">
            <Newsletter />
          </div>
          <Footer
            onNavigateHome={handleNavigateHome}
            onOpenPrivacy={() => { handleNavigateHome(); setIsPrivacyOpen(true); }}
            onOpenTerms={() => { handleNavigateHome(); setIsTermsOpen(true); }}
          />
          <StickyCTA onOpenCustomizer={() => setIsCustomizerOpen(true)} />
        </motion.div>
        )}
      </AnimatePresence>
      </Suspense>

      <CartDrawer />
      <ToastContainer />
      <Confetti />

      <Soundboard />
    </div>
  );
}

import ErrorBoundary from './components/ui/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <ProductProvider>
              <UIProvider>
                <AppContent />
              </UIProvider>
            </ProductProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
