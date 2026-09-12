import { AdminNav } from "@/components/admin/admin-nav";
import { AdminProductsPanel } from "@/components/admin/admin-products";

export default function AdminProductsPage() {
  return (
    <>
      <AdminNav active="/admin/products" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminProductsPanel />
      </main>
    </>
  );
}
