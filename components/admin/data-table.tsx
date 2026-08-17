"use client";

import { useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Server-side paginated/sortable/searchable data table (spec §7 admin UX
 * requirement). Pagination/sort/search state lives in the URL so it survives
 * refresh and is shareable; the parent Server Component page reads
 * `searchParams` and passes back the already-filtered `data` + `pageCount`.
 */
export function AdminDataTable<T>({
  columns,
  data,
  pageCount,
  page,
  searchPlaceholder,
  toolbar,
}: {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  pageCount: number;
  page: number;
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount,
  });

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleSort(columnId: string) {
    const current = searchParams.get("sort");
    const currentDir = searchParams.get("dir");
    if (current !== columnId) {
      updateParam("sort", columnId);
      const params = new URLSearchParams(searchParams.toString());
      params.set("dir", "asc");
      params.set("sort", columnId);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("dir", currentDir === "asc" ? "desc" : "asc");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }
  }

  const activeSort = searchParams.get("sort");
  const activeDir = searchParams.get("dir");

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchPlaceholder && (
          <Input
            placeholder={searchPlaceholder}
            defaultValue={searchParams.get("q") ?? ""}
            className="max-w-xs"
            onChange={(e) => {
              const value = e.target.value;
              if (searchDebounce.current) clearTimeout(searchDebounce.current);
              searchDebounce.current = setTimeout(() => updateParam("q", value || null), 350);
            }}
          />
        )}
        {toolbar}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.columnDef.meta as { sortable?: boolean } | undefined;
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : sortable?.sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(header.column.id)}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {activeSort === header.column.id ? (
                            activeDir === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            )}
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParam("page", String(page - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => updateParam("page", String(page + 1))}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
