import { cloudinary, MEDIA_FOLDERS, type MediaFolder } from "@/lib/media";

export type MediaFile = {
  publicId: string;
  url: string;
  updatedAt: string | null;
  sizeBytes: number | null;
};

/** Lists files in a Cloudinary folder (fbm/{folder}) via the Admin API. */
export async function listMediaFiles(folder: MediaFolder): Promise<MediaFile[]> {
  const result = await cloudinary.api.resources({
    type: "upload",
    resource_type: folder === "documents" ? "raw" : "image",
    prefix: `fbm/${folder}/`,
    max_results: 100,
  });

  return (result.resources as Array<{ public_id: string; secure_url: string; created_at: string; bytes: number }>)
    .map((r) => ({
      publicId: r.public_id,
      url: r.secure_url,
      updatedAt: r.created_at,
      sizeBytes: r.bytes,
    }))
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
}

export { MEDIA_FOLDERS };
