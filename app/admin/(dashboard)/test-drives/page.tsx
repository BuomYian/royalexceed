import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { BookingsView } from "@/components/admin/bookings-view";

export const metadata = { title: "Test Drives" };

export default async function AdminTestDrivesPage() {
  await requirePageAccess("testDrives", "read");

  const [bookings, salesUsers] = await Promise.all([
    prisma.testDriveBooking.findMany({
      orderBy: { preferredDate: "asc" },
      include: { model: true, assignee: true },
    }),
    prisma.user.findMany({
      where: { role: { in: ["SALES", "ADMIN", "SUPER_ADMIN"] }, isActive: true },
      select: { id: true, fullName: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">Test Drives</h1>
        <p className="text-sm text-muted-foreground">{bookings.length} booking(s)</p>
      </div>
      <BookingsView
        kind="test-drive"
        salesUsers={salesUsers}
        bookings={bookings.map((b) => ({
          id: b.id,
          reference: b.reference,
          fullName: b.fullName,
          phone: b.phone,
          subtitle: b.model?.displayName ?? "Any model",
          date: b.preferredDate,
          timeSlot: b.timeSlot,
          status: b.status,
          assigneeId: b.assigneeId,
          assigneeName: b.assignee?.fullName ?? null,
        }))}
      />
    </div>
  );
}
