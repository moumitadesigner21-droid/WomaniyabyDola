export type OrderStatus = "new" | "pending" | "completed" | "cancelled";
export type PaymentStatus = "COD" | "paid" | "pending";

/** Cart line as sent by the browser. Prices are NOT trusted from here. */
export interface OrderItemInput {
  productId?: string;
  slug?: string;
  variantId?: string;
  size?: string;
  quantity: number;
}

/** Fully priced line, produced server-side by `quoteOrder`. */
export interface PricedOrderItem {
  productId: string;
  slug: string;
  name: string;
  /** Variant label ("M / Red") or legacy size; shown on receipts. */
  size: string | null;
  variantId: string | null;
  variantLabel: string | null;
  quantity: number;
  price: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  notes?: string;
  paymentStatus: PaymentStatus;
  /** Server-computed totals from `quoteOrder`. */
  items: PricedOrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode: string | null;
  /** Signed-in customer placing the order, if any. */
  customerId?: string | null;
  idempotencyKey: string;
}

export interface OrderItem {
  id: number;
  orderId: string;
  productId: string | null;
  slug: string | null;
  name: string;
  size: string | null;
  variantId: string | null;
  variantLabel: string | null;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string | null;
  notes: string | null;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode: string | null;
  customerId: string | null;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  whatsappNotified: boolean;
  whatsappError: string | null;
  customerWhatsappNotified: boolean;
  customerWhatsappError: string | null;
  emailNotified: boolean;
  emailError: string | null;
  idempotencyKey: string;
  createdAt: string;
  items: OrderItem[];
}

export interface StoreSettings {
  ownerWhatsappNumber: string;
  orderEmail: string;
  flatShippingRate: number;
}

/** Resolved shipping/payment rules used for pricing (see `getShippingPaymentConfig`). */
export interface ShippingPaymentConfig {
  flatShippingRate: number;
  freeShippingThreshold: number | null;
  codEnabled: boolean;
  minOrderValue: number;
}

export interface CreateOrderResult {
  order: Order;
  whatsappSent: boolean;
  whatsappError: string | null;
  customerWhatsappSent: boolean;
  customerWhatsappError: string | null;
  emailSent: boolean;
  emailError: string | null;
  duplicate: boolean;
}
