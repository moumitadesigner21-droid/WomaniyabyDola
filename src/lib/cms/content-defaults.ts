import {
  aboutUsContent,
  collections,
  contactUsContent,
  howWeWorkSteps,
  testimonials,
  voicesGalleryContent,
} from "@/lib/data";
import {
  HOMEPAGE_SECTION_CATALOGUE,
  aboutUsSchema,
  announcementBarSchema,
  appearanceSchema,
  bestsellersConfigSchema,
  collectionBannersSchema,
  contactUsSchema,
  heroSlidesSchema,
  homepageSectionsSchema,
  howWeWorkSchema,
  policiesSchema,
  seoSchema,
  shippingPaymentSchema,
  shopPageSchema,
  shopCollectionsSchema,
  socialSchema,
  testimonialsSchema,
  voicesGallerySchema,
  whatsappTemplateSchema,
} from "@/lib/cms/content-schemas";

/** Defaults used by the admin "Reset" buttons and as fallbacks when a key is missing. */
export const CONTENT_DEFAULTS = {
  shop_page: shopPageSchema.parse({
    eyebrow: "Heritage Modern",
    title: "Shop the Collection",
    description: "Gamcha sarees, dresses, jackets & more — crafted with love from Jalpaiguri.",
    heroImage: "",
    heroImagePosition: "center center",
  }),
  announcement_bar: announcementBarSchema.parse({
    enabled: true,
    text: "Handcrafted in Jalpaiguri · Free shipping on orders above ₹2,500",
  }),
  homepage_sections: homepageSectionsSchema.parse(
    HOMEPAGE_SECTION_CATALOGUE.map((entry, index) => ({
      id: entry.type,
      type: entry.type,
      enabled: entry.enabled,
      sortOrder: index,
      label: entry.label,
    })),
  ),
  hero_slides: heroSlidesSchema.parse([]),
  collection_banners: collectionBannersSchema.parse([]),
  collections: shopCollectionsSchema.parse(collections),
  bestsellers_config: bestsellersConfigSchema.parse({ productSlugs: [] }),
  how_we_work: howWeWorkSchema.parse(howWeWorkSteps),
  testimonials: testimonialsSchema.parse(testimonials),
  about_us: aboutUsSchema.parse(aboutUsContent),
  voices_gallery: voicesGallerySchema.parse(voicesGalleryContent),
  contact_us: contactUsSchema.parse(contactUsContent),
  policies: policiesSchema.parse({
    shipping: "Orders ship within 3–5 business days across India.",
    returns: "Returns accepted within 7 days for unused items.",
    privacy: "We respect your privacy and never share customer data.",
    terms: "By ordering you agree to our store terms.",
    faq: [],
    sizeGuide: "Most outfits are free size unless noted on the product page.",
    care: "Hand wash or gentle machine wash for handloom fabrics.",
  }),
  social: socialSchema.parse({
    whatsappNumber: "919775301488",
    phone: "9775301488",
    email: "womaniadesignstudio@gmail.com",
    address: "Newtown para, PO & District: Jalpaiguri",
    businessHours: "Mon–Sat · 10:00 AM – 7:00 PM IST",
  }),
  shipping_payment: shippingPaymentSchema.parse({
    flatShippingRate: 0,
    freeShippingThreshold: 2500,
    paymentsEnabled: true,
    minOrderValue: 0,
    deliveryZones: "Pan India",
  }),
  whatsapp_template: whatsappTemplateSchema.parse({
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
  }),
  customer_whatsapp_template: whatsappTemplateSchema.parse({
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
  }),
  appearance: appearanceSchema.parse({
    logoUrl: "/womania-logo.png",
    faviconUrl: "/favicon.ico",
    primaryColor: "#6B1E2E",
    accentColor: "#C9A227",
    fontHeading: "serif",
    fontBody: "sans-serif",
  }),
  seo: seoSchema.parse({
    siteTitle: "Womania by Dola",
    titleTemplate: "%s | Womania by Dola",
    homepageTitle: "Womania by Dola | Heritage Modern Ethnic Wear",
    homepageDescription:
      "Gamcha sarees, co-ord sets, shrugs & handloom ethnic wear handcrafted by Dola in Jalpaiguri.",
    keywords: ["gamcha saree", "handloom ethnic wear", "Jalpaiguri boutique", "Womania by Dola"],
    ogImage: "/hero/01.jpg",
    favicon: "/favicon.ico",
    organization: {
      name: "Womania by Dola",
      phone: "+919775301488",
      email: "womaniadesignstudio@gmail.com",
      locality: "Jalpaiguri",
      region: "West Bengal",
      country: "IN",
    },
  }),
};
