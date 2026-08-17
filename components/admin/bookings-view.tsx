"use client";

import { useMemo, useTransition } from "react";
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
import { StatusBadge } from "@/components/admin/status-badge";

const STATUSES = ["PENDING", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;

export type BookingRow = {
  id: string;
  reference: string;
  fullName: string;
  phone: string;
  subtitle: string;
  date: Date;
  timeSlot?: string;
  status: string;
  assigneeId: string | null;
  assigneeName: string | null;
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
                    <p className="font-medium">{booking.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.subtitle} {booking.timeSlot && `· ${booking.timeSlot}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{booking.reference}</p>
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
                        <a href={buildWhatsAppLink(booking.phone, `Hi ${booking.fullName}, this is FBM International regarding your booking.`)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
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
                  <Select value={booking.status} onValueChange={(v) => updateBooking(booking.id, { status: v })} disabled={pending}>
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
    </div>
  );
}
