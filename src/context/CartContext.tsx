import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product } from '../types';
import { STORAGE_KEYS } from '../constants';
import { playChaChingSound } from '../utils/sounds';
import { logger } from '../utils/logger';
import { buildCartItemId } from '../services/commerce/helpers';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem | Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== 'object') return false;
  const i = item as Record<string, unknown>;
  return (
    typeof i.cartItemId === 'string' &&
    typeof i.price === 'number' &&
    typeof i.quantity === 'number' &&
    typeof i.productId === 'string' &&
    typeof i.name === 'string' &&
    typeof i.image === 'string'
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (!saved) return [];
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isValidCartItem);
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
    } catch (error) {
      logger.error('CartContext: impossibile salvare il carrello in localStorage:', error);
    }
  }, [items]);

  const addToCart = (
    incomingItem: CartItem | Product,
    quantity: number = 1,
    size?: string,
    color?: string,
  ) => {
    const normalizedItem: CartItem = 'cartItemId' in incomingItem
      ? incomingItem
      : {
          cartItemId: buildCartItemId({
            sourceType: incomingItem.sourceType === 'community' ? 'community' : 'catalog',
            productId: incomingItem.id,
            communityDesignId: incomingItem.communityDesignId,
            designId: incomingItem.designId,
            catalogVariantRef: incomingItem.catalogVariantRef ?? `${incomingItem.baseProductId ?? incomingItem.id}:${size ?? 'std'}:${color ?? 'std'}`,
          }),
          sourceType: incomingItem.sourceType === 'community' ? 'community' : 'catalog',
          productId: incomingItem.id,
          baseProductId: incomingItem.baseProductId,
          designId: incomingItem.designId,
          communityDesignId: incomingItem.communityDesignId,
          catalogVariantRef: incomingItem.catalogVariantRef,
          quantity,
          price: incomingItem.price,
          name: incomingItem.name,
          image: incomingItem.image,
          category: incomingItem.category,
          memeDescription: incomingItem.memeDescription,
          color: incomingItem.color,
          selectedSize: size,
          selectedColor: color,
          authorName: incomingItem.authorName,
        };

    setItems(prev => {
      const existing = prev.find(item => item.cartItemId === normalizedItem.cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === normalizedItem.cartItemId
            ? { ...item, quantity: item.quantity + normalizedItem.quantity }
            : item
        );
      }
      return [...prev, normalizedItem];
    });

    playChaChingSound();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('app:confetti'));
    }

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(cartItemId);
    setItems(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Round to 2 decimal places to avoid floating-point drift (e.g. 29.99 * 3 = 89.97000000000001)
  const total = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen, total }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
