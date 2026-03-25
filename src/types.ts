import { Timestamp } from './firebase';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'client';
}

export interface LayerData {
  id: string;
  type: 'meme' | 'text' | 'image';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  opacity: number;
  locked?: boolean;
  flipX?: boolean;
  flipY?: boolean;
  filter?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface CustomData {
  baseImage: string;
  layers?: LayerData[];
  memeUrl?: string;
  topText?: string;
  bottomText?: string;
  position?: { x: number; y: number; width: number | string; height: number | string };
  overlay: {
    top: string;
    left: string;
    width: string;
    height: string;
    rotate?: string;
    mixBlendMode?: string;
  };
  containerSize?: { width: number; height: number };
  designTextureUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'wearable' | 'useless' | 'decor' | 'community';
  memeDescription: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  color: string;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  customData?: CustomData;
  likes?: number;
  authorName?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  cartItemId: string;
}

export interface Meme {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
}

/** Single Printful variant: ties a size+color combo to a Printful variant_id */
export interface PrintfulVariant {
  id: number;           // Printful catalog variant_id
  size: string;         // e.g. 'S', 'M', 'L', '15 Pro', 'Matte'
  colorName: string;    // e.g. 'White', 'Black', 'Navy'
  colorHex: string;     // e.g. '#FFFFFF'
}

export interface BaseProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'wearable' | 'useless' | 'decor' | 'community';
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  overlay: {
    top: string;
    left: string;
    width: string;
    height: string;
    rotate?: string;
    mixBlendMode?: string;
  };
  /** Printful catalog product ID (e.g. 71 for Bella+Canvas 3001) */
  printfulProductId: number;
  /** Print placement used in the Printful files array */
  printfulPlacement: 'front' | 'default' | 'back';
  /** All variants for this product with their Printful IDs */
  printfulVariants: PrintfulVariant[];
}

export interface CustomTemplate {
  id: string;
  name: string;
  createdAt: string;
  baseProductId: string;
  layers: LayerData[];
  previewImage: string;
}

export interface CommunityDesign {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  image: string;
  memeDescription: string;
  productType?: 'wearable' | 'useless' | 'decor';
  createdAt: Timestamp;
  likes: number;
  totalSales?: number;
  totalEarnings?: number;
  royaltyRate?: number; // percentage (e.g. 12 = 12%)
  isPublished?: boolean;
  tags?: string[];
}
