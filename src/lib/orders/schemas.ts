import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  /** Variant id when the product has options (Size/Colour…). */
  variantId: z.string().trim().max(200).optional(),
  /** Legacy size-only products. */
  size: z.string().trim().max(40).optional(),
  quantity: z.number().int().min(1).max(50),
});

export const quoteSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Your cart is empty.").max(50),
  couponCode: z.string().trim().max(40).optional(),
});
