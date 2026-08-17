"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Phone, MessageCircle, Mail, Trash2 } from "lucide-react";
import type { Lead, LeadNote, Model, User } from "@prisma/client";
import { updateLead, addLeadNote, deleteLead } from "@/lib/actions/leads";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDistanceToNow } from "date-fns";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "NEGOTIATION", "WON", "LOST"] as const;

type LeadWithRelations = Lead & {
  model: Model | null;
  assignee: User | null;
  notes: (LeadNote & { author: { fullName: string } })[];
};

export function LeadDetail({
  lead,
  salesUsers,
  canDelete,
}: {
  lead: LeadWithRelations;
  salesUsers: { id: string; fullName: string }[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  function updateStatus(status: string) {
    startTransition(async () => {
      const result = await updateLead({ id: lead.id, status });
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Status updated");
        router.refresh();
      }
    });
  }

  function assignTo(assigneeId: string) {
    startTransition(async () => {
      const result = await updateLead({ id: lead.id, assigneeId: assigneeId === "unassigned" ? null : assigneeId });
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Lead assigned");
        router.refresh();
      }
    });
  }

  function submitNote() {
    if (!note.trim()) return;
    startTransition(async () => {
      const result = await addLeadNote({ leadId: lead.id, body: note });
      if (!result.success) toast.error(result.error);
      else {
        setNote("");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">{lead.fullName}</h1>
            <p className="text-sm text-muted-foreground">
              {lead.type} · {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
            </p>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        <Card>
          <CardContent className="space-y-2 pt-6 text-sm">
            <p><span className="text-muted-foreground">Phone:</span> {lead.phone}</p>
            {lead.email && <p><span className="text-muted-foreground">Email:</span> {lead.email}</p>}
            {lead.model && <p><span className="text-muted-foreground">Model:</span> {lead.model.displayName}</p>}
            {lead.message && <p><span className="text-muted-foreground">Message:</span> {lead.message}</p>}
            {lead.source && <p><span className="text-muted-foreground">Source:</span> {lead.source}</p>}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" render={<a href={`tel:${lead.phone}`}><Phone className="h-4 w-4" /> Call</a>} />
          <Button
            variant="outline"
            render={
              <a href={buildWhatsAppLink(lead.phone, `Hi ${lead.fullName}, this is FBM International.`)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            }
          />
          {lead.email && (
            <Button variant="outline" render={<a href={`mailto:${lead.email}`}><Mail className="h-4 w-4" /> Email</a>} />
          )}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note…" rows={3} />
              <Button size="sm" onClick={submitNote} disabled={pending || !note.trim()}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Add note
              </Button>
            </div>
            <ul className="space-y-3">
              {lead.notes.map((n) => (
                <li key={n.id} className="border-b border-border/60 pb-2 text-sm last:border-0">
                  <p>{n.body}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.author.fullName} · {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                  </p>
                </li>
              ))}
              {lead.notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Pipeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Status</p>
              <Select value={lead.status} onValueChange={updateStatus}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Assignee</p>
              <Select value={lead.assigneeId ?? "unassigned"} onValueChange={assignTo}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {salesUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {canDelete && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteLead(lead.id);
                    if (!result.success) toast.error(result.error);
                    else {
                      toast.success("Lead deleted");
                      router.push("/admin/leads");
                    }
                  })
                }
              >
                <Trash2 className="h-4 w-4" /> Delete lead
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
