"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/user";
import { writeAuditLog } from "@/lib/audit";

export type LoginState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { error: "Invalid email or password." };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: data.user.id } });
  if (!dbUser || !dbUser.isActive) {
    await supabase.auth.signOut();
    return { error: "This account is not authorized to access the admin dashboard." };
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { lastLoginAt: new Date() },
  });
  await writeAuditLog({ actorId: dbUser.id, action: "LOGIN", entity: "User", entityId: dbUser.id });

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}
