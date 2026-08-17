"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Star } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteModel } from "@/lib/actions/models";
import { formatMoney } from "@/lib/currency";

type ModelRow = {
  id: string;
  displayName: string;
  bodyType: string;
  startingPriceUsd: number | null;
  priceOnRequest: boolean;
  status: string;
  isFeatured: boolean;
  thumbnailUrl: string | null;
  _count: { inventory: number };
};

export function ModelsTable({
  models,
  page,
  pageCount,
}: {
  models: ModelRow[];
  page: number;
  pageCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<ModelRow | null>(null);

  const columns: ColumnDef<ModelRow, unknown>[] = [
    {
      accessorKey: "displayName",
      header: "Model",
      meta: { sortable: true },
      cell: ({ row }) => (
        <Link href={`/admin/models/${row.original.id}`} className="flex items-center gap-3 font-medium hover:underline">
          <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-muted">
            {row.original.thumbnailUrl && (
              <Image src={row.original.thumbnailUrl} alt="" fill className="object-cover" unoptimized />
            )}
          </div>
          {row.original.displayName}
          {row.original.isFeatured && <Star className="h-3.5 w-3.5 fill-warning text-warning" />}
        </Link>
      ),
    },
    { accessorKey: "bodyType", header: "Body type" },
    {
      accessorKey: "startingPriceUsd",
      header: "Price",
      meta: { sortable: true },
      cell: ({ row }) =>
        row.original.priceOnRequest || row.original.startingPriceUsd === null
          ? "On request"
          : formatMoney(row.original.startingPriceUsd, "USD"),
    },
    { header: "In stock", cell: ({ row }) => row.original._count.inventory },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => setToDelete(row.original)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <AdminDataTable columns={columns} data={models} pageCount={pageCount} page={page} searchPlaceholder="Search models…" />

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the model and its variants, colors, images, and specs. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  if (!toDelete) return;
                  const result = await deleteModel(toDelete.id);
                  if (!result.success) toast.error(result.error);
                  else {
                    toast.success("Model deleted");
                    router.refresh();
                  }
                  setToDelete(null);
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
