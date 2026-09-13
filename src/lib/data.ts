/**
 * Storefront types plus the default copy used as a fallback when a CMS
 * site-content key is missing. The live catalog and content are in D1 (edit
 * them at /admin); the original seed was exported to db/seed.sql.
 */
import type { CategorySlug } from "./categories";
import { images } from "./images";

export function isExternalLink(href: string) {
  return href.startsWith("http");
}

export function isAnchorLink(href: string) {
  return href.startsWith("/#");
}

export interface HeroSlide {
  desktopImage: string;
  mobileImage: string;
  imagePosition?: string;
  thumbnailPosition?: string;
  meta: string;
  stat: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  active: boolean;
  order: number;
}

export const collections = [
  {
    title: "Gamcha",
    subtitle: "Sarees, dresses & jackets",
    image: images.banners.gamcha,
    href: "/category/gamcha",
    categoryKey: "gamcha",
  },
  {
    title: "Outfits",
    subtitle: "Dresses & co-ord sets",
    image: images.collections.everyday,
    href: "/category/outfits",
    categoryKey: "outfits",
  },
  {
    title: "Shrug",
    subtitle: "Layered ethnic elegance",
    image: images.collections.shrugSilk,
    href: "/category/shrug",
    categoryKey: "shrug",
    imagePosition: "center top",
    portrait: true,
  },
  {
    title: "Skirts & Wrappers",
    subtitle: "Wrapped skirts, dokhona & sets",
    image: images.skirts.gamchaFlared,
    href: "/category/skirts-wrappers",
    categoryKey: "skirts-wrappers",
    portrait: true,
  },
  {
    title: "Saree",
    subtitle: "Silk, cotton & handloom",
    image: images.collections.banarasi,
    href: "/category/sarees",
    categoryKey: "sarees",
  },
  {
    title: "Jamdani",
    subtitle: "Woven poetry on cotton",
    image: images.collections.jamdani,
    href: "/category/jamdani",
    categoryKey: "jamdani",
  },
  {
    title: "Mekhla Chador",
    subtitle: "Select heritage pieces",
    image: images.collections.mekhlaChadorGreen,
    href: "/category/mekhla-chador",
    categoryKey: "mekhla-chador",
  },
  {
    title: "Cotton Stoles",
    subtitle: "2 m · 50 cm handwoven wraps",
    image: "/products/cotton-stoles/red-handwoven-cotton-stole/01.jpg",
    href: "/category/cotton-stoles",
    categoryKey: "cotton-stoles",
    portrait: true,
  },
] as const;

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  subcategory?: string;
  price: number;
  image: string;
  isNew?: boolean;
  isBestseller?: boolean;
  /** Legacy WooCommerce product URL — reference only, not used for navigation. */
  storeUrl?: string;
  imagePosition?: string;
  portrait?: boolean;
  sizes?: string[];
  customSizeNote?: string;
  dimensions?: string;
  gallery?: string[];
  hoverImage?: string;
  description?: string;
  cardBackground?: string;
  /** False when the CMS marks the product sold out. Undefined = static seed data (treated as in stock). */
  inStock?: boolean;
  /** Original price when a sale price is active (from CMS). */
  compareAtPrice?: number;
  /** Option groups (Size, Colour…) when the product has variants. */
  options?: ProductOption[];
  /** Purchasable combinations; when present, one must be chosen to buy. */
  variants?: ProductVariant[];
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  values: Record<string, string>;
  label: string;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  image?: string;
}


export const shopCategories = [
  "all",
  "gamcha",
  "outfits",
  "skirts-wrappers",
  "shrug",
  "sarees",
  "jamdani",
  "mekhla-chador",
  "dupattas",
  "cotton-stoles",
] as const;

export type ShopCategory = (typeof shopCategories)[number];

export function getProductHoverImage(product: Product): string | undefined {
  if (product.hoverImage && product.hoverImage !== product.image) {
    return product.hoverImage;
  }

  return product.gallery?.find((src) => src !== product.image);
}

export const howWeWorkSteps = [
  {
    step: "01",
    title: "Curated Collections",
    description:
      "We handpick the finest traditional and modern styles to match every woman's unique taste.",
    href: "/shop",
  },
  {
    step: "02",
    title: "Easy & Secure Shopping",
    description:
      "Browse, select, and pay with confidence through our user-friendly and secure platform.",
    href: "/shop",
  },
  {
    step: "03",
    title: "Fast & Reliable Delivery",
    description:
      "Sit back and relax — your favorite fashion pieces arrive at your doorstep, quickly and safely.",
    href: "/contact-us",
  },
] as const;

export const aboutUsContent = {
  welcome: {
    eyebrow: "About Us",
    title: "Welcome to Womania by Dola",
    intro:
      "At Womania, we're all about blending tradition with modern style in a way that makes every woman feel elegant, confident, and unique. Founded by Dola Guha Neogi Roy, Womania started as a passion project and has grown into a brand that celebrates the beauty of Indian handloom fabrics with a fresh, contemporary twist.",
  },
  story: {
    title: "The Story Behind Womania",
    paragraphs: [
      "Womania was born from Dola's love for Indian textiles and her vision to make them accessible to the modern woman. Her journey began with a fascination for Gamcha, Khadi, and Tribal fabrics from Assam and the Northeast — and a desire to make these traditional fabrics stand out in everyday fashion.",
      "Starting with Gamcha dresses, sarees, and wrapped skirts, Womania quickly became known for beautifully crafted, sustainable pieces that connect tradition with modern style. Our mission is simple: to make every woman feel empowered and stylish, while supporting artisans and preserving the rich textile heritage of India.",
    ],
    founderName: "Dola Guha Neogi Roy",
    founderBio:
      "The heart and soul behind Womania, Dola has always had a deep passion for Indian textiles. With a keen eye for design and a love for traditional fabrics, she has made it her mission to bring Gamcha, Khadi, and Tribal weaves into everyday fashion — pieces that feel as great as they look.",
    quote: "Crafted for the queen in you.",
  },
  philosophy: {
    title: "Our Philosophy",
    paragraphs: [
      "We believe fashion should be as comfortable as it is beautiful. Each garment is carefully crafted with fabrics that are timeless and incredibly wearable — from the simplicity of Gamcha to the elegance of Khadi and the vibrant patterns of Tribal fabrics from Assam and the Northeast.",
      "Our designs reflect the unique style and spirit of every woman. Whether it's a saree for a special occasion, a Gamcha dress for casual wear, or a wrapped skirt that adds tradition to a modern wardrobe, we have something for every moment.",
    ],
    fabrics: [
      { name: "Gamcha", note: "Patchwork colour & everyday ease" },
      { name: "Khadi", note: "Breathable, elegant handloom" },
      { name: "Tribal Weaves", note: "Northeast heritage & bold pattern" },
    ],
  },
  highlights: [
    {
      title: "Craftsmanship",
      description:
        "Every piece is carefully made using authentic handloom fabrics sourced from talented artisans across India.",
    },
    {
      title: "Timeless Style",
      description:
        "Traditional techniques meet contemporary design — versatile pieces for any occasion.",
    },
    {
      title: "Sustainability",
      description:
        "Eco-friendly practices and ethical production, so fashion is beautiful and responsible.",
    },
    {
      title: "Customizable Fit",
      description:
        "Custom sizing on many garments — because everyone deserves to feel comfortable and confident.",
    },
    {
      title: "Celebrating Tradition",
      description:
        "We honour Indian artisans and craftsmanship, preserving the cultural heritage of our textiles.",
    },
  ],
  promise: {
    title: "Our Promise to You",
    paragraphs: [
      "At Womania, we promise to continue creating fashion that's not just about looking good, but feeling good too. Our clothing is for women who want to feel connected to tradition, but aren't afraid to show off their modern style.",
      "Thank you for choosing Womania by Dola. We're excited to be part of your journey — one that celebrates heritage, creativity, and, of course, style.",
    ],
  },
} as const;

export const testimonials = [
  {
    quote:
      "My gamcha saree from Womania turned every head at the pandal — the checks, the drape, everything felt so me.",
    name: "Womania Client",
    city: "West Bengal",
    rating: 5,
  },
  {
    quote:
      "Wearing a custom Womania gown on the pageant stage felt like carrying our handloom story with pride.",
    name: "Pageant Contestant",
    city: "Designed by Dola",
    rating: 5,
  },
  {
    quote:
      "Interning at the studio taught me how gamcha and khadi become real garments women love to wear.",
    name: "Design Intern",
    city: "Jalpaiguri Studio",
    rating: 5,
  },
  {
    quote:
      "Finally found a brand that reflects my roots and modern taste. Totally in love with Womania!",
    name: "Priya S.",
    city: "Guwahati",
    rating: 5,
  },
];

const voicesBase = "/testimonials/voices";

export const voicesGalleryContent = {
  eyebrow: "Voices of Womania",
  title: "Real women. Real stories.",
  intro:
    "Clients in their favourite drapes, pageant contestants in custom gowns, and interns learning the craft at our Jalpaiguri studio — this is the community behind every stitch.",
  items: [
    {
      id: "voice-01",
      image: `${voicesBase}/01-client-studio-portrait.jpg`,
      alt: "Womania client in a floral open jacket at a studio shoot",
      category: "client" as const,
      caption: "Everyday elegance in Womania",
    },
    {
      id: "voice-02",
      image: `${voicesBase}/02-clients-gamcha-pair.jpg`,
      alt: "Two clients wearing gamcha sarees and matching accessories",
      category: "client" as const,
      caption: "Gamcha sisters at an event",
    },
    {
      id: "voice-03",
      image: `${voicesBase}/03-client-goddess-saree.jpg`,
      alt: "Client in a hand-painted goddess motif saree",
      category: "client" as const,
      caption: "Festive art saree",
    },
    {
      id: "voice-04",
      image: `${voicesBase}/04-client-gamcha-event.jpg`,
      alt: "Client in red and white gamcha saree at a cultural programme",
      category: "client" as const,
      caption: "Gamcha on stage",
    },
    {
      id: "voice-05",
      image: `${voicesBase}/05-client-gamcha-jewelry.jpg`,
      alt: "Client in gamcha saree with shell jewellery",
      category: "client" as const,
      caption: "Checks, shells & confidence",
    },
    {
      id: "voice-06",
      image: `${voicesBase}/06-studio-diwali-team.jpg`,
      alt: "Team celebrating Diwali at the Womania studio",
      category: "studio" as const,
      caption: "Studio diya celebration",
    },
    {
      id: "voice-07",
      image: `${voicesBase}/07-intern-heritage-experience.jpg`,
      alt: "Intern experiencing traditional grain pounding at a heritage site",
      category: "intern" as const,
      caption: "Learning beyond the studio",
    },
    {
      id: "voice-08",
      image: `${voicesBase}/08-studio-interns-team.jpg`,
      alt: "Interns and team at the design studio",
      category: "intern" as const,
      caption: "Our intern family",
    },
    {
      id: "voice-09",
      image: `${voicesBase}/09-intern-workshop.jpg`,
      alt: "Intern at a rural workshop visit",
      category: "intern" as const,
      caption: "Field visit with the team",
    },
    {
      id: "voice-10",
      image: `${voicesBase}/10-pageant-blue-gown.jpg`,
      alt: "Pageant contestant in a custom blue Womania gown",
      category: "pageant" as const,
      caption: "Custom pageant gown",
    },
    {
      id: "voice-11",
      image: `${voicesBase}/11-interns-studio-selfie.jpg`,
      alt: "Interns smiling together inside the studio",
      category: "intern" as const,
      caption: "Behind the sewing machine",
    },
    {
      id: "voice-12",
      image: `${voicesBase}/12-pageant-red-gown.jpg`,
      alt: "Pageant contestant in a red Womania gown with brand badge",
      category: "pageant" as const,
      caption: "Womania on the runway",
    },
    {
      id: "voice-13",
      image: `${voicesBase}/13-pageant-pink-yellow.jpg`,
      alt: "Pageant contestant in pink and yellow custom outfit",
      category: "pageant" as const,
      caption: "Bold colour on stage",
    },
    {
      id: "voice-14",
      image: `${voicesBase}/14-pageant-orange-green.jpg`,
      alt: "Pageant contestant in orange and green handloom gown",
      category: "pageant" as const,
      caption: "Handloom pageant look",
    },
    {
      id: "voice-15",
      image: `${voicesBase}/15-client-embroidered-jacket.jpg`,
      alt: "Client in black gold-embroidered Womania jacket",
      category: "client" as const,
      caption: "Embroidered statement piece",
    },
    {
      id: "voice-16",
      image: `${voicesBase}/16-studio-team-selfie.jpg`,
      alt: "Dola and team selfie at Womania design studio",
      category: "studio" as const,
      caption: "The design studio",
    },
    {
      id: "voice-17",
      image: `${voicesBase}/17-client-art-saree.jpg`,
      alt: "Client in yellow art saree with fish motifs and matching jacket",
      category: "client" as const,
      caption: "Hand-painted fish motifs",
    },
    {
      id: "voice-18",
      image: `${voicesBase}/18-client-gamcha-shrug.jpg`,
      alt: "Client giving a thumbs up in a gamcha-pattern shrug",
      category: "client" as const,
      caption: "Gamcha shrug, real life",
    },
  ],
};

export const storeContact = {
  phone: "9775301488",
  phoneHref: "tel:9775301488",
  email: "womaniadesignstudio@gmail.com",
  emailHref: "mailto:womaniadesignstudio@gmail.com",
  address: "Newtown para, PO & District: Jalpaiguri",
  whatsappHref: "https://wa.me/919775301488",
  hours: "Mon–Sat · 10:00 AM – 7:00 PM IST",
} as const;

export const contactUsContent = {
  hero: {
    eyebrow: "Contact Us",
    title: "Questions, orders & everything in between",
    intro:
      "Whether you're choosing a gamcha shrug, tracking an order, or planning a custom fit — our studio in Jalpaiguri is only a message away.",
  },
  reach: [
    {
      label: "WhatsApp",
      value: "Chat with us",
      href: storeContact.whatsappHref,
      note: "Fastest for orders & sizing",
    },
    {
      label: "Phone",
      value: storeContact.phone,
      href: storeContact.phoneHref,
      note: "Mon–Sat, 10 AM – 7 PM",
    },
    {
      label: "Email",
      value: storeContact.email,
      href: storeContact.emailHref,
      note: "Receipts & detailed queries",
    },
    {
      label: "Studio",
      value: "Jalpaiguri, West Bengal",
      href: "https://maps.google.com/?q=Jalpaiguri+West+Bengal",
      note: storeContact.address,
    },
  ],
  faqEyebrow: "Information & Questions",
  faqTitle: "Frequently Asked Questions",
  formEyebrow: "Write to the Studio",
  formTitle: "Contact us for any questions",
  formNote:
    "Share your details and we'll reply on WhatsApp or email — usually within one business day.",
  faqs: [
    {
      id: "product-match",
      question: "Will I receive the same product that I see in the picture?",
      answer: [
        "At Womania, we ensure that the product you see in the picture is exactly what you receive. All our product images are professionally photographed to reflect the actual design, colour, and details.",
        "If you ever face any issue, our customer support is always here to help.",
      ],
    },
    {
      id: "sales-receipt",
      question: "Where can I view my sales receipt?",
      answer: [
        "You can view your sales receipt in the following ways:",
      ],
      list: [
        "Email confirmation — a receipt is sent to your registered email after placing an order. Check your inbox or spam folder.",
        "My Account → Orders — log in on womaniabydola.com, open Orders, and view or download your receipt.",
        "Need help? Contact us with your order number and we'll resend it right away.",
      ],
    },
    {
      id: "returns",
      question: "How can I return an item?",
      intro: "Returning an item at Womania is simple and hassle-free.",
      steps: [
        "Go to My Account → Orders, log in, and select the order you wish to return.",
        "Click Request Return, choose the item and reason, then submit your request.",
        "You'll receive return instructions by email; our partner may arrange a pickup.",
        "Once verified, your refund is processed within 5–7 business days.",
      ],
    },
    {
      id: "restock",
      question: 'Will you restock items indicated as "out of stock?"',
      answer: [
        "Yes, we do restock popular items. If something is out of stock, click Notify Me on the product page to get an update when it's available again.",
      ],
    },
    {
      id: "shipping",
      question: "Where can I ship my order?",
      answer: [
        "You can ship your order anywhere across India. Enter your complete shipping address at checkout and we'll deliver it to your doorstep.",
      ],
    },
  ],
} as const;
