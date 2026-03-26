/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState } from 'react';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider, useProduct } from './context/ProductContext';
import { UIProvider, useUI } from './context/UIContext';
import Header from './components/layout/Header';
import Hero from './components/sections/Hero';
import Marquee from './components/ui/Marquee';
import Features from './components/sections/Features';
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
import StickyCTA from './components/ui/StickyCTA';

import { useDynamicCursor } from './hooks/useDynamicCursor';
import { MEME_BASES } from './constants';
import type { MemeBase } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { playBlipSound } from './utils/sounds';

const ProductView = lazy(() => import('./components/product/ProductView'));
const ProductCustomizer = lazy(() => import('./components/customizer/ProductCustomizer'));
const CommunityPage = lazy(() => import('./components/sections/CommunityPage'));
const ProfileDashboard = lazy(() => import('./components/sections/ProfileDashboard'));
const PrivacyPolicyPage = lazy(() => import('./components/sections/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./components/sections/TermsPage'));
const CreatorTermsPage = lazy(() => import('./components/sections/CreatorTermsPage'));
const RoyaltyPolicyPage = lazy(() => import('./components/sections/RoyaltyPolicyPage'));



function AppContent() {
  useDynamicCursor();

  const {
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
    isCreatorTermsOpen,
    setIsCreatorTermsOpen,
    isRoyaltyPolicyOpen,
    setIsRoyaltyPolicyOpen,
  } = useUI();

  const [pendingMeme, setPendingMeme] = useState<{ url: string; name: string } | null>(null);
  const [pendingBaseProductId, setPendingBaseProductId] = useState<string | null>(null);

  const handleNavigateHome = () => {
    setIsCustomizerOpen(false);
    setIsCommunityOpen(false);
    setIsProfileOpen(false);
    setIsPrivacyOpen(false);
    setIsTermsOpen(false);
    setIsCreatorTermsOpen(false);
    setIsRoyaltyPolicyOpen(false);
    setSelectedProduct(null);
    setPendingMeme(null);
    setPendingBaseProductId(null);
  };

  const handleStartWithMeme = (meme: MemeBase) => {
    playBlipSound();
    setPendingMeme({ url: meme.url, name: meme.name });
    setPendingBaseProductId(null);
    setIsCustomizerOpen(true);
  };

  const handleOpenCustomizerWithMeme = (meme: MemeBase) => {
    playBlipSound();
    setPendingMeme({ url: meme.url, name: meme.name });
    setPendingBaseProductId(null);
    setIsCommunityOpen(false);
    setIsCustomizerOpen(true);
  };

  const handleOpenCustomizerWithProduct = (productId: string) => {
    playBlipSound();
    setPendingBaseProductId(productId);
    setPendingMeme(null);
    setIsCommunityOpen(false);
    setIsCustomizerOpen(true);
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
        ) : isCreatorTermsOpen ? (
          <motion.div
            key="creator-terms-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <CreatorTermsPage onBack={handleNavigateHome} />
          </motion.div>
        ) : isRoyaltyPolicyOpen ? (
          <motion.div
            key="royalty-policy-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <RoyaltyPolicyPage onBack={handleNavigateHome} />
          </motion.div>
        ) : isProfileOpen ? (
          <motion.div
            key="profile-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ErrorBoundary>
              <ProfileDashboard
                onBack={() => setIsProfileOpen(false)}
                onOpenCreatorTerms={() => { setIsProfileOpen(false); setIsCreatorTermsOpen(true); }}
                onOpenRoyaltyPolicy={() => { setIsProfileOpen(false); setIsRoyaltyPolicyOpen(true); }}
              />
            </ErrorBoundary>
          </motion.div>
        ) : isCustomizerOpen ? (
          <motion.div
            key="customizer-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ErrorBoundary>
              <ProductCustomizer
                onBack={() => { setIsCustomizerOpen(false); setPendingMeme(null); setPendingBaseProductId(null); }}
                initialMeme={pendingMeme ?? undefined}
                initialBaseProductId={pendingBaseProductId ?? undefined}
                onPublished={() => {
                  setIsCustomizerOpen(false);
                  setPendingMeme(null);
                  setPendingBaseProductId(null);
                  setIsCommunityOpen(true);
                }}
              />
            </ErrorBoundary>
          </motion.div>
        ) : isCommunityOpen ? (
          <motion.div
            key="community-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ErrorBoundary>
              <CommunityPage
                onBack={() => setIsCommunityOpen(false)}
                onSelectProduct={setSelectedProduct}
                onOpenCustomizer={() => { setIsCommunityOpen(false); setIsCustomizerOpen(true); }}
                onOpenCustomizerWithMeme={handleOpenCustomizerWithMeme}
                onOpenCustomizerWithProduct={handleOpenCustomizerWithProduct}
              />
            </ErrorBoundary>
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
            <Hero
              onOpenCustomizer={() => setIsCustomizerOpen(true)}
              onOpenCommunity={handleOpenCommunity}
            />

          <HowItWorks onOpenCustomizer={() => setIsCustomizerOpen(true)} />

          <TrendingSection
            memeBases={MEME_BASES}
            onStartWithMeme={handleStartWithMeme}
            onOpenCustomizer={() => { playBlipSound(); setIsCustomizerOpen(true); }}
          />

          <div id="features">
            <Features onOpenCustomizer={() => setIsCustomizerOpen(true)} />
          </div>

          <div id="testimonials">
            <Testimonials onOpenCommunity={handleOpenCommunity} />
          </div>

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
            onOpenCreatorTerms={() => { handleNavigateHome(); setIsCreatorTermsOpen(true); }}
            onOpenRoyaltyPolicy={() => { handleNavigateHome(); setIsRoyaltyPolicyOpen(true); }}
            onOpenCustomizer={() => { handleNavigateHome(); setIsCustomizerOpen(true); }}
            onOpenCommunity={handleOpenCommunity}
          />
          <StickyCTA onOpenCustomizer={() => setIsCustomizerOpen(true)} />
        </motion.div>
        )}
      </AnimatePresence>
      </Suspense>

      <ErrorBoundary>
        <CartDrawer />
      </ErrorBoundary>
      <ToastContainer />
      <Confetti />

      <Soundboard />
    </div>
  );
}

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
