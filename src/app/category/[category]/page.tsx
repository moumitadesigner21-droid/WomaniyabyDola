import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { CategoryPageHero } from "@/components/category-page-hero";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { isCategorySlug } from "@/lib/categories";
import { getCategory } from "@/lib/cms/categories-repository";
import { getProductsByCategory } from "@/lib/catalog-server";
import { breadcrumbJsonLd, buildCategoryMetadata, itemListJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/category/[category]">) {
  const { category: categorySlug } = await params;
  if (!isCategorySlug(categorySlug)) {
    return { title: "Category Not Found" };
  }
  const category = await getCategory(categorySlug);
  if (!category) return { title: "Category Not Found" };
  return buildCategoryMetadata(category);
}

export default async function CategoryPage({
  params,
}: PageProps<"/category/[category]">) {
  const { category: categorySlug } = await params;

  if (!isCategorySlug(categorySlug)) {
    notFound();
  }

  const category = await getCategory(categorySlug);
  if (!category || !category.enabled) {
    notFound();
  }

  const categoryProducts = await getProductsByCategory(categorySlug);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: category.name, path: `/category/${category.slug}` },
          ]),
          itemListJsonLd(category.name, categoryProducts),
        ]}
      />
      <AnnouncementBar />
      <Header />
      <main>
        <CategoryPageHero
          category={categorySlug}
          eyebrow="Shop by Category"
          title={category.name}
          description={category.description ?? ""}
          image={category.heroImage}
          imagePosition={category.heroImagePosition}
        />

        <section className="bg-ivory py-12 lg:py-16">
          <Suspense
            fallback={
              <div className="mx-auto max-w-7xl px-4 py-20 text-center text-warm-gray sm:px-6 lg:px-8">
                Loading products...
              </div>
            }
          >
            <CatalogBrowser
              category={categorySlug}
              products={categoryProducts}
              categoryProducts={categoryProducts}
            />
          </Suspense>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
