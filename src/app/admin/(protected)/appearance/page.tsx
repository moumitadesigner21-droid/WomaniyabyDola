import { AdminNav } from "@/components/admin/admin-nav";
import { AdminAppearanceEditor } from "@/components/admin/editors/appearance-editor";

export const metadata = { title: "Appearance | Womania Admin" };

export default function AdminAppearancePage() {
  return (
    <>
      <AdminNav active="/admin/appearance" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminAppearanceEditor />
      </main>
    </>
  );
}
