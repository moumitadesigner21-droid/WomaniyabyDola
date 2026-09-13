import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductDetail } from "@/components/product-detail";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getCategoryLabel } from "@/lib/categories";
import {
  getCmsProductBySlug,
  getProductBySlug,
  getProductImages,
} from "@/lib/catalog-server";
import { JsonLd } from "@/components/json-ld";
import { getCategory } from "@/lib/cms/categories-repository";
import { breadcrumbJsonLd, buildMetadata, productJsonLd } from "@/lib/seo";

// The page reads D1 on every request, so we deliberately do NOT
// pre-render slugs at build time (that would require a seeded DB on the
// build machine).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const [cms, images] = await Promise.all([
    getCmsProductBySlug(slug),
    getProductImages(product),
  ]);
  const title = cms?.seoTitle || product.name;
  const description =
    cms?.seoDescription ||
    product.description ||
    `${product.name} — ${getCategoryLabel(product.category)} handcrafted by Dola.`;

  return buildMetadata({
    title,
    description,
    path: `/products/${product.slug}`,
    image: images[0],
    keywords: [
      product.name,
      getCategoryLabel(product.category),
      ...(cms?.tags ?? []),
      cms?.fabric ?? "",
      cms?.color ?? "",
    ].filter(Boolean),
    noindex: product.inStock === false && !cms?.enabled,
  });
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [cms, images, category] = await Promise.all([
    getCmsProductBySlug(slug),
    getProductImages(product),
    getCategory(product.category),
  ]);
  const categoryName = category?.name ?? getCategoryLabel(product.category);

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product, images, cms?.sku ?? null),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: categoryName, path: `/category/${product.category}` },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
        ]}
      />
      <AnnouncementBar />
      <Header />
      <main className="bg-ivory">
        <Suspense fallback={null}>
          <ProductDetail product={product} />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
