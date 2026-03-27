import * as admin from 'firebase-admin';
import * as crypto from 'node:crypto';
import Stripe from 'stripe';
import type { Request, Response } from 'express';
import type { CallableRequest } from 'firebase-functions/v2/https';
import * as functions from 'firebase-functions/v2';

import { BASE_PRODUCTS } from '../src/constants';
import { CURATED_CATALOG_VARIANTS } from '../src/services/commerce/catalogDefaults';
import type {
  BaseProductId,
  CartItemRecord,
  CatalogVariantRecord,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  DesignDraftRecord,
  OrderItemRecord,
  OrderRecord,
  PublishCommunityDesignRequest,
  PublishCommunityDesignResponse,
  SaveDesignDraftRequest,
  SaveDesignDraftResponse,
  ShippingAddressInput,
  ShippingQuoteOption,
  ShippingQuoteRequest,
  ShippingQuoteResponse,
} from '../src/services/commerce/types';

const db = admin.firestore();
const bucket = admin.storage().bucket();

const APP_URL = process.env.APP_URL ?? 'http://localhost:5173';
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY ?? '';
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID ?? '';
const PRINTFUL_WEBHOOK_SECRET = process.env.PRINTFUL_WEBHOOK_SECRET ?? '';
const PRINTFUL_WEBHOOK_PUBLIC_KEY = process.env.PRINTFUL_WEBHOOK_PUBLIC_KEY ?? '';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';
const CHECKOUT_CURRENCY = 'eur';

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion })
  : null;

type RawBodyRequest = Request & { rawBody: Buffer };

type UserRole = 'admin' | 'client' | 'creator';

interface StoredShippingQuote {
  userId: string;
  cartHash: string;
  addressHash: string;
  currency: string;
  options: ShippingQuoteOption[];
  createdAt: FirebaseFirestore.FieldValue;
}

function requireAuth<T>(request: CallableRequest<T>) {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Autenticazione richiesta.');
  }

  return request.auth.uid;
}

async function requireAdmin(uid: string) {
  const userSnap = await db.collection('users').doc(uid).get();
  const role = (userSnap.data()?.role ?? 'client') as UserRole;
  if (role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Permessi insufficienti.');
  }
}

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function buildCartHash(cartItems: CartItemRecord[]) {
  const normalized = [...cartItems]
    .map((item) => ({
      cartItemId: item.cartItemId,
      sourceType: item.sourceType,
      productId: item.productId,
      baseProductId: item.baseProductId,
      designId: item.designId,
      communityDesignId: item.communityDesignId,
      catalogVariantRef: item.catalogVariantRef,
      quantity: item.quantity,
    }))
    .sort((a, b) => a.cartItemId.localeCompare(b.cartItemId));

  return sha256(JSON.stringify(normalized));
}

function buildAddressHash(address: ShippingAddressInput) {
  return sha256(JSON.stringify({
    name: address.name.trim(),
    surname: address.surname.trim(),
    address: address.address.trim(),
    city: address.city.trim(),
    zip: address.zip.trim(),
    province: address.province.trim().toUpperCase(),
    country: address.country.trim(),
    phone: address.phone?.trim() ?? '',
  }));
}

function assertString(value: unknown, field: string, min = 1, max = 300): string {
  if (typeof value !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', `${field} non valido.`);
  }

  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new functions.https.HttpsError('invalid-argument', `${field} non valido.`);
  }

  return trimmed;
}

function assertDataUrl(value: unknown, field: string) {
  const raw = assertString(value, field, 32, 16_000_000);
  if (!raw.startsWith('data:image/')) {
    throw new functions.https.HttpsError('invalid-argument', `${field} deve essere una data URL immagine.`);
  }
  return raw;
}

function validateShippingAddress(input: unknown): ShippingAddressInput {
  if (!input || typeof input !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Indirizzo di spedizione mancante.');
  }

  const data = input as Record<string, unknown>;
  return {
    name: assertString(data.name, 'Nome', 1, 80),
    surname: assertString(data.surname, 'Cognome', 1, 80),
    address: assertString(data.address, 'Indirizzo', 3, 160),
    city: assertString(data.city, 'Città', 2, 120),
    zip: assertString(data.zip, 'CAP', 2, 20),
    province: assertString(data.province, 'Provincia', 2, 20),
    country: assertString(data.country, 'Paese', 2, 80),
    phone: typeof data.phone === 'string' ? data.phone.trim() : '',
  };
}

function validateCartItems(input: unknown): CartItemRecord[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Carrello vuoto.');
  }

  return input.map((rawItem, index) => {
    if (!rawItem || typeof rawItem !== 'object') {
      throw new functions.https.HttpsError('invalid-argument', `Elemento carrello ${index + 1} non valido.`);
    }

    const item = rawItem as Record<string, unknown>;
    const baseProductId = item.baseProductId as BaseProductId | undefined;
    if (!baseProductId) {
      throw new functions.https.HttpsError('invalid-argument', `baseProductId mancante per l'elemento ${index + 1}.`);
    }

    const quantity = Number(item.quantity ?? 0);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new functions.https.HttpsError('invalid-argument', `Quantità non valida per l'elemento ${index + 1}.`);
    }

    return {
      cartItemId: assertString(item.cartItemId, 'cartItemId', 6, 400),
      sourceType: assertString(item.sourceType, 'sourceType', 4, 20) as CartItemRecord['sourceType'],
      productId: assertString(item.productId, 'productId', 1, 200),
      baseProductId,
      designId: typeof item.designId === 'string' ? item.designId : undefined,
      communityDesignId: typeof item.communityDesignId === 'string' ? item.communityDesignId : undefined,
      catalogVariantRef: typeof item.catalogVariantRef === 'string' ? item.catalogVariantRef : undefined,
      quantity,
      price: Number(item.price ?? 0),
      name: assertString(item.name, 'name', 1, 200),
      image: assertString(item.image, 'image', 1, 4000),
      category: (item.category as CartItemRecord['category']) ?? 'community',
      memeDescription: typeof item.memeDescription === 'string' ? item.memeDescription : '',
      color: typeof item.color === 'string' ? item.color : 'bg-white',
      selectedSize: typeof item.selectedSize === 'string' ? item.selectedSize : undefined,
      selectedColor: typeof item.selectedColor === 'string' ? item.selectedColor : undefined,
      authorName: typeof item.authorName === 'string' ? item.authorName : undefined,
    };
  });
}

async function uploadDataUrl(path: string, dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new functions.https.HttpsError('invalid-argument', 'Formato immagine non valido.');
  }

  const [, contentType, base64Payload] = match;
  const buffer = Buffer.from(base64Payload, 'base64');

  const file = bucket.file(path);
  await file.save(buffer, {
    metadata: {
      contentType,
      cacheControl: 'private, max-age=3600',
    },
    resumable: false,
  });

  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });

  return { storagePath: path, downloadUrl: signedUrl, contentType };
}

async function getCatalogVariant(refId: string): Promise<CatalogVariantRecord> {
  const snap = await db.collection('catalogVariants').doc(refId).get();
  if (snap.exists) {
    return snap.data() as CatalogVariantRecord;
  }

  const fallback = CURATED_CATALOG_VARIANTS.find((variant) => variant.id === refId);
  if (!fallback) {
    throw new functions.https.HttpsError('not-found', `Variante ${refId} non trovata.`);
  }

  return fallback;
}

async function getDesignRecord(uid: string, designId: string): Promise<DesignDraftRecord> {
  const snap = await db.collection('designs').doc(designId).get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'Design non trovato.');
  }

  const design = snap.data() as DesignDraftRecord;
  if (design.ownerId !== uid) {
    throw new functions.https.HttpsError('permission-denied', 'Design non accessibile.');
  }

  return design;
}

async function getDesignForOrder(uid: string, item: CartItemRecord): Promise<DesignDraftRecord> {
  if (item.sourceType === 'customizer') {
    if (!item.designId) {
      throw new functions.https.HttpsError('invalid-argument', 'designId mancante per articolo custom.');
    }
    return getDesignRecord(uid, item.designId);
  }

  if (item.sourceType === 'community') {
    if (!item.communityDesignId) {
      throw new functions.https.HttpsError('invalid-argument', 'communityDesignId mancante.');
    }
    const communitySnap = await db.collection('communityDesigns').doc(item.communityDesignId).get();
    if (!communitySnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Design community non trovato.');
    }
    const community = communitySnap.data() as Record<string, unknown>;
    const sourceDesignId = typeof community.designId === 'string' ? community.designId : '';
    if (!sourceDesignId) {
      throw new functions.https.HttpsError('failed-precondition', 'Il design community non ha un draft collegato.');
    }
    return getDesignRecord(uid, sourceDesignId).catch(async () => {
      const designSnap = await db.collection('designs').doc(sourceDesignId).get();
      if (!designSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Draft community non trovato.');
      }
      return designSnap.data() as DesignDraftRecord;
    });
  }

  throw new functions.https.HttpsError('failed-precondition', 'Gli articoli catalog statico non sono supportati nel checkout hosted.');
}

function mapCountryCode(country: string) {
  if (country.toLowerCase().includes('ital')) return 'IT';
  return country.slice(0, 2).toUpperCase();
}

function mapPrintfulRecipient(address: ShippingAddressInput, email?: string) {
  return {
    name: `${address.name} ${address.surname}`.trim(),
    address1: address.address,
    city: address.city,
    state_code: address.province.toUpperCase(),
    country_code: mapCountryCode(address.country),
    zip: address.zip,
    ...(address.phone ? { phone: address.phone } : {}),
    ...(email ? { email } : {}),
  };
}

async function printfulFetch<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  if (!PRINTFUL_API_KEY) {
    throw new functions.https.HttpsError('failed-precondition', 'PRINTFUL_API_KEY non configurata.');
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${PRINTFUL_API_KEY}`,
    'Content-Type': 'application/json',
    ...(PRINTFUL_STORE_ID ? { 'X-PF-Store-ID': PRINTFUL_STORE_ID } : {}),
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };

  const response = await fetch(`https://api.printful.com/v2${endpoint}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Printful ${response.status}: ${text}`);
  }

  return JSON.parse(text) as T;
}

async function computeShippingOptions(cartItems: CartItemRecord[], address: ShippingAddressInput): Promise<ShippingQuoteOption[]> {
  const fallback: ShippingQuoteOption[] = [
    { id: 'standard', shipping: 'STANDARD', label: 'Standard', rate: 5.9, currency: 'EUR', minDeliveryDays: 4, maxDeliveryDays: 7 },
  ];

  if (!PRINTFUL_API_KEY) {
    return fallback;
  }

  const shipmentItems = await Promise.all(
    cartItems.map(async (item) => {
      const variant = item.catalogVariantRef ? await getCatalogVariant(item.catalogVariantRef) : null;
      if (!variant || variant.printfulVariantId <= 0) {
        throw new functions.https.HttpsError('failed-precondition', `Variante Printful non pronta per ${item.name}.`);
      }

      return {
        catalog_variant_id: variant.printfulVariantId,
        quantity: item.quantity,
      };
    }),
  );

  try {
    const response = await printfulFetch<{ data: Array<Record<string, unknown>> }>('/shipping-rates', {
      method: 'POST',
      body: JSON.stringify({
        recipient: mapPrintfulRecipient(address),
        items: shipmentItems,
        currency: 'EUR',
      }),
    });

    return response.data.map((option, index) => ({
      id: `${String(option.shipping ?? 'STANDARD').toLowerCase()}-${index}`,
      shipping: String(option.shipping ?? 'STANDARD'),
      label: String(option.shipping_method_name ?? option.shipping ?? 'Standard'),
      rate: Number(option.rate ?? 0),
      currency: String(option.currency ?? 'EUR'),
      minDeliveryDays: typeof option.min_delivery_days === 'number' ? option.min_delivery_days : undefined,
      maxDeliveryDays: typeof option.max_delivery_days === 'number' ? option.max_delivery_days : undefined,
    }));
  } catch (error) {
    console.error('getShippingQuote Printful error:', error);
    return fallback;
  }
}

async function buildOrderItems(uid: string, cartItems: CartItemRecord[]): Promise<OrderItemRecord[]> {
  return Promise.all(
    cartItems.map(async (item) => {
      if (!item.baseProductId || !item.catalogVariantRef) {
        throw new functions.https.HttpsError('invalid-argument', 'Elemento carrello incompleto.');
      }

      const variant = await getCatalogVariant(item.catalogVariantRef);
      const design = await getDesignForOrder(uid, item);
      if (design.baseProductId !== item.baseProductId) {
        throw new functions.https.HttpsError('invalid-argument', `Design ${design.id} non coerente col prodotto scelto.`);
      }

      let creatorId: string | null = null;
      let royaltyRateSnapshot: number | null = null;
      if (item.sourceType === 'community' && item.communityDesignId) {
        const communitySnap = await db.collection('communityDesigns').doc(item.communityDesignId).get();
        if (communitySnap.exists) {
          const community = communitySnap.data() as Record<string, unknown>;
          creatorId = typeof community.authorId === 'string' ? community.authorId : null;
          royaltyRateSnapshot = typeof community.royaltyRate === 'number' ? community.royaltyRate : null;
        }
      }

      const unitPrice = variant.price;

      return {
        sourceType: item.sourceType,
        productId: item.productId,
        baseProductId: item.baseProductId,
        designId: design.id,
        communityDesignId: item.communityDesignId,
        catalogVariantRef: variant.id,
        printfulVariantId: variant.printfulVariantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: Number((unitPrice * item.quantity).toFixed(2)),
        size: item.selectedSize ?? variant.size ?? variant.posterSize ?? variant.phoneModel ?? null,
        color: item.selectedColor ?? variant.colorName ?? variant.finish ?? null,
        name: item.name,
        image: item.image,
        royaltyRateSnapshot,
        creatorId,
      };
    }),
  );
}

export async function saveDesignDraftHandler(request: CallableRequest<SaveDesignDraftRequest>): Promise<SaveDesignDraftResponse> {
  const uid = requireAuth(request);
  const data = request.data;
  const baseProductId = assertString(data.baseProductId, 'baseProductId', 4, 40) as BaseProductId;
  const selectionKey = assertString(data.selectionKey, 'selectionKey', 2, 80);
  const previewDataUrl = assertDataUrl(data.previewDataUrl, 'previewDataUrl');

  if (!Array.isArray(data.layerConfig)) {
    throw new functions.https.HttpsError('invalid-argument', 'layerConfig non valido.');
  }
  if (!Array.isArray(data.printPlacements) || data.printPlacements.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'printPlacements non valido.');
  }

  const designRef = db.collection('designs').doc();
  const previewAsset = await uploadDataUrl(`designs/${uid}/${designRef.id}/preview.png`, previewDataUrl);

  const placements = await Promise.all(
    data.printPlacements.map(async (placement, index) => {
      const imageDataUrl = assertDataUrl(placement.imageDataUrl, `printPlacements[${index}]`);
      const asset = await uploadDataUrl(
        `designs/${uid}/${designRef.id}/placement-${placement.placement}-${index}.png`,
        imageDataUrl,
      );
      const previewAsset = typeof placement.previewDataUrl === 'string'
        ? await uploadDataUrl(
            `designs/${uid}/${designRef.id}/placement-preview-${placement.placement}-${index}.png`,
            assertDataUrl(placement.previewDataUrl, `printPlacements[${index}].previewDataUrl`),
          )
        : undefined;

      return {
        placementId: typeof placement.placementId === 'string' ? placement.placementId : undefined,
        placement: placement.placement,
        technique: assertString(placement.technique, 'technique', 2, 40),
        asset,
        previewAsset,
        layerConfig: Array.isArray(placement.layerConfig) ? placement.layerConfig : undefined,
        transform: placement.transform && typeof placement.transform === 'object'
          ? {
              x: Number((placement.transform as Record<string, unknown>).x ?? 0),
              y: Number((placement.transform as Record<string, unknown>).y ?? 0),
              width: Number((placement.transform as Record<string, unknown>).width ?? 0),
              height: Number((placement.transform as Record<string, unknown>).height ?? 0),
            }
          : undefined,
        status: 'ready' as const,
      };
    }),
  );

  const payload: DesignDraftRecord = {
    id: designRef.id,
    ownerId: uid,
    sourceType: data.sourceType,
    baseProductId,
    selectionKey,
    layerConfig: data.layerConfig,
    previewAsset,
    placements,
    assetStatus: 'ready',
    publishedCommunityDesignId: null,
    metadata: data.metadata ?? {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await designRef.set(payload);

  return {
    designId: designRef.id,
    previewUrl: previewAsset.downloadUrl,
  };
}

export async function publishCommunityDesignHandler(request: CallableRequest<PublishCommunityDesignRequest>): Promise<PublishCommunityDesignResponse> {
  const uid = requireAuth(request);
  const designId = assertString(request.data.designId, 'designId', 6, 128);
  const memeDescription = assertString(request.data.memeDescription, 'memeDescription', 6, 1000);

  const design = await getDesignRecord(uid, designId);
  const userSnap = await db.collection('users').doc(uid).get();
  const userData = userSnap.data() as Record<string, unknown> | undefined;
  const authorName = typeof userData?.displayName === 'string' && userData.displayName.trim()
    ? userData.displayName
    : typeof userData?.username === 'string' && userData.username.trim()
      ? userData.username
      : 'Creator';

  const baseProduct = BASE_PRODUCTS.find((product) => product.id === design.baseProductId);
  if (!baseProduct) {
    throw new functions.https.HttpsError('failed-precondition', 'Prodotto base non trovato.');
  }

  const docRef = db.collection('communityDesigns').doc();
  await docRef.set({
    authorId: uid,
    authorName,
    authorPhotoURL: typeof userData?.photoURL === 'string' ? userData.photoURL : null,
    image: design.previewAsset.downloadUrl,
    designId,
    memeDescription,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    likes: 0,
    totalSales: 0,
    totalEarnings: 0,
    royaltyRate: 6.9,
    isPublished: true,
    productType: baseProduct.category,
    baseProductId: baseProduct.id,
    baseProductName: baseProduct.name,
    baseProductPrice: baseProduct.price,
    memeBaseId: design.metadata?.memeBaseId ?? null,
    memeBaseName: design.metadata?.memeBaseName ?? null,
    memeBaseCategory: design.metadata?.memeBaseCategory ?? null,
    layerCount: design.metadata?.layerCount ?? design.layerConfig.length,
    hasCustomText: design.metadata?.hasCustomText ?? false,
    hasAILayer: design.metadata?.hasAILayer ?? false,
    tags: design.metadata?.tags ?? [],
  });

  await db.collection('designs').doc(designId).set({
    publishedCommunityDesignId: docRef.id,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return {
    designId,
    communityDesignId: docRef.id,
  };
}

export async function getShippingQuoteHandler(request: CallableRequest<ShippingQuoteRequest>): Promise<ShippingQuoteResponse> {
  const uid = requireAuth(request);
  const cartItems = validateCartItems(request.data.cartItems);
  const shippingAddress = validateShippingAddress(request.data.shippingAddress);

  await buildOrderItems(uid, cartItems);
  const options = await computeShippingOptions(cartItems, shippingAddress);
  const quoteRef = db.collection('shippingQuotes').doc();
  const quote: StoredShippingQuote = {
    userId: uid,
    cartHash: buildCartHash(cartItems),
    addressHash: buildAddressHash(shippingAddress),
    currency: options[0]?.currency ?? 'EUR',
    options,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await quoteRef.set(quote);

  return {
    quoteId: quoteRef.id,
    options,
    currency: quote.currency,
  };
}

export async function createCheckoutSessionHandler(request: CallableRequest<CreateCheckoutSessionRequest>): Promise<CreateCheckoutSessionResponse> {
  const uid = requireAuth(request);
  if (!stripe) {
    throw new functions.https.HttpsError('failed-precondition', 'STRIPE_SECRET_KEY non configurata.');
  }

  const cartItems = validateCartItems(request.data.cartItems);
  const shippingAddress = validateShippingAddress(request.data.shippingAddress);
  const quoteId = assertString(request.data.quoteId, 'quoteId', 6, 128);
  const shippingOptionId = assertString(request.data.shippingOptionId, 'shippingOptionId', 2, 120);

  const quoteSnap = await db.collection('shippingQuotes').doc(quoteId).get();
  if (!quoteSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Shipping quote non trovata.');
  }

  const quote = quoteSnap.data() as StoredShippingQuote;
  if (quote.userId !== uid) {
    throw new functions.https.HttpsError('permission-denied', 'Shipping quote non accessibile.');
  }
  if (quote.cartHash !== buildCartHash(cartItems) || quote.addressHash !== buildAddressHash(shippingAddress)) {
    throw new functions.https.HttpsError('invalid-argument', 'Shipping quote non coerente con il checkout.');
  }

  const shippingOption = quote.options.find((option) => option.id === shippingOptionId);
  if (!shippingOption) {
    throw new functions.https.HttpsError('invalid-argument', 'Opzione di spedizione non valida.');
  }

  const userSnap = await db.collection('users').doc(uid).get();
  const userData = userSnap.data() as Record<string, unknown> | undefined;
  const customerEmail = typeof userData?.email === 'string' ? userData.email : '';
  const orderItems = await buildOrderItems(uid, cartItems);
  const subtotal = Number(orderItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));
  const total = Number((subtotal + shippingOption.rate).toFixed(2));

  const orderRef = db.collection('orders').doc();
  const orderRecord: OrderRecord = {
    id: orderRef.id,
    userId: uid,
    customerEmail,
    paymentStatus: 'pending',
    fulfillmentStatus: 'draft',
    printfulOrderId: null,
    shippingMethod: shippingOption.shipping,
    shippingLabel: shippingOption.label,
    tracking: {},
    address: shippingAddress,
    items: orderItems,
    amounts: {
      currency: shippingOption.currency,
      subtotal,
      shipping: shippingOption.rate,
      total,
    },
    processedEventIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await orderRef.set({
    ...orderRecord,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    ...orderItems.map((item, index) => ({
      quantity: item.quantity,
      price_data: {
        currency: CHECKOUT_CURRENCY,
        unit_amount: Math.round(item.unitPrice * 100),
        product_data: {
          name: item.name,
          images: [item.image],
          metadata: {
            orderItemIndex: String(index),
            baseProductId: item.baseProductId,
          },
        },
      },
    })),
    {
      quantity: 1,
      price_data: {
        currency: CHECKOUT_CURRENCY,
        unit_amount: Math.round(shippingOption.rate * 100),
        product_data: {
          name: `Spedizione ${shippingOption.label}`,
        },
      },
    },
  ];

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: orderRef.id,
    customer_email: customerEmail || undefined,
    line_items: lineItems,
    success_url: `${APP_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/?checkout=cancel`,
    metadata: {
      orderId: orderRef.id,
      quoteId,
      shippingOptionId,
      userId: uid,
    },
  });

  await orderRef.set({
    stripeSessionId: session.id,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return {
    checkoutUrl: session.url ?? '',
    orderId: orderRef.id,
  };
}

async function createRoyaltyLedgerEntries(orderId: string, order: OrderRecord) {
  const batch = db.batch();

  order.items.forEach((item, index) => {
    if (!item.creatorId || !item.royaltyRateSnapshot || !item.communityDesignId) {
      return;
    }

    const amount = Number(((item.totalPrice * item.royaltyRateSnapshot) / 100).toFixed(2));
    const docRef = db.collection('royaltyLedger').doc();
    batch.set(docRef, {
      id: docRef.id,
      orderId,
      orderItemIndex: index,
      designId: item.designId ?? null,
      communityDesignId: item.communityDesignId,
      creatorId: item.creatorId,
      rateSnapshot: item.royaltyRateSnapshot,
      amount,
      currency: order.amounts.currency,
      status: 'pending_fulfillment',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
}

async function buildSignedPlacementUrl(placement: DesignDraftRecord['placements'][number]) {
  const file = bucket.file(placement.asset.storagePath);
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60,
  });

  return signedUrl;
}

async function fulfillPaidOrder(orderId: string) {
  const orderSnap = await db.collection('orders').doc(orderId).get();
  if (!orderSnap.exists) {
    throw new Error(`Order ${orderId} not found.`);
  }

  const order = orderSnap.data() as OrderRecord;
  if (order.printfulOrderId || order.fulfillmentStatus === 'submitted' || order.fulfillmentStatus === 'shipped') {
    return;
  }

  if (!PRINTFUL_API_KEY) {
    await orderSnap.ref.set({
      fulfillmentStatus: 'queued',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return;
  }

  const createdOrder = await printfulFetch<{ data: { id: number } }>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      external_id: orderId,
      shipping: order.shippingMethod ?? 'STANDARD',
      recipient: mapPrintfulRecipient(order.address, order.customerEmail),
    }),
  });

  const printfulOrderId = createdOrder.data.id;

  for (const item of order.items) {
    if (!item.printfulVariantId || item.printfulVariantId <= 0 || !item.designId) {
      throw new Error(`Order item ${item.name} is not Printful ready.`);
    }

    const designSnap = await db.collection('designs').doc(item.designId).get();
    const design = designSnap.data() as DesignDraftRecord | undefined;
    if (!design || design.assetStatus !== 'ready') {
      throw new Error(`Design ${item.designId} not ready for fulfillment.`);
    }

    const placements = await Promise.all(
      design.placements.map(async (placement) => ({
        placement: placement.placement,
        technique: placement.technique,
        layers: [
          {
            type: 'file',
            url: await buildSignedPlacementUrl(placement),
          },
        ],
      })),
    );

    await printfulFetch(`/orders/${printfulOrderId}/order-items`, {
      method: 'POST',
      body: JSON.stringify({
        catalog_variant_id: item.printfulVariantId,
        source: 'catalog',
        quantity: item.quantity,
        placements,
      }),
    });
  }

  await printfulFetch(`/orders/${printfulOrderId}/confirmation`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  await orderSnap.ref.set({
    printfulOrderId,
    fulfillmentStatus: 'submitted',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  await createRoyaltyLedgerEntries(orderId, order);
}

export async function stripeWebhookHandler(req: RawBodyRequest, res: Response) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    res.status(500).send('Stripe webhook non configurato');
    return;
  }

  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') {
    res.status(400).send('Missing stripe-signature');
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    res.status(400).send(`Webhook signature verification failed: ${String(error)}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId || session.client_reference_id;
    if (orderId) {
      const orderRef = db.collection('orders').doc(orderId);
      const snap = await orderRef.get();
      const processedEventIds = (snap.data()?.processedEventIds ?? []) as string[];
      if (!processedEventIds.includes(event.id)) {
        await orderRef.set({
          paymentStatus: 'paid',
          stripeSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          processedEventIds: admin.firestore.FieldValue.arrayUnion(event.id),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        await fulfillPaidOrder(orderId);
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId || session.client_reference_id;
    if (orderId) {
      await db.collection('orders').doc(orderId).set({
        paymentStatus: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
  }

  res.status(200).json({ received: true });
}

function verifyPrintfulWebhook(rawBody: Buffer, signature: string, publicKey?: string) {
  if (!PRINTFUL_WEBHOOK_SECRET) {
    return false;
  }
  if (PRINTFUL_WEBHOOK_PUBLIC_KEY && publicKey !== PRINTFUL_WEBHOOK_PUBLIC_KEY) {
    return false;
  }

  const digest = crypto.createHmac('sha256', PRINTFUL_WEBHOOK_SECRET).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

async function updateRoyaltyLedgerForOrder(orderId: string, status: 'earned' | 'voided' | 'reversed') {
  const snapshot = await db.collection('royaltyLedger').where('orderId', '==', orderId).get();
  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.set(doc.ref, {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  });
  await batch.commit();
}

function extractPrintfulOrderId(payload: Record<string, unknown>): number | null {
  const direct = payload.data as Record<string, unknown> | undefined;
  if (typeof direct?.id === 'number') return direct.id;
  if (typeof direct?.order_id === 'number') return direct.order_id;
  if (typeof payload.order_id === 'number') return payload.order_id;
  return null;
}

export async function printfulWebhookHandler(req: RawBodyRequest, res: Response) {
  const signature = req.headers['x-pf-webhook-signature'];
  const publicKey = req.headers['x-pf-webhook-public-key'];
  if (
    typeof signature !== 'string'
    || typeof publicKey !== 'string'
    || !verifyPrintfulWebhook(req.rawBody, signature, publicKey)
  ) {
    res.status(400).send('Invalid Printful signature');
    return;
  }

  const payload = req.body as Record<string, unknown>;
  const eventType = String(payload.type ?? payload.event ?? '');
  const printfulOrderId = extractPrintfulOrderId(payload);
  if (!printfulOrderId) {
    res.status(200).json({ ignored: true });
    return;
  }

  const querySnap = await db.collection('orders').where('printfulOrderId', '==', printfulOrderId).limit(1).get();
  if (querySnap.empty) {
    res.status(200).json({ ignored: true });
    return;
  }

  const orderRef = querySnap.docs[0].ref;
  const orderId = orderRef.id;
  const data = (payload.data ?? {}) as Record<string, unknown>;

  if (eventType.includes('shipment_sent')) {
    await orderRef.set({
      fulfillmentStatus: 'shipped',
      tracking: {
        number: typeof data.tracking_number === 'string' ? data.tracking_number : null,
        url: typeof data.tracking_url === 'string' ? data.tracking_url : null,
        carrier: typeof data.carrier === 'string' ? data.carrier : null,
        shippedAt: new Date().toISOString(),
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await updateRoyaltyLedgerForOrder(orderId, 'earned');
  } else if (eventType.includes('shipment_delivered')) {
    await orderRef.set({
      fulfillmentStatus: 'delivered',
      tracking: {
        number: typeof data.tracking_number === 'string' ? data.tracking_number : null,
        url: typeof data.tracking_url === 'string' ? data.tracking_url : null,
        carrier: typeof data.carrier === 'string' ? data.carrier : null,
        deliveredAt: new Date().toISOString(),
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await updateRoyaltyLedgerForOrder(orderId, 'earned');
  } else if (eventType.includes('order_failed') || eventType.includes('shipment_canceled') || eventType.includes('order_canceled')) {
    await orderRef.set({
      fulfillmentStatus: 'failed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await updateRoyaltyLedgerForOrder(orderId, 'voided');
  }

  res.status(200).json({ received: true });
}

export async function syncPrintfulCatalogHandler(request: CallableRequest<unknown>) {
  const uid = requireAuth(request);
  await requireAdmin(uid);

  const batch = db.batch();
  for (const fallback of CURATED_CATALOG_VARIANTS) {
    batch.set(db.collection('catalogVariants').doc(fallback.id), {
      ...fallback,
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  if (PRINTFUL_API_KEY) {
    for (const product of BASE_PRODUCTS) {
      if (!product.printfulProductId || product.printfulProductId <= 0) continue;
      try {
        const response = await printfulFetch<{ data: Array<Record<string, unknown>> }>(`/catalog-products/${product.printfulProductId}/catalog-variants`);
        response.data.forEach((variant, index) => {
          const docId = `${product.id}-${String(variant.id)}`;
          batch.set(db.collection('catalogVariants').doc(docId), {
            id: docId,
            baseProductId: product.id,
            label: String(variant.name ?? variant.size ?? variant.color ?? docId),
            size: typeof variant.size === 'string' ? variant.size : undefined,
            colorName: typeof variant.color === 'string' ? variant.color : undefined,
            phoneModel: typeof variant.size === 'string' && product.id === 'base-phonecase' ? variant.size : undefined,
            posterSize: typeof variant.size === 'string' && product.id === 'base-poster' ? variant.size : undefined,
            colorHex: typeof variant.color_code === 'string' ? variant.color_code : undefined,
            printfulProductId: product.printfulProductId,
            printfulVariantId: Number(variant.id),
            placement: product.printfulPlacement,
            technique: product.id === 'base-tshirt' ? 'dtg' : product.id === 'base-phonecase' ? 'uv' : 'print',
            price: Number(variant.retail_price ?? product.price),
            currency: 'EUR',
            active: true,
            sortOrder: index + 1,
            syncedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        });
      } catch (error) {
        console.error(`syncPrintfulCatalog failed for ${product.id}:`, error);
      }
    }
  }

  await batch.commit();
  return { success: true };
}

export async function retryPendingOrdersHandler() {
  const snapshot = await db.collection('orders')
    .where('paymentStatus', '==', 'paid')
    .limit(20)
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data() as OrderRecord;
    if (!['draft', 'queued', 'failed'].includes(data.fulfillmentStatus)) {
      continue;
    }

    try {
      await fulfillPaidOrder(doc.id);
    } catch (error) {
      console.error(`retryPendingOrders failed for ${doc.id}:`, error);
    }
  }
}
