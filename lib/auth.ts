import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role, User as PrismaUser } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { assertPermission, can, type Action, type Resource } from "@/lib/rbac";

/** Resolves the Supabase session to a Prisma `User` row. Memoized per-request. */
export const getCurrentUser = cache(async (): Promise<PrismaUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !dbUser.isActive) return null;
  return dbUser;
});

/** Page/layout guard — redirects to /admin/login. Defense in depth alongside proxy.ts (spec §10). */
export async function requireUser(): Promise<PrismaUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Page-level role guard — redirects unauthorized staff back to the dashboard. */
export async function requirePageAccess(
  resource: Resource,
  action: Action = "read",
): Promise<PrismaUser> {
  const user = await requireUser();
  if (!can(user.role, resource, action)) {
    redirect("/admin?error=forbidden");
  }
  return user;
}

/**
 * Server Action / route handler guard — throws `ForbiddenError` instead of
 * redirecting, so callers can surface an inline error rather than navigating
 * away mid-mutation.
 */
export async function requireApiAccess(
  resource: Resource,
  action: Action,
): Promise<PrismaUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthenticated");
  }
  assertPermission(user.role, resource, action);
  return user;
}

export function isRole(user: PrismaUser, ...roles: Role[]): boolean {
  return roles.includes(user.role);
}
