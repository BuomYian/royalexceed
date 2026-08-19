"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Papa from "papaparse";
import { Download, LayoutGrid, Table2, Phone, MessageCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Lead, Model, User } from "@prisma/client";
import { AdminDataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { LeadsKanban } from "@/components/admin/leads-kanban";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type LeadRow = Lead & { model: Model | null; assignee: User | null };

export function LeadsView({
  leads,
  salesUsers,
  view,
}: {
  leads: LeadRow[];
  salesUsers: { id: string; fullName: string }[];
  view: "kanban" | "table";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (typeFilter !== "all" && lead.type !== typeFilter) return false;
      if (assigneeFilter !== "all") {
        if (assigneeFilter === "unassigned" && lead.assigneeId) return false;
        if (assigneeFilter !== "unassigned" && lead.assigneeId !== assigneeFilter) return false;
      }
      return true;
    });
  }, [leads, typeFilter, assigneeFilter]);

  function setView(next: "kanban" | "table") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  function exportCsv() {
    const csv = Papa.unparse(
      filtered.map((l) => ({
        name: l.fullName,
        phone: l.phone,
        email: l.email ?? "",
        type: l.type,
        status: l.status,
        model: l.model?.displayName ?? "",
        assignee: l.assignee?.fullName ?? "",
        createdAt: l.createdAt.toISOString(),
      })),
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns: ColumnDef<LeadRow, unknown>[] = [
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => (
        <Link href={`/admin/leads/${row.original.id}`} className="font-medium hover:underline">
          {row.original.fullName}
        </Link>
      ),
    },
    { accessorKey: "type", header: "Type" },
    { header: "Model", cell: ({ row }) => row.original.model?.displayName ?? "—" },
    { header: "Assignee", cell: ({ row }) => row.original.assignee?.fullName ?? "Unassigned" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "contact",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            render={<a href={`tel:${row.original.phone}`} aria-label="Call"><Phone className="h-4 w-4" /></a>}
          />
          <Button
            variant="ghost"
            size="icon"
            render={
              <a href={buildWhatsAppLink(row.original.phone, `Hi ${row.original.fullName}, this is Royal Exceed Co. Ltd.`)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </a>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {["GENERAL", "QUOTE", "TEST_DRIVE", "SERVICE", "PARTS", "FINANCE", "FLEET", "CALLBACK"].map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={(v) => setAssigneeFilter(v ?? "all")}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Assignee" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {salesUsers.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ms-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <div className="flex rounded-md border border-border">
            <Button variant={view === "kanban" ? "secondary" : "ghost"} size="sm" onClick={() => setView("kanban")}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={view === "table" ? "secondary" : "ghost"} size="sm" onClick={() => setView("table")}>
              <Table2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {view === "kanban" ? (
        <LeadsKanban leads={filtered} />
      ) : (
        <AdminDataTable columns={columns} data={filtered} pageCount={1} page={1} />
      )}
    </div>
  );
}
