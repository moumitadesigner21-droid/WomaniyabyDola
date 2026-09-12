import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSettingsPanel } from "@/components/admin/admin-settings";

export const metadata = {
  title: "Settings | Womania Admin",
};

export default function AdminSettingsPage() {
  return (
    <>
      <AdminNav active="/admin/settings" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminSettingsPanel />
      </main>
    </>
  );
}
