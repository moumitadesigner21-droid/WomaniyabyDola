import { getSiteContent } from "@/lib/cms/content-repository";
import {
  getBestsellerProducts,
  getFeaturedProducts,
  getHeroSlides,
} from "@/lib/catalog-server";
import { mergeHomepageSections } from "@/lib/cms/content-schemas";
import { listNewProducts } from "@/lib/cms/products-repository";
import type { HomepageSection } from "@/lib/cms/types";

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const stored = await getSiteContent<HomepageSection[]>("homepage_sections", []);
  return mergeHomepageSections(stored);
}

export async function getAnnouncementBar() {
  return getSiteContent<{ enabled: boolean; text: string }>("announcement_bar", {
    enabled: false,
    text: "",
  });
}

export async function getCollectionBanners() {
  return getSiteContent<
    {
      title: string;
      subtitle?: string;
      image: string;
      href: string;
      imagePosition?: string;
    }[]
  >("collection_banners", []);
}

export async function getShopCollections() {
  return getSiteContent("collections", []);
}

export async function getHowWeWorkSteps() {
  return getSiteContent("how_we_work", []);
}

export async function getTestimonials() {
  return getSiteContent("testimonials", []);
}

export async function getVoicesGallery() {
  return getSiteContent("voices_gallery", null);
}

export async function getAboutUsContent() {
  return getSiteContent("about_us", null);
}

export async function getContactUsContent() {
  return getSiteContent("contact_us", null);
}

export async function getStoreContact() {
  return getSiteContent("store_contact", null);
}

export async function getSiteAppearance() {
  return getSiteContent("appearance", null);
}

export async function getSiteSeo() {
  return getSiteContent("seo", null);
}

export async function getSiteSocial() {
  return getSiteContent("social", null);
}

export async function getPolicies() {
  return getSiteContent("policies", null);
}

export async function getShippingPaymentSettings() {
  return getSiteContent("shipping_payment", null);
}

export async function getWhatsAppTemplate() {
  return getSiteContent<{ template: string }>("whatsapp_template", {
    template: "",
  });
}

export async function getCustomerWhatsAppTemplate() {
  return getSiteContent<{ template: string }>("customer_whatsapp_template", {
    template: "",
  });
}

export async function getHomepageData() {
  const [
    allSections,
    announcement,
    heroSlides,
    collectionBanners,
    collections,
    bestsellers,
    featured,
    howWeWork,
    testimonials,
    newArrivals,
    aboutUs,
    voices,
    shippingPayment,
    social,
  ] = await Promise.all([
    getHomepageSections(),
    getAnnouncementBar(),
    getHeroSlides(),
    getCollectionBanners(),
    getShopCollections(),
    getBestsellerProducts(),
    getFeaturedProducts(),
    getHowWeWorkSteps(),
    getTestimonials(),
    listNewProducts(8),
    getAboutUsContent(),
    getVoicesGallery(),
    getShippingPaymentSettings(),
    getSiteSocial(),
  ]);

  const sections = allSections
    .filter((section) => section.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    sections,
    announcement,
    heroSlides,
    collectionBanners,
    collections,
    bestsellers,
    featured,
    howWeWork,
    testimonials,
    newArrivals,
    aboutUs,
    voices,
    shippingPayment,
    social,
  };
}
