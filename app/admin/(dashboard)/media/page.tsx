import { requirePageAccess } from "@/lib/auth";
import { listMediaFiles, MEDIA_FOLDERS } from "@/lib/data/media";
import { MediaLibrary } from "@/components/admin/media-library";

export const metadata = { title: "Media Library" };

export default async function AdminMediaPage({ searchParams }: PageProps<"/admin/media">) {
  await requirePageAccess("media", "read");
  const sp = await searchParams;
  const folder = MEDIA_FOLDERS.includes(sp.folder as (typeof MEDIA_FOLDERS)[number])
    ? (sp.folder as (typeof MEDIA_FOLDERS)[number])
    : "vehicles";

  const files = await listMediaFiles(folder).catch(() => []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">Media Library</h1>
        <p className="text-sm text-muted-foreground">Browse and manage Cloudinary media folders</p>
      </div>
      <MediaLibrary folder={folder} files={files} />
    </div>
  );
}
