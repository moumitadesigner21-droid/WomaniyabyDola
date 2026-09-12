import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { CategoryPageHero } from "@/components/category-page-hero";
import { CategoryContent } from "@/components/category-content";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import {
  categories,
  getCategoryBySlug,
  getCategoryLabel,
  getSubcategoryLabel,
  isCategorySlug,
} from "@/lib/categories";
import {
  getProductsByCategory,
  getProductsBySubcategory,
} from "@/lib/catalog-server";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const params: { category: string; subcategory: string }[] = [];

  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      if (getProductsBySubcategory(category.slug, subcategory.slug).length > 0) {
        params.push({
          category: category.slug,
          subcategory: subcategory.slug,
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[category]/[subcategory]">) {
  const { category: categorySlug, subcategory } = await params;

  if (!isCategorySlug(categorySlug)) {
    return { title: "Category Not Found | Womania by Dola" };
  }

  const label = getSubcategoryLabel(categorySlug, subcategory);

  return {
    title: `${label} | ${getCategoryLabel(categorySlug)} | Womania by Dola`,
    description: `Shop ${label.toLowerCase()} from Womania by Dola.`,
  };
}

export default async function SubcategoryPage({
  params,
}: PageProps<"/category/[category]/[subcategory]">) {
  const { category: categorySlug, subcategory } = await params;

  if (!isCategorySlug(categorySlug)) {
    notFound();
  }

  const category = getCategoryBySlug(categorySlug);
  const subcategoryDef = category?.subcategories.find(
    (item) => item.slug === subcategory,
  );

  if (!category || !subcategoryDef) {
    notFound();
  }

  if (getProductsBySubcategory(categorySlug, subcategory).length === 0) {
    notFound();
  }

  const categoryProducts = getProductsByCategory(categorySlug);
  const initialProducts = getProductsBySubcategory(categorySlug, subcategory);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <CategoryPageHero
          category={categorySlug}
          eyebrow={category.name}
          title={subcategoryDef.name}
          description={category.description}
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
