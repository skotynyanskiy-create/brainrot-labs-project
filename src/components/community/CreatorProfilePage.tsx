import { ArrowLeft, ChevronRight, ExternalLink, Heart, ShoppingBag, Trophy, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { CommunityDesign, CreatorInfo } from '../../types';
import type { CommunitySortOption } from '../../context/ProductContext';
import { getSiteCtaClasses } from '../../styles/siteCta';
import DesignGrid from './DesignGrid';

interface CreatorProfilePageProps {
  creator: CreatorInfo;
  designs: CommunityDesign[];
  isLoading: boolean;
  sortBy: CommunitySortOption;
  onSortChange: (sort: CommunitySortOption) => void;
  onSelectDesign: (design: CommunityDesign) => void;
  onLikeDesign?: (designId: string, delta: 1 | -1) => void;
  onSelectAuthor?: (authorId: string, authorName: string) => void;
  onSelectMemeBase?: (memeBaseId: string, memeBaseName: string) => void;
  onOpenCustomizer?: () => void;
  onBack: () => void;
}

const RANK_COLORS: Record<number, string> = {
  1: 'bg-yellow-400',
  2: 'bg-gray-200',
  3: 'bg-orange-300',
};

const RANK_LABELS: Record<number, string> = {
  1: 'Creator #1 — leader della community',
  2: 'Creator #2 — sfida il primo posto',
  3: 'Creator #3 — sul podio',
};

export default function CreatorProfilePage({
  creator,
  designs,
  isLoading,
  sortBy,
  onSortChange,
  onSelectDesign,
  onLikeDesign,
  onSelectAuthor,
  onSelectMemeBase,
  onOpenCustomizer,
  onBack,
}: CreatorProfilePageProps) {
  const rankColor = RANK_COLORS[creator.rank] ?? 'bg-white';
  // Most-used meme base by this creator
  const topMemeBase = (() => {
    const counts = new Map<string, { id: string; name: string; count: number }>();
    designs.forEach((d) => {
      if (d.memeBaseId && d.memeBaseName) {
        const cur = counts.get(d.memeBaseId) ?? { id: d.memeBaseId, name: d.memeBaseName, count: 0 };
        cur.count += 1;
        counts.set(d.memeBaseId, cur);
      }
    });
    let best: { id: string; name: string; count: number } | undefined;
    counts.forEach((v) => { if (!best || v.count > best.count) best = v; });
    return best ?? null;
  })();
  const totalSales = designs.reduce((acc, d) => acc + (d.totalSales ?? 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      className="min-h-screen bg-[#f3f1ec]"
    >
      {/* ── Breadcrumb nav ───────────────────────────────────────────────────── */}
      <div className="border-b-4 border-black bg-white px-6 py-4 md:px-12">
        <div className="flex items-center gap-2 font-mono text-xs font-black uppercase">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 border-4 border-black bg-white px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Archivio Digitale
          </button>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-400">Top Creator</span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="border-4 border-black bg-green-400 px-3 py-1.5">@{creator.name}</span>
        </div>
      </div>

      {/* ── Hero / Profile banner ─────────────────────────────────────────────── */}
      <section className="border-b-8 border-black bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr_auto]">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 lg:items-start">
              <div className="flex h-28 w-28 items-center justify-center border-4 border-cyan-400 bg-black text-5xl font-black text-cyan-400 md:h-36 md:w-36 md:text-6xl">
                {creator.name.charAt(0).toUpperCase()}
              </div>
              <div className={`border-2 border-black px-3 py-1 font-mono text-xs font-black uppercase ${rankColor} text-black`}>
                #{creator.rank} in classifica
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <p className="font-mono text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Creator</p>
              <h1 className="mt-2 text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-7xl">
                @{creator.name}
              </h1>
              {topMemeBase && (
                <p className="mt-4 font-mono text-sm text-gray-400">
                  Base meme preferita:{' '}
                  {onSelectMemeBase ? (
                    <button
                      onClick={() => onSelectMemeBase(topMemeBase.id, topMemeBase.name)}
                      className="text-white underline decoration-cyan-400 underline-offset-4 transition-colors hover:text-cyan-400"
                    >
                      {topMemeBase.name}
                      <ExternalLink className="ml-1 inline h-3 w-3" />
                    </button>
                  ) : (
                    <span className="text-white">{topMemeBase.name}</span>
                  )}
                </p>
              )}

              {/* Stats bar */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="border-2 border-white/20 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <p className="font-mono text-[10px] font-black uppercase text-gray-400">Design</p>
                  </div>
                  <p className="text-3xl font-black">{creator.designs}</p>
                </div>
                <div className="border-2 border-white/20 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-400" />
                    <p className="font-mono text-[10px] font-black uppercase text-gray-400">Like</p>
                  </div>
                  <p className="text-3xl font-black">{creator.likes}</p>
                </div>
                <div className="border-2 border-white/20 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-green-400" />
                    <p className="font-mono text-[10px] font-black uppercase text-gray-400">Vendite</p>
                  </div>
                  <p className="text-3xl font-black">{totalSales}</p>
                </div>
                <div className="border-2 border-cyan-400/30 bg-cyan-400/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-mono text-[10px] text-cyan-400">€</span>
                    <p className="font-mono text-[10px] font-black uppercase text-gray-400">Royalty</p>
                  </div>
                  <p className="text-3xl font-black text-cyan-400">€{creator.earnings.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            {onOpenCustomizer && (
              <div className="flex items-center lg:items-start lg:pt-16">
                <button
                  onClick={onOpenCustomizer}
                  className={getSiteCtaClasses('create', 'md')}
                >
                  <Wand2 className="h-4 w-4" />
                  Crea il tuo design
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Achievement bar ──────────────────────────────────────────────────── */}
      {creator.rank <= 3 && (
        <div className={`border-b-4 border-black px-6 py-4 md:px-12 ${creator.rank === 1 ? 'bg-yellow-400' : creator.rank === 2 ? 'bg-gray-100' : 'bg-orange-200'}`}>
          <p className="mx-auto max-w-7xl font-mono text-xs font-black uppercase tracking-widest">
            {RANK_LABELS[creator.rank]}
          </p>
        </div>
      )}

      {/* ── Design Grid ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-12 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">Tutti i lavori</p>
            <h2 className="mt-1 text-3xl font-black uppercase tracking-tighter md:text-5xl">
              I design di @{creator.name}
            </h2>
          </div>

          <DesignGrid
            designs={designs}
            isLoading={isLoading}
            hasMore={false}
            onLoadMore={() => {}}
            onSelectDesign={onSelectDesign}
            onLikeDesign={onLikeDesign}
            onSelectAuthor={onSelectAuthor}
            viewMode="product"
            sortBy={sortBy}
            onSortChange={onSortChange}
          />
        </div>
      </section>
    </motion.div>
  );
}
