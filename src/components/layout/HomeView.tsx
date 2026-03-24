import { motion } from 'motion/react';
import { lazy, Suspense } from 'react';
import Hero from '../sections/Hero';
import TrendingSection from '../sections/TrendingSection';
import Features from '../sections/Features';
import FeaturedMemeSection from '../sections/FeaturedMemeSection';
import ProductGridSection from '../product/ProductGridSection';
import Footer from '../layout/Footer';
import HowItWorks from '../sections/HowItWorks';
import StickyCTA from '../ui/StickyCTA';
import { Product } from '../../types';

const FAQ = lazy(() => import('../sections/FAQ'));
const Policies = lazy(() => import('../sections/Policies'));
const Newsletter = lazy(() => import('../sections/Newsletter'));
const Testimonials = lazy(() => import('../sections/Testimonials'));
const CombinedCommunity = lazy(() => import('../sections/CombinedCommunity'));
const CommunityMarketplace = lazy(() => import('../sections/CommunityMarketplace'));

interface HomeViewProps {
  products: Product[];
  filteredProducts: Product[];
  selectedCategory: string;
  categories: { id: string; label: string; color: string }[];
  handleCategoryClick: (id: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setIsCustomizerOpen: (isOpen: boolean) => void;
  setIsCommunityOpen: (isOpen: boolean) => void;
  handleNavigateHome: () => void;
}

export default function HomeView({
  products,
  filteredProducts,
  selectedCategory,
  categories,
  handleCategoryClick,
  setSelectedProduct,
  setIsCustomizerOpen,
  setIsCommunityOpen,
  handleNavigateHome
}: HomeViewProps) {
  return (
    <motion.div
      key="home-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero onOpenCustomizer={() => setIsCustomizerOpen(true)} />
      
      <TrendingSection products={products} onSelectProduct={setSelectedProduct} />

      <Features />
      
      <HowItWorks />

      <motion.main 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        id="products" 
        className="py-32 px-6 md:px-12 max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <motion.h2 
            initial={{ rotate: -5, scale: 0.9 }}
            whileInView={{ rotate: 0, scale: 1 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter bg-white inline-block px-4 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] transform -rotate-2"
          >
            La Nostra <br/> <span className="text-pink-500">Collezione</span>
          </motion.h2>
          
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  whileHover={{ scale: 1.05, rotate: (Math.random() - 0.5) * 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 border-4 border-black font-black uppercase italic text-sm md:text-base transition-all ${
                    selectedCategory === cat.id 
                      ? `${cat.color} shadow-none translate-x-[4px] translate-y-[4px]` 
                      : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
                  }`}
                >
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {products.length > 0 && (
          <FeaturedMemeSection 
            product={products[0]} 
            onSelectProduct={setSelectedProduct} 
            onOpenCustomizer={() => setIsCustomizerOpen(true)} 
          />
        )}
        
        <ProductGridSection 
          products={filteredProducts.slice(0, 9)} 
          onSelectProduct={setSelectedProduct} 
        />
      </motion.main>
      
      <Suspense fallback={<div>Loading...</div>}>
        <Testimonials />
        <CombinedCommunity 
          onOpenCustomizer={() => setIsCustomizerOpen(true)} 
          onOpenCommunity={() => setIsCommunityOpen(true)}
        />
        <CommunityMarketplace />
        <FAQ />
        <Policies />
        <Newsletter />
      </Suspense>
      
      <Footer onNavigateHome={handleNavigateHome} />
      <StickyCTA onOpenCustomizer={() => setIsCustomizerOpen(true)} />
    </motion.div>
  );
}
