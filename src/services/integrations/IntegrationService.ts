import { OrderData, OrderResponse, OrderProvider } from './types';
import { logger } from '../../utils/logger';

export class IntegrationService {
  private provider: OrderProvider;

  constructor(provider: OrderProvider) {
    this.provider = provider;
  }

  async processOrder(order: OrderData): Promise<OrderResponse> {
    try {
      return await this.provider.sendOrder(order);
    } catch (error) {
      logger.error("Errore durante l'invio dell'ordine:", error);
      return { success: false, error: String(error) };
    }
  }

  async syncCatalog(): Promise<void> {
    await this.provider.syncCatalog();
  }
}
