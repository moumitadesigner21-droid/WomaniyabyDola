import type { Product } from "@/lib/data";
import type { HeroSlide } from "@/lib/data";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Bestsellers } from "@/components/bestsellers";
import { CollectionBanners } from "@/components/collection-banners";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowWeWork } from "@/components/how-we-work";
import { ShopByCategory } from "@/components/shop-by-category";
import { Testimonials } from "@/components/testimonials";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getHomepageData } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export default function Home() {
  const data = getHomepageData();

  const sectionMap: Record<string, React.ReactNode> = {
    hero: <Hero slides={data.heroSlides as HeroSlide[]} />,
    collections: (
      <CollectionBanners banners={data.collectionBanners} />
    ),
    categories: (
      <ShopByCategory collections={data.collections as typeof data.collections} />
    ),
    bestsellers: <Bestsellers products={data.bestsellers as Product[]} />,
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
