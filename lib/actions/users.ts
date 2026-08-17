"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireApiAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { inviteUserSchema, updateUserSchema, type InviteUserInput, type UpdateUserInput } from "@/lib/validations/user";
import type { ActionResult } from "@/lib/actions/models";

export async function inviteUser(raw: InviteUserInput): Promise<ActionResult<{ id: string }>> {
  const actor = await requireApiAccess("users", "create");
  const parsed = inviteUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const supabase = createServiceRoleClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data: invited, error } = await supabase.auth.admin.inviteUserByEmail(data.email, {
    redirectTo: `${siteUrl}/admin/login`,
  });

  if (error || !invited.user) {
    return { success: false, error: error?.message ?? "Failed to invite user" };
  }

  const user = await prisma.user.create({
    data: {
      id: invited.user.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      phone: data.phone,
    },
  });

  await writeAuditLog({ actorId: actor.id, action: "CREATE", entity: "User", entityId: user.id, changes: { email: data.email, role: data.role } });
  revalidatePath("/admin/users");
  return { success: true, data: { id: user.id } };
}

export async function updateUser(raw: UpdateUserInput): Promise<ActionResult> {
  const actor = await requireApiAccess("users", "update");
  const parsed = updateUserSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Validation failed" };
  const { id, ...data } = parsed.data;

  if (id === actor.id && data.isActive === false) {
    return { success: false, error: "You cannot deactivate your own account." };
  }

  await prisma.user.update({ where: { id }, data });
  await writeAuditLog({ actorId: actor.id, action: "UPDATE", entity: "User", entityId: id, changes: data });
  revalidatePath("/admin/users");
  return { success: true, data: undefined };
}

export async function deactivateUser(id: string): Promise<ActionResult> {
  return updateUser({ id, isActive: false });
}
