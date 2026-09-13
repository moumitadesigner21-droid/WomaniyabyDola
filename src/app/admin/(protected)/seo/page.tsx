import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSeoEditor } from "@/components/admin/editors/seo-editor";

export const metadata = { title: "SEO | Womania Admin" };

export default function AdminSeoPage() {
  return (
    <>
      <AdminNav active="/admin/seo" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminSeoEditor />
      </main>
    </>
  );
}
