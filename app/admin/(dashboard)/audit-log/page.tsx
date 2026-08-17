import { formatDistanceToNow } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Audit Log" };
const PAGE_SIZE = 50;

export default async function AdminAuditLogPage({ searchParams }: PageProps<"/admin/audit-log">) {
  await requirePageAccess("auditLog", "read");
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { actor: { select: { fullName: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">{total} entries — who changed what and when</p>
      </div>
      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.actor?.fullName ?? "System"}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    {log.entity}
                    {log.entityId && <span className="text-muted-foreground"> #{log.entityId.slice(0, 8)}</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.ipAddress ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDistanceToNow(log.createdAt, { addSuffix: true })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
