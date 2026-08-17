import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { ModelsTable } from "@/components/admin/models-table";

export const metadata = { title: "Models" };

const PAGE_SIZE = 20;

export default async function AdminModelsPage({
  searchParams,
}: PageProps<"/admin/models">) {
  const user = await requirePageAccess("models", "read");
  const canCreate = can(user.role, "models", "create");
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "sortOrder";
  const dir = sp.dir === "desc" ? "desc" : "asc";

  const where = q
    ? { OR: [{ displayName: { contains: q, mode: "insensitive" as const } }, { name: { contains: q, mode: "insensitive" as const } }] }
    : {};

  const [models, total] = await Promise.all([
    prisma.model.findMany({
      where,
      orderBy: { [sort]: dir },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        displayName: true,
        bodyType: true,
        startingPriceUsd: true,
        priceOnRequest: true,
        status: true,
        isFeatured: true,
        thumbnailUrl: true,
        _count: { select: { inventory: true } },
      },
    }),
    prisma.model.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Models</h1>
          <p className="text-sm text-muted-foreground">{total} model(s)</p>
        </div>
        {canCreate && (
          <Button
            render={
              <Link href="/admin/models/new">
                <Plus className="h-4 w-4" /> New model
              </Link>
            }
          />
        )}
      </div>

      <ModelsTable
        models={models.map((m) => ({
          ...m,
          startingPriceUsd: m.startingPriceUsd ? Number(m.startingPriceUsd) : null,
        }))}
        page={page}
        pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
      />
    </div>
  );
}
