import { Suspense } from "react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { CategoryPageHero } from "@/components/category-page-hero";
import { ShopContent } from "@/components/shop-content";
import { WhatsAppButton } from "@/components/whatsapp-button";

import { JsonLd } from "@/components/json-ld";
import { getAllCatalogProducts } from "@/lib/catalog-server";
import { breadcrumbJsonLd, buildPageMetadata, itemListJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return buildPageMetadata("shop", {
    title: "Shop",
    description:
      "Shop gamcha sarees, co-ord sets, dresses, shrugs & ethnic wear — handcrafted by Dola in Jalpaiguri.",
    path: "/shop",
  });
}

export default async function ShopPage() {
  const initialProducts = await getAllCatalogProducts();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
          ]),
          itemListJsonLd("Shop the Collection", initialProducts),
        ]}
      />
      <AnnouncementBar />
      <Header />
      <main>
        <CategoryPageHero
          category="shop"
          eyebrow="Heritage Modern"
          title="Shop the Collection"
          description="Gamcha sarees, dresses, jackets & more — crafted with love from Jalpaiguri."
        />

        <section className="bg-ivory py-12 lg:py-16">
          <Suspense
            fallback={
              <div className="mx-auto max-w-7xl px-4 py-20 text-center text-warm-gray sm:px-6 lg:px-8">
                Loading products...
              </div>
            }
          >
            <ShopContent initialProducts={initialProducts} />
          </Suspense>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
