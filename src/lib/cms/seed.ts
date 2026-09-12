import { randomUUID } from "crypto";
import { categories } from "@/lib/categories";
import {
  aboutUsContent,
  allProducts,
  collectionBanners,
  collections,
  contactUsContent,
  heroSlides,
  howWeWorkSteps,
  outfitsProducts,
  products as curatedProducts,
  sareeProducts,
  skirtsAndWrappersProducts,
  storeContact,
  testimonials,
  voicesGalleryContent,
} from "@/lib/data";
import { getDb } from "@/lib/orders/db";
import type { Product } from "@/lib/data";
import { upsertSiteContent } from "@/lib/cms/content-repository";
import type { CmsProductInput } from "@/lib/cms/types";

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function productToInput(product: Product): CmsProductInput {
  return {
    slug: product.slug,
    name: product.name,
    description: product.description ?? null,
    categorySlug: product.category,
    subcategorySlug: product.subcategory ?? null,
    price: product.price,
    salePrice: null,
    sku: product.id,
    stockQuantity: 10,
    inStock: true,
    enabled: true,
    featured: curatedProducts.bestsellers.some((item) => item.slug === product.slug),
    isNew: Boolean(product.isNew),
    isBestseller: Boolean(product.isBestseller),
    onSale: false,
    badgeText: product.isNew ? "NEW" : product.isBestseller ? "BESTSELLER" : null,
    fabric: null,
    color: null,
    careInstructions: null,
    dimensions: product.dimensions ?? null,
    customSizeNote: product.customSizeNote ?? null,
    image: product.image,
    hoverImage: product.hoverImage ?? null,
    imagePosition: product.imagePosition ?? null,
    portrait: Boolean(product.portrait),
    cardBackground: product.cardBackground ?? null,
    highlights: [],
    tags: [],
    sizes: product.sizes ?? [],
    colors: [],
    seoTitle: product.name,
    seoDescription: product.description ?? null,
    videoUrl: null,
    palluImage: null,
    sortOrder: 0,
    images: (product.gallery ?? []).map((url, index) => ({
      url,
      altText: product.name,
      sortOrder: index + 1,
      imageType: "gallery" as const,
    })),
  };
}

function collectSeedProducts(): Product[] {
  const seen = new Set<string>();
  const items: Product[] = [];

  for (const product of [
    ...allProducts,
    ...outfitsProducts,
    ...skirtsAndWrappersProducts,
    ...sareeProducts,
  ]) {
    if (seen.has(product.slug)) continue;
    seen.add(product.slug);
    items.push(product);
  }

  return items;
}

export function isCmsSeeded(): boolean {
  const database = getDb();
  const row = database
    .prepare("SELECT value FROM settings WHERE key = 'cms_seeded'")
    .get() as { value: string } | undefined;
  return row?.value === "1";
}

export function seedCmsFromStaticData() {
  if (isCmsSeeded()) return;

  const database = getDb();
  const now = new Date().toISOString();

  const insertCategory = database.prepare(`
    INSERT INTO categories (slug, name, description, image, sort_order, enabled, seo_title, seo_description)
    VALUES (@slug, @name, @description, @image, @sortOrder, 1, @seoTitle, @seoDescription)
    ON CONFLICT(slug) DO NOTHING
  `);

  const insertSubcategory = database.prepare(`
    INSERT INTO category_subcategories (category_slug, slug, name, sort_order)
    VALUES (@categorySlug, @slug, @name, @sortOrder)
    ON CONFLICT(category_slug, slug) DO NOTHING
  `);

  categories.forEach((category, index) => {
    const collection = collections.find((item) => item.categoryKey === category.slug);
    insertCategory.run({
      slug: category.slug,
      name: category.name,
      description: category.description,
      image: collection?.image ?? null,
      sortOrder: index,
      seoTitle: category.name,
      seoDescription: category.description,
    });

    category.subcategories.forEach((sub, subIndex) => {
      insertSubcategory.run({
        categorySlug: category.slug,
        slug: sub.slug,
        name: sub.name,
        sortOrder: subIndex,
      });
    });
  });

  const insertProduct = database.prepare(`
    INSERT INTO products (
      id, slug, name, description, category_slug, subcategory_slug,
      price, sale_price, sku, stock_quantity, in_stock, enabled, featured,
      is_new, is_bestseller, on_sale, badge_text, fabric, color, care_instructions,
      dimensions, custom_size_note, image, hover_image, image_position, portrait,
      card_background, highlights, tags, sizes, colors, seo_title, seo_description,
      video_url, pallu_image, sort_order, created_at, updated_at
    ) VALUES (
      @id, @slug, @name, @description, @categorySlug, @subcategorySlug,
      @price, @salePrice, @sku, @stockQuantity, @inStock, @enabled, @featured,
      @isNew, @isBestseller, @onSale, @badgeText, @fabric, @color, @careInstructions,
      @dimensions, @customSizeNote, @image, @hoverImage, @imagePosition, @portrait,
      @cardBackground, @highlights, @tags, @sizes, @colors, @seoTitle, @seoDescription,
      @videoUrl, @palluImage, @sortOrder, @createdAt, @updatedAt
    )
  `);

  const insertImage = database.prepare(`
    INSERT INTO product_images (product_id, url, alt_text, sort_order, image_type)
    VALUES (@productId, @url, @altText, @sortOrder, @imageType)
  `);

  collectSeedProducts().forEach((product, index) => {
    const input = productToInput(product);
    const id = product.id || randomUUID();

    insertProduct.run({
      id,
      slug: input.slug,
      name: input.name,
      description: input.description,
      categorySlug: input.categorySlug,
      subcategorySlug: input.subcategorySlug,
      price: input.price,
      salePrice: input.salePrice,
      sku: input.sku,
      stockQuantity: input.stockQuantity ?? 10,
      inStock: input.inStock ? 1 : 0,
      enabled: input.enabled ? 1 : 0,
      featured: input.featured ? 1 : 0,
      isNew: input.isNew ? 1 : 0,
      isBestseller: input.isBestseller ? 1 : 0,
      onSale: input.onSale ? 1 : 0,
      badgeText: input.badgeText,
      fabric: input.fabric,
      color: input.color,
      careInstructions: input.careInstructions,
      dimensions: input.dimensions,
      customSizeNote: input.customSizeNote,
      image: input.image,
      hoverImage: input.hoverImage,
      imagePosition: input.imagePosition,
      portrait: input.portrait ? 1 : 0,
      cardBackground: input.cardBackground,
      highlights: JSON.stringify(input.highlights ?? []),
      tags: JSON.stringify(input.tags ?? []),
      sizes: JSON.stringify(input.sizes ?? []),
      colors: JSON.stringify(input.colors ?? []),
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      videoUrl: input.videoUrl,
      palluImage: input.palluImage,
      sortOrder: index,
      createdAt: now,
      updatedAt: now,
    });

    for (const image of input.images ?? []) {
      insertImage.run({
        productId: id,
        url: image.url,
        altText: image.altText,
        sortOrder: image.sortOrder,
        imageType: image.imageType,
      });
    }
  });

  const defaultNav = [
    { id: "nav-home", label: "Home", href: "/", sortOrder: 0 },
    { id: "nav-shop", label: "Shop", href: "/shop", sortOrder: 1 },
    { id: "nav-gamcha", label: "Gamcha", href: "/category/gamcha", sortOrder: 2 },
    { id: "nav-outfits", label: "Outfits", href: "/category/outfits", sortOrder: 3 },
    { id: "nav-saree", label: "Saree", href: "/category/sarees", sortOrder: 4 },
    { id: "nav-skirts", label: "Skirts & Wrappers", href: "/category/skirts-wrappers", sortOrder: 5 },
    { id: "nav-shrug", label: "Shrug", href: "/category/shrug", sortOrder: 6 },
    { id: "nav-jamdani", label: "Jamdani", href: "/category/jamdani", sortOrder: 7 },
    { id: "nav-dupattas", label: "Dupattas", href: "/category/dupattas", sortOrder: 8 },
    { id: "nav-stoles", label: "Cotton Stoles", href: "/category/cotton-stoles", sortOrder: 9 },
    { id: "nav-about", label: "About Us", href: "/about-us", sortOrder: 10 },
    { id: "nav-contact", label: "Contact Us", href: "/contact-us", sortOrder: 11 },
  ];

  const insertNav = database.prepare(`
    INSERT INTO navigation_items (id, label, href, parent_id, sort_order, enabled, location)
    VALUES (@id, @label, @href, NULL, @sortOrder, 1, 'header')
    ON CONFLICT(id) DO NOTHING
  `);

  defaultNav.forEach((item) => insertNav.run(item));

  upsertSiteContent("hero_slides", heroSlides);
  upsertSiteContent("collection_banners", collectionBanners);
  upsertSiteContent("collections", collections);
  upsertSiteContent("how_we_work", howWeWorkSteps);
  upsertSiteContent("testimonials", testimonials);
  upsertSiteContent("voices_gallery", voicesGalleryContent);
  upsertSiteContent("about_us", aboutUsContent);
  upsertSiteContent("contact_us", contactUsContent);
  upsertSiteContent("store_contact", storeContact);
  upsertSiteContent(
    "homepage_sections",
    [
      { id: "hero", type: "hero", enabled: true, sortOrder: 0, label: "Hero Banner" },
      { id: "collections", type: "collections", enabled: true, sortOrder: 1, label: "See Our Collection" },
      { id: "categories", type: "categories", enabled: true, sortOrder: 2, label: "Shop by Category" },
      { id: "bestsellers", type: "bestsellers", enabled: true, sortOrder: 3, label: "Best Sellers" },
      { id: "how_we_work", type: "how_we_work", enabled: true, sortOrder: 4, label: "How We Work" },
      { id: "testimonials", type: "testimonials", enabled: true, sortOrder: 5, label: "Voices of Womania" },
    ],
  );
  upsertSiteContent("announcement_bar", {
    enabled: true,
    text: "Handcrafted in Jalpaiguri · Free shipping on orders above ₹2,500",
  });
  upsertSiteContent("appearance", {
    logoUrl: "/womania-logo.png",
    faviconUrl: "/favicon.ico",
    primaryColor: "#6B1E2E",
    accentColor: "#C9A227",
    fontHeading: "serif",
    fontBody: "sans-serif",
  });
  upsertSiteContent("seo", {
    siteTitle: "Womania by Dola",
    homepageTitle: "Womania by Dola | Heritage Modern Ethnic Wear",
    homepageDescription:
      "Gamcha sarees, co-ord sets, shrugs & handloom ethnic wear handcrafted by Dola in Jalpaiguri.",
    ogImage: "/hero/01.jpg",
    favicon: "/favicon.ico",
  });
  upsertSiteContent("social", {
    whatsappNumber: "919775301488",
    phone: storeContact.phone,
    email: storeContact.email,
    address: storeContact.address,
    businessHours: storeContact.hours,
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    otherLinks: [],
  });
  upsertSiteContent("shipping_payment", {
    flatShippingRate: 0,
    freeShippingThreshold: 2500,
    codEnabled: true,
    onlinePaymentEnabled: false,
    minOrderValue: 0,
    deliveryZones: "Pan India",
  });
  upsertSiteContent("whatsapp_template", {
    template: `🛍️ NEW ORDER RECEIVED

Order ID: #{{orderNumber}}

Customer Details
Name: {{customerName}}
Phone: {{customerPhone}}
Email: {{customerEmail}}
Address: {{customerAddress}}

Order Details
{{items}}

Subtotal: {{subtotal}}
Shipping: {{shipping}}
Discount: {{discount}}
*Total: {{total}}*

Payment Status: {{paymentStatus}}`,
  });
  upsertSiteContent("customer_whatsapp_template", {
    template: `Hi {{customerName}}! 🛍️

Thank you for shopping with Womania by Dola.

Your order *#{{orderNumber}}* has been received.

{{items}}

Subtotal: {{subtotal}}
Shipping: {{shipping}}
Discount: {{discount}}
*Total: {{total}}*

Payment: {{paymentStatus}}

Delivery address:
{{customerAddress}}

We will contact you on WhatsApp for delivery updates.`,
  });
  upsertSiteContent("policies", {
    shipping: "Orders ship within 3–5 business days across India.",
    returns: "Returns accepted within 7 days for unused items.",
    privacy: "We respect your privacy and never share customer data.",
    terms: "By ordering you agree to our store terms.",
    faq: [],
    sizeGuide: "Most outfits are free size unless noted on the product page.",
    care: "Hand wash or gentle machine wash for handloom fabrics.",
  });

  database
    .prepare(
      "INSERT INTO settings (key, value) VALUES ('cms_seeded', '1') ON CONFLICT(key) DO UPDATE SET value = '1'",
    )
    .run();
}
