"use server";

import { revalidatePath } from "next/cache";
import { requireApiAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import {
  uploadMedia,
  deleteMedia,
  validateUpload,
  isMediaInUse,
  type MediaFolder,
} from "@/lib/media";
import type { ActionResult } from "@/lib/actions/types";

export async function uploadMediaAction(
  folder: MediaFolder,
  formData: FormData,
): Promise<ActionResult<{ url: string; publicId: string }>> {
  const user = await requireApiAccess("media", "create");

  const file = formData.get("file");
  if (!(file instanceof File)) return { success: false, error: "No file provided" };

  const validationError = validateUpload(folder, file);
  if (validationError) return { success: false, error: validationError };

  try {
    const { url, publicId } = await uploadMedia(folder, file);
    await writeAuditLog({ actorId: user.id, action: "CREATE", entity: "Media", entityId: publicId, changes: { folder, url } });
    revalidatePath("/admin/media");
    return { success: true, data: { url, publicId } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Upload failed" };
  }
}

export async function deleteMediaAction(
  folder: MediaFolder,
  publicId: string,
  url: string,
): Promise<ActionResult> {
  const user = await requireApiAccess("media", "delete");

  const inUse = await isMediaInUse(url);
  if (inUse) {
    return { success: false, error: "This file is still used by published content and can't be deleted." };
  }

  await deleteMedia(publicId, folder);
  await writeAuditLog({ actorId: user.id, action: "DELETE", entity: "Media", entityId: publicId, changes: { folder } });
  revalidatePath("/admin/media");
  return { success: true, data: undefined };
}
