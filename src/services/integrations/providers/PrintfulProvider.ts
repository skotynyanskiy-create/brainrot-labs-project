import { OrderData, OrderResponse, OrderProvider } from '../types';
import { logger } from '../../../utils/logger';
import { BASE_PRODUCTS } from '../../../constants';

// ── Fallback variant ──────────────────────────────────────────────────────────
// Bella+Canvas 3001 White M (product 71) — used when no exact match found.
const VARIANT_FALLBACK = 4012;

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
 *   3. First variant in the product (ultimate fallback)
 */
function resolveVariantId(productId: string, size?: string, color?: string): number {
  // Strip the 'custom-' prefix and trailing timestamp to recover baseId
  // 'custom-base-tshirt-1712345678901' → 'base-tshirt'
  const baseId = productId.startsWith('custom-')
    ? productId.replace(/^custom-/, '').replace(/-\d+$/, '')
    : productId;

  const product = BASE_PRODUCTS.find(p => p.id === baseId);
  if (!product) {
    logger.warn(`PrintfulProvider: prodotto base "${baseId}" non trovato, uso fallback ${VARIANT_FALLBACK}`);
    return VARIANT_FALLBACK;
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

  return variant?.id ?? VARIANT_FALLBACK;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export class PrintfulProvider implements OrderProvider {
  private apiKey: string;
  private baseUrl = 'https://api.printful.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendOrder(order: OrderData): Promise<OrderResponse> {
    try {
      const { shipping } = order.customer;

      const printfulOrder = {
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

          return {
            variant_id: resolveVariantId(item.productId, item.size, item.color),
            quantity:   item.quantity,
            files: [
              {
                url: item.customData?.designTextureUrl
                  || 'https://picsum.photos/seed/brainrot/1000/1000',
                position: placement,
              },
            ],
          };
        }),
      };

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          Authorization:  `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printfulOrder),
      });

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
