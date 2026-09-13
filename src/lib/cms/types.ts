import type { CategorySlug } from "@/lib/categories";

export interface CmsProductImage {
  id: number;
  productId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  imageType: "gallery" | "pallu" | "drape" | "video_thumb";
}

export interface CmsProductOption {
  /** e.g. "Size", "Colour" */
  name: string;
  values: string[];
}

export interface CmsProductVariant {
  /** Deterministic id derived from option values, e.g. "size-m__colour-red". */
  id: string;
  productId: string;
  optionValues: Record<string, string>;
  sku: string | null;
  /** null = inherit the product price */
  price: number | null;
  salePrice: number | null;
  stockQuantity: number;
  inStock: boolean;
  image: string | null;
  sortOrder: number;
}

export type CmsProductVariantInput = Omit<CmsProductVariant, "productId" | "id"> & {
  id?: string;
};

export interface CmsProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categorySlug: CategorySlug;
  subcategorySlug: string | null;
  price: number;
  salePrice: number | null;
  sku: string | null;
  stockQuantity: number;
  inStock: boolean;
  enabled: boolean;
  featured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  onSale: boolean;
  badgeText: string | null;
  fabric: string | null;
  color: string | null;
  careInstructions: string | null;
  dimensions: string | null;
  customSizeNote: string | null;
  image: string;
  hoverImage: string | null;
  imagePosition: string | null;
  portrait: boolean;
  cardBackground: string | null;
  highlights: string[];
  tags: string[];
  sizes: string[];
  colors: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  videoUrl: string | null;
  palluImage: string | null;
  sortOrder: number;
  images: CmsProductImage[];
  options: CmsProductOption[];
  variants: CmsProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CmsProductInput {
  slug: string;
  name: string;
  description?: string | null;
  categorySlug: CategorySlug;
  subcategorySlug?: string | null;
  price: number;
  salePrice?: number | null;
  sku?: string | null;
  stockQuantity?: number;
  inStock?: boolean;
  enabled?: boolean;
  featured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  onSale?: boolean;
  badgeText?: string | null;
  fabric?: string | null;
  color?: string | null;
  careInstructions?: string | null;
  dimensions?: string | null;
  customSizeNote?: string | null;
  image: string;
  hoverImage?: string | null;
  imagePosition?: string | null;
  portrait?: boolean;
  cardBackground?: string | null;
  highlights?: string[];
  tags?: string[];
  sizes?: string[];
  colors?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  videoUrl?: string | null;
  palluImage?: string | null;
  sortOrder?: number;
  images?: Omit<CmsProductImage, "id" | "productId">[];
  options?: CmsProductOption[];
  variants?: CmsProductVariantInput[];
}

export interface CmsCategory {
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  /** Photo behind the category page hero; null = illustrated default. */
  heroImage: string | null;
  heroImagePosition: string | null;
  sortOrder: number;
  enabled: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  subcategories: { slug: string; name: string; sortOrder: number }[];
}

export interface CmsNavItem {
  id: string;
  label: string;
  href: string;
  parentId: string | null;
  sortOrder: number;
  enabled: boolean;
  location: "header" | "footer";
}

export interface CmsCoupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  validFrom: string | null;
  validUntil: string | null;
  categorySlug: string | null;
  productId: string | null;
  freeShipping: boolean;
  enabled: boolean;
  createdAt: string;
}

export interface HomepageSection {
  id: string;
  type: string;
  enabled: boolean;
  sortOrder: number;
  label: string;
}

export interface SiteAppearance {
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
}

export interface SiteSeo {
  siteTitle: string;
  homepageTitle: string;
  homepageDescription: string;
  ogImage: string;
  favicon: string;
}

export interface SiteSocial {
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  otherLinks: { label: string; url: string }[];
}

export interface ShippingPaymentSettings {
  flatShippingRate: number;
  freeShippingThreshold: number | null;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  minOrderValue: number;
  deliveryZones: string;
}

export interface WhatsAppTemplateSettings {
  template: string;
}

export interface DashboardStats {
  totalOrders: number;
  newOrders: number;
  pendingOrders: number;
  completedOrders: number;
  revenue: number;
  lowStockProducts: CmsProduct[];
  outOfStockProducts: CmsProduct[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    orderStatus: string;
    createdAt: string;
  }[];
}
