import { AdminNav } from "@/components/admin/admin-nav";
import { AdminJsonContentEditor } from "@/components/admin/admin-content-editor";

export default function AdminSeoPage() {
  return (
    <>
      <AdminNav active="/admin/seo" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-3xl text-maroon">SEO Settings</h2>
            <p className="mt-2 text-sm text-warm-gray">
              Homepage SEO, Open Graph image, favicon, and site title.
            </p>
          </div>
          <AdminJsonContentEditor
            title="Global SEO"
            description="siteTitle, homepageTitle, homepageDescription, ogImage, favicon"
            contentKey="seo"
          />
        </div>
      </main>
    </>
  );
}
