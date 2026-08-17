import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { LeadDetail } from "@/components/admin/lead-detail";

export const metadata = { title: "Lead detail" };

export default async function LeadDetailPage({ params }: PageProps<"/admin/leads/[id]">) {
  const user = await requirePageAccess("leads", "read");
  const { id } = await params;

  const [lead, salesUsers] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        model: true,
        assignee: true,
        notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { fullName: true } } } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["SALES", "ADMIN", "SUPER_ADMIN"] }, isActive: true },
      select: { id: true, fullName: true },
    }),
  ]);

  if (!lead) notFound();

  return <LeadDetail lead={lead} salesUsers={salesUsers} canDelete={user.role === "SUPER_ADMIN" || user.role === "ADMIN"} />;
}
