import { cache } from "react";
import { listNavigation } from "@/lib/cms/navigation-repository";
import type { CmsNavItem, SiteAppearance, SiteSocial } from "@/lib/cms/types";
import {
  getAnnouncementBar,
  getPolicies,
  getSiteAppearance,
  getSiteSocial,
} from "@/lib/storefront";

/** Defaults mirror the seed in `cms/seed.ts` so a partially-edited blob still renders. */
const DEFAULT_SOCIAL: SiteSocial = {
  whatsappNumber: "919775301488",
  phone: "9775301488",
  email: "womaniadesignstudio@gmail.com",
  address: "Newtown para, PO & District: Jalpaiguri",
  businessHours: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  otherLinks: [],
};

const DEFAULT_APPEARANCE: SiteAppearance = {
  logoUrl: "/womania-logo.png",
  faviconUrl: "/favicon.ico",
  primaryColor: "#6B1E2E",
  accentColor: "#C9A227",
  fontHeading: "serif",
  fontBody: "sans-serif",
};

export interface NavLinkItem {
  label: string;
  href: string;
  children?: NavLinkItem[];
}

export const getSocial = cache(async (): Promise<SiteSocial> => {
  return { ...DEFAULT_SOCIAL, ...((await getSiteSocial()) ?? {}) };
});

export const getAppearance = cache(async (): Promise<SiteAppearance> => {
  return { ...DEFAULT_APPEARANCE, ...((await getSiteAppearance()) ?? {}) };
});

/** Digits-only WhatsApp number with India country code applied when missing. */
export function normalizeWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

function toNavLinks(items: CmsNavItem[]): NavLinkItem[] {
  const enabled = items.filter((item) => item.enabled);
  const byParent = new Map<string, CmsNavItem[]>();
  for (const item of enabled) {
    if (!item.parentId) continue;
    const list = byParent.get(item.parentId) ?? [];
    list.push(item);
    byParent.set(item.parentId, list);
  }
  const sort = (list: CmsNavItem[]) => [...list].sort((a, b) => a.sortOrder - b.sortOrder);

  return sort(enabled.filter((item) => !item.parentId)).map((item) => {
    const children = sort(byParent.get(item.id) ?? []).map((child) => ({
      label: child.label,
      href: child.href,
    }));
    return children.length
      ? { label: item.label, href: item.href, children }
      : { label: item.label, href: item.href };
  });
}

export const getHeaderNav = cache(async (): Promise<NavLinkItem[]> => {
  return toNavLinks(await listNavigation("header"));
});

export const getFooterNav = cache(async (): Promise<NavLinkItem[]> => {
  return toNavLinks(await listNavigation("footer"));
});

export interface PolicyLink {
  label: string;
  href: string;
}

/** Support links shown in the footer; only policies with content get a link. */
export async function getPolicyLinks(): Promise<PolicyLink[]> {
  const policies = (await getPolicies()) as Record<string, unknown> | null;
  if (!policies) return [];

  const candidates: { key: string; label: string }[] = [
    { key: "shipping", label: "Shipping Policy" },
    { key: "returns", label: "Refund & Returns" },
    { key: "sizeGuide", label: "Size Guide" },
    { key: "care", label: "Care Instructions" },
    { key: "privacy", label: "Privacy Policy" },
    { key: "terms", label: "Terms & Conditions" },
    { key: "faq", label: "FAQ" },
  ];

  return candidates
    .filter(({ key }) => {
      const value = policies[key];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    })
    .map(({ key, label }) => ({ label, href: `/policies#${key}` }));
}

export const getAnnouncement = cache(async () => getAnnouncementBar());
