export type OrderStatus = "new" | "pending" | "completed" | "cancelled";
export type PaymentStatus = "COD" | "paid" | "pending";

export interface OrderItemInput {
  productId?: string;
  slug?: string;
  name: string;
  size?: string;
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
  shipping?: number;
  discount?: number;
  items: OrderItemInput[];
  idempotencyKey: string;
}

export interface OrderItem {
  id: number;
  orderId: string;
  productId: string | null;
  slug: string | null;
  name: string;
  size: string | null;
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
