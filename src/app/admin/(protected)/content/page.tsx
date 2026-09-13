import { AdminNav } from "@/components/admin/admin-nav";
import { AdminContentPagesEditor } from "@/components/admin/editors/content-editor";

export default function AdminContentPage() {
  return (
    <>
      <AdminNav active="/admin/content" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminContentPagesEditor />
      </main>
    </>
  );
}
