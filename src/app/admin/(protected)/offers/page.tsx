import { AdminNav } from "@/components/admin/admin-nav";
import { AdminOffersPanel } from "@/components/admin/admin-offers";

export default function AdminOffersPage() {
  return (
    <>
      <AdminNav active="/admin/offers" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminOffersPanel />
      </main>
    </>
  );
}
