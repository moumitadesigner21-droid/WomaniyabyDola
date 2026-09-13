import { MediaLibrary } from "@/components/admin/form/media-library";

export const metadata = { title: "Media | Womania Admin" };

export default function AdminMediaPage() {
  return (
    <><div className="mb-8">
          <h2 className="font-serif text-3xl text-maroon">Media Library</h2>
          <p className="mt-2 text-sm text-warm-gray">
            Every image uploaded through the admin. Images still used by a product or
            page cannot be deleted.
          </p>
        </div>
        <MediaLibrary /></>
  );
}
