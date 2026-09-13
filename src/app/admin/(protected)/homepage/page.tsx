import { AdminNav } from "@/components/admin/admin-nav";
import { AdminHomepageEditor } from "@/components/admin/editors/homepage-editor";

export default function AdminHomepagePage() {
  return (
    <>
      <AdminNav active="/admin/homepage" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminHomepageEditor />
      </main>
    </>
  );
}
