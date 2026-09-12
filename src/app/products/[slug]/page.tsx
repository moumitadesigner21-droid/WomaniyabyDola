import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductDetail } from "@/components/product-detail";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getCategoryLabel } from "@/lib/categories";
import { getAllCatalogProducts, getProductBySlug } from "@/lib/catalog-server";

export function generateStaticParams() {
  return getAllCatalogProducts().map((product) => ({ slug: product.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found | Womania by Dola" };
  }

  return {
    title: `${product.name} | Womania by Dola`,
    description: `${product.name} — ${getCategoryLabel(product.category)} handcrafted by Dola.`,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
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
