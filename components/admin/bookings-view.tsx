"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format, isSameDay } from "date-fns";
import { Phone, MessageCircle } from "lucide-react";
import { updateTestDrive } from "@/lib/actions/test-drive";
import { updateServiceBooking } from "@/lib/actions/service-booking";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin/status-badge";

const STATUSES = ["PENDING", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;

export type BookingRow = {
  id: string;
  reference: string;
  fullName: string;
  phone: string;
  email?: string | null;
  subtitle: string;
  date: Date;
  timeSlot?: string;
  status: string;
  assigneeId: string | null;
  assigneeName: string | null;
  /** The customer's own free-text note (TestDriveBooking.notes /
   * ServiceBooking.description) — previously queried nowhere in the admin
   * pages, so there was no way to read what the customer actually wrote. */
  message?: string | null;
  /** Extra kind-specific fields (location; plate/VIN/mileage) worth showing
   * in the detail view but not worth cluttering the compact card with. */
  details?: { label: string; value: string }[];
};

export function BookingsView({
  bookings,
  salesUsers,
  kind,
}: {
  bookings: BookingRow[];
  salesUsers: { id: string; fullName: string }[];
  kind: "test-drive" | "service";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openBooking, setOpenBooking] = useState<BookingRow | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, BookingRow[]>();
    for (const booking of bookings) {
      const key = format(booking.date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(booking);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [bookings]);

  function updateBooking(id: string, patch: { status?: string; assigneeId?: string | null }) {
    startTransition(async () => {
      const action = kind === "test-drive" ? updateTestDrive : updateServiceBooking;
      const result = await action({ id, ...patch });
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Updated");
        router.refresh();
      }
    });
  }

  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">No bookings yet.</p>;
  }

  return (
    <div className="space-y-6">
      {groups.map(([dateKey, rows]) => (
        <div key={dateKey}>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            {format(rows[0].date, "EEEE, MMMM d, yyyy")}
            {isSameDay(rows[0].date, new Date()) && <span className="ms-2 text-primary">Today</span>}
          </h2>
          <div className="space-y-2">
            {rows.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="flex flex-wrap items-center gap-4 py-4">
                  <div className="min-w-[160px] flex-1">
                    <button
                      type="button"
                      onClick={() => setOpenBooking(booking)}
                      className="font-medium hover:underline"
                    >
                      {booking.fullName}
                    </button>
                    <p className="text-sm text-muted-foreground">
                      {booking.subtitle} {booking.timeSlot && `· ${booking.timeSlot}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{booking.reference}</p>
                    {booking.message && (
                      <p className="mt-1 line-clamp-1 text-xs text-foreground/80">“{booking.message}”</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      render={<a href={`tel:${booking.phone}`} aria-label="Call"><Phone className="h-4 w-4" /></a>}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      render={
                        <a href={buildWhatsAppLink(booking.phone, `Hi ${booking.fullName}, this is Exceed Limited regarding your booking.`)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      }
                    />
                  </div>
                  <Select
                    value={booking.assigneeId ?? "unassigned"}
                    onValueChange={(v) => updateBooking(booking.id, { assigneeId: v === "unassigned" ? null : v })}
                    disabled={pending}
                  >
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {salesUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={booking.status} onValueChange={(v) => v && updateBooking(booking.id, { status: v })} disabled={pending}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <StatusBadge status={booking.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={!!openBooking} onOpenChange={(open) => !open && setOpenBooking(null)}>
        <DialogContent>
          {openBooking && (
            <>
              <DialogHeader>
                <DialogTitle>{openBooking.fullName}</DialogTitle>
                <DialogDescription>
                  {openBooking.reference} · {format(openBooking.date, "EEEE, MMMM d, yyyy")}
                  {openBooking.timeSlot && ` · ${openBooking.timeSlot}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone" value={openBooking.phone} />
                  {openBooking.email && <Field label="Email" value={openBooking.email} />}
                  <Field label={kind === "test-drive" ? "Model" : "Vehicle"} value={openBooking.subtitle} />
                  <Field label="Status" value={openBooking.status.replace("_", " ")} />
                  <Field label="Assignee" value={openBooking.assigneeName ?? "Unassigned"} />
                  {openBooking.details?.map((d) => <Field key={d.label} label={d.label} value={d.value} />)}
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Message</p>
                  <p className="whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-3">
                    {openBooking.message || "No message left."}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p>{value}</p>
    </div>
  );
}
