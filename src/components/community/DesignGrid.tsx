import { useMemo, useState } from 'react';
import { Loader2, SearchX } from 'lucide-react';
import type { CommunityDesign } from '../../types';
import type { CommunitySortOption } from '../../context/ProductContext';
import DesignCard from './DesignCard';

interface DesignGridProps {
  designs: CommunityDesign[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectDesign: (design: CommunityDesign) => void;
  onLikeDesign?: (designId: string, delta: 1 | -1) => void;
  onSelectAuthor?: (authorId: string, authorName: string) => void;
  viewMode: 'meme-base' | 'product';
  sortBy: CommunitySortOption;
  onSortChange: (sort: CommunitySortOption) => void;
  title?: string;
}

const SORT_OPTIONS: Array<{ id: CommunitySortOption; label: string }> = [
  { id: 'popular', label: 'Più apprezzati' },
  { id: 'recent', label: 'Più recenti' },
  { id: 'sales', label: 'Più venduti' },
];

export default function DesignGrid({
  designs,
  isLoading,
  hasMore,
  onLoadMore,
  onSelectDesign,
  onLikeDesign,
  onSelectAuthor,
  viewMode,
  sortBy,
  onSortChange,
  title,
}: DesignGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect top tags from designs (max 8 unique)
  const availableTags = useMemo(() => {
    const counts = new Map<string, number>();
    designs.forEach((d) => {
      d.tags?.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [designs]);

  const filtered = useMemo(
    () => (activeTag ? designs.filter((d) => d.tags?.includes(activeTag)) : designs),
    [designs, activeTag]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Sort + tag controls */}
      <div className="flex flex-col gap-3">
        {/* Sort bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {title && (
            <p className="font-mono text-xs font-black uppercase tracking-widest text-gray-500">
              {filtered.length} design
            </p>
          )}
          <div className="flex gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onSortChange(opt.id)}
                className={`border-2 border-black px-3 py-1 font-mono text-[11px] font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${
                  sortBy === opt.id ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag filter chips */}
        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`border-2 border-black px-2.5 py-0.5 font-mono text-[10px] font-black uppercase transition-all ${
                activeTag === null ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'
              }`}
            >
              Tutti
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`border-2 border-black px-2.5 py-0.5 font-mono text-[10px] font-black uppercase transition-all ${
                  activeTag === tag
                    ? 'bg-cyan-400 text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                    : 'bg-white hover:bg-cyan-50'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && filtered.length === 0 && (
        <div className="flex h-48 items-center justify-center border-4 border-black bg-white">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 border-4 border-black bg-white py-16">
          <SearchX className="h-12 w-12 opacity-30" />
          <p className="font-mono text-sm font-black uppercase tracking-widest opacity-50">
            {activeTag ? `Nessun design con #${activeTag}` : 'Nessun design ancora'}
          </p>
          {!activeTag && (
            <p className="text-center text-xs text-gray-500">
              Sii il primo a creare un design con questa base!
            </p>
          )}
          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              className="border-2 border-black bg-white px-3 py-1 font-mono text-xs font-black uppercase hover:bg-gray-50"
            >
              Rimuovi filtro
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((design, i) => (
            <DesignCard
              key={design.id}
              design={design}
              viewMode={viewMode}
              featured={i === 0 && !activeTag}
              onSelect={onSelectDesign}
              onLike={onLikeDesign ? (id, delta) => onLikeDesign(id, delta) : undefined}
              onSelectAuthor={onSelectAuthor}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !activeTag && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="flex items-center gap-2 border-4 border-black bg-white px-6 py-3 font-mono text-xs font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Carica altri design
          </button>
        </div>
      )}
    </div>
  );
}
