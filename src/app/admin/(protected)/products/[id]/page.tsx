import { AdminProductForm } from "@/components/admin/admin-product-form";

export default async function AdminEditProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;

  return <AdminProductForm productId={id} />;
}
