import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { listModelOptions } from "@/lib/data/models";
import { InventoryForm } from "@/components/admin/inventory-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryInput } from "@/lib/validations/inventory";

export const metadata = { title: "Edit inventory unit" };

export default async function EditInventoryPage({ params }: PageProps<"/admin/inventory/[id]">) {
  await requirePageAccess("inventory", "read");
  const { id } = await params;

  const [unit, models, history] = await Promise.all([
    prisma.inventoryUnit.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    listModelOptions(),
    prisma.auditLog.findMany({
      where: { entity: "InventoryUnit", entityId: id, action: "STATUS_CHANGE" },
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { fullName: true } } },
    }),
  ]);

  if (!unit) notFound();

  const defaultValues: Partial<InventoryInput> = {
    ...unit,
    variantId: unit.variantId ?? undefined,
    vin: unit.vin ?? undefined,
    priceUsd: unit.priceUsd ? Number(unit.priceUsd) : null,
    arrivalDate: unit.arrivalDate?.toISOString().slice(0, 10),
    notes: unit.notes ?? undefined,
    images: unit.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt ?? undefined })),
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-4 font-heading text-2xl font-bold">Edit {unit.stockNumber}</h1>
        <InventoryForm models={models} defaultValues={defaultValues} />
      </div>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Status change history</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No status changes yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {history.map((log) => {
                const changes = log.changes as { from?: string; to?: string } | null;
                return (
                  <li key={log.id} className="border-b border-border/60 pb-2 last:border-0">
                    <p>
                      {changes?.from} → <span className="font-medium">{changes?.to}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.actor?.fullName ?? "System"} · {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
