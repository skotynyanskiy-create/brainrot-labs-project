import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Box,
  Flame,
  Heart,
  Layers3,
  Package,
  Smartphone,
  Search,
  Shirt,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Wand2,
} from 'lucide-react';

import type { BaseProduct, CommunityDesign, CreatorInfo, MemeBase, Product } from '../../types';
import { useProduct } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { BASE_PRODUCTS, CREATOR_ROYALTY_RATE, MEME_BASES } from '../../constants';
import { getSiteCtaClasses } from '../../styles/siteCta';
import { playBlipSound } from '../../utils/sounds';
import DesignGrid from '../community/DesignGrid';
import MemeBaseGallery from '../community/MemeBaseGallery';
import ProductBaseGallery from '../community/ProductBaseGallery';
import MemeDetailPage from '../community/MemeDetailPage';
import ProductDetailPage from '../community/ProductDetailPage';
import CreatorProfilePage from '../community/CreatorProfilePage';
import Product3DPreview from '../customizer/Product3DPreview';

interface CommunityPageProps {
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenCustomizer?: () => void;
  onOpenCustomizerWithMeme?: (meme: MemeBase) => void;
  onOpenCustomizerWithProduct?: (productId: string) => void;
}

type ActiveTab = 'meme-base' | 'product-3d' | 'top-creator' | 'search-results';

type DetailView =
  | { type: 'meme'; data: MemeBase }
  | { type: 'product'; data: BaseProduct }
  | { type: 'creator'; data: CreatorInfo };

const CATEGORY_COLORS: Record<string, { pill: string; label: string }> = {
  reaction: { pill: 'bg-cyan-400 text-black border-cyan-400',   label: 'Reaction' },
  format:   { pill: 'bg-yellow-400 text-black border-yellow-400', label: 'Format' },
  dank:     { pill: 'bg-pink-500 text-white border-pink-500',    label: 'Dank' },
  italian:  { pill: 'bg-green-400 text-black border-green-400',  label: 'Italian' },
};

const RANK_CONFIG = [
  { bg: 'bg-yellow-400', label: 'Gold',   shadow: 'shadow-[8px_8px_0_0_rgba(0,0,0,1)]', minH: 'min-h-[280px]', py: 'py-10' },
  { bg: 'bg-gray-200',   label: 'Silver', shadow: 'shadow-[8px_8px_0_0_rgba(0,0,0,1)]', minH: 'min-h-[240px]', py: 'py-7'  },
  { bg: 'bg-orange-300', label: 'Bronze', shadow: 'shadow-[8px_8px_0_0_rgba(0,0,0,1)]', minH: 'min-h-[220px]', py: 'py-6'  },
];


const designToProduct = (design: CommunityDesign): Product => ({
  id: design.id,
  name: design.memeBaseName ? `${design.memeBaseName} - Community` : design.baseProductName ?? 'Community Design',
  price: design.baseProductPrice ?? 28,
  image: design.image,
  category: 'community',
  memeDescription: design.memeDescription,
  rarity: design.likes > 700 ? 'Legendary' : design.likes > 400 ? 'Epic' : design.likes > 180 ? 'Rare' : 'Common',
  color: 'bg-white',
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }],
  likes: design.likes,
  authorName: design.authorName,
  sourceType: 'community',
  baseProductId: design.baseProductId,
  communityDesignId: design.id,
  designId: design.designId ?? undefined,
});

// ── Meme category filter pill ────────────────────────────────────────────────

function CategoryPill({
  label,
  colorClass,
  active,
  onClick,
}: {
  label: string;
  colorClass: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      className={`shrink-0 border-4 border-black px-4 py-2 font-mono text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
        active
          ? `${colorClass} shadow-none translate-x-0.5 translate-y-0.5`
          : 'bg-white text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
      }`}
    >
      {label}
    </motion.button>
  );
}


// ── Podium creator card ──────────────────────────────────────────────────────

function PodiumCard({
  creator,
  rank,
  onClick,
}: {
  creator: { authorId: string; name: string; designs: number; likes: number; earnings: number };
  rank: number;
  onClick: () => void;
}) {
  const cfg = RANK_CONFIG[rank - 1] ?? RANK_CONFIG[0];
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -6 }}
      className={`group flex w-full flex-col items-center border-4 border-black ${cfg.bg} ${cfg.shadow} ${cfg.minH} ${cfg.py} transition-all hover:shadow-none hover:translate-y-1 px-4`}
    >
      <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-black/40">{cfg.label}</span>
      <span className="mt-2 text-6xl font-black leading-none text-black/20">#{rank}</span>
      <div className="mt-4 flex h-14 w-14 items-center justify-center border-4 border-black bg-black text-xl font-black uppercase text-cyan-300">
        {creator.name.charAt(0)}
      </div>
      <p className="mt-3 text-center text-sm font-black uppercase tracking-tight leading-tight">@{creator.name}</p>
      <div className="mt-4 flex w-full flex-col gap-2">
        <div className="flex items-center justify-between border-t-2 border-black/20 pt-3">
          <span className="font-mono text-[10px] text-black/50">Design</span>
          <span className="font-mono text-[11px] font-black">{creator.designs}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-black/50">Like</span>
          <span className="font-mono text-[11px] font-black">{creator.likes.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-black/50">Royalty</span>
          <span className="font-mono text-[11px] font-black">€{creator.earnings.toFixed(0)}</span>
        </div>
      </div>
    </motion.button>
  );
}

// ── Creator list row (#4-8) ──────────────────────────────────────────────────

function CreatorListRow({
  creator,
  rank,
  onClick,
}: {
  creator: { authorId: string; name: string; designs: number; likes: number; earnings: number };
  rank: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      className="group flex w-full items-center gap-4 border-b-2 border-black bg-white px-5 py-4 text-left last:border-b-0 transition-colors hover:bg-gray-50"
    >
      <span className="w-8 shrink-0 font-mono text-sm font-black text-black/25">#{rank}</span>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-[#f4f0e8] font-black uppercase">
        {creator.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-black uppercase tracking-tight">@{creator.name}</p>
        <div className="mt-1 flex gap-3">
          <span className="font-mono text-[10px] text-gray-400">{creator.designs} design</span>
          <span className="font-mono text-[10px] text-gray-400">{creator.likes.toLocaleString()} like</span>
          <span className="font-mono text-[10px] text-gray-400">€{creator.earnings.toFixed(0)} royalty</span>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
    </motion.button>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CommunityPage({
  onBack: _onBack,
  onSelectProduct,
  onOpenCustomizer,
  onOpenCustomizerWithMeme,
  onOpenCustomizerWithProduct,
}: CommunityPageProps) {
  const {
    communityDesigns,
    filteredCommunityDesigns,
    communitySearchResults,
    isCommunityLoading,
    hasMoreDesigns,
    fetchMoreDesigns,
    likeDesign,
    searchQuery,
    setSearchQuery,
    selectedMemeBaseId,
    setSelectedMemeBaseId,
    selectedBaseProductId,
    setSelectedBaseProductId,
    communitySort,
    setCommunitySort,
  } = useProduct();

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('meme-base');
  const [detailView, setDetailView] = useState<DetailView | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      if (communitySearchResults.length > 0) {
        setDetailView(null);
        setActiveTab('search-results');
      } else if (activeTab === 'search-results') {
        setActiveTab('meme-base');
      }
    });
  }, [activeTab, communitySearchResults.length]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const totalStats = useMemo(() => ({
    designs: communityDesigns.length,
    likes: communityDesigns.reduce((acc, d) => acc + d.likes, 0),
    sales: communityDesigns.reduce((acc, d) => acc + (d.totalSales ?? 0), 0),
  }), [communityDesigns]);

  const topCreatorsMap = useMemo(() => {
    const map = new Map<string, { authorId: string; name: string; designs: number; likes: number; earnings: number }>();
    communityDesigns.forEach((d) => {
      const cur = map.get(d.authorId) ?? { authorId: d.authorId, name: d.authorName, designs: 0, likes: 0, earnings: 0 };
      cur.designs += 1;
      cur.likes += d.likes;
      cur.earnings += d.totalEarnings ?? 0;
      map.set(d.authorId, cur);
    });
    return map;
  }, [communityDesigns]);

  const topCreators = useMemo(() => (
    Array.from(topCreatorsMap.values())
      .sort((a, b) => (b.likes + b.earnings * 10) - (a.likes + a.earnings * 10))
      .slice(0, 8)
  ), [topCreatorsMap]);

  const designCountPerMemeBase = useMemo(() => {
    const counts: Record<string, number> = {};
    communityDesigns.forEach((d) => { if (d.memeBaseId) counts[d.memeBaseId] = (counts[d.memeBaseId] ?? 0) + 1; });
    return counts;
  }, [communityDesigns]);

  const totalLikesPerMemeBase = useMemo(() => {
    const counts: Record<string, number> = {};
    communityDesigns.forEach((d) => { if (d.memeBaseId) counts[d.memeBaseId] = (counts[d.memeBaseId] ?? 0) + d.likes; });
    return counts;
  }, [communityDesigns]);

  const designCountPerProduct = useMemo(() => {
    const counts: Record<string, number> = {};
    communityDesigns.forEach((d) => { if (d.baseProductId) counts[d.baseProductId] = (counts[d.baseProductId] ?? 0) + 1; });
    return counts;
  }, [communityDesigns]);

  const totalLikesPerProduct = useMemo(() => {
    const counts: Record<string, number> = {};
    communityDesigns.forEach((d) => { if (d.baseProductId) counts[d.baseProductId] = (counts[d.baseProductId] ?? 0) + d.likes; });
    return counts;
  }, [communityDesigns]);

  const totalRoyaltyValue = useMemo(
    () => communityDesigns.reduce((acc, design) => acc + (design.totalEarnings ?? 0), 0),
    [communityDesigns]
  );

  const activeCreatorsCount = useMemo(() => topCreatorsMap.size, [topCreatorsMap]);

  const topMemeBase = useMemo(() => {
    const topMemeBaseId = Object.entries(designCountPerMemeBase)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    if (!topMemeBaseId) {
      return MEME_BASES[0];
    }

    return MEME_BASES.find((memeBase) => memeBase.id === topMemeBaseId) ?? MEME_BASES[0];
  }, [designCountPerMemeBase]);

  const topProductBase = useMemo(() => {
    const topProductId = Object.entries(designCountPerProduct)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    if (!topProductId) {
      return BASE_PRODUCTS[0];
    }

    return BASE_PRODUCTS.find((product) => product.id === topProductId) ?? BASE_PRODUCTS[0];
  }, [designCountPerProduct]);

  const topCreator = topCreators[0] ?? null;

  const archiveOverviewStats = useMemo(() => ([
    {
      label: 'Template attivi',
      value: MEME_BASES.length,
      meta: 'basi pronte da remixare',
      icon: Flame,
      tone: 'bg-cyan-400 text-black',
    },
    {
      label: 'Design pubblicati',
      value: totalStats.designs,
      meta: 'drop live nella community',
      icon: Layers3,
      tone: 'bg-black text-white',
    },
    {
      label: 'Supporti pronti',
      value: BASE_PRODUCTS.length,
      meta: 'prodotti agganciati al customizer 3D',
      icon: Package,
      tone: 'bg-yellow-400 text-black',
    },
    {
      label: 'Creator attivi',
      value: activeCreatorsCount,
      meta: 'profili con design pubblicati',
      icon: Users,
      tone: 'bg-green-400 text-black',
    },
  ]), [activeCreatorsCount, totalStats.designs]);

  const archiveCommerceSignals = useMemo(() => ([
    {
      label: 'Royalty creator',
      value: `${CREATOR_ROYALTY_RATE}%`,
      meta: 'quota visibile in ogni vendita',
      icon: Star,
      tone: 'bg-green-400 text-black',
    },
    {
      label: 'Vendite totali',
      value: totalStats.sales,
      meta: 'ordini registrati sui design pubblicati',
      icon: TrendingUp,
      tone: 'bg-yellow-400 text-black',
    },
    {
      label: 'Royalty maturate',
      value: `€${Math.round(totalRoyaltyValue)}`,
      meta: 'royalty aggregate generate dalla community',
      icon: Box,
      tone: 'bg-black text-white',
    },
  ]), [totalRoyaltyValue, totalStats.sales]);

  const archiveDashboardCards = archiveOverviewStats;

  const currentDetailTotalCount = useMemo(() => {
    if (detailView?.type === 'meme') return designCountPerMemeBase[detailView.data.id] ?? 0;
    if (detailView?.type === 'product') return designCountPerProduct[detailView.data.id] ?? 0;
    return 0;
  }, [detailView, designCountPerMemeBase, designCountPerProduct]);

  const creatorDesigns = useMemo(() => {
    if (detailView?.type !== 'creator') return [];
    return communityDesigns.filter((d) => d.authorId === detailView.data.authorId);
  }, [communityDesigns, detailView]);

  const filteredMemeBases = useMemo(() => {
    if (!activeCategory) return MEME_BASES;
    return MEME_BASES.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectMemeBase = (memeBase: MemeBase) => {
    playBlipSound();
    setSelectedMemeBaseId(memeBase.id);
    setSelectedBaseProductId(null);
    setDetailView({ type: 'meme', data: memeBase });
  };

  const handleSelectBaseProduct = (product: BaseProduct) => {
    playBlipSound();
    setSelectedBaseProductId(product.id);
    setSelectedMemeBaseId(null);
    setDetailView({ type: 'product', data: product });
  };

  const handleSelectCreator = (
    creator: { authorId: string; name: string; designs: number; likes: number; earnings: number },
    rank: number,
  ) => {
    playBlipSound();
    setDetailView({
      type: 'creator',
      data: { authorId: creator.authorId, name: creator.name, designs: creator.designs, likes: creator.likes, earnings: creator.earnings, rank },
    });
  };

  const handleBack = () => {
    setDetailView(null);
    setSelectedMemeBaseId(null);
    setSelectedBaseProductId(null);
  };

  const handleSelectDesign = (design: CommunityDesign) => onSelectProduct(designToProduct(design));
  const handleLikeDesign   = (designId: string, delta: 1 | -1) => void likeDesign(designId, delta);

  const handleOpenCustomizerFromDetail = () => {
    if (detailView?.type === 'meme' && onOpenCustomizerWithMeme) { onOpenCustomizerWithMeme(detailView.data); return; }
    if (detailView?.type === 'product' && onOpenCustomizerWithProduct) { onOpenCustomizerWithProduct(detailView.data.id); return; }
    setDetailView(null);
    onOpenCustomizer?.();
  };

  const handleSelectAuthor = (authorId: string, authorName: string) => {
    playBlipSound();
    const existing = Array.from(topCreatorsMap.values()).find((c) => c.authorId === authorId);
    const rank = existing ? topCreators.findIndex((c) => c.authorId === authorId) + 1 : topCreators.length + 1;
    setDetailView({ type: 'creator', data: { authorId, name: authorName, designs: existing?.designs ?? 0, likes: existing?.likes ?? 0, earnings: existing?.earnings ?? 0, rank } });
  };

  const handleSelectMemeBaseById = (memeBaseId: string) => {
    const meme = MEME_BASES.find((m) => m.id === memeBaseId);
    if (meme) handleSelectMemeBase(meme);
  };

  // ── Detail views ──────────────────────────────────────────────────────────

  if (detailView?.type === 'meme') {
    return (
      <MemeDetailPage
        memeBase={detailView.data}
        designs={filteredCommunityDesigns}
        totalDesignCount={currentDetailTotalCount}
        isLoading={isCommunityLoading}
        hasMore={hasMoreDesigns}
        onLoadMore={() => void fetchMoreDesigns()}
        sortBy={communitySort}
        onSortChange={setCommunitySort}
        onSelectDesign={handleSelectDesign}
        onLikeDesign={handleLikeDesign}
        onSelectAuthor={handleSelectAuthor}
        onOpenCustomizer={(onOpenCustomizer || onOpenCustomizerWithMeme) ? handleOpenCustomizerFromDetail : undefined}
        onBack={handleBack}
      />
    );
  }

  if (detailView?.type === 'product') {
    return (
      <ProductDetailPage
        product={detailView.data}
        designs={filteredCommunityDesigns}
        totalDesignCount={currentDetailTotalCount}
        isLoading={isCommunityLoading}
        hasMore={hasMoreDesigns}
        onLoadMore={() => void fetchMoreDesigns()}
        sortBy={communitySort}
        onSortChange={setCommunitySort}
        onSelectDesign={handleSelectDesign}
        onLikeDesign={handleLikeDesign}
        onSelectAuthor={handleSelectAuthor}
        onOpenCustomizer={(onOpenCustomizer || onOpenCustomizerWithProduct) ? handleOpenCustomizerFromDetail : undefined}
        onBack={handleBack}
      />
    );
  }

  if (detailView?.type === 'creator') {
    return (
      <CreatorProfilePage
        creator={detailView.data}
        designs={creatorDesigns}
        isLoading={false}
        sortBy={communitySort}
        onSortChange={setCommunitySort}
        onSelectDesign={handleSelectDesign}
        onLikeDesign={handleLikeDesign}
        onSelectAuthor={handleSelectAuthor}
        onSelectMemeBase={handleSelectMemeBaseById}
        onOpenCustomizer={onOpenCustomizer ? handleOpenCustomizerFromDetail : undefined}
        onBack={handleBack}
      />
    );
  }

  // ── Tab config ────────────────────────────────────────────────────────────

  const TABS: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    accentClass: string;
    activeBg: string;
  }> = [
    { id: 'meme-base',   label: 'Meme Base', icon: Flame,   count: MEME_BASES.length,     accentClass: 'border-l-cyan-400',   activeBg: 'bg-cyan-50' },
    { id: 'product-3d',  label: 'Prodotti',  icon: Shirt,   count: BASE_PRODUCTS.length,  accentClass: 'border-l-yellow-400', activeBg: 'bg-yellow-50' },
    { id: 'top-creator', label: 'Creator',   icon: Trophy,  count: topCreators.length,    accentClass: 'border-l-green-400',  activeBg: 'bg-green-50' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="community-listing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-[#f4f0e8]"
      >

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b-8 border-black bg-white px-6 pb-16 pt-12 md:px-12 md:pt-16">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, #00000010 1px, transparent 1px)', backgroundSize: '26px 26px' }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(6,182,212,0.12),transparent)]" />

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:gap-12">
              <div className="flex max-w-3xl flex-col items-start">
                <div className="inline-flex items-center gap-2 border-4 border-black bg-black px-4 py-2 font-mono text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <Star className="h-3.5 w-3.5 fill-cyan-300 text-cyan-300" />
                  Archivio Digitale
                </div>

                <h1 className="mt-6 max-w-[10.8ch] text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] text-black sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.8rem]">
                  DAL TEMPLATE
                  <br />
                  AL TUO
                  <br />
                  <span className="mt-3 inline-block -rotate-[1.1deg] border-4 border-black bg-cyan-400 px-3 py-1.5 text-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] sm:px-4 sm:py-2">
                    OGGETTO CULT
                  </span>
                </h1>

                <div className="mt-6 max-w-[41rem] border-l-4 border-black pl-5">
                  <p className="text-base font-semibold leading-[1.55] text-black/80 sm:text-lg md:text-[1.18rem]">
                    L&apos;archivio digitale raccoglie template meme, supporti fisici e creator in un unico flusso.
                    Qui navighi le basi, visualizzi il prodotto in 3D e capisci subito cosa puo diventare un design reale.
                  </p>
                </div>

                <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  {onOpenCustomizer && (
                    <button
                      onClick={() => { playBlipSound(); onOpenCustomizer(); }}
                      className={getSiteCtaClasses(
                        'create',
                        'lg',
                        'group w-full sm:w-auto sm:min-w-[18rem] shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:shadow-[14px_14px_0_0_rgba(0,0,0,1)]'
                      )}
                    >
                      <Wand2 className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
                      CREA IL TUO DESIGN
                    </button>
                  )}

                  <button
                    onClick={() => {
                      playBlipSound();
                      setActiveTab('product-3d');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={getSiteCtaClasses(
                      'archive',
                      'lg',
                      'group w-full sm:w-auto sm:min-w-[18rem] shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:shadow-[14px_14px_0_0_rgba(0,0,0,1)]'
                    )}
                  >
                    <Smartphone className="h-5 w-5 transition-transform duration-200 group-hover:-rotate-6" />
                    SUPPORTI 3D
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {['Template remixabili', 'Preview cover 3D integrata', 'Creator ranking separato'].map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center border-2 border-black bg-white px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-black/65 shadow-[3px_3px_0_0_rgba(0,0,0,1)] sm:text-[11px]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[35rem]">
                  <div className="pointer-events-none absolute inset-x-[10%] top-[8%] h-[58%] rounded-full bg-cyan-300/30 blur-[75px]" />

                  <motion.div
                    animate={{ y: [-6, 6, -6] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative border-4 border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)]"
                  >
                    <div className="border-b-4 border-black bg-black px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-yellow-300">
                          Preview supporto
                        </p>
                        <span className="border-2 border-white/35 bg-white px-2 py-1 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-black">
                          iPhone Snap Case
                        </span>
                      </div>
                    </div>

                    <div className="relative bg-[linear-gradient(180deg,#f7f3ea_0%,#ffffff_100%)] px-4 pb-6 pt-4 sm:px-6 sm:pb-8">
                      <div className="pointer-events-none absolute inset-0 opacity-35" style={{ backgroundImage: 'radial-gradient(circle, #0000000f 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                      <div className="relative h-[320px] sm:h-[400px] lg:h-[500px]">
                        <Product3DPreview
                          baseProductId="base-phonecase"
                          designTextureUrl={null}
                          baseColor="#1f1f1f"
                          autoRotate={true}
                          lightingMode="neutral"
                        />
                      </div>
                    </div>
                  </motion.div>

                  <div className="absolute -bottom-4 right-4 border-4 border-black bg-yellow-400 px-4 py-2 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/65">
                      Supporto focus
                    </p>
                    <p className="mt-1 text-sm font-black uppercase leading-none">
                      cover pronta
                      <br />
                      per il customizer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden mx-auto max-w-7xl">

            {/* Label pill */}
            <div className="inline-flex items-center gap-2 border-2 border-white/20 bg-white/5 px-3 py-1.5">
              <Star className="h-3 w-3 fill-cyan-400 text-cyan-400" />
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">
                Archivio Digitale
              </span>
            </div>

            {/* Headline + CTA */}
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="text-6xl font-black uppercase leading-[0.88] tracking-tighter md:text-8xl">
                  Meme, prodotti<br />
                  e creator<br />
                  <span className="text-cyan-400">reali.</span>
                </h1>
                <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-gray-400">
                  Scegli un template, personalizza nel customizer 3D e pubblica un design che la community può acquistare.
                </p>
              </div>
              {onOpenCustomizer && (
                <button
                  onClick={() => { playBlipSound(); onOpenCustomizer(); }}
                  className={getSiteCtaClasses('create', 'lg', 'self-end border-white')}
                >
                  <Wand2 className="h-5 w-5" />
                  Crea il tuo design
                </button>
              )}
            </div>

            {/* Stats strip */}
            <div className="mt-12 grid grid-cols-2 gap-px border-t border-white/10 pt-10 sm:grid-cols-4">
              {[
                { label: 'Template meme',    value: MEME_BASES.length,         icon: Flame,       color: 'text-cyan-400' },
                { label: 'Design community', value: totalStats.designs,        icon: Heart,       color: 'text-white' },
                { label: 'Vendite totali',   value: totalStats.sales,          icon: TrendingUp,  color: 'text-yellow-400' },
                { label: 'Royalty creator',  value: `${CREATOR_ROYALTY_RATE}%`, icon: Star,       color: 'text-green-400' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex flex-col gap-2 pr-6">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                      <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">{s.label}</span>
                    </div>
                    <span className={`text-4xl font-black md:text-5xl ${s.color}`}>{s.value}</span>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ── TAB NAV ───────────────────────────────────────────── */}
        <section className="border-b-8 border-black bg-black px-6 py-10 text-white md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
              <div className="grid gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="font-mono text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">
                      Archivio Pulse Board
                    </p>
                    <h2 className="mt-2 text-3xl font-black uppercase tracking-tighter md:text-4xl">
                      Scopri cosa c&apos;e e cosa gira
                    </h2>
                  </div>
                  <p className="max-w-sm font-mono text-xs leading-5 text-white/45 md:text-right">
                    Discovery, trend e segnali commerce reali in un blocco unico, utile per capire dove entrare.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {archiveOverviewStats.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="border-4 border-black bg-white p-4 text-black shadow-[8px_8px_0_0_rgba(255,255,255,0.08)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-black/50">
                            {card.label}
                          </p>
                          <span className={`inline-flex h-9 w-9 items-center justify-center border-2 border-black ${card.tone}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                        </div>
                        <p className="mt-4 text-4xl font-black uppercase leading-none tracking-[-0.05em]">
                          {card.value}
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-5 text-black/68">
                          {card.meta}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="border-4 border-white bg-[#111111] p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-green-400">
                          Creator leader
                        </p>
                        <p className="mt-3 text-3xl font-black uppercase tracking-tighter">
                          {topCreator ? `@${topCreator.name}` : 'Nessun leader'}
                        </p>
                      </div>
                      <Users className="h-6 w-6 shrink-0 text-green-400" />
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase text-white/35">Design</p>
                        <p className="mt-1 text-lg font-black">{topCreator?.designs ?? 0}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase text-white/35">Like</p>
                        <p className="mt-1 text-lg font-black">{topCreator?.likes ?? 0}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase text-white/35">Royalty</p>
                        <p className="mt-1 text-lg font-black">€{topCreator?.earnings.toFixed(0) ?? '0'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        playBlipSound();
                        setActiveTab('top-creator');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="mt-5 inline-flex items-center gap-2 border-4 border-white bg-white px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-black shadow-[4px_4px_0_0_rgba(255,255,255,0.12)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    >
                      Apri classifica creator
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid gap-4">
                    <div className="border-4 border-black bg-cyan-400 p-5 text-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
                            Template top
                          </p>
                          <p className="mt-2 text-2xl font-black uppercase leading-[0.95] tracking-tighter">
                            {topMemeBase?.name ?? 'Nessun template'}
                          </p>
                        </div>
                        <Flame className="h-6 w-6 shrink-0" />
                      </div>
                      <p className="mt-3 text-sm font-semibold leading-5 text-black/70">
                        {topMemeBase ? `${designCountPerMemeBase[topMemeBase.id] ?? 0} design pubblicati e ${totalLikesPerMemeBase[topMemeBase.id] ?? 0} like aggregati.` : 'Appena arrivano dati reali, qui comparira il template piu usato.'}
                      </p>
                    </div>

                    <div className="border-4 border-black bg-yellow-400 p-5 text-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
                            Supporto piu usato
                          </p>
                          <p className="mt-2 text-2xl font-black uppercase leading-[0.95] tracking-tighter">
                            {topProductBase.name}
                          </p>
                        </div>
                        <Smartphone className="h-6 w-6 shrink-0" />
                      </div>
                      <p className="mt-3 text-sm font-semibold leading-5 text-black/70">
                        {designCountPerProduct[topProductBase.id] ?? 0} design pubblicati e {totalLikesPerProduct[topProductBase.id] ?? 0} like aggregati su questo supporto.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="border-4 border-white bg-[#0f0f0f] p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                    Commerce proof
                  </p>
                  <div className="mt-4 grid gap-4">
                    {archiveCommerceSignals.map((card) => {
                      const Icon = card.icon;
                      return (
                        <div key={card.label} className="border-4 border-white bg-white p-4 text-black">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-black/50">
                              {card.label}
                            </p>
                            <span className={`inline-flex h-9 w-9 items-center justify-center border-2 border-black ${card.tone}`}>
                              <Icon className="h-4 w-4" />
                            </span>
                          </div>
                          <p className="mt-3 text-3xl font-black uppercase leading-none tracking-[-0.05em]">
                            {card.value}
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-5 text-black/68">
                            {card.meta}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-4 border-black bg-white p-5 text-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-black/45">
                    Entry point rapidi
                  </p>
                  <div className="mt-4 grid gap-3">
                    <button
                      onClick={() => {
                        playBlipSound();
                        setActiveTab('meme-base');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center justify-between border-4 border-black bg-cyan-400 px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.16em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    >
                      Esplora i template
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        playBlipSound();
                        setActiveTab('product-3d');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center justify-between border-4 border-black bg-yellow-400 px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.16em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    >
                      Vedi i supporti 3D
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    {onOpenCustomizer && (
                      <button
                        onClick={() => {
                          playBlipSound();
                          onOpenCustomizer();
                        }}
                        className={getSiteCtaClasses('create', 'md', 'w-full justify-between')}
                      >
                        <span>Crea un nuovo design</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hidden border-b-8 border-black bg-black px-6 py-10 text-white md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <div>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">
                      Archivio Pulse Board
                    </p>
                    <h2 className="mt-2 text-3xl font-black uppercase tracking-tighter md:text-4xl">
                      Dati reali, letti meglio
                    </h2>
                  </div>
                  <p className="hidden max-w-xs text-right font-mono text-xs text-white/45 md:block">
                    La hero racconta il prodotto.
                    Questa dashboard ti dice subito capacita, stato e direzione dell&apos;archivio.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {archiveDashboardCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="border-4 border-black bg-white p-4 text-black shadow-[8px_8px_0_0_rgba(255,255,255,0.08)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-black/50">
                            {card.label}
                          </p>
                          <span className={`inline-flex h-9 w-9 items-center justify-center border-2 border-black ${card.tone}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                        </div>
                        <p className="mt-4 text-4xl font-black uppercase leading-none tracking-[-0.05em]">
                          {card.value}
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-5 text-black/68">
                          {card.meta}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="border-4 border-white bg-[#111111] p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-green-400">
                    Creator leader
                  </p>
                  <p className="mt-3 text-3xl font-black uppercase tracking-tighter">
                    {topCreator ? `@${topCreator.name}` : 'Nessun leader'}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase text-white/35">Design</p>
                      <p className="mt-1 text-lg font-black">{topCreator?.designs ?? 0}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase text-white/35">Like</p>
                      <p className="mt-1 text-lg font-black">{topCreator?.likes ?? 0}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase text-white/35">Royalty</p>
                      <p className="mt-1 text-lg font-black">€{topCreator?.earnings.toFixed(0) ?? '0'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-4 border-black bg-cyan-400 p-5 text-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
                        Supporto più usato
                      </p>
                      <p className="mt-2 text-2xl font-black uppercase leading-[0.95] tracking-tighter">
                        {topProductBase.name}
                      </p>
                    </div>
                    <Box className="h-6 w-6 shrink-0" />
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-5 text-black/70">
                    {designCountPerProduct[topProductBase.id] ?? 0} design pubblicati e {totalLikesPerProduct[topProductBase.id] ?? 0} like aggregati su questo supporto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="sticky top-0 z-40 border-b-8 border-black bg-white">
          <div className="mx-auto flex max-w-7xl overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { playBlipSound(); setActiveTab(tab.id); }}
                  className={`relative flex shrink-0 items-center gap-2.5 border-l-4 px-6 py-5 font-mono text-[12px] font-black uppercase tracking-[0.12em] transition-all md:px-10 ${
                    isActive
                      ? `${tab.accentClass} ${tab.activeBg} text-black`
                      : 'border-l-transparent text-gray-400 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-black' : ''}`} />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-black ${
                    isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[4px] bg-black"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MEME BASE TAB ─────────────────────────────────────── */}
        {activeTab === 'meme-base' && (
          <section className="px-6 py-16 md:px-12">
            <div className="mx-auto max-w-7xl">

              {/* Section header */}
              <div className="mb-10 flex flex-col gap-2">
                <p className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Template Vault</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="text-4xl font-black uppercase tracking-tighter md:text-6xl leading-none">Template Meme</h2>
                  <p className="font-mono text-sm text-gray-500 sm:text-right">
                    Seleziona un template per vedere i remix<br className="hidden sm:block" /> e creare il tuo design.
                  </p>
                </div>
              </div>

              {/* Category filter bar */}
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <CategoryPill
                  label="Tutti"
                  colorClass="bg-black text-white border-black"
                  active={activeCategory === null}
                  onClick={() => setActiveCategory(null)}
                />
                {Object.entries(CATEGORY_COLORS).map(([key, cfg]) => (
                  <CategoryPill
                    key={key}
                    label={cfg.label}
                    colorClass={cfg.pill}
                    active={activeCategory === key}
                    onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                  />
                ))}
                <span className="ml-auto font-mono text-[11px] font-black uppercase tracking-[0.15em] text-gray-400">
                  {filteredMemeBases.length} risultati
                </span>
              </div>

              {/* Gallery */}
              <MemeBaseGallery
                memeBases={filteredMemeBases}
                designCountPerBase={designCountPerMemeBase}
                totalLikesPerBase={totalLikesPerMemeBase}
                selectedId={selectedMemeBaseId}
                onSelect={handleSelectMemeBase}
              />

            </div>
          </section>
        )}

        {/* ── PRODOTTI TAB ──────────────────────────────────────── */}
        {activeTab === 'product-3d' && (
          <section className="px-6 py-16 md:px-12">
            <div className="mx-auto max-w-7xl">

              {/* Section header */}
              <div className="mb-10 flex flex-col gap-2">
                <p className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Supporti Fisici</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="text-4xl font-black uppercase tracking-tighter md:text-6xl leading-none">Prodotti Base</h2>
                  <p className="font-mono text-sm text-gray-500 sm:text-right">
                    {BASE_PRODUCTS.length} supporti reali integrati<br className="hidden sm:block" /> con il customizer 3D e il checkout.
                  </p>
                </div>
              </div>

              <ProductBaseGallery
                products={BASE_PRODUCTS}
                designCountPerProduct={designCountPerProduct}
                totalLikesPerProduct={totalLikesPerProduct}
                selectedId={selectedBaseProductId}
                onSelect={handleSelectBaseProduct}
              />

            </div>
          </section>
        )}

        {/* ── TOP CREATOR TAB ───────────────────────────────────── */}
        {activeTab === 'top-creator' && (
          <section className="px-6 py-16 md:px-12">
            <div className="mx-auto max-w-7xl">

              {/* Section header */}
              <div className="mb-10 flex flex-col gap-2">
                <p className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Classifica Globale</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="text-4xl font-black uppercase tracking-tighter md:text-6xl leading-none">
                    Top Creator
                    <span className="ml-4 inline-flex items-center border-4 border-black bg-green-400 px-3 py-1 text-xl">
                      {topCreators.length}
                    </span>
                  </h2>
                  <p className="font-mono text-sm text-gray-500 sm:text-right">
                    Ordinati per like + royalty generate.<br className="hidden sm:block" /> Clicca per vedere il profilo completo.
                  </p>
                </div>
              </div>

              {topCreators.length > 0 ? (
                <>
                  {/* PODIUM: #2 | #1 | #3 */}
                  {topCreators.length >= 1 && (
                    <div className="mb-12">
                      <p className="mb-6 font-mono text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Podio</p>
                      <div className="grid grid-cols-3 items-end gap-4">
                        {/* Silver #2 */}
                        {topCreators[1] ? (
                          <PodiumCard
                            creator={topCreators[1]}
                            rank={2}
                            onClick={() => { if (topCreators[1]) handleSelectCreator(topCreators[1], 2); }}
                          />
                        ) : (
                          <div className="min-h-[240px] border-4 border-dashed border-black/20" />
                        )}
                        {/* Gold #1 — center, tallest */}
                        {topCreators[0] && (
                          <PodiumCard
                            creator={topCreators[0]}
                            rank={1}
                            onClick={() => { if (topCreators[0]) handleSelectCreator(topCreators[0], 1); }}
                          />
                        )}
                        {/* Bronze #3 */}
                        {topCreators[2] ? (
                          <PodiumCard
                            creator={topCreators[2]}
                            rank={3}
                            onClick={() => { if (topCreators[2]) handleSelectCreator(topCreators[2], 3); }}
                          />
                        ) : (
                          <div className="min-h-[220px] border-4 border-dashed border-black/20" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* List #4-8 */}
                  {topCreators.length > 3 && (
                    <div>
                      <p className="mb-4 font-mono text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Classifica completa</p>
                      <div className="border-4 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                        {topCreators.slice(3).map((creator, i) => (
                          <CreatorListRow
                            key={creator.authorId}
                            creator={creator}
                            rank={i + 4}
                            onClick={() => handleSelectCreator(creator, i + 4)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-6 border-4 border-dashed border-black bg-white py-24 text-center">
                  <Users className="h-12 w-12 opacity-20" />
                  <div>
                    <p className="font-mono text-sm font-black uppercase tracking-[0.2em] opacity-40">Nessun creator ancora</p>
                    <p className="mt-2 font-mono text-xs text-gray-400">La classifica si aggiorna con ogni design pubblicato.</p>
                  </div>
                  {onOpenCustomizer && (
                    <button
                      onClick={() => { playBlipSound(); onOpenCustomizer(); }}
                      className="border-4 border-black bg-green-400 px-6 py-3 font-mono text-xs font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    >
                      Sii il primo creator
                    </button>
                  )}
                </div>
              )}

              {/* Become a creator CTA */}
              {!user && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-12 border-4 border-black bg-black px-8 py-10 text-white shadow-[8px_8px_0_0_rgba(34,211,238,0.3)]"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-green-400">Diventa Creator</p>
                      <h3 className="mt-3 text-3xl font-black uppercase tracking-tighter md:text-4xl">
                        Pubblica. Vendi.<br />
                        <span className="text-cyan-400">Incassa royalty.</span>
                      </h3>
                      <p className="mt-3 font-mono text-sm text-gray-400">
                        Accedi con Google e inizia a guadagnare il {CREATOR_ROYALTY_RATE}% su ogni vendita del tuo design.
                      </p>
                    </div>
                    {onOpenCustomizer && (
                      <button
                        onClick={() => { playBlipSound(); onOpenCustomizer(); }}
                        className="shrink-0 border-4 border-cyan-400 bg-cyan-400 px-7 py-4 font-mono text-sm font-black uppercase text-black shadow-[6px_6px_0_0_rgba(34,211,238,0.4)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                      >
                        Inizia a creare
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

            </div>
          </section>
        )}

        {/* ── SEARCH RESULTS TAB ────────────────────────────────── */}
        {activeTab === 'search-results' && (
          <section className="px-6 py-16 md:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Risultati ricerca</p>
                  <h2 className="mt-2 text-4xl font-black uppercase tracking-tighter md:text-6xl">"{searchQuery}"</h2>
                </div>
                <div className="inline-flex items-center gap-2 border-4 border-black bg-white px-5 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <Search className="h-4 w-4" />
                  <span className="font-mono text-xs font-black uppercase tracking-[0.15em]">
                    {communitySearchResults.length} design trovati
                  </span>
                </div>
              </div>
              {communitySearchResults.length === 0 && (
                <div className="mb-8 flex flex-col gap-4 border-4 border-black bg-yellow-100 p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-black/55">Nessun match</p>
                    <p className="mt-2 max-w-2xl text-sm font-semibold text-black/75">
                      Prova con il nome di un creator, un prodotto base, una meme base oppure un tag presente nei design della community.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      playBlipSound();
                      setSearchQuery('');
                      setActiveTab('meme-base');
                    }}
                    className="shrink-0 border-4 border-black bg-white px-5 py-3 font-mono text-xs font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  >
                    Reset ricerca
                  </button>
                </div>
              )}
              <DesignGrid
                designs={communitySearchResults}
                isLoading={false}
                hasMore={false}
                onLoadMore={() => {}}
                onSelectDesign={handleSelectDesign}
                onLikeDesign={handleLikeDesign}
                onSelectAuthor={handleSelectAuthor}
                viewMode="meme-base"
                sortBy={communitySort}
                onSortChange={setCommunitySort}
              />
            </div>
          </section>
        )}

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <section className="border-t-8 border-black bg-black px-6 py-20 text-white md:px-12">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:gap-20">

            {/* Left: workflow steps */}
            <div>
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-green-400">Come funziona</p>
              <h3 className="mt-4 text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Da zero a design<br />
                <span className="text-cyan-400">acquistabile.</span>
              </h3>
              <div className="mt-10 flex flex-col gap-5">
                {[
                  { n: '01', title: 'Scegli il template',   desc: 'Sfoglia l\'archivio meme e trova la base giusta per la tua idea.' },
                  { n: '02', title: 'Customizza in 3D',     desc: 'Il customizer in tempo reale ti mostra il risultato finale prima di comprare.' },
                  { n: '03', title: 'Pubblica o acquista',  desc: 'Compralo subito o caricalo nella community per ricevere feedback e ordini.' },
                  { n: '04', title: `Royalty al ${CREATOR_ROYALTY_RATE}%`, desc: 'Ogni vendita del tuo design genera royalty dirette sul tuo profilo creator.' },
                ].map((step) => (
                  <div key={step.n} className="flex items-start gap-5 border-l-4 border-cyan-400 pl-5">
                    <span className="shrink-0 font-mono text-xs font-black text-cyan-400">{step.n}</span>
                    <div>
                      <p className="font-mono text-[11px] font-black uppercase tracking-[0.15em] text-white">{step.title}</p>
                      <p className="mt-1 font-mono text-sm leading-relaxed text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 3 large CTA cards */}
            <div className="flex flex-col justify-center gap-4">
              <button
                onClick={() => { playBlipSound(); setActiveTab('meme-base'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center justify-between border-4 border-cyan-400 bg-cyan-400 px-6 py-5 text-black shadow-[6px_6px_0_0_rgba(34,211,238,0.3)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <div className="flex items-center gap-3">
                  <Flame className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-black/50">Template Vault</p>
                    <p className="font-black uppercase">Sfoglia i meme</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>

              <button
                onClick={() => { playBlipSound(); setActiveTab('top-creator'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center justify-between border-4 border-yellow-400 bg-yellow-400 px-6 py-5 text-black shadow-[6px_6px_0_0_rgba(250,204,21,0.3)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-black/50">Classifica</p>
                    <p className="font-black uppercase">Top Creator</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>

              {onOpenCustomizer && (
                <button
                  onClick={() => { playBlipSound(); onOpenCustomizer(); }}
                  className={getSiteCtaClasses('create', 'lg', 'border-white w-full justify-between')}
                >
                  <div className="flex items-center gap-3">
                    <Wand2 className="h-5 w-5" />
                    <span>Crea il tuo design</span>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0" />
                </button>
              )}
            </div>

          </div>
        </section>

      </motion.div>
    </AnimatePresence>
  );
}
