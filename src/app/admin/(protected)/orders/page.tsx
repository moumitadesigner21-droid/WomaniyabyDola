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
  return <AdminOrdersPanel initialSearch={search ?? ""} />;
}
