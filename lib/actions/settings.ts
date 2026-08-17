"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireApiAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { updateSiteSettingsSchema, type UpdateSiteSettingsInput } from "@/lib/validations/settings";
import type { ActionResult } from "@/lib/actions/models";

export async function updateSiteSettings(raw: UpdateSiteSettingsInput): Promise<ActionResult> {
  const user = await requireApiAccess("settings", "update");
  const parsed = updateSiteSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { usdToSsp, ...data } = parsed.data;

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: { data, usdToSsp },
    create: { id: "singleton", data, usdToSsp },
  });

  await writeAuditLog({ actorId: user.id, action: "UPDATE", entity: "SiteSetting", entityId: "singleton" });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidateTag("site-settings", "max");
  return { success: true, data: undefined };
}
