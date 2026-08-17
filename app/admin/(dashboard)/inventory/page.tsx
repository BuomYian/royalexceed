import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { CsvImportDialog } from "@/components/admin/csv-import-dialog";
import { InventoryTable } from "@/components/admin/inventory-table";

export const metadata = { title: "Inventory" };
const PAGE_SIZE = 20;

export default async function AdminInventoryPage({
  searchParams,
}: PageProps<"/admin/inventory">) {
  const user = await requirePageAccess("inventory", "read");
  const canCreate = can(user.role, "inventory", "create");
  const canDelete = can(user.role, "inventory", "delete");
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "createdAt";
  const dir = sp.dir === "asc" ? "asc" : "desc";

  const where = q
    ? {
        OR: [
          { stockNumber: { contains: q, mode: "insensitive" as const } },
          { colorName: { contains: q, mode: "insensitive" as const } },
          { model: { displayName: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [units, total] = await Promise.all([
    prisma.inventoryUnit.findMany({
      where,
      orderBy: { [sort]: dir },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { model: { select: { displayName: true } }, variant: { select: { name: true } } },
    }),
    prisma.inventoryUnit.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">{total} unit(s)</p>
        </div>
        <div className="flex gap-2">
          {canCreate && <CsvImportDialog />}
          {canCreate && (
            <Button
              render={
                <Link href="/admin/inventory/new">
                  <Plus className="h-4 w-4" /> Add unit
                </Link>
              }
            />
          )}
        </div>
      </div>

      <InventoryTable
        units={units.map((u) => ({
          ...u,
          priceUsd: u.priceUsd ? Number(u.priceUsd) : null,
        }))}
        page={page}
        pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        canDelete={canDelete}
      />
    </div>
  );
}
