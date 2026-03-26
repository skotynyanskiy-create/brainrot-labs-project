import type { OrderData, OrderResponse, OrderProvider } from '../types';
import { logger } from '../../../utils/logger';
import { BASE_PRODUCTS } from '../../../constants';

// ── Helper ────────────────────────────────────────────────────────────────────
/**
 * Resolve the Printful variant_id for a cart item.
 *
 * Custom product IDs follow the pattern:  `custom-{baseId}-{timestamp}`
 * e.g. `custom-base-tshirt-1712345678901`
 *
 * Resolution order:
 *   1. Exact match on size + colorName
 *   2. Size match only (first available color for that size)
 *   3. First variant in the product
 *
 * Throws if the base product is not found — never silently substitutes.
 */
function resolveVariantId(productId: string, size?: string, color?: string): number {
  // Strip the 'custom-' prefix and trailing timestamp to recover baseId
  // 'custom-base-tshirt-1712345678901' → 'base-tshirt'
  const baseId = productId.startsWith('custom-')
    ? productId.replace(/^custom-/, '').replace(/-\d+$/, '')
    : productId;

  const product = BASE_PRODUCTS.find(p => p.id === baseId);
  if (!product) {
    throw new Error(`Prodotto base "${baseId}" non trovato nel catalogo. Ordine annullato.`);
  }
  if (!product.printfulVariants || product.printfulVariants.length === 0) {
    throw new Error(`Il prodotto "${baseId}" non ha varianti Printful configurate.`);
  }

  const normalizedSize  = (size  ?? '').trim();
  const normalizedColor = (color ?? '').trim();

  // 1. Exact match: size + colorName
  let variant = product.printfulVariants.find(
    v => v.size === normalizedSize && v.colorName === normalizedColor
  );

  // 2. Size-only match (first color available for that size)
  if (!variant && normalizedSize) {
    variant = product.printfulVariants.find(v => v.size === normalizedSize);
    if (variant) {
      logger.warn(
        `PrintfulProvider: colore "${normalizedColor}" non trovato per "${baseId}" taglia "${normalizedSize}", uso primo colore disponibile`
      );
    }
  }

  // 3. First variant in the product
  if (!variant) {
    variant = product.printfulVariants[0];
    logger.warn(
      `PrintfulProvider: taglia "${normalizedSize}" non trovata per "${baseId}", uso primo variant disponibile`
    );
  }

  if (!variant) {
    throw new Error(`Nessun variant disponibile per il prodotto "${baseId}". Ordine annullato.`);
  }

  return variant.id;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export class PrintfulProvider implements OrderProvider {
  private apiKey: string;
  private baseUrl = 'https://api.printful.com';
  private readonly FETCH_TIMEOUT_MS = 15000;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendOrder(order: OrderData): Promise<OrderResponse> {
    try {
      const { shipping } = order.customer;

      const printfulOrder = {
        external_id: order.id, // idempotency — prevents duplicate orders on retry
        recipient: {
          name:         order.customer.name,
          email:        order.customer.email,
          address1:     shipping.address1,
          city:         shipping.city,
          state_code:   shipping.state_code,
          country_code: shipping.country_code,
          zip:          shipping.zip,
          ...(shipping.phone ? { phone: shipping.phone } : {}),
        },
        items: order.items.map((item) => {
          // Resolve the correct Printful placement per product type
          const baseId = item.productId.startsWith('custom-')
            ? item.productId.replace(/^custom-/, '').replace(/-\d+$/, '')
            : item.productId;
          const baseProduct  = BASE_PRODUCTS.find(p => p.id === baseId);
          const placement    = baseProduct?.printfulPlacement ?? 'front';

          const designUrl = item.customData?.designTextureUrl;
          if (!designUrl) {
            throw new Error(`Nessun design trovato per l'articolo "${item.productId}". Carica il design prima di procedere.`);
          }

          return {
            variant_id: resolveVariantId(item.productId, item.size, item.color),
            quantity:   item.quantity,
            files: [
              {
                url:      designUrl,
                position: placement,
              },
            ],
          };
        }),
      };

      // Fetch with timeout via AbortController
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(`${this.baseUrl}/orders`, {
          method:  'POST',
          headers: {
            Authorization:  `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body:   JSON.stringify(printfulOrder),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const data = (await response.json()) as {
        result?: { id: number };
        error?:  { message: string };
      };

      if (!response.ok) {
        const msg = data.error?.message ?? `HTTP ${response.status}`;
        logger.error('PrintfulProvider API error:', msg);
        return { success: false, error: msg };
      }

      return {
        success:         true,
        providerOrderId: data.result?.id.toString() ?? order.id,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error('PrintfulProvider: timeout dopo', this.FETCH_TIMEOUT_MS, 'ms');
        return { success: false, error: 'Timeout connessione Printful. Riprova tra poco.' };
      }
      logger.error('PrintfulProvider Exception:', error);
      return {
        success: false,
        error:   error instanceof Error ? error.message : 'Errore sconosciuto',
      };
    }
  }

  /**
   * Sync catalog variants from Printful API.
   * Call this if you suspect variant IDs have changed (rare for established products).
   * Logs the raw API response — update BASE_PRODUCTS.printfulVariants manually from the output.
   */
  async syncCatalog(): Promise<void> {
    for (const product of BASE_PRODUCTS) {
      try {
        const res = await fetch(`${this.baseUrl}/products/${product.printfulProductId}/variants`, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        });
        const data = await res.json() as { result?: unknown };
        logger.log(`PrintfulProvider syncCatalog — product ${product.id} (${product.printfulProductId}):`, data.result);
      } catch (err) {
        logger.error(`PrintfulProvider syncCatalog — errore per ${product.id}:`, err);
      }
    }
  }
}
