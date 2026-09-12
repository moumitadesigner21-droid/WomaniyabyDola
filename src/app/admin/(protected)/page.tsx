import { AdminNav } from "@/components/admin/admin-nav";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminNav active="/admin" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminDashboard />
      </main>
    </>
  );
}
