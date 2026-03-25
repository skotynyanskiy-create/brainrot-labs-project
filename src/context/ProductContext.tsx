import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product, CommunityDesign } from '../types';
import { COMMUNITY_SEED_DESIGNS, PRODUCTS } from '../constants';
import { db, collection, onSnapshot, Timestamp } from '../firebase';
import { logger } from '../utils/logger';

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

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [communityDesigns, setCommunityDesigns] = useState<CommunityDesign[]>(FALLBACK_COMMUNITY_DESIGNS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

    unsubscribeDesigns = onSnapshot(
      collection(db, 'communityDesigns'),
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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const normalizedQuery = searchQuery.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.memeDescription.toLowerCase().includes(normalizedQuery) ||
        product.authorName?.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

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
