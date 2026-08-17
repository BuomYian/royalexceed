import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { LeadsView } from "@/components/admin/leads-view";

export const metadata = { title: "Leads" };

export default async function AdminLeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  await requirePageAccess("leads", "read");
  const sp = await searchParams;
  const view = sp.view === "table" ? "table" : "kanban";

  const [leads, salesUsers] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      include: { model: true, assignee: true },
    }),
    prisma.user.findMany({
      where: { role: { in: ["SALES", "ADMIN", "SUPER_ADMIN"] }, isActive: true },
      select: { id: true, fullName: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">Leads</h1>
        <p className="text-sm text-muted-foreground">{leads.length} lead(s)</p>
      </div>
      <LeadsView leads={leads} salesUsers={salesUsers} view={view} />
    </div>
  );
}
