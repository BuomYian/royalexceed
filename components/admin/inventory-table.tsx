"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
import { deleteInventoryUnit } from "@/lib/actions/inventory";
import { formatMoney } from "@/lib/currency";

type UnitRow = {
  id: string;
  stockNumber: string;
  vin: string | null;
  year: number;
  colorName: string;
  mileageKm: number;
  status: string;
  condition: string;
  priceUsd: number | null;
  model: { displayName: string };
  variant: { name: string } | null;
};

export function InventoryTable({
  units,
  page,
  pageCount,
  canDelete,
}: {
  units: UnitRow[];
  page: number;
  pageCount: number;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<UnitRow | null>(null);

  const columns: ColumnDef<UnitRow, unknown>[] = [
    {
      accessorKey: "stockNumber",
      header: "Stock #",
      meta: { sortable: true },
      cell: ({ row }) => (
        <Link href={`/admin/inventory/${row.original.id}`} className="font-medium hover:underline">
          {row.original.stockNumber}
        </Link>
      ),
    },
    { header: "Model", cell: ({ row }) => `${row.original.model.displayName}${row.original.variant ? ` — ${row.original.variant.name}` : ""}` },
    { accessorKey: "year", header: "Year", meta: { sortable: true } },
    { accessorKey: "colorName", header: "Color" },
    { header: "VIN", cell: ({ row }) => row.original.vin ?? "—" },
    { header: "Mileage", cell: ({ row }) => `${row.original.mileageKm.toLocaleString()} km` },
    {
      header: "Price",
      cell: ({ row }) => (row.original.priceUsd ? formatMoney(row.original.priceUsd) : "—"),
    },
    { accessorKey: "status", header: "Status", meta: { sortable: true }, cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    ...(canDelete
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: UnitRow } }) => (
              <Button variant="ghost" size="icon" onClick={() => setToDelete(row.original)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            ),
          } as ColumnDef<UnitRow, unknown>,
        ]
      : []),
  ];

  return (
    <>
      <AdminDataTable columns={columns} data={units} pageCount={pageCount} page={page} searchPlaceholder="Search stock #, color, model…" />
      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.stockNumber}?</AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  if (!toDelete) return;
                  const result = await deleteInventoryUnit(toDelete.id);
                  if (!result.success) toast.error(result.error);
                  else {
                    toast.success("Unit deleted");
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
