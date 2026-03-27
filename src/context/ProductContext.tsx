import React, { createContext, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { Product, CommunityDesign } from '../types';
import { COMMUNITY_SEED_DESIGNS, PRODUCTS } from '../constants';
import {
  db, collection, doc, onSnapshot, query, where, orderBy, limit, getDocs, updateDoc, startAfter, Timestamp, increment,
} from '../firebase';
import type { DocumentSnapshot } from '../firebase';
import { logger } from '../utils/logger';

export type CommunitySortOption = 'popular' | 'recent' | 'sales';
export type CommunityFilterType = 'memeBase' | 'product';

interface ProductContextType {
  products: Product[];
  communityDesigns: CommunityDesign[];
  filteredProducts: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  // Community filtered state
  selectedMemeBaseId: string | null;
  setSelectedMemeBaseId: (id: string | null) => void;
  selectedBaseProductId: string | null;
  setSelectedBaseProductId: (id: string | null) => void;
  communitySort: CommunitySortOption;
  setCommunitySort: (sort: CommunitySortOption) => void;
  filteredCommunityDesigns: CommunityDesign[];
  communitySearchResults: CommunityDesign[];
  isCommunityLoading: boolean;
  hasMoreDesigns: boolean;
  fetchMoreDesigns: () => Promise<void>;
  likeDesign: (designId: string, delta: 1 | -1) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const FALLBACK_COMMUNITY_DESIGNS: CommunityDesign[] = COMMUNITY_SEED_DESIGNS.map((design) => ({
  ...design,
  tags: [...design.tags],
  createdAt: Timestamp.now(),
}));

const normalizeCreatedAt = (value: unknown): Timestamp => {
  if (value instanceof Timestamp) {
    return value;
  }

  if (value && typeof value === 'object' && 'seconds' in value && typeof (value as { seconds?: unknown }).seconds === 'number') {
    const raw = value as { seconds: number; nanoseconds?: number };
    return new Timestamp(raw.seconds, raw.nanoseconds ?? 0);
  }

  if (typeof value === 'string') {
    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      return Timestamp.fromDate(parsedDate);
    }
  }

  return Timestamp.now();
};

const normalizeCommunityDesign = (design: Partial<CommunityDesign> & { id: string }): CommunityDesign => ({
  authorId: '',
  authorName: 'Creator',
  image: '',
  memeDescription: '',
  likes: 0,
  ...design,
  createdAt: normalizeCreatedAt(design.createdAt),
});

const PAGE_SIZE = 12;

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [communityDesigns, setCommunityDesigns] = useState<CommunityDesign[]>(FALLBACK_COMMUNITY_DESIGNS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Community filter state
  const [selectedMemeBaseId, setSelectedMemeBaseId] = useState<string | null>(null);
  const [selectedBaseProductId, setSelectedBaseProductId] = useState<string | null>(null);
  const [communitySort, setCommunitySort] = useState<CommunitySortOption>('popular');
  const [filteredCommunityDesigns, setFilteredCommunityDesigns] = useState<CommunityDesign[]>([]);
  const [isCommunityLoading, setIsCommunityLoading] = useState(false);
  const [hasMoreDesigns, setHasMoreDesigns] = useState(false);

  // Cache: filterKey → designs[], cursor
  const designCache = useRef<Map<string, CommunityDesign[]>>(new Map());
  const cursorCache = useRef<Map<string, DocumentSnapshot | null>>(new Map());

  useEffect(() => {
    let unsubscribeProducts = () => {};
    let unsubscribeDesigns = () => {};

    unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Product[];
        setProducts(productsData.length > 0 ? productsData : PRODUCTS);
      },
      (error) => {
        logger.warn('Falling back to local products:', error);
        setProducts(PRODUCTS);
      }
    );

    // Listener globale limitato a 24 documenti recenti per statistiche aggregate
    unsubscribeDesigns = onSnapshot(
      query(collection(db, 'communityDesigns'), orderBy('createdAt', 'desc'), limit(24)),
      (snapshot) => {
        const designsData = snapshot.docs.map((doc) => normalizeCommunityDesign({
          ...doc.data(),
          id: doc.id,
        }));
        setCommunityDesigns(designsData.length > 0 ? designsData : FALLBACK_COMMUNITY_DESIGNS);
      },
      (error) => {
        logger.warn('Falling back to local community designs:', error);
        setCommunityDesigns(FALLBACK_COMMUNITY_DESIGNS);
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeDesigns();
    };
  }, []);

  const fetchDesignsByFilter = useCallback(async (
    filterType: CommunityFilterType,
    filterId: string,
    sort: CommunitySortOption,
    append = false
  ) => {
    const cacheKey = `${filterType}-${filterId}-${sort}`;

    if (!append && designCache.current.has(cacheKey)) {
      setFilteredCommunityDesigns(designCache.current.get(cacheKey) ?? []);
      setHasMoreDesigns((cursorCache.current.get(cacheKey) ?? null) !== null);
      return;
    }

    setIsCommunityLoading(true);
    try {
      const orderField = sort === 'popular' ? 'likes' : sort === 'sales' ? 'totalSales' : 'createdAt';
      const whereField = filterType === 'memeBase' ? 'memeBaseId' : 'baseProductId';

      const cursor = append ? cursorCache.current.get(cacheKey) : null;

      const constraints = [
        where(whereField, '==', filterId),
        where('isPublished', '==', true),
        orderBy(orderField, 'desc'),
        limit(PAGE_SIZE),
        ...(cursor ? [startAfter(cursor)] : []),
      ];

      const snapshot = await getDocs(query(collection(db, 'communityDesigns'), ...constraints));
      const newDesigns = snapshot.docs.map((doc) => normalizeCommunityDesign({ ...doc.data(), id: doc.id }));

      const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
      cursorCache.current.set(cacheKey, lastDoc);

      const updated = append
        ? [...(designCache.current.get(cacheKey) ?? []), ...newDesigns]
        : newDesigns;

      designCache.current.set(cacheKey, updated);
      setFilteredCommunityDesigns(updated);
      setHasMoreDesigns(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      logger.warn('fetchDesignsByFilter fallback:', error);
      // Fallback su dati locali filtrati per campo
      const field = filterType === 'memeBase' ? 'memeBaseId' : 'baseProductId';
      const fallback = FALLBACK_COMMUNITY_DESIGNS.filter((d) => d[field] === filterId);
      setFilteredCommunityDesigns(fallback);
      setHasMoreDesigns(false);
    } finally {
      setIsCommunityLoading(false);
    }
  }, []);

  // Ri-fetch quando cambia selezione o sort
  useEffect(() => {
    if (selectedMemeBaseId) {
      designCache.current.clear();
      void fetchDesignsByFilter('memeBase', selectedMemeBaseId, communitySort);
    } else if (selectedBaseProductId) {
      designCache.current.clear();
      void fetchDesignsByFilter('product', selectedBaseProductId, communitySort);
    } else {
      setFilteredCommunityDesigns([]);
      setHasMoreDesigns(false);
    }
  }, [selectedMemeBaseId, selectedBaseProductId, communitySort, fetchDesignsByFilter]);

  /** Optimistically update like count locally and persist to Firestore. */
  const likeDesign = useCallback(async (designId: string, delta: 1 | -1) => {
    const applyDelta = (list: CommunityDesign[]) =>
      list.map((d) => d.id === designId ? { ...d, likes: Math.max(0, d.likes + delta) } : d);

    setCommunityDesigns((prev) => applyDelta(prev));
    setFilteredCommunityDesigns((prev) => applyDelta(prev));

    try {
      await updateDoc(doc(db, 'communityDesigns', designId), { likes: increment(delta) });
    } catch (error) {
      // Rollback on failure
      const rollback = (list: CommunityDesign[]) =>
        list.map((d) => d.id === designId ? { ...d, likes: Math.max(0, d.likes - delta) } : d);
      setCommunityDesigns((prev) => rollback(prev));
      setFilteredCommunityDesigns((prev) => rollback(prev));
      logger.warn('likeDesign failed:', error);
    }
  }, []);

  const fetchMoreDesigns = useCallback(async () => {
    if (selectedMemeBaseId) {
      await fetchDesignsByFilter('memeBase', selectedMemeBaseId, communitySort, true);
    } else if (selectedBaseProductId) {
      await fetchDesignsByFilter('product', selectedBaseProductId, communitySort, true);
    }
  }, [selectedMemeBaseId, selectedBaseProductId, communitySort, fetchDesignsByFilter]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.toLowerCase();
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.memeDescription.toLowerCase().includes(normalizedQuery) ||
        product.authorName?.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [deferredSearchQuery, products, selectedCategory]);

  // Community designs matching the current search query (empty when query is blank)
  const communitySearchResults = useMemo(() => {
    const q = deferredSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return communityDesigns.filter((d) =>
      d.memeDescription.toLowerCase().includes(q) ||
      d.authorName.toLowerCase().includes(q) ||
      d.memeBaseName?.toLowerCase().includes(q) ||
      d.baseProductName?.toLowerCase().includes(q) ||
      d.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [communityDesigns, deferredSearchQuery]);

  return (
    <ProductContext.Provider
      value={{
        products,
        communityDesigns,
        filteredProducts,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        setSelectedProduct,
        selectedMemeBaseId,
        setSelectedMemeBaseId,
        selectedBaseProductId,
        setSelectedBaseProductId,
        communitySort,
        setCommunitySort,
        filteredCommunityDesigns,
        communitySearchResults,
        isCommunityLoading,
        hasMoreDesigns,
        fetchMoreDesigns,
        likeDesign,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProduct must be used within a ProductProvider');
  return context;
};
