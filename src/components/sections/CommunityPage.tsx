import { motion, useInView } from 'motion/react';
import { useProduct } from '../../context/ProductContext';
import ProductCard from '../product/ProductCard';
import {
  Users, Sparkles, Trophy, Clock, Flame, TrendingUp,
  Heart, ShoppingBag, Star, Wand2, DollarSign,
  Upload, Eye
} from 'lucide-react';
import { Product } from '../../types';
import { useMemo, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

interface CommunityPageProps {
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenCustomizer?: () => void;
}

type SortOption = 'top' | 'new' | 'underground' | 'trending';

// Royalty rate shown to users
const ROYALTY_RATE = 12;

export default function CommunityPage({ onBack: _onBack, onSelectProduct, onOpenCustomizer }: CommunityPageProps) {
  const { communityDesigns } = useProduct();
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortOption>('top');
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

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
      createdAt: design.createdAt,
      totalSales: design.totalSales || 0,
      totalEarnings: design.totalEarnings || 0,
      royaltyRate: design.royaltyRate || ROYALTY_RATE,
    })) as (Product & { createdAt?: any; totalSales?: number; totalEarnings?: number; royaltyRate?: number })[];
  }, [communityDesigns]);

  const sortedProducts = useMemo(() => {
    const products = [...communityProducts];
    switch (sortBy) {
      case 'top':
        return products.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'new':
        return products.sort((a, b) => {
          const dateA = (a as any).createdAt?.seconds || 0;
          const dateB = (b as any).createdAt?.seconds || 0;
          return dateB - dateA;
        });
      case 'underground':
        return products.sort((a, b) => (a.likes || 0) - (b.likes || 0));
      case 'trending':
        return products.sort((a, b) => ((b as any).totalSales || 0) - ((a as any).totalSales || 0));
      default:
        return products;
    }
  }, [communityProducts, sortBy]);

  const topThree = useMemo(() => sortedProducts.slice(0, 3), [sortedProducts]);
  const restOfProducts = useMemo(() => sortedProducts.slice(3), [sortedProducts]);

  // Top creators derived from community designs
  const topCreators = useMemo(() => {
    const creatorMap = new Map<string, { name: string; likes: number; designs: number; earnings: number }>();
    communityDesigns.forEach(d => {
      const existing = creatorMap.get(d.authorId) || { name: d.authorName, likes: 0, designs: 0, earnings: 0 };
      existing.likes += d.likes;
      existing.designs += 1;
      existing.earnings += d.totalEarnings || 0;
      creatorMap.set(d.authorId, existing);
    });
    return Array.from(creatorMap.values())
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 4);
  }, [communityDesigns]);

  const totalStats = useMemo(() => ({
    designs: communityDesigns.length,
    totalLikes: communityDesigns.reduce((acc, d) => acc + d.likes, 0),
    totalSales: communityDesigns.reduce((acc, d) => acc + (d.totalSales || 0), 0),
    totalPaidOut: communityDesigns.reduce((acc, d) => acc + (d.totalEarnings || 0), 0),
  }), [communityDesigns]);

  const sortTabs: Array<{ id: SortOption; label: string; icon: typeof Trophy; color: string; textColor: string }> = [
    { id: 'top', label: 'TOP DISAGIO', icon: Trophy, color: 'bg-pink-500', textColor: 'text-white' },
    { id: 'new', label: 'FRESH DROP', icon: Clock, color: 'bg-cyan-400', textColor: 'text-black' },
    { id: 'trending', label: 'TRENDING', icon: TrendingUp, color: 'bg-green-400', textColor: 'text-black' },
    { id: 'underground', label: 'UNDERGROUND', icon: Sparkles, color: 'bg-yellow-400', textColor: 'text-black' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      {/* ─── HERO ─── */}
      <section
        ref={heroRef}
        className="pt-48 pb-24 px-6 md:px-12 bg-white border-b-8 border-black relative overflow-hidden"
      >
        {/* Geometric background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[45%] h-full bg-cyan-400 -skew-x-6 translate-x-24 hidden lg:block" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400 border-8 border-black -translate-x-16 translate-y-16 rotate-12 opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-16">
            {/* Left: title */}
            <div className="max-w-3xl">
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={isHeroInView ? { x: 0, opacity: 1 } : {}}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-4 border-black shadow-[3px_3px_0_0_rgba(34,211,238,1)]">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-mono font-black uppercase tracking-widest text-lg">COMMUNITY VAULT — V3</span>
              </motion.div>

              <motion.h1
                initial={{ x: -60, opacity: 0 }}
                animate={isHeroInView ? { x: 0, opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[12vw] md:text-[8vw] font-black uppercase leading-[0.88] tracking-tighter italic mb-10"
              >
                MEME<br />
                <span className="inline-block bg-cyan-400 text-black px-8 py-2 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] -rotate-2">
                  CREATORS
                </span><br />
                HUB
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xl md:text-2xl font-sans font-medium leading-relaxed max-w-xl text-gray-800"
              >
                Esplora i design della community, acquistali su prodotti fisici e{' '}
                <span className="bg-yellow-400 px-2 font-black">pubblica i tuoi per guadagnare royalty</span> ogni volta che
                qualcuno li compra.
              </motion.p>
            </div>

            {/* Right: stats cards */}
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={isHeroInView ? { x: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-4 w-full lg:w-72 shrink-0"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black text-white p-4 border-4 border-black shadow-[6px_6px_0_0_rgba(236,72,153,1)] rotate-1">
                  <Flame className="w-5 h-5 text-orange-400 mb-2" />
                  <div className="text-2xl font-black italic">{totalStats.designs}</div>
                  <div className="font-mono text-xs uppercase text-gray-400">Design Totali</div>
                </div>
                <div className="bg-yellow-400 p-4 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] -rotate-1">
                  <Heart className="w-5 h-5 mb-2" />
                  <div className="text-2xl font-black italic">{(totalStats.totalLikes / 1000).toFixed(1)}K</div>
                  <div className="font-mono text-xs uppercase">Like Totali</div>
                </div>
                <div className="bg-green-400 p-4 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <DollarSign className="w-5 h-5 mb-2" />
                  <div className="text-2xl font-black italic">€{totalStats.totalPaidOut.toFixed(0)}</div>
                  <div className="font-mono text-xs uppercase">Royalty Pagate</div>
                </div>
                <div className="bg-pink-500 text-white p-4 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <ShoppingBag className="w-5 h-5 mb-2" />
                  <div className="text-2xl font-black italic">{totalStats.totalSales}</div>
                  <div className="font-mono text-xs uppercase opacity-80">Vendite Design</div>
                </div>
              </div>

              {/* Royalty badge */}
              <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-mono font-black uppercase text-sm">ROYALTY CREATOR</span>
                </div>
                <div className="text-4xl font-black text-green-500">{ROYALTY_RATE}%</div>
                <p className="font-mono text-xs text-gray-500 mt-1">su ogni vendita del tuo design</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── ACTIVITY TICKER ─── */}
      <div className="bg-black border-b-8 border-black py-3 overflow-hidden whitespace-nowrap">
        <div className="flex gap-16 items-center animate-marquee">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-white font-mono text-xs font-bold uppercase shrink-0">
              <span className="text-cyan-400">●</span>
              <span>@MemeLord99 ha appena guadagnato €4.20 di royalty</span>
              <span className="text-pink-500">●</span>
              <span>Nuovo drop: "SKIBIDI TOILET EDITION"</span>
              <span className="text-yellow-400">●</span>
              <span>Aura level globale: CRITICO</span>
              <span className="text-green-400">●</span>
              <span>+12% royalty su ogni vendita — pubblica ora</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CREATOR SPOTLIGHT ─── */}
      {topCreators.length > 0 && (
        <section className="py-20 px-6 md:px-12 bg-[#f0f0f0] border-b-8 border-black">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-12">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none whitespace-nowrap">
                TOP <span className="inline-block bg-yellow-400 px-6 py-2 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rotate-1 italic">CREATORS</span>
              </h2>
              <div className="h-1 flex-1 bg-black" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {topCreators.map((creator, i) => (
                <motion.div
                  key={creator.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all group"
                >
                  {/* Avatar placeholder */}
                  <div className="w-14 h-14 bg-black border-4 border-black flex items-center justify-center mb-4 text-2xl font-black text-yellow-400 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                    {creator.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-black uppercase text-sm leading-tight">@{creator.name}</p>
                      <p className="font-mono text-xs text-gray-500">{creator.designs} design</p>
                    </div>
                    {i === 0 && (
                      <div className="bg-yellow-400 border-2 border-black px-2 py-1 text-[10px] font-black uppercase -rotate-2">
                        #1
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t-2 border-black">
                    <div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span className="font-black text-sm">{creator.likes}</span>
                      </div>
                      <p className="font-mono text-[10px] text-gray-400 uppercase">like</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-500" />
                        <span className="font-black text-sm">€{creator.earnings.toFixed(0)}</span>
                      </div>
                      <p className="font-mono text-[10px] text-gray-400 uppercase">guadagni</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── SORTING TABS ─── */}
      <div className="sticky top-24 z-30 bg-white border-b-8 border-black py-5 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
          {sortTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSortBy(tab.id)}
              className={`px-6 py-2.5 border-4 border-black font-black uppercase italic transition-all flex items-center gap-2 text-sm ${
                sortBy === tab.id
                  ? `${tab.color} ${tab.textColor} shadow-none translate-x-1 translate-y-1`
                  : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── HALL OF FAME ─── */}
      {sortBy === 'top' && topThree.length > 0 && (
        <section className="py-20 px-6 md:px-12 bg-gray-50 border-b-8 border-black">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-12">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                HALL OF{' '}
                <span className="inline-block bg-pink-500 text-white px-6 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rotate-2 italic">
                  FAME
                </span>
              </h2>
              <div className="h-2 flex-1 bg-black" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Rank 1 — featured large */}
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="lg:col-span-2 relative"
              >
                <div className="absolute -top-6 -left-6 z-30 bg-yellow-400 border-4 border-black px-6 py-2 font-black text-2xl italic shadow-[6px_6px_0_0_rgba(0,0,0,1)] -rotate-3">
                  👑 #1 MEME LORD
                </div>
                <ProductCard product={topThree[0]} onSelect={onSelectProduct} bgColor="bg-white" />

                {/* Royalty info overlay */}
                <div className="mt-2 bg-green-400 border-4 border-black p-3 flex items-center justify-between shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-mono font-black text-sm uppercase">
                      {(topThree[0] as any).totalSales || 0} vendite · €
                      {((topThree[0] as any).totalEarnings || 0).toFixed(2)} guadagnati
                    </span>
                  </div>
                  <div className="bg-black text-green-400 px-3 py-1 font-black text-xs uppercase border-2 border-black">
                    {ROYALTY_RATE}% royalty
                  </div>
                </div>
              </motion.div>

              {/* Rank 2 & 3 */}
              <div className="flex flex-col gap-8">
                {topThree.slice(1).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="relative"
                  >
                    <div className="absolute -top-4 -right-4 z-30 bg-gray-200 border-4 border-black px-4 py-1 font-black text-lg italic shadow-[4px_4px_0_0_rgba(0,0,0,1)] rotate-3">
                      #{i + 2}
                    </div>
                    <ProductCard product={product} onSelect={onSelectProduct} bgColor="bg-white" />
                    <div className="mt-1 bg-white border-2 border-black p-2 flex items-center gap-2">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span className="font-mono text-xs text-gray-500 uppercase">
                        {(product as any).totalSales || 0} vendite
                      </span>
                      <span className="ml-auto font-black text-xs text-green-600">
                        +€{((product as any).totalEarnings || 0).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── MAIN GRID ─── */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-12 flex items-end justify-between gap-6">
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            {sortBy === 'top' && (
              <>GLI ALTRI <span className="inline-block bg-cyan-400 px-6 py-2 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rotate-1 italic">CAPOLAVORI</span></>
            )}
            {sortBy === 'new' && (
              <>ULTIME <span className="inline-block bg-yellow-400 px-6 py-2 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] -rotate-1 italic">MUTAZIONI</span></>
            )}
            {sortBy === 'trending' && (
              <>PIÙ <span className="inline-block bg-green-400 px-6 py-2 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rotate-2 italic">VENDUTI</span></>
            )}
            {sortBy === 'underground' && (
              <>TESORI <span className="inline-block bg-pink-500 text-white px-6 py-2 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] -rotate-2 italic">NASCOSTI</span></>
            )}
          </h3>
          <p className="font-mono text-sm text-gray-500 hidden md:block">
            {sortedProducts.length} design disponibili
          </p>
        </div>

        {(sortBy === 'top' ? restOfProducts : sortedProducts).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {(sortBy === 'top' ? restOfProducts : sortedProducts).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                className="flex flex-col"
              >
                <ProductCard product={product} onSelect={onSelectProduct} bgColor="bg-white" />
                {/* Mini royalty strip */}
                <div className="flex items-center justify-between bg-gray-50 border-b-2 border-x-2 border-black px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3 h-3 text-red-400" />
                    <span className="font-mono text-xs font-bold">{product.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3 h-3 text-gray-400" />
                    <span className="font-mono text-xs text-gray-500">{(product as any).totalSales || 0} vendite</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border-8 border-black border-dashed bg-gray-50">
            <Sparkles className="w-20 h-20 text-gray-300 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-black uppercase mb-4">IL VUOTO COSMICO</h2>
            <p className="font-mono text-lg text-gray-500 mb-8">
              Nessun design in questa categoria. Sii il primo a rompere il ghiaccio!
            </p>
            {onOpenCustomizer && (
              <button
                onClick={onOpenCustomizer}
                className="bg-pink-500 text-white border-4 border-black px-8 py-4 font-black uppercase text-lg shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center gap-3 mx-auto italic"
              >
                <Wand2 className="w-5 h-5" /> CREA ORA
              </button>
            )}
          </div>
        )}
      </section>

      {/* ─── HOW ROYALTIES WORK ─── */}
      <section className="py-24 px-6 md:px-12 bg-black text-white border-t-8 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-16">
            {/* Left: title */}
            <div className="flex-1">
              <div className="inline-block bg-green-400 text-black font-mono font-black uppercase text-xs tracking-widest px-4 py-2 mb-8 border-4 border-green-400">
                CREATOR ECONOMY
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8">
                PUBBLICA.<br />GUADAGNA.<br />
                <span className="text-green-400">REPEAT.</span>
              </h2>
              <p className="font-sans text-xl text-gray-300 leading-relaxed max-w-lg">
                Ogni design che pubblichi nella community può essere acquistato da altri utenti su
                t-shirt, mug e poster. Tu ricevi automaticamente il <strong className="text-green-400">{ROYALTY_RATE}%</strong> di
                royalty su ogni vendita, senza fare nulla.
              </p>
            </div>

            {/* Right: steps */}
            <div className="flex-1 flex flex-col gap-6">
              {[
                {
                  step: '01',
                  title: 'Crea il tuo design',
                  desc: "Usa il customizer con AI Gemini per creare il meme perfetto.",
                  color: 'border-l-cyan-400',
                  icon: Wand2,
                },
                {
                  step: '02',
                  title: 'Pubblica nella community',
                  desc: 'Dopo l\'acquisto, pubblica il design rendendolo disponibile a tutti.',
                  color: 'border-l-yellow-400',
                  icon: Upload,
                },
                {
                  step: '03',
                  title: 'Ricevi le royalty',
                  desc: `Ogni vendita del tuo design ti frutta il ${ROYALTY_RATE}% automatico. Accumulato nel tuo profilo.`,
                  color: 'border-l-green-400',
                  icon: DollarSign,
                },
                {
                  step: '04',
                  title: 'Scala con i like',
                  desc: 'Più like ricevi, più il tuo design appare in cima. Visibilità organica, guadagni reali.',
                  color: 'border-l-pink-400',
                  icon: TrendingUp,
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex gap-5 bg-white/5 border border-white/10 border-l-4 ${item.color} p-5`}
                >
                  <div className="font-mono text-2xl font-black text-white/20 shrink-0">{item.step}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className="w-4 h-4 text-green-400" />
                      <h4 className="font-black uppercase text-sm">{item.title}</h4>
                    </div>
                    <p className="font-mono text-sm text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-white/10">
            <div>
              <p className="font-mono text-green-400 font-black uppercase tracking-widest text-sm mb-2">PRONTO A GUADAGNARE?</p>
              <h3 className="text-3xl font-black uppercase italic">Inizia a creare adesso.</h3>
            </div>
            <div className="flex gap-4">
              {onOpenCustomizer && (
                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenCustomizer}
                  className="bg-green-400 text-black border-4 border-green-400 px-8 py-4 font-black uppercase text-lg shadow-[8px_8px_0_0_rgba(74,222,128,0.3)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center gap-3 italic"
                >
                  <Wand2 className="w-5 h-5" /> CREA & PUBBLICA
                </motion.button>
              )}
              {!user && (
                <div className="bg-white/10 border border-white/20 px-6 py-4 font-mono text-sm text-gray-400 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Login richiesto per pubblicare
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
