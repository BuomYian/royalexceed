import { requireUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

// Server-side session check here is defense in depth on top of proxy.ts
// (spec §10 "middleware guards all /admin/* routes; server-side session check
// in the admin layout as well").
export default async function DashboardLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar user={{ fullName: user.fullName, email: user.email, role: user.role }} />
        <main className="flex-1 overflow-x-hidden bg-muted/30 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
