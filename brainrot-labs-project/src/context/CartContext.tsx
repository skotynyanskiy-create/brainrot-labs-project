import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product } from '../types';
import { STORAGE_KEYS } from '../constants';
import { playChaChingSound } from '../utils/sounds';
import { logger } from '../utils/logger';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string, customData?: Record<string, unknown>) => void;
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
    typeof i.id === 'string'
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
    product: Product,
    quantity: number = 1,
    size?: string,
    color?: string,
    customData?: Record<string, unknown>
  ) => {
    // Include a short hash of customData to avoid ID collisions between different designs on same base product
    const customHash = customData ? btoa(JSON.stringify(customData)).slice(0, 8) : '';
    const cartItemId = `${product.id}-${size || 'nosize'}-${color || 'nocolor'}${customHash ? `-${customHash}` : ''}`;

    setItems(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedSize: size, selectedColor: color, cartItemId }];
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
