import { getSiteContent } from "@/lib/cms/content-repository";
import { getBestsellerProducts, getHeroSlides } from "@/lib/catalog-server";
import type { HomepageSection } from "@/lib/cms/types";

export function getHomepageSections(): HomepageSection[] {
  return getSiteContent<HomepageSection[]>("homepage_sections", []);
}

export function getAnnouncementBar() {
  return getSiteContent<{ enabled: boolean; text: string }>("announcement_bar", {
    enabled: false,
    text: "",
  });
}

export function getCollectionBanners() {
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

export function getShopCollections() {
  return getSiteContent("collections", []);
}

export function getHowWeWorkSteps() {
  return getSiteContent("how_we_work", []);
}

export function getTestimonials() {
  return getSiteContent("testimonials", []);
}

export function getVoicesGallery() {
  return getSiteContent("voices_gallery", null);
}

export function getAboutUsContent() {
  return getSiteContent("about_us", null);
}

export function getContactUsContent() {
  return getSiteContent("contact_us", null);
}

export function getStoreContact() {
  return getSiteContent("store_contact", null);
}

export function getSiteAppearance() {
  return getSiteContent("appearance", null);
}

export function getSiteSeo() {
  return getSiteContent("seo", null);
}

export function getSiteSocial() {
  return getSiteContent("social", null);
}

export function getPolicies() {
  return getSiteContent("policies", null);
}

export function getShippingPaymentSettings() {
  return getSiteContent("shipping_payment", null);
}

export function getWhatsAppTemplate() {
  return getSiteContent<{ template: string }>("whatsapp_template", {
    template: "",
  });
}

export function getCustomerWhatsAppTemplate() {
  return getSiteContent<{ template: string }>("customer_whatsapp_template", {
    template: "",
  });
}

export function getHomepageData() {
  const sections = getHomepageSections()
    .filter((section) => section.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    sections,
    announcement: getAnnouncementBar(),
    heroSlides: getHeroSlides(),
    collectionBanners: getCollectionBanners(),
    collections: getShopCollections(),
    bestsellers: getBestsellerProducts(),
    howWeWork: getHowWeWorkSteps(),
    testimonials: getTestimonials(),
  };
}
