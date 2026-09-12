import { AdminNav } from "@/components/admin/admin-nav";
import { AdminOrdersPanel } from "@/components/admin/admin-orders";

export const metadata = {
  title: "Orders | Womania Admin",
};

export default function AdminOrdersPage() {
  return (
    <>
      <AdminNav active="/admin/orders" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminOrdersPanel />
      </main>
    </>
  );
}
