import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Product, CommunityDesign } from '../types';
import { PRODUCTS } from '../constants';
import { db, collection, onSnapshot, Timestamp } from '../firebase';

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

const FALLBACK_COMMUNITY_DESIGNS: CommunityDesign[] = [
  {
    id: 'fallback-1',
    authorId: 'seed-1',
    authorName: 'MemeLord99',
    image: 'https://picsum.photos/seed/brainrot-community-1/900/900',
    memeDescription: 'La Gioconda in modalita streetwear. Nessuno l ha chiesto, tutti la vogliono.',
    createdAt: Timestamp.now(),
    likes: 420,
    totalSales: 34,
    totalEarnings: 122.46,
    royaltyRate: 12,
    isPublished: true,
    productType: 'wearable',
    tags: ['art', 'streetwear', 'iconic'],
  },
  {
    id: 'fallback-2',
    authorId: 'seed-2',
    authorName: 'SigmaPixel',
    image: 'https://picsum.photos/seed/brainrot-community-2/900/900',
    memeDescription: 'Un toast cosmico che fissa l abisso. Molto niche, molto potente.',
    createdAt: Timestamp.now(),
    likes: 314,
    totalSales: 18,
    totalEarnings: 64.76,
    royaltyRate: 12,
    isPublished: true,
    productType: 'decor',
    tags: ['cosmic', 'niche', 'deep'],
  },
  {
    id: 'fallback-3',
    authorId: 'seed-3',
    authorName: 'CringeQueen',
    image: 'https://picsum.photos/seed/brainrot-community-3/900/900',
    memeDescription: 'Il gatto manager che approva solo meme ad alto rendimento emotivo.',
    createdAt: Timestamp.now(),
    likes: 777,
    totalSales: 61,
    totalEarnings: 219.38,
    royaltyRate: 12,
    isPublished: true,
    productType: 'useless',
    tags: ['cat', 'corporate', 'meme'],
  },
  {
    id: 'fallback-4',
    authorId: 'seed-4',
    authorName: 'ToiletOracle',
    image: 'https://picsum.photos/seed/brainrot-community-4/900/900',
    memeDescription: 'Una reliquia post ironica uscita direttamente dal laboratorio.',
    createdAt: Timestamp.now(),
    likes: 999,
    totalSales: 88,
    totalEarnings: 316.44,
    royaltyRate: 12,
    isPublished: true,
    productType: 'wearable',
    tags: ['postirony', 'legendary', 'lab'],
  },
  {
    id: 'fallback-5',
    authorId: 'seed-5',
    authorName: 'VibeCheck404',
    image: 'https://picsum.photos/seed/brainrot-community-5/900/900',
    memeDescription: 'Skibidi vibes encoded in cotton. Solo per intenditori.',
    createdAt: Timestamp.now(),
    likes: 256,
    totalSales: 22,
    totalEarnings: 79.12,
    royaltyRate: 12,
    isPublished: true,
    productType: 'wearable',
    tags: ['skibidi', 'gen-z', 'vibes'],
  },
  {
    id: 'fallback-6',
    authorId: 'seed-6',
    authorName: 'NpcEnergy',
    image: 'https://picsum.photos/seed/brainrot-community-6/900/900',
    memeDescription: 'NPC behavior at 120fps. Il tuo cervello in loop infinito.',
    createdAt: Timestamp.now(),
    likes: 512,
    totalSales: 45,
    totalEarnings: 161.82,
    royaltyRate: 12,
    isPublished: true,
    productType: 'decor',
    tags: ['npc', 'loop', 'meta'],
  },
];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [communityDesigns, setCommunityDesigns] = useState<CommunityDesign[]>(FALLBACK_COMMUNITY_DESIGNS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Product[];
        setProducts(productsData.length > 0 ? productsData : PRODUCTS);
      },
      (error) => {
        console.warn('Falling back to local products:', error);
        setProducts(PRODUCTS);
      }
    );

    const unsubscribeDesigns = onSnapshot(
      collection(db, 'communityDesigns'),
      (snapshot) => {
        const designsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as CommunityDesign[];
        setCommunityDesigns(designsData.length > 0 ? designsData : FALLBACK_COMMUNITY_DESIGNS);
      },
      (error) => {
        console.warn('Falling back to local community designs:', error);
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

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProduct must be used within a ProductProvider');
  return context;
};
