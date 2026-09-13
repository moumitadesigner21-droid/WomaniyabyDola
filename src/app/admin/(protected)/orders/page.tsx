import { AdminNav } from "@/components/admin/admin-nav";
import { AdminOrdersPanel } from "@/components/admin/admin-orders";

export const metadata = {
  title: "Orders | Womania Admin",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  // The Customers page deep-links here with ?search=<email>.
  const { search } = await searchParams;
  return (
    <>
      <AdminNav active="/admin/orders" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminOrdersPanel initialSearch={search ?? ""} />
      </main>
    </>
  );
}
