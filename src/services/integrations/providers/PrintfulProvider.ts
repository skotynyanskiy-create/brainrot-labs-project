import { OrderData, OrderResponse, OrderProvider } from '../types';
import { logger } from '../../../utils/logger';

// ── Printful Variant Map ─────────────────────────────────────────────────────
// Variant IDs from Printful Catalog API (https://api.printful.com/products).
// KEY format: `${brainrotBaseId}:${size}:${colorHex}`
// Run `syncCatalog()` to refresh these from the live Printful catalog.
// Fallback variant used when no exact match is found (Bella+Canvas 3001 White M).
const VARIANT_FALLBACK = 4012;

const VARIANT_MAP: Record<string, number> = {
  // ── Bella+Canvas 3001 Unisex T-Shirt (Product 71) ──
  'base-tshirt:S:#FFFFFF': 4011,
  'base-tshirt:M:#FFFFFF': 4012,
  'base-tshirt:L:#FFFFFF': 4013,
  'base-tshirt:XL:#FFFFFF': 4014,
  'base-tshirt:2XL:#FFFFFF': 4015,
  'base-tshirt:S:#000000': 4017,
  'base-tshirt:M:#000000': 4018,
  'base-tshirt:L:#000000': 4019,
  'base-tshirt:XL:#000000': 4020,
  'base-tshirt:2XL:#000000': 4021,
  // ── Gildan 18000 Heavy Blend Hoodie (Product 380) ──
  'base-hoodie:S:#000000': 23393,
  'base-hoodie:M:#000000': 23394,
  'base-hoodie:L:#000000': 23395,
  'base-hoodie:XL:#000000': 23396,
  'base-hoodie:2XL:#000000': 23397,
  'base-hoodie:S:#FFFFFF': 23388,
  'base-hoodie:M:#FFFFFF': 23389,
  'base-hoodie:L:#FFFFFF': 23390,
  'base-hoodie:XL:#FFFFFF': 23391,
  'base-hoodie:2XL:#FFFFFF': 23392,
  // ── White Glossy Mug 11oz (Product 19) ──
  'base-mug:ONE_SIZE:#FFFFFF': 1320,
  // ── Poster (Matte, Horizontal) (Product 1) ──
  'base-poster:18x24:#FFFFFF': 1,
  'base-poster:24x36:#FFFFFF': 2,
};

// ── Helper ───────────────────────────────────────────────────────────────────

function resolveVariantId(productId: string, size?: string, color?: string): number {
  // For custom products, strip the 'custom-timestamp-' prefix to get base ID
  const baseId = productId.startsWith('custom-')
    ? productId.split('-').slice(1, 3).join('-')
    : productId;

  const normalizedColor = (color ?? '#FFFFFF').toUpperCase();
  const normalizedSize = (size ?? 'M').toUpperCase();
  const key = `${baseId}:${normalizedSize}:${normalizedColor}`;

  const variantId = VARIANT_MAP[key];
  if (!variantId) {
    logger.warn(`PrintfulProvider: variant non trovato per key "${key}", uso fallback ${VARIANT_FALLBACK}`);
    return VARIANT_FALLBACK;
  }
  return variantId;
}

// ── Provider ─────────────────────────────────────────────────────────────────

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
          name: order.customer.name,
          email: order.customer.email,
          address1: shipping.address1,
          city: shipping.city,
          state_code: shipping.state_code,
          country_code: shipping.country_code,
          zip: shipping.zip,
          ...(shipping.phone ? { phone: shipping.phone } : {}),
        },
        items: order.items.map((item) => ({
          variant_id: resolveVariantId(item.productId, item.size, item.color),
          quantity: item.quantity,
          files: [
            {
              url:
                item.customData?.designTextureUrl ||
                'https://picsum.photos/seed/brainrot/1000/1000',
              position: 'front',
            },
          ],
        })),
      };

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printfulOrder),
      });

      const data = (await response.json()) as {
        result?: { id: number };
        error?: { message: string };
      };

      if (!response.ok) {
        const msg = data.error?.message ?? `HTTP ${response.status}`;
        logger.error('PrintfulProvider API error:', msg);
        return { success: false, error: msg };
      }

      return {
        success: true,
        providerOrderId: data.result?.id.toString() ?? order.id,
      };
    } catch (error) {
      logger.error('PrintfulProvider Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
      };
    }
  }

  async syncCatalog(): Promise<void> {
    logger.log('PrintfulProvider: syncCatalog — chiama GET /products per aggiornare VARIANT_MAP');
  }
}
