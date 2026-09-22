import type { Product } from "@/lib/data";
import type { HeroSlide } from "@/lib/data";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Bestsellers } from "@/components/bestsellers";
import { CollectionBanners } from "@/components/collection-banners";
import { FeaturedProducts } from "@/components/featured-products";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowWeWork } from "@/components/how-we-work";
import { LookbookPreview } from "@/components/lookbook-preview";
import { NewArrivals } from "@/components/new-arrivals";
import { StoryTeaser } from "@/components/story-teaser";
import { TrustBenefits } from "@/components/trust-benefits";
import { ShopByCategory } from "@/components/shop-by-category";
import { Testimonials } from "@/components/testimonials";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { aboutUsSchema, voicesGallerySchema } from "@/lib/cms/content-schemas";
import { CONTENT_DEFAULTS } from "@/lib/cms/content-defaults";
import { buildPageMetadata, getSeoSettings } from "@/lib/seo";
import { getHomepageData } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const seo = await getSeoSettings();
  const metadata = await buildPageMetadata("home", {
    title: seo.homepageTitle,
    description: seo.homepageDescription,
    path: "/",
  });
  // The homepage title should not go through the "%s | Site" template.
  return { ...metadata, title: { absolute: String(metadata.title) } };
}

export default async function Home() {
  const data = await getHomepageData();
  const about = aboutUsSchema.safeParse(data.aboutUs);
  const voices = voicesGallerySchema.safeParse(data.voices);
  const shipping = (data.shippingPayment ?? {}) as {
    freeShippingThreshold?: number | null;
    paymentsEnabled?: boolean;
    deliveryZones?: string;
  };

  const sectionMap: Record<string, React.ReactNode> = {
    trust: (
      <TrustBenefits
        freeShippingThreshold={shipping.freeShippingThreshold ?? null}
        paymentsEnabled={shipping.paymentsEnabled ?? true}
        deliveryZones={shipping.deliveryZones}
      />
    ),
    new_arrivals: <NewArrivals products={data.newArrivals} />,
    story: <StoryTeaser content={about.success ? about.data : CONTENT_DEFAULTS.about_us} />,
    lookbook: (
      <LookbookPreview content={voices.success ? voices.data : CONTENT_DEFAULTS.voices_gallery} />
    ),
    hero: <Hero slides={data.heroSlides as HeroSlide[]} />,
    collections: (
      <CollectionBanners banners={data.collectionBanners} />
    ),
    categories: (
      <ShopByCategory collections={data.collections as typeof data.collections} />
    ),
    bestsellers: <Bestsellers products={data.bestsellers as Product[]} />,
    featured: <FeaturedProducts products={data.featured as Product[]} />,
    how_we_work: <HowWeWork steps={data.howWeWork} />,
    testimonials: <Testimonials items={data.testimonials} />,
  };

  return (
    <>
      <AnnouncementBar
        enabled={data.announcement.enabled}
        text={data.announcement.text}
      />
      <Header />
      <main>
        {data.sections.map((section) =>
          sectionMap[section.type] ? (
            <div key={section.id}>{sectionMap[section.type]}</div>
          ) : null,
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
