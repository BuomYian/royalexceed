"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { updateLead } from "@/lib/actions/leads";
import type { Lead, LeadStatus, Model, User } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLUMNS: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "NEGOTIATION", "WON", "LOST"];

type LeadWithRelations = Lead & { model: Model | null; assignee: User | null };

export function LeadsKanban({ leads }: { leads: LeadWithRelations[] }) {
  const [items, setItems] = useState(leads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as LeadStatus;
    const lead = items.find((l) => l.id === active.id);
    if (!lead || lead.status === newStatus) return;

    setItems((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l)));
    startTransition(async () => {
      const result = await updateLead({ id: lead.id, status: newStatus });
      if (!result.success) {
        toast.error(result.error);
        router.refresh();
      }
    });
  }

  const activeLead = items.find((l) => l.id === activeId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={items.filter((l) => l.status === status)}
          />
        ))}
      </div>
      <DragOverlay>{activeLead && <LeadCard lead={activeLead} dragging />}</DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ status, leads }: { status: LeadStatus; leads: LeadWithRelations[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-72 shrink-0 rounded-lg border border-border bg-muted/40 p-2 transition-colors",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between px-1 pb-2">
        <h3 className="text-sm font-semibold">{status.replace("_", " ")}</h3>
        <span className="text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div className="space-y-2">
        {leads.map((lead) => (
          <DraggableLead key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

function DraggableLead({ lead }: { lead: LeadWithRelations }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 10 } : undefined}
      className="touch-none"
    >
      <LeadCard lead={lead} />
    </div>
  );
}

function LeadCard({ lead, dragging }: { lead: LeadWithRelations; dragging?: boolean }) {
  return (
    <Card className={cn("cursor-grab gap-1.5 p-3 active:cursor-grabbing", dragging && "shadow-lg")}>
      {/*
        Not a whole-card onClick: the card's drag listeners live on its
        *parent* (DraggableLead's div, below), and relying on dnd-kit's
        activationConstraint alone to still let a plain click through turned
        out unreliable in practice. stopPropagation on pointerdown here
        guarantees dnd-kit's ancestor listener never starts tracking a drag
        that began on this link, so the click always makes it through —
        regardless of dnd-kit's internal pointer-capture details. The rest of
        the card (padding, other fields) stays drag-only, matching the
        existing whole-card-drag UX.
      */}
      <Link
        href={`/admin/leads/${lead.id}`}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-sm font-medium hover:underline"
      >
        {lead.fullName}
      </Link>
      <p className="text-xs text-muted-foreground">{lead.phone}</p>
      {lead.model && <p className="text-xs text-muted-foreground">{lead.model.displayName}</p>}
      {lead.message && <p className="line-clamp-2 text-xs text-foreground/80">{lead.message}</p>}
      <p className="text-xs text-muted-foreground">{lead.assignee?.fullName ?? "Unassigned"}</p>
    </Card>
  );
}
