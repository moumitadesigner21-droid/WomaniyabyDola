import { AdminNav } from "@/components/admin/admin-nav";
import { AdminCustomersPanel } from "@/components/admin/admin-customers";

export const metadata = { title: "Customers | Womania Admin" };

export default function AdminCustomersPage() {
  return (
    <>
      <AdminNav active="/admin/customers" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminCustomersPanel />
      </main>
    </>
  );
}
