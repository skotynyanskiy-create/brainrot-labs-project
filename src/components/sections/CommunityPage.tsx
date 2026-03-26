import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Flame, Search, Shirt, Trophy, Users, Wand2 } from 'lucide-react';

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

  useEffect(() => {
    if (communitySearchResults.length > 0) {
      setDetailView(null);
      setActiveTab('search-results');
    } else if (activeTab === 'search-results') {
      setActiveTab('meme-base');
    }
  }, [activeTab, communitySearchResults.length]);

  const totalStats = useMemo(() => ({
    designs: communityDesigns.length,
    likes: communityDesigns.reduce((acc, design) => acc + design.likes, 0),
    sales: communityDesigns.reduce((acc, design) => acc + (design.totalSales ?? 0), 0),
    royalties: communityDesigns.reduce((acc, design) => acc + (design.totalEarnings ?? 0), 0),
  }), [communityDesigns]);

  const topCreatorsMap = useMemo(() => {
    const map = new Map<string, { authorId: string; name: string; designs: number; likes: number; earnings: number }>();
    communityDesigns.forEach((design) => {
      const current = map.get(design.authorId) ?? { authorId: design.authorId, name: design.authorName, designs: 0, likes: 0, earnings: 0 };
      current.designs += 1;
      current.likes += design.likes;
      current.earnings += design.totalEarnings ?? 0;
      map.set(design.authorId, current);
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
    communityDesigns.forEach((design) => {
      if (design.memeBaseId) counts[design.memeBaseId] = (counts[design.memeBaseId] ?? 0) + 1;
    });
    return counts;
  }, [communityDesigns]);

  const totalLikesPerMemeBase = useMemo(() => {
    const counts: Record<string, number> = {};
    communityDesigns.forEach((design) => {
      if (design.memeBaseId) counts[design.memeBaseId] = (counts[design.memeBaseId] ?? 0) + design.likes;
    });
    return counts;
  }, [communityDesigns]);

  const designCountPerProduct = useMemo(() => {
    const counts: Record<string, number> = {};
    communityDesigns.forEach((design) => {
      if (design.baseProductId) counts[design.baseProductId] = (counts[design.baseProductId] ?? 0) + 1;
    });
    return counts;
  }, [communityDesigns]);

  const totalLikesPerProduct = useMemo(() => {
    const counts: Record<string, number> = {};
    communityDesigns.forEach((design) => {
      if (design.baseProductId) counts[design.baseProductId] = (counts[design.baseProductId] ?? 0) + design.likes;
    });
    return counts;
  }, [communityDesigns]);

  const creatorDesigns = useMemo(() => {
    if (detailView?.type !== 'creator') return [];
    return communityDesigns.filter((design) => design.authorId === detailView.data.authorId);
  }, [communityDesigns, detailView]);

  const currentDetailTotalCount = useMemo(() => {
    if (detailView?.type === 'meme') return designCountPerMemeBase[detailView.data.id] ?? 0;
    if (detailView?.type === 'product') return designCountPerProduct[detailView.data.id] ?? 0;
    return 0;
  }, [detailView, designCountPerMemeBase, designCountPerProduct]);

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

  const handleSelectCreator = (creator: (typeof topCreators)[number], rank: number) => {
    playBlipSound();
    setDetailView({
      type: 'creator',
      data: {
        authorId: creator.authorId,
        name: creator.name,
        designs: creator.designs,
        likes: creator.likes,
        earnings: creator.earnings,
        rank,
      },
    });
  };

  const handleBack = () => {
    setDetailView(null);
    setSelectedMemeBaseId(null);
    setSelectedBaseProductId(null);
  };

  const handleSelectDesign = (design: CommunityDesign) => {
    onSelectProduct(designToProduct(design));
  };

  const handleLikeDesign = (designId: string, delta: 1 | -1) => {
    void likeDesign(designId, delta);
  };

  const handleOpenCustomizerFromDetail = () => {
    if (detailView?.type === 'meme' && onOpenCustomizerWithMeme) {
      onOpenCustomizerWithMeme(detailView.data);
      return;
    }
    if (detailView?.type === 'product' && onOpenCustomizerWithProduct) {
      onOpenCustomizerWithProduct(detailView.data.id);
      return;
    }
    setDetailView(null);
    onOpenCustomizer?.();
  };

  const handleSelectAuthor = (authorId: string, authorName: string) => {
    playBlipSound();
    const existing = Array.from(topCreatorsMap.values()).find((creator) => creator.authorId === authorId);
    const rank = existing ? topCreators.findIndex((creator) => creator.authorId === authorId) + 1 : topCreators.length + 1;
    setDetailView({
      type: 'creator',
      data: {
        authorId,
        name: authorName,
        designs: existing?.designs ?? 0,
        likes: existing?.likes ?? 0,
        earnings: existing?.earnings ?? 0,
        rank,
      },
    });
  };

  const handleSelectMemeBaseById = (memeBaseId: string) => {
    const meme = MEME_BASES.find((item) => item.id === memeBaseId);
    if (meme) handleSelectMemeBase(meme);
  };

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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="community-listing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-[#f4f0e8]"
      >
        <section className="border-b-8 border-black bg-black px-6 pb-16 pt-28 text-white md:px-12 md:pb-20">
          <div className="mx-auto grid max-w-7xl gap-12 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.3em] text-cyan-300">Brainrot creator archive</p>
              <h1 className="mt-6 text-6xl font-black uppercase leading-[0.88] tracking-tighter md:text-8xl">
                Meme base,
                <br />
                supporti fisici
                <br />
                e creator veri
              </h1>
              <p className="mt-8 max-w-2xl border-l-8 border-cyan-400 pl-6 text-lg font-medium leading-relaxed text-gray-200 md:text-2xl">
                La community non e un feed casuale. Parti da una base meme o da un supporto vendibile, apri il customizer giusto e pubblica solo design acquistabili davvero.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => { playBlipSound(); setActiveTab('meme-base'); document.getElementById('community-workbench')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className={getSiteCtaClasses('archive', 'lg', 'border-white shadow-[8px_8px_0_0_rgba(255,255,255,0.18)]')}
                >
                  <Flame className="h-5 w-5" />
                  Archivio Digitale
                </button>
                {onOpenCustomizer && (
                  <button
                    onClick={() => { playBlipSound(); onOpenCustomizer(); }}
                    className={getSiteCtaClasses('create', 'lg', 'border-white shadow-[8px_8px_0_0_rgba(255,255,255,0.18)]')}
                  >
                    <Wand2 className="h-5 w-5" />
                    Crea il tuo design
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-3 self-start sm:grid-cols-2">
              {[
                { label: 'Meme base', value: MEME_BASES.length, tone: 'bg-yellow-400 text-black' },
                { label: 'Design pubblicati', value: totalStats.designs, tone: 'bg-white text-black' },
                { label: 'Vendite attivate', value: totalStats.sales, tone: 'bg-pink-500 text-white' },
                { label: 'Royalty creator', value: `${CREATOR_ROYALTY_RATE}%`, tone: 'bg-green-400 text-black' },
              ].map((item) => (
                <div key={item.label} className={`border-4 border-white p-5 shadow-[8px_8px_0_0_rgba(255,255,255,0.14)] ${item.tone}`}>
                  <p className="font-mono text-xs font-black uppercase tracking-[0.2em]">{item.label}</p>
                  <p className="mt-4 text-4xl font-black">{item.value}</p>
                </div>
              ))}

              <div className="border-4 border-white bg-black p-5 text-white sm:col-span-2">
                <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Regola del vault</p>
                <p className="mt-3 max-w-xl font-mono text-sm leading-relaxed text-gray-300">
                  Un design community ha valore solo se resta collegato a draft, variante, creator, royalty e checkout reale. Tutta la struttura qui parte da questa regola.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="community-workbench" className="border-b-8 border-black bg-white px-6 py-8 md:px-12">
          <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">Workbench</p>
              <h2 className="mt-4 text-4xl font-black uppercase tracking-tighter md:text-6xl">
                Tre ingressi,
                <br />
                un flusso unico
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  id: 'meme-base' as const,
                  title: 'Base meme',
                  text: 'Apri le basi che stanno gia generando remix, design pubblicati e un contesto chiaro da leggere.',
                  icon: Flame,
                  tone: 'bg-cyan-400',
                },
                {
                  id: 'product-3d' as const,
                  title: 'Supporti',
                  text: 'Lavora sui tre supporti reali gia disponibili: t-shirt, iPhone case e poster premium.',
                  icon: Shirt,
                  tone: 'bg-yellow-400',
                },
                {
                  id: 'top-creator' as const,
                  title: 'Creator',
                  text: 'Controlla chi pubblica con continuita, converte meglio e costruisce presenza nel catalogo.',
                  icon: Trophy,
                  tone: 'bg-green-400',
                },
              ].map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => { playBlipSound(); setActiveTab(entry.id); }}
                  className={`border-4 border-black p-5 text-left transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                    activeTab === entry.id ? `${entry.tone} shadow-none translate-x-1 translate-y-1` : 'bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]'
                  }`}
                >
                  <entry.icon className="h-6 w-6" />
                  <p className="mt-4 text-xl font-black uppercase">{entry.title}</p>
                  <p className="mt-3 font-mono text-xs uppercase leading-relaxed">{entry.text}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {activeTab === 'meme-base' && (
          <section className="px-6 py-16 md:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">Archive view</p>
                  <h2 className="mt-3 text-4xl font-black uppercase tracking-tighter md:text-6xl">Template base e contesto community</h2>
                </div>
                <p className="max-w-xl font-mono text-sm leading-relaxed text-gray-600">
                  Ogni base meme porta con se volume, like e remix. Qui scegli la partenza narrativa prima ancora del prodotto.
                </p>
              </div>

              <MemeBaseGallery
                memeBases={MEME_BASES}
                designCountPerBase={designCountPerMemeBase}
                totalLikesPerBase={totalLikesPerMemeBase}
                selectedId={selectedMemeBaseId}
                onSelect={handleSelectMemeBase}
              />
            </div>
          </section>
        )}

        {activeTab === 'product-3d' && (
          <section className="px-6 py-16 md:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">Support view</p>
                  <h2 className="mt-3 text-4xl font-black uppercase tracking-tighter md:text-6xl">I tre supporti base gia pronti a catalogo</h2>
                </div>
                <p className="max-w-xl font-mono text-sm leading-relaxed text-gray-600">
                  Qui non vedi placeholder o immagini stock: entri direttamente nei modelli base che il sistema usa davvero per customizer, catalogo e checkout.
                </p>
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

        {activeTab === 'top-creator' && (
          <section className="px-6 py-16 md:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">Creator ranking</p>
                  <h2 className="mt-3 text-4xl font-black uppercase tracking-tighter md:text-6xl">Chi sta muovendo il vault</h2>
                </div>
                <p className="max-w-xl font-mono text-sm leading-relaxed text-gray-600">
                  Ranking basato su design pubblicati, like e royalty attivate. Il creator profile non e decorativo: collega autore, catalogo e conversione.
                </p>
              </div>

              <div className="border-4 border-black bg-white shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
                {topCreators.length > 0 ? (
                  <div className="divide-y-4 divide-black">
                    {topCreators.map((creator, index) => (
                      <button
                        key={creator.authorId}
                        onClick={() => handleSelectCreator(creator, index + 1)}
                        className="grid w-full gap-4 px-5 py-5 text-left transition-colors hover:bg-yellow-50 md:grid-cols-[120px_1fr_320px]"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-black uppercase text-gray-300">#{index + 1}</span>
                          <span className="flex h-14 w-14 items-center justify-center border-4 border-black bg-black text-2xl font-black uppercase text-cyan-300">
                            {creator.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Creator</p>
                          <p className="mt-2 text-3xl font-black uppercase tracking-tighter">@{creator.name}</p>
                        </div>
                        <div className="grid gap-2 md:grid-cols-3">
                          <div className="border-2 border-black bg-white px-3 py-3">
                            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500">Design</p>
                            <p className="mt-2 font-black">{creator.designs}</p>
                          </div>
                          <div className="border-2 border-black bg-white px-3 py-3">
                            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500">Like</p>
                            <p className="mt-2 font-black">{creator.likes}</p>
                          </div>
                          <div className="border-2 border-black bg-white px-3 py-3">
                            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500">Royalty</p>
                            <p className="mt-2 font-black">EUR {creator.earnings.toFixed(0)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center">
                    <Users className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-4 font-mono text-sm font-black uppercase tracking-widest opacity-50">Nessun creator ancora</p>
                  </div>
                )}
              </div>

              {!user && (
                <div className="mt-10 border-4 border-black bg-black p-8 text-white shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
                  <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Creator access</p>
                  <h3 className="mt-3 text-3xl font-black uppercase tracking-tighter">Fai login per pubblicare e attivare royalty</h3>
                  <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-gray-300">
                    Il funnel community e collegato all'account: draft, publish, ordini e payout passano tutti dallo stesso profilo.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'search-results' && (
          <section className="px-6 py-16 md:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">Search result</p>
                  <h2 className="mt-3 text-4xl font-black uppercase tracking-tighter md:text-6xl">
                    Risultati per "{searchQuery}"
                  </h2>
                </div>
                <div className="flex items-center gap-3 border-4 border-black bg-white px-4 py-3 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <Search className="h-5 w-5" />
                  <p className="font-mono text-xs font-black uppercase tracking-[0.15em]">{communitySearchResults.length} design trovati</p>
                </div>
              </div>

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

        <section className="border-t-8 border-black bg-black px-6 py-16 text-white md:px-12">
          <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-green-400">Workflow creator</p>
              <h3 className="mt-4 text-4xl font-black uppercase tracking-tighter md:text-6xl">
                Parti da una base,
                <br />
                apri il supporto giusto,
                <br />
                pubblica con senso
              </h3>
              <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-gray-300">
                Il sistema community e costruito per far combaciare editor, catalogo, profilo creator e checkout reale. Niente design scollegati, niente publish vuoti.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                '1. Scegli una base meme o un supporto dal vault.',
                '2. Apri il customizer con il renderer corretto per quel prodotto.',
                '3. Salva il draft, aggiungilo al carrello o pubblicalo nella community.',
                `4. Ogni vendita valida attiva il ${CREATOR_ROYALTY_RATE}% di royalty creator.`,
              ].map((line) => (
                <div key={line} className="border-4 border-white bg-white px-5 py-4 font-mono text-sm font-black uppercase text-black shadow-[8px_8px_0_0_rgba(34,211,238,1)]">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t-8 border-black bg-white px-6 py-12 md:px-12">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">Next action</p>
              <h3 className="mt-3 text-4xl font-black uppercase tracking-tighter">Entra nel funnel giusto</h3>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => { playBlipSound(); setActiveTab('meme-base'); }}
                className="flex items-center justify-center gap-3 border-4 border-black bg-white px-6 py-4 text-sm font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                Sfoglia le basi
                <ArrowRight className="h-4 w-4" />
              </button>
              {onOpenCustomizer && (
                <button
                  onClick={() => { playBlipSound(); onOpenCustomizer(); }}
                  className={getSiteCtaClasses('create', 'md')}
                >
                  Crea il tuo design
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => { playBlipSound(); setActiveTab('top-creator'); }}
                className="flex items-center justify-center gap-3 border-4 border-black bg-yellow-400 px-6 py-4 text-sm font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                Leggi i creator
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </motion.div>
    </AnimatePresence>
  );
}
