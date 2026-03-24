import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { STORAGE_KEYS } from '../constants';
import { playChaChingSound } from '../utils/sounds';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1, size?: string, color?: string) => {
    const cartItemId = `${product.id}-${size || 'nosize'}-${color || 'nocolor'}`;
    
    setItems(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity, selectedSize: size, selectedColor: color, cartItemId }];
    });
    
    // Suono extra e confetti per il brainrot
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

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
