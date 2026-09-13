import type { Metadata } from "next";
import { Suspense } from "react";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { CookieNotice } from "@/components/cookie-notice";
import { HashScroll } from "@/components/hash-scroll";
import { NavigationProgress } from "@/components/navigation-progress";
import { CartProvider } from "@/lib/cart";
import { CustomerProvider } from "@/lib/customer";
import { JsonLd } from "@/components/json-ld";
import { getSeoSettings, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { getAppearance } from "@/lib/site-chrome";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// Every page reads the CMS (nav, announcement, SEO) per request, so nothing is
// prerendered at build time and `next build` never needs data/orders.db.
export const dynamic = "force-dynamic";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [seo, appearance] = await Promise.all([getSeoSettings(), getAppearance()]);
  const template = seo.titleTemplate.includes("%s")
    ? seo.titleTemplate
    : `%s | ${seo.siteTitle}`;

  return {
    metadataBase: getSiteUrl(),
    title: { default: seo.homepageTitle, template },
    description: seo.homepageDescription,
    keywords: seo.keywords.length ? seo.keywords : undefined,
    applicationName: seo.siteTitle,
    icons: { icon: appearance.faviconUrl || seo.favicon },
    verification: seo.googleSiteVerification
      ? { google: seo.googleSiteVerification }
      : undefined,
    openGraph: {
      type: "website",
      siteName: seo.siteTitle,
      title: seo.homepageTitle,
      description: seo.homepageDescription,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      site: seo.twitterHandle || undefined,
      title: seo.homepageTitle,
      description: seo.homepageDescription,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [appearance, organization, website] = await Promise.all([
    getAppearance(),
    organizationJsonLd(),
    websiteJsonLd(),
  ]);
  // Brand colours are editable from /admin/appearance; they override the
  // defaults declared in globals.css.
  const themeVars = {
    "--maroon": appearance.primaryColor,
    "--gold": appearance.accentColor,
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
      style={themeVars}
    >
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        <JsonLd data={[organization, website]} />
        <CustomerProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <HashScroll />
            {children}
            <CookieNotice />
          </CartProvider>
        </CustomerProvider>
      </body>
    </html>
  );
}
