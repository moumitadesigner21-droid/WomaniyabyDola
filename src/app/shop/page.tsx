import { Suspense } from "react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { CategoryPageHero } from "@/components/category-page-hero";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { WhatsAppButton } from "@/components/whatsapp-button";

import { JsonLd } from "@/components/json-ld";
import { getAllCatalogProducts } from "@/lib/catalog-server";
import { CONTENT_DEFAULTS } from "@/lib/cms/content-defaults";
import { getSiteContent } from "@/lib/cms/content-repository";
import { shopPageSchema } from "@/lib/cms/content-schemas";
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
  const [initialProducts, rawShopPage] = await Promise.all([
    getAllCatalogProducts(),
    getSiteContent<unknown>("shop_page", null),
  ]);
  const parsed = shopPageSchema.safeParse(rawShopPage);
  const shopPage = parsed.success ? parsed.data : CONTENT_DEFAULTS.shop_page;

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
          eyebrow={shopPage.eyebrow}
          title={shopPage.title}
          description={shopPage.description}
          image={shopPage.heroImage || null}
          imagePosition={shopPage.heroImagePosition}
        />

        <section className="bg-ivory py-12 lg:py-16">
          <Suspense
            fallback={
              <div className="mx-auto max-w-7xl px-4 py-20 text-center text-warm-gray sm:px-6 lg:px-8">
                Loading products...
              </div>
            }
          >
            <CatalogBrowser products={initialProducts} allProducts={initialProducts} />
          </Suspense>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
