import { AdminNav } from "@/components/admin/admin-nav";
import { AdminProductForm } from "@/components/admin/admin-product-form";

export default function AdminNewProductPage() {
  return (
    <>
      <AdminNav active="/admin/products" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminProductForm />
      </main>
    </>
  );
}
