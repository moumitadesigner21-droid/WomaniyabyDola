import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { CategoryPageHero } from "@/components/category-page-hero";
import { CategoryContent } from "@/components/category-content";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { JsonLd } from "@/components/json-ld";
import { isCategorySlug } from "@/lib/categories";
import { getCategory } from "@/lib/cms/categories-repository";
import { breadcrumbJsonLd, buildCategoryMetadata, itemListJsonLd } from "@/lib/seo";
import {
  getProductsByCategory,
  getProductsBySubcategory,
} from "@/lib/catalog-server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/category/[category]/[subcategory]">) {
  const { category: categorySlug, subcategory } = await params;
  if (!isCategorySlug(categorySlug)) {
    return { title: "Category Not Found" };
  }
  const category = await getCategory(categorySlug);
  const sub = category?.subcategories.find((item) => item.slug === subcategory);
  if (!category || !sub) return { title: "Category Not Found" };
  return buildCategoryMetadata(category, sub);
}

export default async function SubcategoryPage({
  params,
}: PageProps<"/category/[category]/[subcategory]">) {
  const { category: categorySlug, subcategory } = await params;

  if (!isCategorySlug(categorySlug)) {
    notFound();
  }

  const category = await getCategory(categorySlug);
  const subcategoryDef = category?.subcategories.find(
    (item) => item.slug === subcategory,
  );

  if (!category || !category.enabled || !subcategoryDef) {
    notFound();
  }

  const [categoryProducts, initialProducts] = await Promise.all([
    getProductsByCategory(categorySlug),
    getProductsBySubcategory(categorySlug, subcategory),
  ]);

  if (initialProducts.length === 0) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: category.name, path: `/category/${category.slug}` },
            { name: subcategoryDef.name, path: `/category/${category.slug}/${subcategoryDef.slug}` },
          ]),
          itemListJsonLd(`${subcategoryDef.name} · ${category.name}`, initialProducts),
        ]}
      />
      <AnnouncementBar />
      <Header />
      <main>
        <CategoryPageHero
          category={categorySlug}
          eyebrow={category.name}
          title={subcategoryDef.name}
          description={category.description ?? ""}
        />

        <section className="bg-ivory py-12 lg:py-16">
          <Suspense
            fallback={
              <div className="mx-auto max-w-7xl px-4 py-20 text-center text-warm-gray sm:px-6 lg:px-8">
                Loading products...
              </div>
            }
          >
            <CategoryContent
              category={categorySlug}
              subcategory={subcategory}
              initialProducts={initialProducts}
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
