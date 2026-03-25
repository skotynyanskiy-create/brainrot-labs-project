import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Clock3,
  DollarSign,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users,
  Wand2,
} from 'lucide-react';
import type { Product } from '../../types';
import { useProduct } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { CREATOR_ROYALTY_RATE, MEME_BASES } from '../../constants';
import { playBlipSound } from '../../utils/sounds';
import ProductGridSection from '../product/ProductGridSection';
import CommunityProductCard from '../product/CommunityProductCard';

interface CommunityPageProps {
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenCustomizer?: () => void;
}

type ActiveTab = 'community' | 'catalog';
type SortOption = 'popular' | 'recent' | 'sales' | 'earnings';
type CommunityTypeFilter = 'all' | 'wearable' | 'decor' | 'useless';

const COMMUNITY_FILTERS: Array<{ id: CommunityTypeFilter; label: string; color: string }> = [
  { id: 'all', label: 'Tutti i design', color: 'bg-white' },
  { id: 'wearable', label: 'Wearable', color: 'bg-cyan-400' },
  { id: 'decor', label: 'Decor', color: 'bg-yellow-400' },
  { id: 'useless', label: 'Accessori', color: 'bg-pink-500 text-white' },
];

const SORT_OPTIONS: Array<{ id: SortOption; label: string; icon: typeof Trophy; color: string }> = [
  { id: 'popular', label: 'Piu apprezzati', icon: Trophy, color: 'bg-yellow-400' },
  { id: 'recent', label: 'Piu recenti', icon: Clock3, color: 'bg-white' },
  { id: 'sales', label: 'Piu venduti', icon: ShoppingBag, color: 'bg-cyan-400' },
  { id: 'earnings', label: 'Piu royalty', icon: DollarSign, color: 'bg-green-400' },
];

const CATALOG_CATEGORIES = [
  { id: 'all', label: 'Tutto', color: 'bg-white' },
  { id: 'wearable', label: 'Wearable', color: 'bg-orange-400' },
  { id: 'useless', label: 'Accessori', color: 'bg-cyan-400' },
  { id: 'decor', label: 'Decor', color: 'bg-pink-400' },
] as const;

const PRODUCT_TYPE_META = {
  wearable: { label: 'Wearable Design', price: 34.9, color: 'bg-cyan-400' },
  decor: { label: 'Decor Design', price: 24.9, color: 'bg-yellow-400' },
  useless: { label: 'Accessory Design', price: 19.9, color: 'bg-pink-500' },
} as const;

const MEME_CATEGORY_META = {
  reaction: { label: 'Reaction Base', badge: 'bg-cyan-400' },
  format: { label: 'Format Base', badge: 'bg-yellow-400' },
  dank: { label: 'Dank Base', badge: 'bg-pink-500 text-white' },
  italian: { label: 'Italian Base', badge: 'bg-green-400' },
} as const;

const buildRarity = (likes: number, sales: number) => {
  if (likes > 700 || sales > 70) return 'Legendary';
  if (likes > 400 || sales > 35) return 'Epic';
  if (likes > 180 || sales > 12) return 'Rare';
  return 'Common';
};

export default function CommunityPage({ onBack: _onBack, onSelectProduct, onOpenCustomizer }: CommunityPageProps) {
  const { communityDesigns, filteredProducts, selectedCategory, setSelectedCategory } = useProduct();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('community');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CommunityTypeFilter>('all');

  const communityEntries = useMemo(() => {
    return communityDesigns.map((design, index) => {
      const productType = design.productType || 'wearable';
      const meta = PRODUCT_TYPE_META[productType];
      const memeBase = MEME_BASES[index % MEME_BASES.length];
      const memeMeta = MEME_CATEGORY_META[memeBase.category];
      const totalSales = design.totalSales || 0;
      const totalEarnings = design.totalEarnings || 0;
      const royaltyRate = design.royaltyRate || CREATOR_ROYALTY_RATE;
      const createdAtSeconds = typeof design.createdAt === 'object' && 'seconds' in design.createdAt ? design.createdAt.seconds : 0;

      const product: Product = {
        id: design.id,
        name: `Base meme ${memeBase.name}`,
        price: meta.price,
        image: memeBase.url,
        category: 'community',
        memeDescription: `${design.memeDescription} Base selezionata: ${memeBase.name}, usata dalla community per reinterpretazioni, remix e pubblicazioni ad alta leggibilità.`,
        rarity: buildRarity(design.likes, totalSales),
        color: meta.color,
        sizes: productType === 'wearable' ? ['S', 'M', 'L', 'XL', 'XXL'] : productType === 'decor' ? ['A4', 'A3', '50x70'] : ['Standard'],
        colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }],
        likes: design.likes,
        authorName: design.authorName,
      };

      return {
        id: design.id,
        design,
        product,
        productType,
        productTypeLabel: `${memeMeta.label} / ${meta.label}`,
        totalSales,
        totalEarnings,
        royaltyRate,
        createdAtSeconds,
        tags: [...new Set([...(design.tags || []), ...memeBase.tags, memeBase.category])],
        memeBase,
      };
    });
  }, [communityDesigns]);

  const filteredCommunityEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    let entries = [...communityEntries];
    if (typeFilter !== 'all') {
      entries = entries.filter((entry) => entry.productType === typeFilter);
    }

    if (normalizedQuery) {
      entries = entries.filter((entry) =>
        entry.product.name.toLowerCase().includes(normalizedQuery) ||
        entry.memeBase.name.toLowerCase().includes(normalizedQuery) ||
        entry.product.authorName?.toLowerCase().includes(normalizedQuery) ||
        entry.product.memeDescription.toLowerCase().includes(normalizedQuery) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      );
    }

    switch (sortBy) {
      case 'recent':
        entries.sort((a, b) => b.createdAtSeconds - a.createdAtSeconds);
        break;
      case 'sales':
        entries.sort((a, b) => b.totalSales - a.totalSales);
        break;
      case 'earnings':
        entries.sort((a, b) => b.totalEarnings - a.totalEarnings);
        break;
      case 'popular':
      default:
        entries.sort((a, b) => (b.product.likes || 0) - (a.product.likes || 0));
        break;
    }

    return entries;
  }, [communityEntries, query, sortBy, typeFilter]);

  const featuredEntry = filteredCommunityEntries[0];
  const editorPicks = filteredCommunityEntries.slice(1, 4);
  const gridEntries = filteredCommunityEntries.slice(4);
  const heroMemeBases = MEME_BASES.slice(0, 4);

  const totalStats = useMemo(() => ({
    designs: communityDesigns.length,
    likes: communityDesigns.reduce((acc, design) => acc + design.likes, 0),
    sales: communityDesigns.reduce((acc, design) => acc + (design.totalSales || 0), 0),
    royalties: communityDesigns.reduce((acc, design) => acc + (design.totalEarnings || 0), 0),
  }), [communityDesigns]);

  const topCreators = useMemo(() => {
    const creatorMap = new Map<string, { name: string; designs: number; likes: number; earnings: number }>();
    communityDesigns.forEach((design) => {
      const current = creatorMap.get(design.authorId) || { name: design.authorName, designs: 0, likes: 0, earnings: 0 };
      current.designs += 1;
      current.likes += design.likes;
      current.earnings += design.totalEarnings || 0;
      creatorMap.set(design.authorId, current);
    });

    return Array.from(creatorMap.values()).sort((a, b) => (b.earnings + b.likes) - (a.earnings + a.likes)).slice(0, 4);
  }, [communityDesigns]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#f3f1ec]">
      <section className="border-b-8 border-black bg-white px-6 pb-16 pt-36 md:px-12 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-8 inline-flex items-center gap-3 border-4 border-black bg-black px-4 py-2 text-white shadow-[6px_6px_0_0_rgba(34,211,238,1)]">
                <Users className="h-4 w-4" />
                <span className="font-mono text-xs font-black uppercase tracking-[0.3em]">Base Meme Vault</span>
              </div>
              <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tighter md:text-8xl">
                Basi meme
                <br />
                <span className="mt-3 inline-block rotate-[-1deg] border-4 border-black bg-cyan-400 px-6 py-2 shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
                  della community
                </span>
              </h1>
              <p className="mt-8 max-w-2xl border-l-8 border-black pl-6 text-lg font-medium leading-relaxed text-gray-800 md:text-2xl">
                Qui non stai sfogliando mockup casuali: stai entrando nell'archivio delle basi meme che la community usa per costruire design, drop e remix pubblicabili.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                {onOpenCustomizer && (
                  <button
                    onClick={() => { playBlipSound(); onOpenCustomizer(); }}
                    className="flex items-center justify-center gap-3 border-4 border-black bg-pink-500 px-7 py-4 text-lg font-black uppercase text-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-black hover:shadow-none"
                  >
                    <Wand2 className="h-5 w-5" />
                    Apri il customizer
                  </button>
                )}
                <div className="flex items-center gap-3 border-4 border-black bg-white px-6 py-4 font-mono text-sm font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  <DollarSign className="h-4 w-4" />
                  Royalty creator: {CREATOR_ROYALTY_RATE}%
                </div>
              </div>
            </div>

            <div className="grid gap-4 self-start">
              <div className="grid grid-cols-2 gap-4">
                {heroMemeBases.map((base, index) => (
                  <article key={base.id} className={`overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] ${index === 1 ? 'rotate-[1deg]' : index === 2 ? '-rotate-[1deg]' : ''}`}>
                    <div className="relative">
                      <img src={base.url} alt={base.name} className="aspect-[4/3] w-full object-cover" />
                      <div className={`absolute left-3 top-3 border-2 border-black px-2 py-1 text-[10px] font-black uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)] ${MEME_CATEGORY_META[base.category].badge}`}>
                        {MEME_CATEGORY_META[base.category].label}
                      </div>
                    </div>
                    <div className="border-t-4 border-black p-3">
                      <p className="text-sm font-black uppercase">{base.name}</p>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-600">
                        {base.usageCount} utilizzi community
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border-4 border-black bg-yellow-400 p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  <p className="font-mono text-xs font-black uppercase tracking-[0.2em]">Basi tracciate</p>
                  <p className="mt-3 text-4xl font-black">{MEME_BASES.length}</p>
                </div>
                <div className="border-4 border-black bg-pink-500 p-5 text-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  <p className="font-mono text-xs font-black uppercase tracking-[0.2em]">Like totali</p>
                  <p className="mt-3 text-4xl font-black">{totalStats.likes}</p>
                </div>
                <div className="border-4 border-black bg-white p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  <p className="font-mono text-xs font-black uppercase tracking-[0.2em]">Design derivati</p>
                  <p className="mt-3 text-4xl font-black">{totalStats.designs}</p>
                </div>
                <div className="border-4 border-black bg-green-400 p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  <p className="font-mono text-xs font-black uppercase tracking-[0.2em]">Royalty registrate</p>
                  <p className="mt-3 text-4xl font-black">EUR {totalStats.royalties.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[92px] z-20 bg-transparent px-4 py-4 md:top-[104px] md:px-6 lg:top-[112px] xl:top-[120px]">
        <div className="mx-auto flex max-w-5xl overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:border-6 md:shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
          <button
            onClick={() => { playBlipSound(); setActiveTab('community'); }}
            className={`flex flex-1 items-center justify-center gap-2 border-r-4 border-black px-4 py-3 text-sm font-black uppercase transition-all md:gap-3 md:px-6 md:py-4 md:text-base ${activeTab === 'community' ? 'bg-cyan-400 text-black' : 'bg-white text-black hover:bg-[#f5f5f5]'}`}
          >
            <Users className="h-4 w-4 md:h-5 md:w-5" />
            Community
          </button>
          <button
            onClick={() => { playBlipSound(); setActiveTab('catalog'); }}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-black uppercase transition-all md:gap-3 md:px-6 md:py-4 md:text-base ${activeTab === 'catalog' ? 'bg-yellow-400 text-black' : 'bg-white text-black hover:bg-[#f5f5f5]'}`}
          >
            <Package className="h-4 w-4 md:h-5 md:w-5" />
            Catalogo base
          </button>
        </div>
      </div>

      {activeTab === 'community' && (
        <>
          <section className="border-b-8 border-black bg-[#f8f6f1] px-6 py-8 md:px-12">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <label className="relative block">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cerca basi meme, creator o tag"
                    className="w-full border-4 border-black bg-white py-4 pl-12 pr-4 font-mono text-sm font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,1)] focus:outline-none"
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => { playBlipSound(); setSortBy(option.id); }}
                      className={`flex items-center gap-2 border-4 border-black px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none ${sortBy === option.id ? option.color : 'bg-white'}`}
                    >
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {COMMUNITY_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => { playBlipSound(); setTypeFilter(filter.id); }}
                    className={`border-4 border-black px-4 py-2 text-sm font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none ${typeFilter === filter.id ? filter.color : 'bg-white'}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {filteredCommunityEntries.length === 0 ? (
            <section className="px-6 py-24 md:px-12">
              <div className="mx-auto max-w-7xl border-8 border-dashed border-black bg-white p-16 text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
                <Sparkles className="mx-auto h-16 w-16" />
                <h2 className="mt-6 text-4xl font-black uppercase">Nessuna base trovata</h2>
                <p className="mx-auto mt-4 max-w-2xl font-mono text-sm uppercase leading-relaxed text-gray-600">
                  Modifica ricerca o filtro per vedere altre basi meme della community. La pagina ora privilegia template di partenza, remix pubblicati e segnali reali di utilizzo.
                </p>
                {onOpenCustomizer && (
                  <button
                    onClick={() => { playBlipSound(); onOpenCustomizer(); }}
                    className="mt-8 border-4 border-black bg-pink-500 px-6 py-3 font-black uppercase text-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:shadow-none"
                  >
                    Crea il tuo design →
                  </button>
                )}
              </div>
            </section>
          ) : (
            <>
              {featuredEntry && (
                <section className="px-6 py-16 md:px-12">
                  <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-center gap-6">
                      <h2 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">
                        Base meme in
                        <span className="ml-4 inline-block rotate-[1deg] border-4 border-black bg-yellow-400 px-5 py-1 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                          spotlight
                        </span>
                      </h2>
                      <div className="h-1 flex-1 bg-black" />
                    </div>

                    <CommunityProductCard
                      product={featuredEntry.product}
                      tags={featuredEntry.tags}
                      sales={featuredEntry.totalSales}
                      earnings={featuredEntry.totalEarnings}
                      royaltyRate={featuredEntry.royaltyRate}
                      productTypeLabel={featuredEntry.productTypeLabel}
                      featured={true}
                      badge="Spotlight"
                      onSelect={onSelectProduct}
                    />
                  </div>
                </section>
              )}

              {editorPicks.length > 0 && (
                <section className="border-y-8 border-black bg-white px-6 py-16 md:px-12">
                  <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-center justify-between gap-6">
                      <div>
                        <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">Editor picks</p>
                        <h3 className="mt-2 text-3xl font-black uppercase tracking-tighter md:text-5xl">Basi meme da cui la community parte davvero</h3>
                      </div>
                      <div className="hidden items-center gap-2 border-4 border-black bg-black px-4 py-2 font-mono text-xs font-black uppercase text-white lg:flex">
                        <ArrowUpRight className="h-4 w-4" />
                        Base, remix, performance
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                      {editorPicks.map((entry, index) => (
                        <CommunityProductCard
                          key={entry.id}
                          product={entry.product}
                          tags={entry.tags}
                          sales={entry.totalSales}
                          earnings={entry.totalEarnings}
                          royaltyRate={entry.royaltyRate}
                          productTypeLabel={entry.productTypeLabel}
                          badge={`Pick ${index + 1}`}
                          onSelect={onSelectProduct}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section className="px-6 py-16 md:px-12">
                <div className="mx-auto max-w-7xl">
                  <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">Archivio filtrato</p>
                      <h3 className="mt-2 text-4xl font-black uppercase tracking-tighter md:text-6xl">Archivio completo delle basi meme</h3>
                    </div>
                    <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">
                      {filteredCommunityEntries.length} schede base dopo filtri e ordinamento
                    </p>
                  </div>

                  {gridEntries.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {gridEntries.map((entry) => (
                        <CommunityProductCard
                          key={entry.id}
                          product={entry.product}
                          tags={entry.tags}
                          sales={entry.totalSales}
                          earnings={entry.totalEarnings}
                          royaltyRate={entry.royaltyRate}
                          productTypeLabel={entry.productTypeLabel}
                          onSelect={onSelectProduct}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="border-8 border-dashed border-black bg-white p-12 text-center shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
                      <p className="font-mono text-sm font-black uppercase tracking-[0.25em] text-gray-500">Nessun'altra base oltre lo spotlight</p>
                    </div>
                  )}
                </div>
              </section>

              {topCreators.length > 0 && (
                <section className="border-y-8 border-black bg-[#111111] px-6 py-16 text-white md:px-12">
                  <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-center gap-6">
                      <h3 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">
                        Creator
                        <span className="ml-4 inline-block rotate-[-1deg] border-4 border-white bg-green-400 px-5 py-1 text-black shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
                          che usano le basi
                        </span>
                      </h3>
                      <div className="h-1 flex-1 bg-white/20" />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                      {topCreators.map((creator, index) => (
                        <div key={creator.name} className="border-4 border-white bg-white p-5 text-black shadow-[8px_8px_0_0_rgba(34,211,238,1)]">
                          <div className="flex items-start justify-between">
                            <div className="flex h-14 w-14 items-center justify-center border-4 border-black bg-black text-2xl font-black text-cyan-400">
                              {creator.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="border-2 border-black bg-yellow-400 px-2 py-1 text-xs font-black uppercase">
                              #{index + 1}
                            </div>
                          </div>
                          <p className="mt-4 text-lg font-black uppercase">@{creator.name}</p>
                          <div className="mt-4 space-y-2 font-mono text-xs uppercase">
                            <div className="flex justify-between border-2 border-black px-3 py-2"><span>Design</span><strong>{creator.designs}</strong></div>
                            <div className="flex justify-between border-2 border-black px-3 py-2"><span>Like</span><strong>{creator.likes}</strong></div>
                            <div className="flex justify-between border-2 border-black px-3 py-2"><span>Royalty</span><strong>EUR {creator.earnings.toFixed(2)}</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section className="bg-black px-6 py-16 text-white md:px-12">
                <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-green-400">Creator workflow</p>
                    <h3 className="mt-4 text-4xl font-black uppercase tracking-tighter md:text-6xl">
                      Parti da una base meme,
                      <br />
                      pubblica e scala nella community
                    </h3>
                    <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-gray-300">
                      La community ora mette al centro i template che generano più remix: base riconoscibile, adattamento sul supporto corretto, vendita attivata e royalty leggibili.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {[
                      '1. Scegli una base meme dal vault community.',
                      '2. Adattala nel customizer al supporto corretto.',
                      `3. Pubblica il remix e attiva il ${CREATOR_ROYALTY_RATE}% di royalty.`,
                      '4. Ogni vendita aggiorna ranking, card e wallet creator.',
                    ].map((line) => (
                      <div key={line} className="border-4 border-white bg-white px-5 py-4 font-mono text-sm font-black uppercase text-black shadow-[8px_8px_0_0_rgba(34,211,238,1)]">
                        {line}
                      </div>
                    ))}
                    {!user && (
                      <div className="border-4 border-white bg-yellow-400 px-5 py-4 font-mono text-sm font-black uppercase text-black shadow-[8px_8px_0_0_rgba(255,255,255,0.35)]">
                        Login richiesto per pubblicare nuovi design.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </>
      )}

      {activeTab === 'catalog' && (
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
          <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">Base catalog</p>
              <h2 className="mt-3 text-5xl font-black uppercase tracking-tighter md:text-7xl">
                Supporti
                <span className="ml-4 inline-block rotate-[1deg] border-4 border-black bg-yellow-400 px-5 py-2 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  di partenza
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {CATALOG_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { playBlipSound(); setSelectedCategory(cat.id); }}
                  className={`border-4 border-black px-5 py-3 text-sm font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none ${selectedCategory === cat.id ? cat.color : 'bg-white'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <ProductGridSection
            products={filteredProducts}
            onSelectProduct={onSelectProduct}
            onResetFilters={() => setSelectedCategory('all')}
          />
        </section>
      )}
    </motion.div>
  );
}
