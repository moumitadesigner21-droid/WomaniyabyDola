import { AdminNav } from "@/components/admin/admin-nav";
import { AdminJsonContentEditor } from "@/components/admin/admin-content-editor";

export default function AdminAppearancePage() {
  return (
    <>
      <AdminNav active="/admin/appearance" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-3xl text-maroon">Appearance</h2>
            <p className="mt-2 text-sm text-warm-gray">
              Logo, colours, fonts, and basic visual branding.
            </p>
          </div>
          <AdminJsonContentEditor
            title="Brand Appearance"
            description="logoUrl, faviconUrl, primaryColor, accentColor, fontHeading, fontBody"
            contentKey="appearance"
          />
        </div>
      </main>
    </>
  );
}
