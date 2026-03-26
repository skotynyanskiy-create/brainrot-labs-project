import type { Timestamp } from './firebase';
import type {
  BaseProductId,
  CartItemRecord,
  CatalogSelectionMode,
  PrintPlacement,
  ProductOverlayConfig,
  RendererType,
} from './services/commerce/types';

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
  role: 'admin' | 'client' | 'creator';
  username?: string;
  creatorTagline?: string;
  bio?: string;
  location?: string;
  portfolioUrl?: string;
  socialHandle?: string;
  creatorCategory?: string;
  legalName?: string;
  payoutEmail?: string;
  phone?: string;
  newsletterOptIn?: boolean;
  authProvider?: 'google' | 'password';
  createdAt?: string;
  shippingAddress?: AccountShippingAddress;
  payoutSetup?: AccountPayoutSetup;
  taxProfile?: AccountTaxProfile;
  royaltyWallet?: RoyaltyWallet;
  legalAcceptances?: UserLegalAcceptances;
}

export interface LegalAcceptance {
  accepted: boolean;
  version: string;
  acceptedAt?: string;
}

export interface UserLegalAcceptances {
  creatorTerms?: LegalAcceptance;
  royaltyPolicy?: LegalAcceptance;
}

export interface AccountShippingAddress {
  fullName: string;
  address1: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface AccountPayoutSetup {
  provider: 'none' | 'stripe_connect' | 'paypal' | 'bank_transfer';
  status: 'not_configured' | 'pending_setup' | 'pending_verification' | 'active' | 'restricted';
  accountId?: string;
  accountLabel?: string;
  payoutCurrency?: string;
  minimumPayoutAmount?: number;
  connectedAt?: string;
  onboardingReady?: boolean;
}

export interface AccountTaxProfile {
  legalName: string;
  businessType: 'individual' | 'business';
  taxCountry: string;
  taxId: string;
  vatId?: string;
}

export interface RoyaltyWallet {
  available: number;
  pending: number;
  paidTotal: number;
  nextPayoutEstimate?: string;
  lastPayoutAt?: string;
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
  sourceType?: 'catalog' | 'customizer' | 'community';
  baseProductId?: BaseProductId;
  communityDesignId?: string;
  designId?: string;
  catalogVariantRef?: string;
  model3dPath?: string; // path relativo a /public, es. "/models/mug.stl" o "/models/cap.glb"
}

export type CartItem = CartItemRecord;

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
  id: BaseProductId;
  name: string;
  slug?: string;
  price: number;
  image: string;
  category: 'wearable' | 'useless' | 'decor' | 'community';
  rendererType?: RendererType;
  modelPath?: string;
  selectionMode?: CatalogSelectionMode;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  variantOptions?: Array<{ label: string; value: string }>;
  overlay: ProductOverlayConfig;
  /** Printful catalog product ID (e.g. 71 for Bella+Canvas 3001) */
  printfulProductId: number;
  printTemplateKey?: string;
  /** Print placement used in the Printful files array */
  printfulPlacement: PrintPlacement;
  /** All variants for this product with their Printful IDs */
  printfulVariants?: PrintfulVariant[];
}

export interface CustomTemplate {
  id: string;
  name: string;
  createdAt: string;
  baseProductId: string;
  layers: LayerData[];
  previewImage: string;
}

export interface MemeBase {
  id: string;
  name: string;
  url: string;
  category: 'reaction' | 'format' | 'dank' | 'italian';
  usageCount: number;
  tags: string[];
  trendScore?: number; // calcolato: usageCount*0.6 + likes_sum*0.4
}

export interface CreatorInfo {
  authorId: string;
  name: string;
  designs: number;
  likes: number;
  earnings: number;
  rank: number;
}

export interface CommunityDesign {
  id: string;
  designId?: string;
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
  royaltyRate?: number; // percentage (e.g. 6.9 = 6.9%)
  isPublished?: boolean;
  tags?: string[];
  // Tracciamento origine — salvati come snapshot al momento del publish
  baseProductId?: BaseProductId;
  baseProductName?: string;        // snapshot nome prodotto base
  baseProductPrice?: number;       // snapshot prezzo prodotto base
  memeBaseId?: string | null;      // es. 'drake', null se nessun meme base usato
  memeBaseName?: string | null;    // snapshot nome meme base
  memeBaseCategory?: MemeBase['category'] | null;
  // Metadati layer
  layerCount?: number;
  hasCustomText?: boolean;
  hasAILayer?: boolean;
}
