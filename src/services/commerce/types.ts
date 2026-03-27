export type BaseProductId = 'base-tshirt' | 'base-phonecase' | 'base-poster';

export type RendererType = 'tshirt' | 'phone-case' | 'poster';

export type CatalogSelectionMode = 'size-color' | 'phone-model-finish' | 'poster-size';

export type PrintPlacement = 'front' | 'back' | 'default';

export type DesignSourceType = 'customizer' | 'community';

export type CartSourceType = 'customizer' | 'community' | 'catalog';

export interface ProductOverlayConfig {
  top: string;
  left: string;
  width: string;
  height: string;
  rotate?: string;
  mixBlendMode?: string;
}

export interface ProductPlacementArea2D {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ProductPlacementHotspot3D {
  x: number;
  y: number;
  label?: string;
}

export interface ProductPlacementCameraPreset {
  position: [number, number, number];
  fov: number;
}

export interface ProductPlacementConstraints {
  minScale: number;
  maxScale: number;
  acceptedLayerTypes: Array<'meme' | 'image' | 'text'>;
}

export interface ProductPlacementTextureProfile {
  preview: {
    width: number;
    height: number;
  };
  print: {
    width: number;
    height: number;
  };
}

export interface ProductPlacementConfig {
  id: string;
  label: string;
  printfulPlacement: PrintPlacement;
  technique: string;
  area2D: ProductPlacementArea2D;
  hotspot3D: ProductPlacementHotspot3D;
  cameraPreset?: ProductPlacementCameraPreset;
  constraints: ProductPlacementConstraints;
  textureProfile: ProductPlacementTextureProfile;
}

export interface ProductColorOption {
  name: string;
  hex: string;
}

export interface ProductVariantOption {
  label: string;
  value: string;
}

export interface BaseProductConfig {
  id: BaseProductId;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: 'wearable' | 'useless' | 'decor';
  rendererType: RendererType;
  modelPath?: string;
  overlay: ProductOverlayConfig;
  placements?: ProductPlacementConfig[];
  selectionMode: CatalogSelectionMode;
  sizes?: string[];
  colors?: ProductColorOption[];
  variantOptions?: ProductVariantOption[];
  printfulProductId?: number;
  printTemplateKey: string;
  defaultPlacement: PrintPlacement;
}

export interface CatalogVariantRecord {
  id: string;
  baseProductId: BaseProductId;
  label: string;
  size?: string;
  colorName?: string;
  phoneModel?: string;
  finish?: string;
  posterSize?: string;
  colorHex?: string;
  printfulProductId: number;
  printfulVariantId: number;
  placement: PrintPlacement;
  technique: string;
  price: number;
  currency: string;
  active: boolean;
  sortOrder: number;
}

export interface DesignAssetRecord {
  storagePath: string;
  downloadUrl: string;
  contentType: string;
  width?: number;
  height?: number;
}

export interface DesignPlacementRecord {
  placementId?: string;
  placement: PrintPlacement;
  technique: string;
  asset: DesignAssetRecord;
  previewAsset?: DesignAssetRecord;
  layerConfig?: unknown[];
  transform?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  status?: 'ready' | 'processing' | 'failed';
}

export interface DesignDraftRecord {
  id: string;
  ownerId: string;
  sourceType: DesignSourceType;
  baseProductId: BaseProductId;
  selectionKey: string;
  layerConfig: unknown[];
  previewAsset: DesignAssetRecord;
  placements: DesignPlacementRecord[];
  assetStatus: 'ready' | 'processing' | 'failed';
  publishedCommunityDesignId?: string | null;
  metadata?: {
    memeDescription?: string;
    memeBaseId?: string | null;
    memeBaseName?: string | null;
    memeBaseCategory?: string | null;
    tags?: string[];
    hasCustomText?: boolean;
    hasAILayer?: boolean;
    layerCount?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItemRecord {
  cartItemId: string;
  sourceType: CartSourceType;
  productId: string;
  baseProductId?: BaseProductId;
  designId?: string;
  communityDesignId?: string;
  catalogVariantRef?: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  category: 'wearable' | 'useless' | 'decor' | 'community';
  memeDescription: string;
  color: string;
  selectedSize?: string;
  selectedColor?: string;
  authorName?: string;
}

export interface ShippingAddressInput {
  name: string;
  surname: string;
  address: string;
  city: string;
  zip: string;
  province: string;
  country: string;
  phone?: string;
}

export interface ShippingQuoteOption {
  id: string;
  shipping: string;
  label: string;
  rate: number;
  currency: string;
  minDeliveryDays?: number;
  maxDeliveryDays?: number;
}

export interface ShippingQuoteResponse {
  quoteId: string;
  options: ShippingQuoteOption[];
  currency: string;
}

export interface OrderAmountSummary {
  currency: string;
  subtotal: number;
  shipping: number;
  total: number;
}

export interface OrderItemRecord {
  sourceType: CartSourceType;
  productId: string;
  baseProductId: BaseProductId;
  designId?: string;
  communityDesignId?: string;
  catalogVariantRef: string;
  printfulVariantId?: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string | null;
  color?: string | null;
  name: string;
  image: string;
  royaltyRateSnapshot?: number | null;
  creatorId?: string | null;
}

export interface OrderRecord {
  id: string;
  userId: string;
  customerEmail: string;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  fulfillmentStatus: 'draft' | 'queued' | 'submitted' | 'shipped' | 'delivered' | 'failed' | 'cancelled';
  printfulOrderId?: number | null;
  shippingMethod?: string | null;
  shippingLabel?: string | null;
  tracking?: {
    number?: string | null;
    url?: string | null;
    carrier?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
  };
  address: ShippingAddressInput;
  items: OrderItemRecord[];
  amounts: OrderAmountSummary;
  processedEventIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoyaltyLedgerRecord {
  id: string;
  orderId: string;
  orderItemIndex: number;
  designId?: string | null;
  communityDesignId?: string | null;
  creatorId: string;
  rateSnapshot: number;
  amount: number;
  currency: string;
  status: 'pending_fulfillment' | 'earned' | 'voided' | 'reversed';
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveDesignDraftRequest {
  baseProductId: BaseProductId;
  sourceType: DesignSourceType;
  selectionKey: string;
  layerConfig: unknown[];
  previewDataUrl: string;
  printPlacements: Array<{
    placementId?: string;
    placement: PrintPlacement;
    technique: string;
    imageDataUrl: string;
    previewDataUrl?: string;
    layerConfig?: unknown[];
    transform?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  metadata?: DesignDraftRecord['metadata'];
}

export interface SaveDesignDraftResponse {
  designId: string;
  previewUrl: string;
}

export interface PublishCommunityDesignRequest {
  designId: string;
  memeDescription: string;
}

export interface PublishCommunityDesignResponse {
  designId: string;
  communityDesignId: string;
}

export interface ShippingQuoteRequest {
  cartItems: CartItemRecord[];
  shippingAddress: ShippingAddressInput;
}

export interface CreateCheckoutSessionRequest {
  cartItems: CartItemRecord[];
  shippingAddress: ShippingAddressInput;
  shippingOptionId: string;
  quoteId: string;
}

export interface CreateCheckoutSessionResponse {
  checkoutUrl: string;
  orderId: string;
}
