// Split out from lib/media.ts (which pulls in the server-only Cloudinary
// Node SDK) so Client Components can import just the folder list/type
// without dragging `cloudinary` (and its `fs`/`path` requires) into the
// browser bundle — see components/admin/media-library.tsx.
export const MEDIA_FOLDERS = ["vehicles", "inventory", "news", "brand", "documents"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];
