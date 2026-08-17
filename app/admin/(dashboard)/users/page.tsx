import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/admin/users-manager";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  await requirePageAccess("users", "read");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">Invite staff and manage roles. Super admin only.</p>
      </div>
      <UsersManager users={users} />
    </div>
  );
}
