"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, LogOut, Search, ExternalLink } from "lucide-react";
import type { Role } from "@prisma/client";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ADMIN_NAV } from "@/components/layout/admin-sidebar";
import { can } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { CommandPalette } from "@/components/admin/command-palette";

export function AdminTopbar({
  user,
}: {
  user: { fullName: string; email: string; role: Role };
}) {
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();
  const initials = user.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          }
        />
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <div className="flex h-16 items-center gap-2 border-b border-border px-5">
            <Image src="/logo-favicon.png" alt="Royal Exceed Co. Ltd" width={32} height={32} className="h-8 w-8" />
            <span className="font-heading text-sm font-bold">Admin</span>
          </div>
          <nav className="space-y-0.5 p-3">
            {ADMIN_NAV.filter((item) => can(user.role, item.resource, "read")).map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
                    active && "bg-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {/* Same reasoning as admin-sidebar.tsx: not RBAC-gated, visible to every role. */}
          <div className="border-t border-border p-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <ExternalLink className="h-4 w-4" />
              View website
            </a>
          </div>
        </SheetContent>
      </Sheet>

      <Button
        variant="outline"
        size="sm"
        className="hidden gap-2 text-muted-foreground sm:inline-flex"
        onClick={() => setPaletteOpen(true)}
      >
        <Search className="h-4 w-4" />
        Search…
        <kbd className="ms-4 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        aria-label="Search"
        onClick={() => setPaletteOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} role={user.role} />

      <div className="ms-auto flex items-center gap-3">
        <div className="hidden text-end sm:block">
          <p className="text-sm font-medium leading-tight">{user.fullName}</p>
          <p className="text-xs leading-tight text-muted-foreground">{user.role.replace("_", " ")}</p>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
