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
  image: string;
  memeDescription: string;
  createdAt: Timestamp;
  likes: number;
}
