import { Inbox, CalendarClock, Warehouse, TrendingUp, Eye, Wrench } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { KpiCard } from "@/components/admin/kpi-card";
import { LeadsChart } from "@/components/admin/leads-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export const metadata = { title: "Dashboard" };

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function AdminDashboardPage() {
  const user = await requireUser();
  const now = new Date();

  const showLeads = can(user.role, "leads", "read");
  const showTestDrives = can(user.role, "testDrives", "read");
  const showInventory = can(user.role, "inventory", "read");
  const showService = can(user.role, "serviceBookings", "read");

  const [
    leadsToday,
    leadsWeek,
    pendingTestDrives,
    vehiclesInStock,
    soldThisMonth,
    topModel,
    pendingServiceBookings,
    recentAudit,
    leadsLast14Days,
  ] = await Promise.all([
    showLeads ? prisma.lead.count({ where: { createdAt: { gte: startOfDay(now) } } }) : 0,
    showLeads ? prisma.lead.count({ where: { createdAt: { gte: startOfWeek(now) } } }) : 0,
    showTestDrives
      ? prisma.testDriveBooking.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } })
      : 0,
    showInventory ? prisma.inventoryUnit.count({ where: { status: "AVAILABLE" } }) : 0,
    showInventory
      ? prisma.inventoryUnit.count({
          where: { status: "SOLD", soldAt: { gte: startOfMonth(now) } },
        })
      : 0,
    showInventory || showLeads
      ? prisma.model.findFirst({ orderBy: { viewCount: "desc" }, select: { displayName: true, viewCount: true } })
      : null,
    showService
      ? prisma.serviceBooking.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } })
      : 0,
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { fullName: true } } },
    }),
    showLeads
      ? prisma.lead.findMany({
          where: { createdAt: { gte: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000) } },
          select: { createdAt: true },
        })
      : [],
  ]);

  const chartData = Array.from({ length: 14 }).map((_, i) => {
    const day = new Date(now.getTime() - (13 - i) * 24 * 60 * 60 * 1000);
    const key = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const count = leadsLast14Days.filter(
      (l) => startOfDay(l.createdAt).getTime() === startOfDay(day).getTime(),
    ).length;
    return { date: key, count };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Welcome back, {user.fullName.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening across FBM International.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {showLeads && <KpiCard label="New leads today" value={leadsToday} icon={Inbox} hint={`${leadsWeek} this week`} />}
        {showTestDrives && (
          <KpiCard label="Test drives pending" value={pendingTestDrives} icon={CalendarClock} />
        )}
        {showInventory && (
          <KpiCard label="Vehicles in stock" value={vehiclesInStock} icon={Warehouse} />
        )}
        {showInventory && (
          <KpiCard label="Units sold this month" value={soldThisMonth} icon={TrendingUp} />
        )}
        {showService && (
          <KpiCard label="Service bookings pending" value={pendingServiceBookings} icon={Wrench} />
        )}
        {topModel && (
          <KpiCard label="Top-viewed model" value={topModel.displayName} icon={Eye} hint={`${topModel.viewCount} views`} />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {showLeads && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Leads over time (14 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadsChart data={chartData} />
            </CardContent>
          </Card>
        )}
        <Card className={showLeads ? "" : "lg:col-span-3"}>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {recentAudit.length === 0 && (
                <li className="text-muted-foreground">No activity yet.</li>
              )}
              {recentAudit.map((log) => (
                <li key={log.id} className="flex justify-between gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0">
                  <span>
                    <span className="font-medium">{log.actor?.fullName ?? "System"}</span>{" "}
                    <span className="text-muted-foreground">
                      {log.action.toLowerCase()}d {log.entity.toLowerCase()}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
