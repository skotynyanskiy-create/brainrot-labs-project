import { ArrowLeft, ChevronRight, Flame, TrendingUp, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { MemeBase, CommunityDesign } from '../../types';
import type { CommunitySortOption } from '../../context/ProductContext';
import { getSiteCtaClasses } from '../../styles/siteCta';
import DesignGrid from './DesignGrid';

interface MemeDetailPageProps {
  memeBase: MemeBase;
  designs: CommunityDesign[];
  totalDesignCount?: number;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  sortBy: CommunitySortOption;
  onSortChange: (sort: CommunitySortOption) => void;
  onSelectDesign: (design: CommunityDesign) => void;
  onLikeDesign?: (designId: string, delta: 1 | -1) => void;
  onSelectAuthor?: (authorId: string, authorName: string) => void;
  onOpenCustomizer?: () => void;
  onBack: () => void;
}

// Keep in sync with MemeBase['category'] in types.ts
const CATEGORY_COLORS: Record<string, string> = {
  reaction: 'bg-cyan-400',
  format: 'bg-yellow-400',
  dank: 'bg-pink-500 text-white',
  italian: 'bg-green-400',
};

export default function MemeDetailPage({
  memeBase,
  designs,
  totalDesignCount,
  isLoading,
  hasMore,
  onLoadMore,
  sortBy,
  onSortChange,
  onSelectDesign,
  onLikeDesign,
  onSelectAuthor,
  onOpenCustomizer,
  onBack,
}: MemeDetailPageProps) {
  const totalLikes = designs.reduce((acc, d) => acc + d.likes, 0);
  const categoryColor = CATEGORY_COLORS[memeBase.category] ?? 'bg-gray-200';
  const isHot = (memeBase.trendScore ?? 0) > 80;
  // Prefer the known total count (from global listener) over paginated length
  const displayCount = Math.max(totalDesignCount ?? 0, designs.length);

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
          <span className="text-gray-400">Meme Base</span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="border-4 border-black bg-cyan-400 px-3 py-1.5">{memeBase.name}</span>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="border-b-8 border-black bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-[1fr_1.4fr]">
            {/* Meme image */}
            <div className="relative overflow-hidden border-b-4 border-black bg-black lg:border-b-0 lg:border-r-4">
              <img
                src={memeBase.url}
                alt={memeBase.name}
                className="h-80 w-full object-cover opacity-90 lg:h-full lg:min-h-[420px]"
              />
              {/* Overlay gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {isHot && (
                <div className="absolute left-4 top-4 flex items-center gap-1 border-2 border-black bg-orange-400 px-2 py-1 font-mono text-[10px] font-black uppercase">
                  <Flame className="h-3 w-3" />
                  Trending
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between p-8 lg:p-12">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className={`border-2 border-black px-3 py-1 font-mono text-[11px] font-black uppercase ${categoryColor}`}>
                    {memeBase.category}
                  </span>
                  <span className="font-mono text-xs text-gray-500">Template Meme</span>
                </div>
                <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-7xl">
                  {memeBase.name}
                </h1>

                {/* Stats row */}
                <div className="mt-8 grid grid-cols-3 gap-3">
                  <div className="border-4 border-black bg-[#f3f1ec] p-4">
                    <p className="font-mono text-[10px] font-black uppercase tracking-widest text-gray-500">Remix</p>
                    <p className="mt-1 text-3xl font-black">
                      {displayCount}
                      {displayCount > designs.length && (
                        <span className="ml-1 text-sm font-bold text-gray-400">+</span>
                      )}
                    </p>
                  </div>
                  <div className="border-4 border-black bg-[#f3f1ec] p-4">
                    <p className="font-mono text-[10px] font-black uppercase tracking-widest text-gray-500">Like totali</p>
                    <p className="mt-1 text-3xl font-black">{totalLikes}</p>
                  </div>
                  <div className="border-4 border-black bg-[#f3f1ec] p-4">
                    <p className="font-mono text-[10px] font-black uppercase tracking-widest text-gray-500">Trend score</p>
                    <p className="mt-1 flex items-center gap-1 text-3xl font-black">
                      {memeBase.trendScore ?? 0}
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </p>
                  </div>
                </div>
              </div>

              {onOpenCustomizer && (
                <div className="mt-10">
                  <button
                    onClick={onOpenCustomizer}
                    className={getSiteCtaClasses('create', 'lg', 'w-full md:w-auto')}
                  >
                    <Wand2 className="h-5 w-5" />
                    Crea il tuo design
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Design Grid ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-12 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">Remix community</p>
              <h2 className="mt-1 text-3xl font-black uppercase tracking-tighter md:text-5xl">
                Tutti i design con questa base
              </h2>
            </div>
          </div>

          <DesignGrid
            designs={designs}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            onSelectDesign={onSelectDesign}
            onLikeDesign={onLikeDesign}
            onSelectAuthor={onSelectAuthor}
            viewMode="meme-base"
            sortBy={sortBy}
            onSortChange={onSortChange}
          />
        </div>
      </section>
    </motion.div>
  );
}
