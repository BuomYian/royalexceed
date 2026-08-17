"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ADMIN_NAV } from "@/components/layout/admin-sidebar";
import { can } from "@/lib/rbac";

export function CommandPalette({
  open,
  onOpenChange,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
}) {
  const router = useRouter();

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const navItems = ADMIN_NAV.filter((item) => can(role, item.resource, "read"));
  const quickActions = [
    { label: "New model", href: "/admin/models/new", resource: "models" as const },
    { label: "New inventory unit", href: "/admin/inventory/new", resource: "inventory" as const },
    { label: "New article", href: "/admin/news/new", resource: "news" as const },
  ].filter((item) => can(role, item.resource, "create"));

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Quick navigation" description="Jump to any admin module or action">
      <CommandInput placeholder="Search modules and actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          {quickActions.map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)}>
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Go to">
          {navItems.map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)}>
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
