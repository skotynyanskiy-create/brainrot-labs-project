import { motion } from 'motion/react';
import { useProduct } from '../../context/ProductContext';
import ProductCard from '../product/ProductCard';
import { Users, Sparkles, Trophy, Clock, Zap, Flame } from 'lucide-react';
import { Product } from '../../types';
import { useMemo, useState } from 'react';

interface CommunityPageProps {
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

type SortOption = 'top' | 'new' | 'underground';

export default function CommunityPage({ onBack: _onBack, onSelectProduct }: CommunityPageProps) {
  const { communityDesigns } = useProduct();
  const [sortBy, setSortBy] = useState<SortOption>('top');

  const communityProducts = useMemo(() => {
    return communityDesigns.map(design => ({
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
      authorName: design.authorName,
      createdAt: design.createdAt
    })) as (Product & { createdAt?: any })[];
  }, [communityDesigns]);

  const sortedProducts = useMemo(() => {
    const products = [...communityProducts];
    if (sortBy === 'top') {
      return products.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'new') {
      return products.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
    } else {
      return products.sort((a, b) => (a.likes || 0) - (b.likes || 0));
    }
  }, [communityProducts, sortBy]);

  const topThree = useMemo(() => sortedProducts.slice(0, 3), [sortedProducts]);
  const restOfProducts = useMemo(() => sortedProducts.slice(3), [sortedProducts]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      {/* Editorial Hero */}
      <section className="pt-48 pb-24 px-6 md:px-12 bg-white border-b-8 border-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-cyan-400 -skew-x-12 translate-x-32 z-0 hidden lg:block"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-12">
            <div className="max-w-4xl">
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full border-4 border-black shadow-[4px_4px_0_0_rgba(34,211,238,1)]">
                  <Users className="w-6 h-6" />
                </div>
                <span className="font-mono font-black uppercase tracking-widest text-xl">LAB_ARCHIVE_V2.0</span>
              </motion.div>
              
              <h1 className="text-[10vw] md:text-[7vw] font-black uppercase leading-[0.9] tracking-tighter italic mb-12">
                COMMUNITY <br/> 
                <span className="inline-block bg-cyan-400 text-black px-8 py-2 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] rotate-[-2deg]">VAULT</span>
              </h1>
              
              <p className="text-2xl md:text-3xl font-sans font-medium text-black leading-tight max-w-2xl">
                "Dove il disagio diventa <span className="bg-yellow-400 px-2">valuta corrente</span>. Esplora i design più votati dai nostri degenerati."
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <div className="bg-black text-white p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(236,72,153,1)] rotate-1">
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-black uppercase text-sm">AURA_LEVEL: CRITICAL</span>
                </div>
                <div className="text-3xl font-black italic">999,999+</div>
              </div>
              <div className="bg-yellow-400 p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] -rotate-1">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-black" />
                  <span className="font-black uppercase text-sm text-black">DESIGN_COUNT</span>
                </div>
                <div className="text-3xl font-black italic text-black">{communityDesigns.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Ticker */}
      <div className="bg-black border-b-8 border-black py-4 overflow-hidden whitespace-nowrap flex">
        <div className="flex gap-12 items-center animate-marquee">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 text-white font-mono text-sm font-bold uppercase">
              <span className="text-cyan-400">●</span>
              <span>RILEVATO PICCO DI CRINGE A MILANO</span>
              <span className="text-pink-500">●</span>
              <span>@MEME_LORD HA APPENA MINTATO UN CAPOLAVORO</span>
              <span className="text-yellow-400">●</span>
              <span>AURA LEVEL GLOBALE IN AUMENTO</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sorting Tabs */}
      <div className="sticky top-24 z-30 bg-white border-b-8 border-black py-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4">
          <button 
            onClick={() => setSortBy('top')}
            className={`px-8 py-3 border-4 border-black font-black uppercase italic transition-all flex items-center gap-3 ${
              sortBy === 'top' ? 'bg-pink-500 text-white shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
            }`}
          >
            <Trophy className="w-5 h-5" /> TOP DISAGIO
          </button>
          <button 
            onClick={() => setSortBy('new')}
            className={`px-8 py-3 border-4 border-black font-black uppercase italic transition-all flex items-center gap-3 ${
              sortBy === 'new' ? 'bg-cyan-400 text-black shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
            }`}
          >
            <Clock className="w-5 h-5" /> FRESH BRAINROT
          </button>
          <button 
            onClick={() => setSortBy('underground')}
            className={`px-8 py-3 border-4 border-black font-black uppercase italic transition-all flex items-center gap-3 ${
              sortBy === 'underground' ? 'bg-yellow-400 text-black shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
            }`}
          >
            <Sparkles className="w-5 h-5" /> UNDERGROUND
          </button>
        </div>
      </div>

      {/* Hall of Fame - Bento Grid */}
      {sortBy === 'top' && topThree.length > 0 && (
        <section className="py-20 px-6 md:px-12 bg-gray-50 border-b-8 border-black">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 flex items-center gap-6">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                HALL OF <span className="inline-block bg-pink-500 text-white px-6 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rotate-2 italic">FAME</span>
              </h2>
              <div className="h-2 flex-1 bg-black"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Rank 1 */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="lg:col-span-2 relative"
              >
                <div className="absolute -top-6 -left-6 z-30 bg-yellow-400 border-4 border-black px-6 py-2 font-black text-2xl italic shadow-[6px_6px_0_0_rgba(0,0,0,1)] rotate-[-5deg]">
                  #1 MEME LORD
                </div>
                <ProductCard 
                  product={topThree[0]} 
                  onSelect={onSelectProduct} 
                  bgColor="bg-white"
                />
              </motion.div>
              
              {/* Rank 2 & 3 */}
              <div className="flex flex-col gap-8">
                {topThree.slice(1).map((product, i) => (
                  <motion.div 
                    key={product.id}
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="relative"
                  >
                    <div className="absolute -top-4 -right-4 z-30 bg-gray-200 border-4 border-black px-4 py-1 font-black text-lg italic shadow-[4px_4px_0_0_rgba(0,0,0,1)] rotate-[5deg]">
                      #{i + 2}
                    </div>
                    <ProductCard 
                      product={product} 
                      onSelect={onSelectProduct} 
                      bgColor="bg-white"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Grid */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-16">
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            {sortBy === 'top' ? (
              <>GLI ALTRI <span className="inline-block bg-cyan-400 px-6 py-2 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rotate-1 italic">CAPOLAVORI</span></>
            ) : sortBy === 'new' ? (
              <>ULTIME <span className="inline-block bg-yellow-400 px-6 py-2 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] -rotate-1 italic">MUTAZIONI</span></>
            ) : (
              <>TESORI <span className="inline-block bg-pink-500 text-white px-6 py-2 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rotate-2 italic">NASCOSTI</span></>
            )}
          </h3>
        </div>

        {restOfProducts.length > 0 || (sortBy !== 'top' && sortedProducts.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {(sortBy === 'top' ? restOfProducts : sortedProducts).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard 
                  product={product} 
                  onSelect={onSelectProduct} 
                  bgColor="bg-white"
                />
              </motion.div>
            ))}
          </div>
        ) : sortBy === 'top' && topThree.length > 0 ? (
          <div className="py-20 text-center border-4 border-black border-dashed">
            <p className="font-mono font-bold text-gray-400 uppercase">Nessun altro design trovato oltre alla Hall of Fame.</p>
          </div>
        ) : (
          <div className="py-40 text-center border-8 border-black border-dashed bg-gray-50">
            <div className="max-w-md mx-auto">
              <Sparkles className="w-20 h-20 text-gray-300 mx-auto mb-6 animate-pulse" />
              <h2 className="text-4xl font-black uppercase mb-4">IL VUOTO COSMICO</h2>
              <p className="font-mono text-lg text-gray-500">
                Nessun design trovato in questa categoria. Sii il primo a rompere il ghiaccio!
              </p>
            </div>
          </div>
        )}
      </section>
    </motion.div>
  );
}
