import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

/** Cloudinary folders under the `fbm/` root — mirrors the spec's original bucket split by content type. */
export const MEDIA_FOLDERS = ["vehicles", "inventory", "news", "brand", "documents"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB, spec §10
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export function validateUpload(folder: MediaFolder, file: File) {
  if (folder === "documents") {
    if (file.type !== "application/pdf") {
      return "Only PDF files are allowed for documents.";
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      return "File exceeds the 10MB limit.";
    }
    return null;
  }

  if (!IMAGE_MIME_TYPES.includes(file.type)) {
    return "Only PNG, JPEG, WebP, or AVIF images are allowed.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image exceeds the 5MB limit.";
  }
  return null;
}

/**
 * Uploads to Cloudinary under `fbm/{folder}/`. Cloudinary strips EXIF/IPTC/XMP
 * metadata from uploads by default (metadata is only preserved when
 * `image_metadata: true` is explicitly requested, which we never do) —
 * satisfying spec §10 "strip EXIF" with no extra image processing step.
 */
export async function uploadMedia(folder: MediaFolder, file: File) {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Media storage isn't configured yet — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (see .env.example).",
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `fbm/${folder}`,
    resource_type: folder === "documents" ? "raw" : "image",
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteMedia(publicId: string, folder: MediaFolder) {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: folder === "documents" ? "raw" : "image",
  });
}

/** Blocks deleting a media asset from the library while it's still referenced by published content. */
export async function isMediaInUse(url: string): Promise<boolean> {
  const counts = await Promise.all([
    prisma.model.count({
      where: {
        OR: [
          { heroImageUrl: url },
          { thumbnailUrl: url },
          { ogImageUrl: url },
          { brochureUrl: url },
        ],
      },
    }),
    prisma.modelImage.count({ where: { url } }),
    prisma.modelColor.count({ where: { imageUrl: url } }),
    prisma.featureBlock.count({ where: { imageUrl: url } }),
    prisma.inventoryImage.count({ where: { url } }),
    prisma.article.count({ where: { coverImageUrl: url } }),
    prisma.testimonial.count({ where: { avatarUrl: url } }),
  ]);
  return counts.reduce((sum, n) => sum + n, 0) > 0;
}
