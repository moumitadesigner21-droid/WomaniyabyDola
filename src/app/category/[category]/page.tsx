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
  isCategorySlug,
} from "@/lib/categories";
import {
  getProductsByCategory,
} from "@/lib/catalog-server";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[category]">) {
  const { category: categorySlug } = await params;

  if (!isCategorySlug(categorySlug)) {
    return { title: "Category Not Found | Womania by Dola" };
  }

  const category = getCategoryBySlug(categorySlug);

  return {
    title: `${getCategoryLabel(categorySlug)} | Womania by Dola`,
    description:
      category?.description ??
      `Shop ${getCategoryLabel(categorySlug)} at Womania by Dola.`,
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/category/[category]">) {
  const { category: categorySlug } = await params;

  if (!isCategorySlug(categorySlug)) {
    notFound();
  }

  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const categoryProducts = getProductsByCategory(categorySlug);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <CategoryPageHero
          category={categorySlug}
          eyebrow="Shop by Category"
          title={category.name}
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
              initialProducts={categoryProducts}
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
