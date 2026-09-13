import { AdminNav } from "@/components/admin/admin-nav";
import { MediaLibrary } from "@/components/admin/form/media-library";

export const metadata = { title: "Media | Womania Admin" };

export default function AdminMediaPage() {
  return (
    <>
      <AdminNav active="/admin/media" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-serif text-3xl text-maroon">Media Library</h2>
          <p className="mt-2 text-sm text-warm-gray">
            Every image uploaded through the admin. Images still used by a product or
            page cannot be deleted.
          </p>
        </div>
        <MediaLibrary />
      </main>
    </>
  );
}
