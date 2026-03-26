export interface ShippingAddress {
  address1: string;
  city: string;
  state_code: string;   // Provincia/Stato (es. "MI", "RM")
  country_code: string; // ISO 3166-1 alpha-2 (es. "IT", "US")
  zip: string;
  phone?: string;
}

export interface OrderCustomer {
  name: string;
  email: string;
  shipping: ShippingAddress;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  customData?: {
    designTextureUrl?: string;
  };
}

export interface OrderData {
  id: string;
  userId?: string;
  customer: OrderCustomer;
  items: OrderItem[];
  total: number;
}

export interface OrderResponse {
  success: boolean;
  providerOrderId?: string;
  error?: string;
}

export interface OrderProvider {
  sendOrder(order: OrderData): Promise<OrderResponse>;
  syncCatalog(): Promise<void>;
}
