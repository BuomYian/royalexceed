"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Warehouse,
  Inbox,
  CalendarClock,
  Wrench,
  Newspaper,
  Quote,
  Image as ImageIcon,
  Settings,
  Users,
  History,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { can, type Resource } from "@/lib/rbac";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: React.ElementType; resource: Resource }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, resource: "dashboard" },
  { href: "/admin/models", label: "Models", icon: Car, resource: "models" },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse, resource: "inventory" },
  { href: "/admin/leads", label: "Leads", icon: Inbox, resource: "leads" },
  { href: "/admin/test-drives", label: "Test Drives", icon: CalendarClock, resource: "testDrives" },
  { href: "/admin/service-bookings", label: "Service Bookings", icon: Wrench, resource: "serviceBookings" },
  { href: "/admin/news", label: "News & Offers", icon: Newspaper, resource: "news" },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote, resource: "testimonials" },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon, resource: "media" },
  { href: "/admin/settings", label: "Site Settings", icon: Settings, resource: "settings" },
  { href: "/admin/users", label: "Users", icon: Users, resource: "users" },
  { href: "/admin/audit-log", label: "Audit Log", icon: History, resource: "auditLog" },
];

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV.filter((item) => can(role, item.resource, "read"));

  return (
    <aside className="hidden w-64 shrink-0 border-e border-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          EL
        </span>
        <span className="font-heading text-sm font-bold text-sidebar-foreground">Admin</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export const ADMIN_NAV = NAV;
