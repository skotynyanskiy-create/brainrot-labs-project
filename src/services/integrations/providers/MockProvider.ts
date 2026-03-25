import type { OrderData, OrderResponse, OrderProvider } from '../types';
import { logger } from '../../../utils/logger';

export class MockProvider implements OrderProvider {
  async sendOrder(order: OrderData): Promise<OrderResponse> {
    logger.log("MockProvider: Ricevuto ordine", order.id);
    // Simula una chiamata API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, providerOrderId: `MOCK-${order.id}` });
      }, 1000);
    });
  }

  async syncCatalog(): Promise<void> {
    logger.log("MockProvider: Sincronizzazione catalogo simulata");
  }
}
