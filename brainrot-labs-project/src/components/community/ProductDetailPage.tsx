import { Suspense } from 'react';
import { ArrowLeft, ChevronRight, Layers, Loader2, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { BaseProduct, CommunityDesign } from '../../types';
import type { CommunitySortOption } from '../../context/ProductContext';
import { getSiteCtaClasses } from '../../styles/siteCta';
import Product3DPreview from '../customizer/Product3DPreview';
import DesignGrid from './DesignGrid';

type SupportedBaseProductId = 'base-tshirt' | 'base-phonecase' | 'base-poster';
const SUPPORTED_IDS: SupportedBaseProductId[] = ['base-tshirt', 'base-phonecase', 'base-poster'];
function toBaseProductId(id: string): SupportedBaseProductId {
  return SUPPORTED_IDS.includes(id as SupportedBaseProductId)
    ? (id as SupportedBaseProductId)
    : 'base-tshirt';
}

interface ProductDetailPageProps {
  product: BaseProduct;
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

export default function ProductDetailPage({
  product,
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
}: ProductDetailPageProps) {
  const baseProductId = toBaseProductId(product.id);
  const totalLikes = designs.reduce((acc, d) => acc + d.likes, 0);
  const totalSales = designs.reduce((acc, d) => acc + (d.totalSales ?? 0), 0);
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
          <span className="text-gray-400">Prodotti 3D</span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="border-4 border-black bg-yellow-400 px-3 py-1.5">{product.name}</span>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="border-b-8 border-black bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-[1fr_1.2fr]">
            {/* 3D Canvas */}
            <div className="relative border-b-4 border-black bg-[#f8f8f8] lg:border-b-0 lg:border-r-4" style={{ minHeight: 420 }}>
              <Suspense fallback={
                <div className="flex h-full min-h-[420px] w-full items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin opacity-30" />
                </div>
              }>
                <Product3DPreview
                  baseProductId={baseProductId}
                  designTextureUrl={null}
                  baseColor="#ffffff"
                  autoRotate={true}
                  lightingMode="neutral"
                />
              </Suspense>
              <div className="pointer-events-none absolute left-4 top-4 border-2 border-black bg-yellow-400 px-2 py-1 font-mono text-[10px] font-black uppercase">
                {product.category}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between p-8 lg:p-12">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">
                  Base prodotto · Canvas fisico
                </p>
                <h1 className="mt-3 text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-7xl">
                  {product.name}
                </h1>
                <p className="mt-4 font-mono text-2xl font-bold">
                  da €{product.price.toFixed(2)}
                </p>

                {/* Sizes */}
                {product.sizes && (
                  <div className="mt-6">
                    <p className="mb-2 font-mono text-[10px] font-black uppercase tracking-widest text-gray-500">Taglie disponibili</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <span key={size} className="border-2 border-black bg-white px-3 py-1 font-mono text-xs font-black uppercase">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {product.colors && (
                  <div className="mt-5">
                    <p className="mb-2 font-mono text-[10px] font-black uppercase tracking-widest text-gray-500">Colori base</p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <div key={c.hex} className="flex items-center gap-1.5">
                          <div
                            className="h-5 w-5 border-2 border-black"
                            style={{ background: c.hex }}
                          />
                          <span className="font-mono text-[10px] uppercase">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="mt-8 grid grid-cols-3 gap-3">
                  <div className="border-4 border-black bg-[#f3f1ec] p-3 text-center">
                    <p className="font-mono text-[9px] font-black uppercase tracking-widest text-gray-500">Design</p>
                    <p className="mt-1 text-2xl font-black">
                      {displayCount}
                      {displayCount > designs.length && (
                        <span className="ml-0.5 text-xs font-bold text-gray-400">+</span>
                      )}
                    </p>
                  </div>
                  <div className="border-4 border-black bg-[#f3f1ec] p-3 text-center">
                    <p className="font-mono text-[9px] font-black uppercase tracking-widest text-gray-500">Like</p>
                    <p className="mt-1 text-2xl font-black">{totalLikes}</p>
                  </div>
                  <div className="border-4 border-black bg-[#f3f1ec] p-3 text-center">
                    <p className="font-mono text-[9px] font-black uppercase tracking-widest text-gray-500">Vendite</p>
                    <p className="mt-1 text-2xl font-black">{totalSales}</p>
                  </div>
                </div>
              </div>

              {onOpenCustomizer && (
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={onOpenCustomizer}
                    className={getSiteCtaClasses('create', 'lg', 'flex-1')}
                  >
                    <Wand2 className="h-5 w-5" />
                    Crea il tuo design
                  </button>
                  {displayCount > 0 && (
                    <a
                      href="#designs"
                      className="flex items-center justify-center gap-2 border-4 border-black bg-white px-5 py-4 font-mono text-xs font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)]"
                    >
                      <Layers className="h-4 w-4" />
                      {displayCount} design →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Design Grid ──────────────────────────────────────────────────────── */}
      <section id="designs" className="px-6 py-12 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-gray-500">Design community</p>
            <h2 className="mt-1 text-3xl font-black uppercase tracking-tighter md:text-5xl">
              Versioni realizzate dalla community
            </h2>
          </div>

          <DesignGrid
            designs={designs}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
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
