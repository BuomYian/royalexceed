import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { BookingsView } from "@/components/admin/bookings-view";

export const metadata = { title: "Service Bookings" };

export default async function AdminServiceBookingsPage() {
  await requirePageAccess("serviceBookings", "read");

  const [bookings, serviceUsers] = await Promise.all([
    prisma.serviceBooking.findMany({ orderBy: { preferredDate: "asc" }, include: { assignee: true } }),
    prisma.user.findMany({
      where: { role: { in: ["SERVICE", "ADMIN", "SUPER_ADMIN"] }, isActive: true },
      select: { id: true, fullName: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">Service Bookings</h1>
        <p className="text-sm text-muted-foreground">{bookings.length} booking(s)</p>
      </div>
      <BookingsView
        kind="service"
        salesUsers={serviceUsers}
        bookings={bookings.map((b) => ({
          id: b.id,
          reference: b.reference,
          fullName: b.fullName,
          phone: b.phone,
          subtitle: `${b.vehicleModel} — ${b.serviceType}`,
          date: b.preferredDate,
          status: b.status,
          assigneeId: b.assigneeId,
          assigneeName: b.assignee?.fullName ?? null,
        }))}
      />
    </div>
  );
}
